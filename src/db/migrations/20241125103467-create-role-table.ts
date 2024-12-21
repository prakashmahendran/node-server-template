import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Determine the SQL dialect (MySQL, MSSQL, PostgreSQL)
  const dialect = (process.env.SQL_TYPE ?? 'postgres').toLowerCase();

  // Create the roles table
  await queryInterface.createTable('Roles', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
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

  if (dialect === 'mysql') {
    // MySQL - Use TIMESTAMP with defaults and ON UPDATE
    await queryInterface.sequelize.query(`
    ALTER TABLE Roles
    MODIFY createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;
  `);
  } else if (dialect === 'postgres') {
    // PostgreSQL - Use DEFAULT NOW()
    await queryInterface.sequelize.query(`
    ALTER TABLE "Roles"
    ALTER COLUMN "createdAt" SET DEFAULT NOW(),
    ALTER COLUMN "updatedAt" SET DEFAULT NOW();
  `);
  } else if (dialect === 'mssql') {
     // MSSQL-specific handling for createdAt and updatedAt default values
     await queryInterface.sequelize.query(`
      ALTER TABLE Roles
      ADD CONSTRAINT DF_Roles_createdAt DEFAULT GETDATE() FOR createdAt;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE Roles
      ADD CONSTRAINT DF_Roles_updatedAt DEFAULT GETDATE() FOR updatedAt;
    `);
  } else {
    throw new Error('Unsupported SQL dialect');
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Drop the roles table
  await queryInterface.dropTable('Roles');
}
