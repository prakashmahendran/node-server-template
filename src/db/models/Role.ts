import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { User } from './User';
import { RolePermission } from './RolePermission';
import { Permission } from './Permission';

@Table
export class Role extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string; // Example: Admin, Trainer, Trainee, Sales

  @Column({ type: DataType.STRING, allowNull: true })
  declare description?: string;

  @HasMany(() => User)
  declare users: User[]; // Relationship with users

  @BelongsToMany(() => Permission, () => RolePermission)
  declare permissions: Permission[]; // Many-to-many relationship with Permission via RolePermission

  @HasMany(() => RolePermission)
  declare rolePermissions: RolePermission[]; // Relationship to RolePermission (join table)

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare createdBy?: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare updatedBy?: number;
}
