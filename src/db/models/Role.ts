import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { User } from './User';
import { RolePermission } from './RolePermission';
import { Permission } from './Permission';

@Table
export class Role extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string; // Example: Admin, Trainer, Trainee, Sales

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @HasMany(() => User)
  users!: User[]; // Relationship with users

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions!: Permission[]; // Many-to-many relationship with Permission via RolePermission

  @HasMany(() => RolePermission)
  rolePermissions!: RolePermission[]; // Relationship to RolePermission (join table)

  @Column({ type: DataType.INTEGER, allowNull: true })
  createdBy?: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  updatedBy?: number;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt!: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updatedAt!: Date;
}
