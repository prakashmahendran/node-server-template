import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Determine the SQL dialect (MySQL, MSSQL, PostgreSQL)
  const dialect = (process.env.SQL_TYPE ?? 'postgres').toLowerCase();

  // Create the 'Users' table
  await queryInterface.createTable('Users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilePic: {
      type: DataTypes.BLOB, // Using BLOB for profile pictures
      allowNull: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Roles', key: 'id' },
      onUpdate: 'CASCADE' // Correct use of onUpdate as 'CASCADE'
    },
    accountStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active'
    },
    lastLogin: { type: DataTypes.DATE, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: true },
    updatedBy: { type: DataTypes.INTEGER, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false }
  });

  // Apply dialect-specific changes for MSSQL, MySQL, and PostgreSQL
  if (dialect === 'mysql') {
    // MySQL-specific handling for TIMESTAMP columns
    await queryInterface.sequelize.query(`
      ALTER TABLE Users
      MODIFY createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;
    `);
  } else if (dialect === 'postgres') {
    // PostgreSQL-specific handling for TIMESTAMP columns
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users"
      ALTER COLUMN "createdAt" SET DEFAULT NOW(),
      ALTER COLUMN "updatedAt" SET DEFAULT NOW();
    `);
  } else if (dialect === 'mssql') {
    // MSSQL-specific handling for createdAt and updatedAt default values
    await queryInterface.sequelize.query(`
      ALTER TABLE Users
      ADD CONSTRAINT DF_Users_createdAt DEFAULT GETDATE() FOR createdAt;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE Users
      ADD CONSTRAINT DF_Users_updatedAt DEFAULT GETDATE() FOR updatedAt;
    `);
  } else {
    throw new Error('Unsupported SQL dialect');
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Drop the 'Users' table
  await queryInterface.dropTable('Users');
}
