import { Schema } from 'express-validator';

export const loginValidator: Schema = {
  email: {
    in: 'body',
    exists: {
      errorMessage: 'Email is required'
    },
    isEmail: {
      errorMessage: 'Email is not valid'
    },
    normalizeEmail: true
  },
  password: {
    in: 'body',
    exists: {
      errorMessage: 'Password is required'
    },
    isString: {
      errorMessage: 'Password must be a string'
    },
    isLength: {
      options: { max: 72 },
      errorMessage: 'Password cannot exceed 72 characters'
    }
  }
};
