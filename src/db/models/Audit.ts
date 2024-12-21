import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Default
} from 'sequelize-typescript';
import { User } from './User';

// Determine dialect (database type)
const dialect = (process.env.SQL_TYPE ?? 'postgres').toLowerCase();

@Table
export class Audit extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  entityType!: string; // Name of the entity (e.g., "User", "Department")

  @Column({ type: DataType.INTEGER, allowNull: false })
  entityId!: number; // ID of the record in the entity table

  @Column({ type: DataType.STRING, allowNull: false })
  action!: string; // Action performed (e.g., "CREATE", "UPDATE", "DELETE")

  // JSON fields - support different types based on dialect
  @Column({
    type: dialect === 'mssql' ? DataType.STRING : DataType.JSON,
    allowNull: true,
    get() {
      const value = this.getDataValue('previousData');
      if (typeof value === 'string') {
        return JSON.parse(value); // Parse the string as JSON
      }
      return value;
    }
  })
  previousData?: object; // JSON object with previous data before change

  @Column({
    type: dialect === 'mssql' ? DataType.STRING : DataType.JSON,
    allowNull: true,
    get() {
      const value = this.getDataValue('newData');
      if (typeof value === 'string') {
        return JSON.parse(value); // Parse the string as JSON
      }
      return value;
    }
  })
  newData?: object; // JSON object with new data after change

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  performedBy?: number; // ID of the user who performed the action

  // Audit fields
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false
  })
  createdAt!: Date; // Timestamp of when the audit entry was created

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: false
  })
  updatedAt!: Date; // Timestamp of when the audit entry was last updated
}
