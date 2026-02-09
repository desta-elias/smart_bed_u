import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { BedService } from '../bed/bed.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private bedService: BedService,
  ) {}

  async create(userId: number, createDto: CreatePatientDto): Promise<Patient> {
    // First, create the patient
    const patient = this.patientsRepository.create({
      ...createDto,
      user: { id: userId },
    });
    const savedPatient = await this.patientsRepository.save(patient);

    // Then, assign the bed if provided
    if (createDto.bed) {
      try {
        // Ensure the bed exists; create it if missing
        try {
          await this.bedService.findByBedNumber(createDto.bed);
        } catch (_error) {
          await this.bedService.create({
            bedNumber: createDto.bed,
            room: createDto.room,
          });
        }
        await this.bedService.assignBed(savedPatient.id, createDto.bed);
      } catch (error) {
        // If bed assignment fails, we should still return the patient
        // but you might want to handle this differently based on your requirements
        throw new BadRequestException(
          `Patient created but bed assignment failed: ${(error as Error).message}`,
        );
      }
    }

    return savedPatient;
  }

  async findAll(userId: number): Promise<Patient[]> {
    return this.patientsRepository.find({ where: { user: { id: userId } } });
  }

  async findOne(id: string, userId: number): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(
    id: string,
    dto: UpdatePatientDto,
    userId: number,
  ): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Patient not found');
    if (patient.user && patient.user.id !== userId)
      throw new ForbiddenException();
    await this.patientsRepository.update(id, dto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: number): Promise<void> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Patient not found');
    if (patient.user && patient.user.id !== userId)
      throw new ForbiddenException();
    await this.bedService.unassignBedByPatientId(id);
    await this.patientsRepository.delete(id);
  }
}
