import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { Role } from './Role';
import { Permission } from './Permission';

@Table
export class RolePermission extends Model {
  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true })
  roleId!: number; // Foreign key referencing Role

  @ForeignKey(() => Permission)
  @Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
  permissionId!: string; // Foreign key referencing Permission

  @BelongsTo(() => Role)
  role!: Role;

  @BelongsTo(() => Permission)
  permission!: Permission;
}
