import { QueryInterface, DataTypes, literal } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('Audits', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    previousData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    newData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    performedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false }
  });

  await queryInterface.sequelize.query(`
    ALTER TABLE Audits
    MODIFY createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('Audits');
}
