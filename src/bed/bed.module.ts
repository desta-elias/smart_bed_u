import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BedService } from './bed.service';
import { BedController } from './bed.controller';
import { BedSchedulerService } from './bed-scheduler.service';
import { Bed } from './entities/bed.entity';
import { BedMovementHistory } from './entities/bed-movement-history.entity';
import { Patient } from '../patient/entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bed, BedMovementHistory, Patient]),
    ScheduleModule.forRoot(),
  ],
  controllers: [BedController],
  providers: [BedService, BedSchedulerService],
  exports: [BedService],
})
export class BedModule {}
