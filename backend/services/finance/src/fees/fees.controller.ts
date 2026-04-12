import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  RawBodyRequest,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { FeesService } from './fees.service';
import { JwtAuthGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { JwtPayload } from '../common/jwt.guard';
import {
  CreateFeeItemDto,
  UpdateFeeItemDto,
  GenerateInvoicesDto,
  InitiatePaymentDto,
  ManualPaymentDto,
} from './dto/fees.dto';

@ApiTags('fees')
@Controller()
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  // ─── Fee Structure ────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('fees/structure')
  @ApiOperation({ summary: 'Create fee item for a grade' })
  createFeeItem(@CurrentUser() user: JwtPayload, @Body() dto: CreateFeeItemDto) {
    return this.feesService.createFeeItem(user.schoolId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('fees/structure')
  @ApiOperation({ summary: 'List fee items' })
  @ApiQuery({ name: 'gradeId', required: false })
  @ApiQuery({ name: 'academicYear', required: false })
  listFeeItems(
    @CurrentUser() user: JwtPayload,
    @Query('gradeId') gradeId?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.feesService.listFeeItems(user.schoolId, {
      ...(gradeId ? { gradeId } : {}),
      ...(academicYear ? { academicYear } : {}),
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('fees/structure/:id')
  @ApiOperation({ summary: 'Update fee item' })
  updateFeeItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateFeeItemDto,
  ) {
    return this.feesService.updateFeeItem(user.schoolId, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('fees/structure/:id')
  @ApiOperation({ summary: 'Deactivate fee item' })
  deactivateFeeItem(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.feesService.deactivateFeeItem(user.schoolId, id);
  }

  // ─── Invoices ─────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('fees/invoices/generate')
  @ApiOperation({ summary: 'Generate invoices for all students in a grade' })
  generateInvoices(@CurrentUser() user: JwtPayload, @Body() dto: GenerateInvoicesDto) {
    return this.feesService.generateInvoices(user.schoolId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('fees/invoices')
  @ApiOperation({ summary: 'List invoices for a student' })
  @ApiQuery({ name: 'studentId', required: true })
  listInvoices(@CurrentUser() user: JwtPayload, @Query('studentId') studentId: string) {
    return this.feesService.listInvoicesForStudent(user.schoolId, studentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('fees/invoices/overdue')
  @ApiOperation({ summary: 'List overdue invoices' })
  @ApiQuery({ name: 'gradeId', required: false })
  listOverdue(@CurrentUser() user: JwtPayload, @Query('gradeId') gradeId?: string) {
    return this.feesService.listOverdueInvoices(user.schoolId, gradeId);
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('fees/payment/initiate')
  @ApiOperation({ summary: 'Initiate Razorpay payment order' })
  initiatePayment(@CurrentUser() user: JwtPayload, @Body() dto: InitiatePaymentDto) {
    return this.feesService.initiatePayment(user.schoolId, user.sub, dto);
  }

  @Post('fees/payment/webhook')
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
    return this.feesService.handleWebhook(rawBody, signature ?? '');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('fees/payment/manual')
  @ApiOperation({ summary: 'Record manual/offline payment' })
  recordManualPayment(@CurrentUser() user: JwtPayload, @Body() dto: ManualPaymentDto) {
    return this.feesService.recordManualPayment(user.schoolId, user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('fees/payment/:studentId')
  @ApiOperation({ summary: 'Payment history for a student' })
  paymentHistory(@CurrentUser() user: JwtPayload, @Param('studentId') studentId: string) {
    return this.feesService.paymentHistory(user.schoolId, studentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('fees/reports/collection')
  @ApiOperation({ summary: 'Collection report' })
  @ApiQuery({ name: 'fromDate', required: true })
  @ApiQuery({ name: 'toDate', required: true })
  collectionReport(
    @CurrentUser() user: JwtPayload,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    return this.feesService.collectionReport(user.schoolId, fromDate, toDate);
  }
}
