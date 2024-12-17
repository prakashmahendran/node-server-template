import {
  EndpointAuthType,
  EndpointRequestType,
  EndpointHandler,
  generateJwtToken
} from 'node-server-engine';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { Permission, Role, User } from 'db';
import {
  AUTH_INVALID_CREDENTIALS,
  AUTH_LOGIN_ERROR,
  AUTH_USER_NOT_FOUND
} from './auth.const';

export const loginHandler: EndpointHandler<EndpointAuthType> = async (
  req: EndpointRequestType[EndpointAuthType],
  res: Response
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'password'],
      raw: true
    });

    if (!user) {
      res.status(401).json({ message: AUTH_USER_NOT_FOUND });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: AUTH_INVALID_CREDENTIALS });
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
    res.status(500).json({ message: AUTH_LOGIN_ERROR, error });
  }
};
