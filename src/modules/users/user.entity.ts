import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { UserRole } from './enums/user-role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  // inverse relation for patients
  @OneToMany(() => Patient, (patient) => patient.user)
  patients: Patient[];
}
