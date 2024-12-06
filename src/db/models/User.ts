import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo
} from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string; // User's name

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string; // User's email

  @Column({ type: DataType.STRING, allowNull: false })
  password!: string; // User's password

  @Column({ type: DataType.BLOB, allowNull: true })
  profilePic?: Buffer; // User's profile picture as a BLOB

  @Column({ type: DataType.STRING, allowNull: true })
  phoneNumber?: string; // User's phone number

  @Column({ type: DataType.STRING, allowNull: true })
  role?: string; // Foreign key for Role

  @Column({ type: DataType.STRING, allowNull: true })
  destination?: string; // User's destination

  @Column({ type: DataType.STRING, allowNull: true })
  department!: number; // Foreign key for Department

  @Column({ type: DataType.DATE, allowNull: true })
  dateOfJoining?: Date; // Date of joining

  @Column({ type: DataType.STRING, allowNull: true })
  position?: string; // User's position

  @Column({ type: DataType.STRING, allowNull: true })
  employmentType?: string; // Type of employment

  @Column({ type: DataType.DATE, allowNull: true })
  dateOfTermination?: Date; // Date of termination

  @Column({ type: DataType.STRING, allowNull: true })
  reasonForTermination?: string; // Reason for termination

  // Audit fields
  @Column({ type: DataType.INTEGER, allowNull: true })
  createdBy?: number; // User ID who created this record

  @Column({ type: DataType.INTEGER, allowNull: true })
  updatedBy?: number; // User ID who last updated this record
}
