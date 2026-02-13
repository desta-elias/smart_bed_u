import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class BedSensorsDto {
  @IsNumber()
  vibration: number;

  @IsNumber()
  temperature: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  unit?: string;
}

export class UpdateBedSensorsDto {
  @ValidateNested()
  @Type(() => BedSensorsDto)
  sensors: BedSensorsDto;
}
