import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey
  } from 'sequelize-typescript';
  import { User } from './User';
  
  @Table
  export class Audit extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    entityType!: string; // Name of the entity (e.g., "User", "Department")
  
    @Column({ type: DataType.INTEGER, allowNull: false })
    entityId!: number; // ID of the record in the entity table
  
    @Column({ type: DataType.STRING, allowNull: false })
    action!: string; // Action performed (e.g., "CREATE", "UPDATE", "DELETE")
  
    @Column({ type: DataType.JSON, allowNull: true })
    previousData?: object; // JSON object with previous data before change
  
    @Column({ type: DataType.JSON, allowNull: true })
    newData?: object; // JSON object with new data after change
  
    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: true })
    performedBy?: number; // ID of the user who performed the action
  
    // Audit fields
    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    createdAt!: Date; // Timestamp of when the audit entry was created
  }
  