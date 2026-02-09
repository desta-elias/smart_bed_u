import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, MoreThan, FindOptionsWhere } from 'typeorm';
import {
  Bed,
  BedStatus,
  MotorType,
  MotorDirection,
  BedDirection,
} from './entities/bed.entity';
import {
  BedMovementHistory,
  MovementType,
} from './entities/bed-movement-history.entity';
import { Patient } from '../patient/entities/patient.entity';
import { User } from '../modules/users/user.entity';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { ManualControlDto } from './dto/manual-control.dto';
import { ScheduleMovementDto } from './dto/schedule-movement.dto';
import { UpdateBedPositionsDto } from './dto/update-bed-positions.dto';

export type BedCommandDirection = BedDirection;

export interface BedCommand {
  motorType: MotorType;
  direction: BedCommandDirection;
  mappedStep: number | null;
  previousPosition: number;
  newPosition: number;
}

@Injectable()
export class BedService {
  private readonly logger = new Logger(BedService.name);
  private readonly arduinoUrl: string;

  constructor(
    @InjectRepository(Bed)
    private bedRepository: Repository<Bed>,
    @InjectRepository(BedMovementHistory)
    private historyRepository: Repository<BedMovementHistory>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private configService: ConfigService,
  ) {
    this.arduinoUrl = this.configService.get<string>(
      'ARDUINO_PC_URL',
      'http://localhost:5000',
    );
  }

  async create(createBedDto: CreateBedDto): Promise<Bed> {
    const existingBed = await this.bedRepository.findOne({
      where: { bedNumber: createBedDto.bedNumber },
    });

    if (existingBed) {
      throw new ConflictException('Bed number already exists');
    }

    const bed = this.bedRepository.create(createBedDto);
    return this.bedRepository.save(bed);
  }

  async findAll(): Promise<Bed[]> {
    return this.bedRepository.find({
      relations: ['currentPatient'],
      order: { bedNumber: 'ASC' },
    });
  }

  async findAvailable(): Promise<Bed[]> {
    return this.bedRepository.find({
      where: { status: BedStatus.AVAILABLE },
      order: { bedNumber: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Bed> {
    const bed = await this.bedRepository.findOne({
      where: { id },
      relations: ['currentPatient'],
    });

    if (!bed) {
      throw new NotFoundException('Bed not found');
    }

    return bed;
  }

  async findByBedNumber(bedNumber: string): Promise<Bed> {
    const bed = await this.bedRepository.findOne({
      where: { bedNumber },
      relations: ['currentPatient'],
    });

    if (!bed) {
      throw new NotFoundException('Bed not found');
    }

    return bed;
  }

  async update(id: number, updateBedDto: UpdateBedDto): Promise<Bed> {
    const bed = await this.findOne(id);
    Object.assign(bed, updateBedDto);
    return this.bedRepository.save(bed);
  }

  async updatePositions(
    id: number,
    updatePositionsDto: UpdateBedPositionsDto,
  ): Promise<{ bed: Bed; commands: BedCommand[] }> {
    const bed = await this.findOne(id);
    const hasAnyField =
      updatePositionsDto.headPosition !== undefined ||
      updatePositionsDto.rightTiltPosition !== undefined ||
      updatePositionsDto.leftTiltPosition !== undefined ||
      updatePositionsDto.legPosition !== undefined;

    if (!hasAnyField) {
      throw new BadRequestException('No position fields provided');
    }

    const commands: BedCommand[] = [];

    if (updatePositionsDto.headPosition !== undefined) {
      const previous = bed.headPosition;
      const next = updatePositionsDto.headPosition;
      bed.headPosition = next;
      const direction = this.getDirectionLabel(previous, next);
      commands.push(
        this.buildCommand(MotorType.HEAD, previous, next, direction),
      );
    }
    if (updatePositionsDto.rightTiltPosition !== undefined) {
      const previous = bed.rightTiltPosition;
      const next = updatePositionsDto.rightTiltPosition;
      bed.rightTiltPosition = next;
      const direction = this.getDirectionLabel(previous, next);
      commands.push(
        this.buildCommand(MotorType.RIGHT_TILT, previous, next, direction),
      );
    }
    if (updatePositionsDto.leftTiltPosition !== undefined) {
      const previous = bed.leftTiltPosition;
      const next = updatePositionsDto.leftTiltPosition;
      bed.leftTiltPosition = next;
      const direction = this.getDirectionLabel(previous, next);
      commands.push(
        this.buildCommand(MotorType.LEFT_TILT, previous, next, direction),
      );
    }
    if (updatePositionsDto.legPosition !== undefined) {
      const previous = bed.legPosition;
      const next = updatePositionsDto.legPosition;
      bed.legPosition = next;
      const direction = this.getDirectionLabel(previous, next);
      commands.push(
        this.buildCommand(MotorType.LEG, previous, next, direction),
      );
    }

    const savedBed = await this.bedRepository.save(bed);
    return { bed: savedBed, commands };
  }

  async remove(id: number): Promise<void> {
    const bed = await this.findOne(id);
    if (bed.status === BedStatus.OCCUPIED) {
      throw new BadRequestException('Cannot delete an occupied bed');
    }
    await this.bedRepository.remove(bed);
  }

  async assignBed(patientId: string, bedNumber: string): Promise<Bed> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const bed = await this.findByBedNumber(bedNumber);

    if (bed.status === BedStatus.OCCUPIED && bed.currentPatient) {
      throw new BadRequestException('Bed is already occupied');
    }

    bed.currentPatient = patient;
    bed.status = BedStatus.OCCUPIED;

    // Update patient's bed field
    patient.bed = bedNumber;
    await this.patientRepository.save(patient);

    return this.bedRepository.save(bed);
  }

  async unassignBed(bedNumber: string): Promise<Bed> {
    const bed = await this.findByBedNumber(bedNumber);

    if (bed.currentPatient) {
      const patient = await this.patientRepository.findOne({
        where: { id: bed.currentPatient.id },
      });
      if (patient) {
        patient.bed = '';
        await this.patientRepository.save(patient);
      }
    }

    bed.currentPatient = null;
    bed.status = BedStatus.AVAILABLE;

    return this.bedRepository.save(bed);
  }

  async unassignBedByPatientId(patientId: string): Promise<Bed | null> {
    const bed = await this.bedRepository.findOne({
      where: { currentPatient: { id: patientId } },
      relations: ['currentPatient'],
    });

    if (!bed) {
      return null;
    }

    if (bed.currentPatient) {
      const patient = await this.patientRepository.findOne({
        where: { id: bed.currentPatient.id },
      });
      if (patient) {
        patient.bed = '';
        await this.patientRepository.save(patient);
      }
    }

    bed.currentPatient = null;
    bed.status = BedStatus.AVAILABLE;

    return this.bedRepository.save(bed);
  }

  async manualControl(
    bedId: number,
    userId: number,
    controlDto: ManualControlDto,
  ): Promise<{ bed: Bed; history: BedMovementHistory; command: BedCommand }> {
    const bed = await this.findOne(bedId);

    if (bed.emergencyStop) {
      throw new BadRequestException('Bed is in emergency stop mode');
    }

    // Calculate new position (simplified calculation)
    const positionField = this.getPositionField(controlDto.motorType);
    const currentPosition = bed[positionField];
    const newPosition = this.calculateNewPosition(
      currentPosition,
      controlDto.direction,
      controlDto.duration,
    );

    bed[positionField] = newPosition;
    await this.bedRepository.save(bed);

    // Log the movement
    const history = await this.logMovement(
      bed,
      userId,
      MovementType.MANUAL,
      controlDto.motorType,
      controlDto.direction,
      controlDto.duration,
      currentPosition,
      newPosition,
      controlDto.notes,
    );

    const command = this.buildCommand(
      controlDto.motorType,
      currentPosition,
      newPosition,
    );
    return { bed, history, command };
  }

  async scheduleMovement(
    bedId: number,
    userId: number,
    scheduleDto: ScheduleMovementDto,
  ): Promise<BedMovementHistory> {
    const bed = await this.findOne(bedId);

    if (bed.emergencyStop) {
      throw new BadRequestException('Bed is in emergency stop mode');
    }

    // Parse scheduled time
    let scheduledDate: Date;
    if (scheduleDto.scheduledFor.includes('T')) {
      // ISO format
      scheduledDate = new Date(scheduleDto.scheduledFor);
    } else {
      // HH:MM:SS format - schedule for today
      const [hours, minutes, seconds] = scheduleDto.scheduledFor.split(':');
      scheduledDate = new Date();
      scheduledDate.setHours(
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds || '0'),
        0,
      );
    }

    if (scheduledDate < new Date()) {
      throw new BadRequestException('Cannot schedule movement in the past');
    }

    // Create scheduled movement record
    const history = this.historyRepository.create({
      bed,
      bedId: bed.id,
      user: { id: userId } as User,
      performedBy: userId,
      patient: bed.currentPatient || null,
      patientId: bed.currentPatient?.id || null,
      movementType: MovementType.SCHEDULED,
      motorType: scheduleDto.motorType,
      direction: scheduleDto.direction,
      duration: scheduleDto.duration,
      scheduledFor: scheduledDate,
      executed: false,
      notes: scheduleDto.notes,
    });

    return this.historyRepository.save(history);
  }

  async emergencyStop(bedId: number, userId: number): Promise<Bed> {
    const bed = await this.findOne(bedId);
    bed.emergencyStop = true;
    await this.bedRepository.save(bed);

    // Log emergency stop
    const history = this.historyRepository.create({
      bed,
      bedId: bed.id,
      user: { id: userId } as User,
      performedBy: userId,
      patient: bed.currentPatient || null,
      patientId: bed.currentPatient?.id || null,
      movementType: MovementType.EMERGENCY_STOP,
      executed: true,
      notes: 'Emergency stop activated',
    });
    await this.historyRepository.save(history);

    return bed;
  }

  async resetEmergencyStop(bedId: number): Promise<Bed> {
    const bed = await this.findOne(bedId);
    bed.emergencyStop = false;
    return this.bedRepository.save(bed);
  }

  async getBedHistory(
    bedId: number,
    limit: number = 50,
  ): Promise<BedMovementHistory[]> {
    return this.historyRepository.find({
      where: { bedId },
      relations: ['user', 'patient'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getScheduledMovements(bedId?: number): Promise<BedMovementHistory[]> {
    const where: FindOptionsWhere<BedMovementHistory> = {
      movementType: MovementType.SCHEDULED,
      executed: false,
      scheduledFor: MoreThan(new Date()),
    };

    if (bedId) {
      where.bedId = bedId;
    }

    return this.historyRepository.find({
      where,
      relations: ['bed', 'user', 'patient'],
      order: { scheduledFor: 'ASC' },
    });
  }

  async executeScheduledMovement(historyId: number): Promise<void> {
    const history = await this.historyRepository.findOne({
      where: { id: historyId },
      relations: ['bed'],
    });

    if (!history || history.executed) {
      return;
    }

    const bed = history.bed;
    if (bed.emergencyStop) {
      return; // Skip execution if emergency stop is active
    }

    const positionField = this.getPositionField(history.motorType);
    const currentPosition = bed[positionField];
    const newPosition = this.calculateNewPosition(
      currentPosition,
      history.direction,
      history.duration,
    );

    bed[positionField] = newPosition;
    await this.bedRepository.save(bed);

    history.executed = true;
    history.previousPosition = currentPosition;
    history.newPosition = newPosition;
    await this.historyRepository.save(history);
  }

  private async logMovement(
    bed: Bed,
    userId: number,
    movementType: MovementType,
    motorType: MotorType,
    direction: MotorDirection,
    duration: number,
    previousPosition: number,
    newPosition: number,
    notes?: string,
  ): Promise<BedMovementHistory> {
    const history = this.historyRepository.create({
      bed,
      bedId: bed.id,
      user: { id: userId } as User,
      performedBy: userId,
      patient: bed.currentPatient || null,
      patientId: bed.currentPatient?.id || null,
      movementType,
      motorType,
      direction,
      duration,
      previousPosition,
      newPosition,
      executed: true,
      notes,
    });

    return this.historyRepository.save(history);
  }

  private getPositionField(
    motorType: MotorType,
  ): 'headPosition' | 'rightTiltPosition' | 'leftTiltPosition' | 'legPosition' {
    const fieldMap = {
      [MotorType.HEAD]: 'headPosition',
      [MotorType.RIGHT_TILT]: 'rightTiltPosition',
      [MotorType.LEFT_TILT]: 'leftTiltPosition',
      [MotorType.LEG]: 'legPosition',
    } as const;
    return fieldMap[motorType];
  }

  private buildCommand(
    motorType: MotorType,
    previousPosition: number,
    newPosition: number,
    directionOverride?: BedCommandDirection,
  ): BedCommand {
    return {
      motorType,
      direction:
        directionOverride ??
        this.getDirectionLabel(previousPosition, newPosition),
      mappedStep: this.mapPositionToStep(newPosition),
      previousPosition,
      newPosition,
    };
  }

  private getDirectionLabel(
    previousPosition: number,
    newPosition: number,
  ): BedCommandDirection {
    if (newPosition > previousPosition) {
      return BedDirection.FORWARD;
    }
    if (newPosition < previousPosition) {
      return BedDirection.BACKWARD;
    }
    return BedDirection.STOP;
  }

  private mapPositionToStep(position: number): number | null {
    if (position < 0) {
      return null;
    }
    if (position < 9) {
      return 0;
    }
    if (position < 18) {
      return 4;
    }
    if (position < 27) {
      return 8;
    }
    if (position < 36) {
      return 12;
    }
    if (position < 45) {
      return 16;
    }
    if (position === 45) {
      return 20;
    }
    return null;
  }
  private calculateNewPosition(
    currentPosition: number,
    direction: MotorDirection,
    duration: number,
  ): number {
    // Simple calculation: ~10 units per second
    const change = duration * 10;
    const newPosition =
      direction === MotorDirection.UP
        ? currentPosition + change
        : currentPosition - change;

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, newPosition));
  }
}
