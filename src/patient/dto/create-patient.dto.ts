import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreatePatientDto {
  @IsNotEmpty() @IsString() name: string;
  @IsNotEmpty() @IsString() bed: string;
  @IsNotEmpty() @IsString() room: string;
  @IsNotEmpty() @IsString() condition: string;
  @IsNotEmpty() @IsInt() age: number;
  @IsNotEmpty() @IsString() gender: string;
  @IsNotEmpty() @IsString() admitted: string;
}
