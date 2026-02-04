import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientsService } from './patient.service';
import { PatientsController } from './patient.controller';
import { BedModule } from '../bed/bed.module';

@Module({
  imports: [TypeOrmModule.forFeature([Patient]), BedModule],
  providers: [PatientsService],
  controllers: [PatientsController],
})
export class PatientsModule {}
