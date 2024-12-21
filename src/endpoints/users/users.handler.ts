import {
    EndpointAuthType,
    EndpointRequestType,
    EndpointHandler,
} from 'node-server-engine';
import bcrypt from 'bcryptjs';
import { Response } from 'express';
import { User, Audit } from 'db';
import {
    USER_NOT_FOUND,
    USER_CREATION_ERROR,
    USER_UPDATE_ERROR,
    USER_DELETION_ERROR,
    USER_GET_ERROR
} from './users.const';


 //create new User 
export const createUserHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {

  const {
    firstName,
    lastName,
    email,
    dateOfBirth,
    phoneNumber,
    password,
    roleId
  } = req.body;
  const { user } = req; // Getting the authenticated user

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      dateOfBirth,
      phoneNumber,
      password: hashedPassword,
      roleId,
      createdBy: user?.id
    });

    await Audit.create({
        entityType: 'User',
        entityId: newUser.id,
        action: 'CREATE',
        newData: newUser,
        performedBy: user?.id
      });

    res.status(200).json({ message: 'User created successfully', newUser });
  } catch (error) {
    res.status(500).json({ message: USER_CREATION_ERROR, error });
  }
};


//get all user
export const getAllUsersHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
) => {
  try {

    const users = await User.findAll();

    if (!users) {
      res.status(404).json({ message: USER_NOT_FOUND });
      return;
    }

    res.status(200).json({ Users: users });
  } catch (error) {
    res.status(500).json({ message: USER_GET_ERROR, error });
  }
};



export const getUserByIdHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {

  const { id } = req.params;
  
  try {

    const user = await User.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({ message: USER_NOT_FOUND });
      return;
    }

    res.status(200).json({ user })
  } catch {
    res.status(500).json({ message: USER_GET_ERROR });
  }
};

// //update a new user
export const updateUserHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {

  const { id } = req.params;
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
    accountStatus,
  } = req.body;

  try {

    const updateUser = await User.findByPk(id);

    if (!updateUser) {
      res.status(404).json({ message: USER_NOT_FOUND });
      return;
    }

    const previousData = {
        firstName: updateUser.firstName,
        lastName: updateUser.lastName,
        email: updateUser.email,
        dateOfBirth: updateUser.dateOfBirth,
        phoneNumber: updateUser.phoneNumber,
        address: updateUser.address,
        qualification: updateUser.qualification,
        profilePic: updateUser.profilePic,
        roleId: updateUser.roleId,
        accountStatus: updateUser.accountStatus,
    }

    updateUser.set({
      firstName: firstName,
      lastName: lastName,
      email: email,
      dateOfBirth: dateOfBirth,
      phoneNumber: phoneNumber,
      address: address,
      qualification: qualification,
      profilePic: profilePic,
      roleId: roleId,
      accountStatus: accountStatus,
      updatedBy: user?.id
    });

    await updateUser.save();

    await Audit.create({
        entityType: 'User',
        entityId: updateUser.id,
        action: 'UPDATE',
        OldData: previousData,
        newData: updateUser,
        performedBy: user?.id
      });

    res.status(200).json({ message: 'User updated successfully', user: updateUser })
  } catch (error) {
    res.status(500).json({ message: USER_UPDATE_ERROR, error });
  }
};

// //delete user
export const deleteUserHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {

  const { id } = req.params;
  const { user } = req;

  try {

    const deleteUser = await User.findByPk(id);

    if (!deleteUser) {
      res.status(404).json({ message: USER_NOT_FOUND });
      return;
    }

    await Audit.create({ 
      entityType: 'User',
      entityId: deleteUser.id,
      action: 'DELETE',
      oldData: deleteUser, // Old data before deletion
      performedBy: user?.id
    })

    await deleteUser.destroy();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: USER_DELETION_ERROR, error });
  }
};
