import { QueryInterface, DataTypes, literal } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {

  // Determine dialect (database type)
  const dialect = (process.env.SQL_TYPE ?? 'postgres').toLowerCase();

  console.log(dialect);

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
      type: dialect === 'mssql' ? DataTypes.STRING : DataTypes.JSON,
      allowNull: true
    },
    newData: {
      type: dialect === 'mssql' ? DataTypes.STRING : DataTypes.JSON,
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

  // Apply dialect-specific changes for MSSQL, MySQL, and PostgreSQL
  if (dialect === 'mysql') {
    // MySQL-specific handling for TIMESTAMP columns
    await queryInterface.sequelize.query(`
      ALTER TABLE Audits
      MODIFY createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;
    `);
  } else if (dialect === 'postgres') {
    // PostgreSQL-specific handling
    await queryInterface.sequelize.query(`
      ALTER TABLE "Audits"
      ALTER COLUMN "createdAt" SET DEFAULT NOW(),
      ALTER COLUMN "updatedAt" SET DEFAULT NOW();
    `);
  } else if (dialect === 'mssql') {
     // MSSQL-specific handling for createdAt and updatedAt default values
     await queryInterface.sequelize.query(`
      ALTER TABLE Audits
      ADD CONSTRAINT DF_Audits_createdAt DEFAULT GETDATE() FOR createdAt;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE Audits
      ADD CONSTRAINT DF_Audits_updatedAt DEFAULT GETDATE() FOR updatedAt;
    `);
  } else {
    throw new Error('Unsupported SQL dialect');
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('Audits');
}
