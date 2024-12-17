import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
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

  await queryInterface.sequelize.query(`
    ALTER TABLE RolePermissions
    MODIFY createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('RolePermissions');
}
