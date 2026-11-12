import {
  EndpointHandler,
  EndpointAuthType,
  EndpointRequestType,
  reportError
} from 'node-server-engine';
import { Response } from 'express';
import {
  Role,
  Permission,
  RolePermission,
  Audit,
  User,
  withTransaction
} from 'db';
import {
  ROLE_NOT_FOUND,
  ROLE_CREATION_ERROR,
  ROLE_UPDATE_ERROR,
  ROLE_DELETE_ERROR,
  ROLE_GET_ERROR,
  ROLE_IN_USE,
  PERMISSION_NOT_FOUND,
  PERMISSION_CREATION_ERROR,
  PERMISSION_UPDATE_ERROR,
  PERMISSION_DELETE_ERROR,
  PERMISSIONS_NOT_FOUND
} from './role.const';

interface PermissionSummary {
  action: string;
  groupName: string;
}

/** Format a role (plain object) for API responses */
function formatRole(role: {
  id: number;
  name: string;
  description?: string;
  permissions?: Array<PermissionSummary>;
}): Record<string, unknown> {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions:
      role.permissions?.map((permission) => ({
        action: permission.action,
        groupName: permission.groupName
      })) ?? []
  };
}

/** Include the permissions of a role, without the join table attributes */
const permissionInclude = {
  model: Permission,
  through: { attributes: [] },
  attributes: ['action', 'groupName']
};

/**
 * Resolve permission actions to their records.
 * Returns the actions that do not exist so the request is rejected before anything is written.
 */
async function resolvePermissions(
  actions: Array<string>
): Promise<{ found: Array<Permission>; missing: Array<string> }> {
  if (actions.length === 0) return { found: [], missing: [] };
  const found = await Permission.findAll({
    where: { action: actions },
    attributes: ['id', 'action']
  });
  const missing = actions.filter(
    (action) => !found.some((permission) => permission.action === action)
  );
  return { found, missing };
}

// Handler to get details of a specific role
export const getRoleDetailsHandler: EndpointHandler<
  EndpointAuthType.JWT
> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { roleId } = req.params as { roleId: string };

  try {
    const role = await Role.findOne({
      where: { id: roleId },
      attributes: ['id', 'name', 'description'],
      include: [permissionInclude]
    });
    if (!role) {
      res.status(404).json({ message: ROLE_NOT_FOUND });
      return;
    }
    res.status(200).json(formatRole(role.toJSON()));
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: ROLE_GET_ERROR });
  }
};

// Handler to get all roles
export const getRolesHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  _req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'description'],
      include: [permissionInclude]
    });
    res.status(200).json(roles.map((role) => formatRole(role.toJSON())));
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: ROLE_GET_ERROR });
  }
};

// Handler to create a new role
export const createRoleHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { name, description } = req.body;
  const actions: Array<string> = req.body.permissions ?? [];
  const { user } = req;

  try {
    // Validate the permissions before writing anything
    const { found, missing } = await resolvePermissions(actions);
    if (missing.length > 0) {
      res.status(400).json({
        message: PERMISSIONS_NOT_FOUND,
        missingPermissions: missing
      });
      return;
    }

    const role = await withTransaction(async (transaction) => {
      const created = await Role.create(
        { name, description, createdBy: user?.id },
        { transaction }
      );

      if (found.length > 0) {
        await RolePermission.bulkCreate(
          found.map((permission) => ({
            roleId: created.id,
            permissionId: permission.id,
            createdBy: user?.id
          })),
          { transaction }
        );
      }

      await Audit.create(
        {
          entityType: 'Role',
          entityId: created.id,
          action: 'CREATE',
          newData: { name, description, permissions: actions },
          performedBy: user?.id
        },
        { transaction }
      );
      return created;
    });

    res.status(201).json({
      message: 'Role created successfully',
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: actions
      }
    });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: ROLE_CREATION_ERROR });
  }
};

// Handler to update a role
export const updateRoleHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };
  const { name, description, permissions } = req.body;
  const { user } = req;
  // An empty or missing list keeps the current permissions
  const actions: Array<string> | undefined =
    Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : undefined;

  try {
    const role = await Role.findByPk(id, {
      include: [{ model: Permission, as: 'permissions' }]
    });

    if (!role) {
      res.status(404).json({ message: ROLE_NOT_FOUND });
      return;
    }

    // Validate the permissions before writing anything
    const { found, missing } = await resolvePermissions(actions ?? []);
    if (missing.length > 0) {
      res.status(400).json({
        message: PERMISSIONS_NOT_FOUND,
        missingPermissions: missing
      });
      return;
    }

    const previousData = {
      name: role.name,
      description: role.description,
      permissions:
        role.permissions?.map((permission) => permission.action) ?? []
    };

    await withTransaction(async (transaction) => {
      role.set({
        name: name ?? role.name,
        description: description ?? role.description,
        updatedBy: user?.id
      });
      await role.save({ transaction });

      if (actions) {
        // Replace the role's permissions
        await RolePermission.destroy({
          where: { roleId: role.id },
          transaction
        });
        await RolePermission.bulkCreate(
          found.map((permission) => ({
            roleId: role.id,
            permissionId: permission.id,
            createdBy: user?.id
          })),
          { transaction }
        );
      }

      await Audit.create(
        {
          entityType: 'Role',
          entityId: role.id,
          action: 'UPDATE',
          previousData,
          newData: {
            name: role.name,
            description: role.description,
            permissions: actions ?? previousData.permissions
          },
          performedBy: user?.id
        },
        { transaction }
      );
    });

    res.status(200).json({
      message: 'Role updated successfully',
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: actions ?? previousData.permissions
      }
    });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: ROLE_UPDATE_ERROR });
  }
};

// Handler to delete a role
export const deleteRoleHandler: EndpointHandler<EndpointAuthType.JWT> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };
  const { user } = req;

  try {
    const role = await Role.findByPk(id);
    if (!role) {
      res.status(404).json({ message: ROLE_NOT_FOUND });
      return;
    }

    // A role that is still assigned to users cannot be deleted
    const assignedUsers = await User.count({ where: { roleId: role.id } });
    if (assignedUsers > 0) {
      res.status(409).json({ message: ROLE_IN_USE });
      return;
    }

    await withTransaction(async (transaction) => {
      await Audit.create(
        {
          entityType: 'Role',
          entityId: role.id,
          action: 'DELETE',
          previousData: { name: role.name, description: role.description },
          performedBy: user?.id
        },
        { transaction }
      );
      await RolePermission.destroy({ where: { roleId: role.id }, transaction });
      await role.destroy({ transaction });
    });

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: ROLE_DELETE_ERROR });
  }
};

// Handler to create a new permission
export const createPermissionHandler: EndpointHandler<
  EndpointAuthType.JWT
> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { action, groupName, description } = req.body;
  const { user } = req;

  try {
    const permission = await withTransaction(async (transaction) => {
      const created = await Permission.create(
        { action, groupName, description, createdBy: user?.id },
        { transaction }
      );
      await Audit.create(
        {
          entityType: 'Permission',
          entityId: created.id,
          action: 'CREATE',
          newData: { action, groupName, description },
          performedBy: user?.id
        },
        { transaction }
      );
      return created;
    });

    res.status(201).json({
      message: 'Permission created successfully',
      permission: {
        action: permission.action,
        groupName: permission.groupName,
        description: permission.description
      }
    });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: PERMISSION_CREATION_ERROR });
  }
};

// Handler to get all permissions
export const getPermissionsHandler: EndpointHandler<
  EndpointAuthType.JWT
> = async (
  _req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  try {
    const permissions = await Permission.findAll({
      attributes: ['action', 'groupName', 'description']
    });
    res.status(200).json({ permissions });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: 'Error fetching permissions' });
  }
};

// Handler to update a permission
export const updatePermissionHandler: EndpointHandler<
  EndpointAuthType.JWT
> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { action } = req.params as { action: string };
  const { user } = req;
  const { groupName, description } = req.body;

  try {
    const permission = await Permission.findOne({ where: { action } });

    if (!permission) {
      res.status(404).json({ message: PERMISSION_NOT_FOUND });
      return;
    }

    const previousData = {
      action: permission.action,
      groupName: permission.groupName,
      description: permission.description
    };

    await withTransaction(async (transaction) => {
      permission.set({
        groupName: groupName ?? permission.groupName,
        description: description ?? permission.description,
        updatedBy: user?.id
      });
      await permission.save({ transaction });

      await Audit.create(
        {
          entityType: 'Permission',
          entityId: permission.id,
          action: 'UPDATE',
          previousData,
          newData: {
            action: permission.action,
            groupName: permission.groupName,
            description: permission.description
          },
          performedBy: user?.id
        },
        { transaction }
      );
    });

    res.status(200).json({
      message: 'Permission updated successfully',
      permission: {
        action: permission.action,
        groupName: permission.groupName,
        description: permission.description
      }
    });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: PERMISSION_UPDATE_ERROR });
  }
};

// Handler to delete a permission
export const deletePermissionHandler: EndpointHandler<
  EndpointAuthType.JWT
> = async (
  req: EndpointRequestType[EndpointAuthType.JWT],
  res: Response
): Promise<void> => {
  const { action } = req.params as { action: string };
  const { user } = req;

  try {
    const permission = await Permission.findOne({ where: { action } });

    if (!permission) {
      res.status(404).json({ message: PERMISSION_NOT_FOUND });
      return;
    }

    await withTransaction(async (transaction) => {
      await Audit.create(
        {
          entityType: 'Permission',
          entityId: permission.id,
          action: 'DELETE',
          previousData: {
            action: permission.action,
            groupName: permission.groupName,
            description: permission.description
          },
          performedBy: user?.id
        },
        { transaction }
      );
      await RolePermission.destroy({
        where: { permissionId: permission.id },
        transaction
      });
      await permission.destroy({ transaction });
    });

    res.status(200).json({ message: 'Permission deleted successfully' });
  } catch (error) {
    reportError(error);
    res.status(500).json({ message: PERMISSION_DELETE_ERROR });
  }
};
