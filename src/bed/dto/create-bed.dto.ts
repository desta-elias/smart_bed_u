import { IsString, IsEnum, IsOptional } from 'class-validator';
import { BedStatus } from '../entities/bed.entity';

export class CreateBedDto {
  @IsString()
  bedNumber: string;

  @IsString()
  room: string;

  @IsEnum(BedStatus)
  @IsOptional()
  status?: BedStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
