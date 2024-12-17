import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('Permissions', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true 
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false }
  });

  await queryInterface.sequelize.query(`
    ALTER TABLE Permissions
    MODIFY createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('Permissions');
}
