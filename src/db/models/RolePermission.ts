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
  @Column({ type: DataType.INTEGER, allowNull: false })
  roleId!: number; // Foreign key referencing Role

  @ForeignKey(() => Permission)
  @Column({ type: DataType.INTEGER, allowNull: false })
  permissionId!: string; // Foreign key referencing Permission

  @BelongsTo(() => Role)
  role!: Role;

  @BelongsTo(() => Permission)
  permission!: Permission;
}
