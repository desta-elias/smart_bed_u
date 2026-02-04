import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { BedMovementHistory, MovementType } from './entities/bed-movement-history.entity';
import { BedService } from './bed.service';

@Injectable()
export class BedSchedulerService {
  private readonly logger = new Logger(BedSchedulerService.name);

  constructor(
    @InjectRepository(BedMovementHistory)
    private historyRepository: Repository<BedMovementHistory>,
    private bedService: BedService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleScheduledMovements() {
    try {
      const now = new Date();
      
      // Find all scheduled movements that should be executed now
      const dueMovements = await this.historyRepository.find({
        where: {
          movementType: MovementType.SCHEDULED,
          executed: false,
          scheduledFor: LessThanOrEqual(now),
        },
        relations: ['bed'],
      });

      if (dueMovements.length === 0) {
        return;
      }

      this.logger.log(
        `Executing ${dueMovements.length} scheduled movement(s)`,
      );

      for (const movement of dueMovements) {
        try {
          await this.bedService.executeScheduledMovement(movement.id);
          this.logger.log(
            `Executed scheduled movement ${movement.id} for bed ${movement.bed.bedNumber}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to execute movement ${movement.id}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in scheduled movement handler: ${error.message}`,
      );
    }
  }
}
