import { Matches } from 'class-validator';

export class BedManagementPinDto {
  @Matches(/^\d{4}$/)
  pin: string;
}

