import { ParamSchema, Schema } from 'express-validator';

export const createRoleValidator: Schema = {
  name: {
    in: 'body',
    exists: {
      errorMessage: 'Role name is required'
    },
    isString: {
      errorMessage: 'Role name must be a string'
    },
    isLength: {
      options: { max: 255 },
      errorMessage: 'Role name cannot exceed 255 characters'
    }
  },
  description: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Description must be a string'
    },
    isLength: {
      options: { max: 500 },
      errorMessage: 'Description cannot exceed 500 characters'
    }
  },
  permissions: {
    in: 'body',
    optional: true,
    isArray: {
      errorMessage: 'Permissions must be an array of actions'
    },
    custom: {
      options: (permissions: string[]) => {
        if (permissions && permissions.some((perm: string) => typeof perm !== 'string')) {
          throw new Error('Each permission must be a string');
        }
        return true;
      }
    }
  }
};

export const updateRoleValidator: Schema = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Role ID is required'
    },
    isInt: {
      errorMessage: 'Role ID must be an integer'
    }
  },
  name: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Role name must be a string'
    },
    isLength: {
      options: { max: 255 },
      errorMessage: 'Role name cannot exceed 255 characters'
    }
  },
  description: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Description must be a string'
    },
    isLength: {
      options: { max: 500 },
      errorMessage: 'Description cannot exceed 500 characters'
    }
  },
  permissions: {
    in: 'body',
    optional: true,
    isArray: {
      errorMessage: 'Permissions must be an array of actions'
    },
    custom: {
      options: (permissions: string[]) => {
        if (permissions && permissions.some((perm: string) => typeof perm !== 'string')) {
          throw new Error('Each permission must be a string');
        }
        return true;
      }
    }
  }
};

export const getRoleValidator: Schema = {
  roleId: {
    in: 'params',
    exists: { errorMessage: 'Role ID is required' },
    isInt: { options: { min: 1 }, errorMessage: 'Role ID must be a positive integer' },
    toInt: true
  }
};

export const deleteRoleValidator: Schema = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Role ID is required'
    },
    isInt: {
      errorMessage: 'Role ID must be an integer'
    }
  }
};

const permissionAction = (location: 'body' | 'params'): ParamSchema => ({
  in: location,
  exists: { errorMessage: 'Permission action is required' },
  isString: { errorMessage: 'Permission action must be a string' },
  trim: true,
  isLength: {
    options: { min: 1, max: 255 },
    errorMessage: 'Permission action must be between 1 and 255 characters'
  }
});

const permissionDescription: ParamSchema = {
  in: 'body',
  optional: { options: { values: 'null' } },
  isString: { errorMessage: 'Description must be a string' },
  isLength: {
    options: { max: 255 },
    errorMessage: 'Description cannot exceed 255 characters'
  }
};

const groupName: ParamSchema = {
  in: 'body',
  isString: { errorMessage: 'Group name must be a string' },
  trim: true,
  isLength: {
    options: { min: 1, max: 255 },
    errorMessage: 'Group name must be between 1 and 255 characters'
  }
};

export const createPermissionValidator: Schema = {
  action: permissionAction('body'),
  description: permissionDescription,
  groupName: { ...groupName, exists: { errorMessage: 'Group name is required' } }
};

export const updatePermissionValidator: Schema = {
  action: permissionAction('params'),
  groupName: { ...groupName, optional: true },
  description: permissionDescription
};

export const deletePermissionValidator: Schema = {
  action: permissionAction('params')
};
