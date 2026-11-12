import {
  EndpointAuthType,
  EndpointRequestType,
  EndpointHandler,
  reportError
} from 'node-server-engine';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { User, Audit, withTransaction } from 'db';
import {
  USER_NOT_FOUND,
  USER_CREATION_ERROR,
  USER_UPDATE_ERROR,
  USER_DELETION_ERROR,
  USER_GET_ERROR,
  USER_SELF_DELETION
} from './users.const';

/** Cost factor used to hash passwords */
const BCRYPT_ROUNDS = 10;

/** Fields recorded in the audit trail (never the password hash) */
function auditSnapshot(user: User): Record<string, unknown> {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    dateOfBirth: user.dateOfBirth,
    phoneNumber: user.phoneNumber,
    address: user.address,
    qualification: user.qualification,
    profilePic: user.profilePic,
    roleId: user.roleId,
    accountStatus: user.accountStatus
  };
}

// Create a new user
export const createUserHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { firstName, lastName, email, dateOfBirth, phoneNumber, password, roleId } =
    req.body;
  const { user } = req;

  try {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const newUser = await withTransaction(async (transaction) => {
      const created = await User.create(
        {
          firstName,
          lastName,
          email,
          dateOfBirth,
          phoneNumber,
          password: hashedPassword,
          roleId,
          createdBy: user?.id
        },
        { transaction }
      );
      await Audit.create(
        {
          entityType: 'User',
          entityId: created.id,
          action: 'CREATE',
          newData: auditSnapshot(created),
          performedBy: user?.id
        },
        { transaction }
      );
      return created;
    });

    res.status(201).json({ message: 'User created successfully', newUser });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: USER_CREATION_ERROR });
  }
};

// Get all users
export const getAllUsersHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  _req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json({ Users: users });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: USER_GET_ERROR });
  }
};

// Get a user by id
export const getUserByIdHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };

  try {
    const user = await User.findOne({
      where: { id },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      res.status(404).json({ message: USER_NOT_FOUND });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: USER_GET_ERROR });
  }
};

// Update a user
export const updateUserHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };
  const { user } = req;
  const {
    firstName,
    lastName,
    email,
    dateOfBirth,
    phoneNumber,
    address,
    qualification,
    profilePic,
    roleId,
    accountStatus
  } = req.body;

  try {
    const updateUser = await User.findByPk(id);

    if (!updateUser) {
      res.status(404).json({ message: USER_NOT_FOUND });
      return;
    }

    const previousData = auditSnapshot(updateUser);

    await withTransaction(async (transaction) => {
      updateUser.set({
        firstName,
        lastName,
        email,
        dateOfBirth,
        phoneNumber,
        address,
        qualification,
        profilePic,
        roleId,
        accountStatus,
        updatedBy: user?.id
      });
      await updateUser.save({ transaction });

      await Audit.create(
        {
          entityType: 'User',
          entityId: updateUser.id,
          action: 'UPDATE',
          previousData,
          newData: auditSnapshot(updateUser),
          performedBy: user?.id
        },
        { transaction }
      );
    });

    res
      .status(200)
      .json({ message: 'User updated successfully', user: updateUser });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: USER_UPDATE_ERROR });
  }
};

// Delete a user
export const deleteUserHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };
  const { user } = req;

  try {
    // Prevent administrators from locking themselves out
    if (user?.id !== undefined && String(user.id) === String(id)) {
      res.status(400).json({ message: USER_SELF_DELETION });
      return;
    }

    const deleteUser = await User.findByPk(id);

    if (!deleteUser) {
      res.status(404).json({ message: USER_NOT_FOUND });
      return;
    }

    await withTransaction(async (transaction) => {
      await Audit.create(
        {
          entityType: 'User',
          entityId: deleteUser.id,
          action: 'DELETE',
          previousData: auditSnapshot(deleteUser),
          performedBy: user?.id
        },
        { transaction }
      );
      await deleteUser.destroy({ transaction });
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: USER_DELETION_ERROR });
  }
};
