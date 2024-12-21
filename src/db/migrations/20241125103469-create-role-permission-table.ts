import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {

  // Now add the appropriate column modifications based on the dialect
  const dialect = (process.env.SQL_TYPE ?? 'postgres').toLowerCase();

  await queryInterface.createTable('RolePermissions', {
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Roles',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    permissionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Permissions', // Now referencing 'Permissions' by 'action'
        key: 'id' // Matching the 'id' column as primary key
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false }
  });

  if (dialect === 'mysql') {
    // MySQL - Use TIMESTAMP with defaults and ON UPDATE
    await queryInterface.sequelize.query(`
        ALTER TABLE RolePermissions
        MODIFY createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;
      `);
  } else if (dialect === 'postgres') {
    // PostgreSQL - Use DEFAULT NOW()
    await queryInterface.sequelize.query(`
        ALTER TABLE "RolePermissions"
        ALTER COLUMN "createdAt" SET DEFAULT NOW(),
        ALTER COLUMN "updatedAt" SET DEFAULT NOW();
      `);
  } else if (dialect === 'mssql') {
     // MSSQL-specific handling for createdAt and updatedAt default values
     await queryInterface.sequelize.query(`
      ALTER TABLE RolePermissions
      ADD CONSTRAINT DF_RolePermissions_createdAt DEFAULT GETDATE() FOR createdAt;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE RolePermissions
      ADD CONSTRAINT DF_RolePermissions_updatedAt DEFAULT GETDATE() FOR updatedAt;
    `);
  } else {
    throw new Error('Unsupported SQL dialect');
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('RolePermissions');
}
