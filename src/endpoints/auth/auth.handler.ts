import {
  EndpointAuthType,
  EndpointRequestType,
  EndpointHandler,
  generateJwtToken,
  reportError
} from 'node-server-engine';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { Permission, Role, User } from 'db';
import {
  AUTH_ACCOUNT_INACTIVE,
  AUTH_INVALID_CREDENTIALS,
  AUTH_LOGIN_ERROR
} from './auth.const';

/**
 * Hash compared against when the user does not exist, so that the response time
 * does not reveal whether an email is registered
 */
const DUMMY_PASSWORD_HASH =
  '$2a$10$rXZGhrRiacdYFizj4MSj4.Utll6bnLO0SZcTm6X4sVFpOWuTWV11i';

export const loginHandler: EndpointHandler<EndpointAuthType> = async (
  req: EndpointRequestType[EndpointAuthType],
  res: Response
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'password', 'accountStatus'],
      raw: true
    });

    // Same response for unknown users and wrong passwords to prevent account enumeration
    const isMatch = await bcrypt.compare(
      password,
      user?.password ?? DUMMY_PASSWORD_HASH
    );
    if (!user || !isMatch) {
      res.status(401).json({ message: AUTH_INVALID_CREDENTIALS });
      return;
    }

    if (user.accountStatus !== 'active') {
      res.status(403).json({ message: AUTH_ACCOUNT_INACTIVE });
      return;
    }

    const userDetails = (
      await User.findOne({
        where: { id: user.id },
        attributes: ['id', 'firstName', 'lastName', 'email'],
        include: [
          {
            model: Role,
            attributes: ['id', 'name'],
            include: [
              {
                model: Permission,
                through: { attributes: [] },
                attributes: ['action']
              }
            ]
          }
        ]
      })
    )?.toJSON();

    // Check if userDetails or userDetails.role is null
    if (!userDetails || !userDetails.role) {
       res
        .status(500)
        .json({
          message: AUTH_LOGIN_ERROR,
          error: 'User role or permissions not found'
        });
        return;
    }

    // Transform the user object
    const transformedUser = {
      id: userDetails.id,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      roleId: userDetails.role.id,
      role: userDetails.role.name,
      permissions: userDetails.role.permissions.map(
        (perm: { action: string }) => perm.action
      )
    };

    const tokenExpiry = Math.floor(Date.now() / 1000) + 60 * 60;
    const accessToken = generateJwtToken(transformedUser);

    res.status(200).json({ accessToken, tokenExpiry, user:transformedUser });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: AUTH_LOGIN_ERROR });
  }
};
