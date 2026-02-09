import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientsService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Request } from 'express';

interface AuthenticatedUser {
  sub?: string;
  userId?: string;
  id?: string;
}

@Controller('patients')
@UseGuards(AuthGuard('jwt'))
export class PatientsController {
  constructor(private readonly svc: PatientsService) {}

  private getUserIdFromReq(req: Request): number {
    // JWT payload shape may be { sub, username } — adjust as needed
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = (req as any).user as AuthenticatedUser;
    const userId = user?.sub ?? user?.userId ?? user?.id;
    return parseInt(userId ?? '0', 10);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Req() req: Request, @Body() dto: CreatePatientDto) {
    const userId = this.getUserIdFromReq(req);
    return this.svc.create(userId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = this.getUserIdFromReq(req);
    return this.svc.findAll(userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = this.getUserIdFromReq(req);
    return this.svc.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    const userId = this.getUserIdFromReq(req);
    return this.svc.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = this.getUserIdFromReq(req);
    return this.svc.remove(id, userId);
  }
}
