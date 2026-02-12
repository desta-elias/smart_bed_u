import { IsNumber, IsOptional, Max, Min, IsObject, IsIn } from 'class-validator';

class DirectionDto {
  @IsOptional()
  @IsIn(['forward', 'backward', 'stop'])
  head?: string;

  @IsOptional()
  @IsIn(['forward', 'backward', 'stop'])
  rightTilt?: string;

  @IsOptional()
  @IsIn(['forward', 'backward', 'stop'])
  leftTilt?: string;

  @IsOptional()
  @IsIn(['forward', 'backward', 'stop'])
  leg?: string;
}

export class UpdateBedPositionsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  headPosition?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rightTiltPosition?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  leftTiltPosition?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  legPosition?: number;

  @IsOptional()
  @IsObject()
  direction?: DirectionDto;
}
