import { Meta, ParamSchema, Schema } from 'express-validator';
import { Op } from 'sequelize';
import { Role, User } from 'db';

/** bcrypt only uses the first 72 bytes of a password */
const PASSWORD_MAX_LENGTH = 72;
const ACCOUNT_STATUSES = ['active', 'suspended', 'inactive'];

const idParam: ParamSchema = {
  in: 'params',
  exists: { errorMessage: 'User id is required' },
  isInt: { options: { min: 1 }, errorMessage: 'User id must be a positive integer' },
  toInt: true
};

const name = (label: string): ParamSchema => ({
  in: 'body',
  exists: { errorMessage: `${label} is required` },
  isString: { errorMessage: `${label} must be a string` },
  trim: true,
  isLength: {
    options: { min: 1, max: 50 },
    errorMessage: `${label} must be between 1 and 50 characters`
  }
});

/** Email must be unique, ignoring the user being updated */
const email: ParamSchema = {
  in: 'body',
  exists: { errorMessage: 'Email is required' },
  isEmail: { errorMessage: 'Email is not valid' },
  normalizeEmail: true,
  custom: {
    options: async (value: string, { req }: Meta) => {
      const currentId = req.params?.id;
      const existing = await User.findOne({
        where: {
          email: value,
          ...(currentId ? { id: { [Op.ne]: currentId } } : {})
        },
        attributes: ['id'],
        raw: true
      });
      if (existing) throw new Error('Email already in use');
    }
  }
};

const phoneNumber: ParamSchema = {
  in: 'body',
  exists: { errorMessage: 'Phone number is required' },
  isString: { errorMessage: 'Phone number must be a string' },
  trim: true,
  matches: {
    options: /^\+?[0-9 ()-]{6,20}$/,
    errorMessage: 'Phone number is not valid'
  }
};

const dateOfBirth: ParamSchema = {
  in: 'body',
  exists: { errorMessage: 'Date of birth is required' },
  isISO8601: { errorMessage: 'Date of birth must be a valid date (YYYY-MM-DD)' }
};

/** The role must exist, so that a bad id is a 400 and not a database error */
const roleId: ParamSchema = {
  in: 'body',
  exists: { errorMessage: 'Role is required' },
  isInt: { options: { min: 1 }, errorMessage: 'Role must be a positive integer' },
  toInt: true,
  custom: {
    options: async (value: number) => {
      const role = await Role.findByPk(value, { attributes: ['id'] });
      if (!role) throw new Error('Role does not exist');
    }
  }
};

const optionalText = (label: string, max: number): ParamSchema => ({
  in: 'body',
  optional: { options: { values: 'null' } },
  isString: { errorMessage: `${label} must be a string` },
  trim: true,
  isLength: { options: { max }, errorMessage: `${label} cannot exceed ${max} characters` }
});

export const createUserValidator: Schema = {
  firstName: name('First name'),
  lastName: name('Last name'),
  email,
  phoneNumber,
  dateOfBirth,
  password: {
    in: 'body',
    exists: { errorMessage: 'Password is required' },
    isString: { errorMessage: 'Password must be a string' },
    isLength: {
      options: { min: 8, max: PASSWORD_MAX_LENGTH },
      errorMessage: `Password must be between 8 and ${PASSWORD_MAX_LENGTH} characters long`
    }
  },
  roleId
};

export const updateUserValidator: Schema = {
  id: idParam,
  firstName: name('First name'),
  lastName: name('Last name'),
  email,
  dateOfBirth,
  phoneNumber,
  roleId,
  accountStatus: {
    in: 'body',
    exists: { errorMessage: 'Account status is required' },
    isIn: {
      options: [ACCOUNT_STATUSES],
      errorMessage: `Account status must be one of: ${ACCOUNT_STATUSES.join(', ')}`
    }
  },
  address: optionalText('Address', 255),
  qualification: optionalText('Qualification', 255),
  profilePic: {
    ...optionalText('Profile picture', 255),
    isURL: { errorMessage: 'Profile picture must be a URL' }
  }
};

export const getUserValidator: Schema = {
  id: idParam
};

export const deleteUserValidator: Schema = {
  id: idParam
};
