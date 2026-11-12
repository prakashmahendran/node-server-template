import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';

import { Role } from './Role';

@Table
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare firstName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare lastName: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare dateOfBirth?: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  declare phoneNumber?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare address?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare qualification?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare profilePic?: string;

  @Column({
    type: DataType.ENUM('active', 'suspended', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  })
  declare accountStatus: 'active' | 'suspended' | 'inactive';

  @Column({ type: DataType.DATE, allowNull: true })
  declare lastLogin?: Date;

  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare roleId: number; // Foreign key for Role

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare createdBy?: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare updatedBy?: number;

  @BelongsTo(() => Role)
  declare role: Role;

  /** Never expose the password hash when a user is serialized (API responses, audit logs...) */
  // Same signature as Model.toJSON so callers keep their typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public toJSON<T = any>(): T {
    const values = { ...(super.toJSON() as Record<string, unknown>) };
    delete values.password;
    return values as T;
  }
}
