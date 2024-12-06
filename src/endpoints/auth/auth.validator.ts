import { Schema } from 'express-validator';
import { User } from 'db';

export const registerValidator: Schema = {
  name: {
    in: 'body',
    exists: {
      errorMessage: 'Name is required'
    },
    isLength: {
      errorMessage: 'Name must be at least 4 characters long',
      options: { min: 4 }
    }
  },
  email: {
    in: 'body',
    exists: {
      errorMessage: 'Email is required'
    },
    isEmail: {
      errorMessage: 'Email is not valid'
    },
    normalizeEmail: true, // Automatically normalize email
    custom: {
      options: async (value) => {
        const user = await User.findOne({ where: { email: value }, raw: true });
        if (user) {
          throw new Error('Email already in use');
        }
      }
    }
  },
  password: {
    in: 'body',
    exists: {
      errorMessage: 'Password is required'
    },
    isLength: {
      errorMessage: 'Password must be at least 6 characters long',
      options: { min: 6 }
    }
  },
};

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
    }
  }
};

export const logoutValidator: Schema = {};
