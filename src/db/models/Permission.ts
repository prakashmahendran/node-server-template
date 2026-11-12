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
  declare action: string; // The action that the permission allows, now the primary key
  
  @Column({ type: DataType.STRING, allowNull: false })
  declare groupName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string;

  // Audit columns
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare createdBy?: number; // User who created the permission

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare updatedBy?: number; // User who last updated the permission

  @BelongsToMany(() => Role, () => RolePermission)
  declare roles: Role[];
}
