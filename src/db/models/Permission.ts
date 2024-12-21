import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { RolePermission } from './RolePermission';
import { Role } from './Role';

@Table
export class Permission extends Model {
  @Column({ type: DataType.STRING, allowNull: false ,unique: true,})
  action!: string; // The action that the permission allows, now the primary key
  
  @Column({ type: DataType.STRING, allowNull: false })
  groupName!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description!: string;

  // Audit columns
  @Column({ type: DataType.INTEGER, allowNull: true })
  createdBy?: number; // User who created the permission

  @Column({ type: DataType.INTEGER, allowNull: true })
  updatedBy?: number; // User who last updated the permission

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt!: Date; // Timestamp when the permission was created

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updatedAt!: Date; // Timestamp when the permission was last updated

  @BelongsToMany(() => Role, () => RolePermission)
  roles!: Role[];
}
