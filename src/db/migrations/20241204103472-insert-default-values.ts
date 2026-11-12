import bcrypt from 'bcryptjs';
import { QueryInterface, QueryTypes } from 'sequelize';

// Define types for roles and permissions based on their schema
interface Role {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  action: string;
  description: string;
  groupName: string;
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Insert roles into the Roles table
  await queryInterface.bulkInsert('Roles', [
    { name: 'admin', description: 'Administrator role' },
  ]);

  await queryInterface.bulkInsert('Permissions', [
    {
      action: 'CreateRole',
      description: 'Create a new role',
      groupName: 'Role & Permission'
    },
    {
      action: 'CreatePermission',
      description: 'Create a new permission',
      groupName: 'Role & Permission'
    },
    {
      action: 'UpdateRole',
      description: 'Update an existing role',
      groupName: 'Role & Permission'
    },
    {
      action: 'UpdatePermission',
      description: 'Update an existing permission',
      groupName: 'Role & Permission'
    },
    {
      action: 'DeleteRole',
      description: 'Delete a role',
      groupName: 'Role & Permission'
    },
    {
      action: 'DeletePermission',
      description: 'Delete a permission',
      groupName: 'Role & Permission'
    },
    {
      action: 'GetRole',
      description: 'Get details of a role',
      groupName: 'Role & Permission'
    },
    {
      action: 'GetPermission',
      description: 'Get details of a permission',
      groupName: 'Role & Permission'
    },
    {
      action: 'CreateUser',
      description: 'Create a new user',
      groupName: 'User Management'
    },
    {
      action: 'GetUser',
      description: 'Get details of a user',
      groupName: 'User Management'
    },
    {
      action: 'UpdateUser',
      description: 'update an existing user',
      groupName: 'User Management'
    },
    {
      action: 'DeleteUser',
      description: 'update an existing user',
      groupName: 'User Management'
    }
  ]);

  const roles = await queryInterface.sequelize.query('SELECT * FROM Roles', {
    type: QueryTypes.SELECT
  });

  const permissions = await queryInterface.sequelize.query(
    'SELECT * FROM Permissions',
    {
      type: QueryTypes.SELECT
    }
  );

  // Explicitly type roles and permissions as the correct types
  const typedRoles = roles as Role[];
  const typedPermissions = permissions as Permission[];

  const rolePermissions = [];

  // Step 3: Map admin to all permissions
  for (const role of typedRoles) {
    for (const permission of typedPermissions) {
      if (role.name === 'admin') {
        rolePermissions.push({
          roleId: role.id,
          permissionId: permission.id
        });
      }
    }
  }

  // Insert role-permission mappings into RolePermissions table
  await queryInterface.bulkInsert('RolePermissions', rolePermissions);

  // The initial administrator is created from the environment, never from a hardcoded password
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminRole = typedRoles.find((role) => role.name === 'admin');
  if (!adminEmail || !adminPassword || !adminRole) {
    console.warn(
      'Skipping the initial admin user: set ADMIN_EMAIL and ADMIN_PASSWORD before running migrations'
    );
    return;
  }
  if (adminPassword.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long');
  }

  await queryInterface.bulkInsert('Users', [
    {
      firstName: 'Admin',
      lastName: 'Admin',
      email: adminEmail.trim().toLowerCase(),
      password: await bcrypt.hash(adminPassword, 10),
      roleId: adminRole.id,
      accountStatus: 'active'
    }
  ]);
}

export async function down(_queryInterface: QueryInterface): Promise<void> {
  // Code to reverse the changes (if needed) in case of rollback
}
