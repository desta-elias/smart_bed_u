import {
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { MotorType, MotorDirection } from '../entities/bed.entity';

export class ScheduleMovementDto {
  @IsEnum(MotorType)
  motorType: MotorType;

  @IsEnum(MotorDirection)
  direction: MotorDirection;

  @IsInt()
  @Min(1)
  @Max(60)
  duration: number; // seconds

  @IsDateString()
  scheduledFor: string; // ISO 8601 format or HH:MM:SS for today

  @IsString()
  @IsOptional()
  notes?: string;
}
