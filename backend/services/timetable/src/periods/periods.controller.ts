import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PeriodsService } from './periods.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import { CreatePeriodDto } from './dto/create-period.dto';

@ApiTags('periods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get()
  @ApiOperation({ summary: "List school's periods ordered by order" })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.periodsService.findAll(user.schoolId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a period' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePeriodDto) {
    return this.periodsService.create(user.schoolId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a period' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.periodsService.remove(user.schoolId, id);
  }
}
