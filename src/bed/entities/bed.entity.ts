import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';

export enum BedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum MotorType {
  HEAD = 'HEAD',
  RIGHT_TILT = 'RIGHT_TILT',
  LEFT_TILT = 'LEFT_TILT',
  LEG = 'LEG',
}

export enum MotorDirection {
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum BedDirection {
  FORWARD = 'FORWARD',
  BACKWARD = 'BACKWARD',
  STOP = 'STOP',
}

@Entity('beds')
export class Bed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  bedNumber: string;

  @Column()
  room: string;

  @Column({
    type: 'enum',
    enum: BedStatus,
    default: BedStatus.AVAILABLE,
  })
  status: BedStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Motor positions (0-100 scale, 0 = fully retracted, 100 = fully extended)
  @Column({ type: 'integer', default: 0 })
  headPosition: number;

  @Column({ type: 'integer', default: 0 })
  rightTiltPosition: number;

  @Column({ type: 'integer', default: 0 })
  leftTiltPosition: number;

  @Column({ type: 'integer', default: 0 })
  legPosition: number;

  @Column({ type: 'boolean', default: false })
  emergencyStop: boolean;

  @OneToOne(() => Patient, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  currentPatient: Patient | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
