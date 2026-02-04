import { IsEnum, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { MotorType, MotorDirection } from '../entities/bed.entity';

export class ManualControlDto {
  @IsEnum(MotorType)
  motorType: MotorType;

  @IsEnum(MotorDirection)
  direction: MotorDirection;

  @IsInt()
  @Min(1)
  @Max(60)
  duration: number; // seconds

  @IsString()
  @IsOptional()
  notes?: string;
}
