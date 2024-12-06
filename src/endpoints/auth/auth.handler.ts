import {
  EndpointAuthType,
  EndpointRequestType,
  EndpointHandler,
  generateJwtToken
} from 'node-server-engine';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { User } from 'db';

export const registerHandler: EndpointHandler<EndpointAuthType> = async (
  req: EndpointRequestType[EndpointAuthType],
  res: Response
) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });
    res
      .status(201)
      .json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const loginHandler: EndpointHandler<EndpointAuthType> = async (
  req: EndpointRequestType[EndpointAuthType],
  res: Response
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'name', 'email', 'role', 'password'],
      raw: true
    });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const tokenExpiry = Math.floor(Date.now() / 1000) + 60 * 60;
    const accessToken = generateJwtToken(user);

    const { password: _, ...userWithoutPassword } = user;

    res
      .status(200)
      .json({ accessToken, tokenExpiry, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error });
  }
};

export const logoutHandler: EndpointHandler<EndpointAuthType> = async (
  req: EndpointRequestType[EndpointAuthType],
  res: Response
) => {
  // Here you might want to implement logic to blacklist the token or handle session
  res.status(200).json({ message: 'User logged out successfully' });
};
