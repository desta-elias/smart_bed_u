import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bed, MotorType, MotorDirection } from './bed.entity';
import { User } from '../../modules/users/user.entity';
import { Patient } from '../../patient/entities/patient.entity';

export enum MovementType {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  EMERGENCY_STOP = 'EMERGENCY_STOP',
}

@Entity('bed_movement_history')
export class BedMovementHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bed, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bedId' })
  bed: Bed;

  @Column()
  bedId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'performedBy' })
  user: User;

  @Column()
  performedBy: number;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient | null;

  @Column({ nullable: true })
  patientId: string | null;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  movementType: MovementType;

  @Column({
    type: 'enum',
    enum: MotorType,
    nullable: true,
  })
  motorType: MotorType;

  @Column({
    type: 'enum',
    enum: MotorDirection,
    nullable: true,
  })
  direction: MotorDirection;

  @Column({ type: 'int', nullable: true })
  duration: number; // in seconds

  @Column({ type: 'int', nullable: true })
  previousPosition: number;

  @Column({ type: 'int', nullable: true })
  newPosition: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date;

  @Column({ type: 'boolean', default: false })
  executed: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  timestamp: Date;
}
