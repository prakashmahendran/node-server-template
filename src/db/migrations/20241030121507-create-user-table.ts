import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
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
    email: {      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
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

  await queryInterface.sequelize.query(`
    ALTER TABLE Users
    MODIFY createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Drop the 'Users' table
  await queryInterface.dropTable('Users');
}
