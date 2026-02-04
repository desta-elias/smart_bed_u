import { PartialType } from '@nestjs/mapped-types';
import { CreateBedDto } from './create-bed.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBedDto extends PartialType(CreateBedDto) {
  @IsBoolean()
  @IsOptional()
  emergencyStop?: boolean;
}
