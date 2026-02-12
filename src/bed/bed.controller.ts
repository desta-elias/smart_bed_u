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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BedService } from './bed.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { ManualControlDto } from './dto/manual-control.dto';
import { ScheduleMovementDto } from './dto/schedule-movement.dto';
import { AssignBedDto } from './dto/assign-bed.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { UpdateBedPositionsDto } from './dto/update-bed-positions.dto';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('beds')
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBedDto: CreateBedDto) {
    return this.bedService.create(createBedDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.bedService.findAll();
  }

  @Get('available')
  @UseGuards(JwtAuthGuard)
  findAvailable() {
    return this.bedService.findAvailable();
  }

  @Get('scheduled-movements')
  @UseGuards(JwtAuthGuard)
  getScheduledMovements(@Query('bedId') bedId?: string) {
    const id = bedId ? parseInt(bedId) : undefined;
    return this.bedService.getScheduledMovements(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.bedService.findOne(+id);
  }

  @Get(':id/positions')
  getPositions(@Param('id') id: string) {
    return this.bedService.getBedPositions(+id);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard)
  getBedHistory(@Param('id') id: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.bedService.getBedHistory(+id, limitNum);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateBedDto: UpdateBedDto) {
    return this.bedService.update(+id, updateBedDto);
  }

  @Patch(':id/positions')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updatePositions(
    @Param('id') id: string,
    @Body() updatePositionsDto: UpdateBedPositionsDto,
  ) {
    return this.bedService.updatePositions(+id, updatePositionsDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.bedService.remove(+id);
  }

  @Post('assign')
  @UseGuards(JwtAuthGuard)
  assignBed(@Body() assignBedDto: AssignBedDto) {
    return this.bedService.assignBed(
      assignBedDto.patientId,
      assignBedDto.bedNumber,
    );
  }

  @Post(':id/unassign')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  unassignBed(@Param('id') id: string) {
    return this.bedService
      .findOne(+id)
      .then((bed) => this.bedService.unassignBed(bed.bedNumber));
  }

  @Post(':id/manual-control')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  manualControl(
    @Param('id') id: string,
    @Body() controlDto: ManualControlDto,
    @Request() req: RequestWithUser,
  ) {
    return this.bedService.manualControl(+id, req.user.userId, controlDto);
  }

  @Post(':id/schedule-movement')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  scheduleMovement(
    @Param('id') id: string,
    @Body() scheduleDto: ScheduleMovementDto,
    @Request() req: RequestWithUser,
  ) {
    return this.bedService.scheduleMovement(+id, req.user.userId, scheduleDto);
  }

  @Get(':id/emergency-stop')
  getEmergencyStopStatus(@Param('id') id: string) {
    return this.bedService.getEmergencyStopStatus(+id);
  }

  @Post(':id/emergency-stop')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  emergencyStop(@Param('id') id: string, @Request() req?: RequestWithUser) {
    return this.bedService.emergencyStop(+id, req?.user?.userId);
  }
}
