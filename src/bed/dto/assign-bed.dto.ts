import { IsString, IsUUID } from 'class-validator';

export class AssignBedDto {
  @IsUUID()
  patientId: string;

  @IsString()
  bedNumber: string;
}
