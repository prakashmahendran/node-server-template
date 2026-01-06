import { Schema } from 'express-validator';

export const publishTestValidator: Schema = {
  message: {
    in: 'body',
    exists: {
      errorMessage: 'Message is required'
    },
    isString: {
      errorMessage: 'Message must be a string'
    },
    notEmpty: {
      errorMessage: 'Message cannot be empty'
    }
  },
  data: {
    in: 'body',
    optional: true,
    isObject: {
      errorMessage: 'Data must be an object'
    }
  }
};
