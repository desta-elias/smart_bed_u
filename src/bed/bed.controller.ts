import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { BedService } from './bed.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { ManualControlDto } from './dto/manual-control.dto';
import { ScheduleMovementDto } from './dto/schedule-movement.dto';
import { AssignBedDto } from './dto/assign-bed.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('beds')
@UseGuards(JwtAuthGuard)
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Post()
  create(@Body() createBedDto: CreateBedDto) {
    return this.bedService.create(createBedDto);
  }

  @Get()
  findAll() {
    return this.bedService.findAll();
  }

  @Get('available')
  findAvailable() {
    return this.bedService.findAvailable();
  }

  @Get('scheduled-movements')
  getScheduledMovements(@Query('bedId') bedId?: string) {
    const id = bedId ? parseInt(bedId) : undefined;
    return this.bedService.getScheduledMovements(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bedService.findOne(+id);
  }

  @Get(':id/history')
  getBedHistory(@Param('id') id: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.bedService.getBedHistory(+id, limitNum);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBedDto: UpdateBedDto) {
    return this.bedService.update(+id, updateBedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bedService.remove(+id);
  }

  @Post('assign')
  assignBed(@Body() assignBedDto: AssignBedDto) {
    return this.bedService.assignBed(
      assignBedDto.patientId,
      assignBedDto.bedNumber,
    );
  }

  @Post(':id/unassign')
  @HttpCode(HttpStatus.OK)
  unassignBed(@Param('id') id: string) {
    return this.bedService.findOne(+id).then((bed) =>
      this.bedService.unassignBed(bed.bedNumber),
    );
  }

  @Post(':id/manual-control')
  @HttpCode(HttpStatus.OK)
  manualControl(
    @Param('id') id: string,
    @Body() controlDto: ManualControlDto,
    @Request() req,
  ) {
    return this.bedService.manualControl(+id, req.user.userId, controlDto);
  }

  @Post(':id/schedule-movement')
  @HttpCode(HttpStatus.OK)
  scheduleMovement(
    @Param('id') id: string,
    @Body() scheduleDto: ScheduleMovementDto,
    @Request() req,
  ) {
    return this.bedService.scheduleMovement(+id, req.user.userId, scheduleDto);
  }

  @Post(':id/emergency-stop')
  @HttpCode(HttpStatus.OK)
  emergencyStop(@Param('id') id: string, @Request() req) {
    return this.bedService.emergencyStop(+id, req.user.userId);
  }

  @Post(':id/reset-emergency-stop')
  @HttpCode(HttpStatus.OK)
  resetEmergencyStop(@Param('id') id: string) {
    return this.bedService.resetEmergencyStop(+id);
  }
}
