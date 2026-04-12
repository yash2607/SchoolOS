import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as crypto from 'crypto';
import { FeeItem } from '../entities/fee-item.entity';
import { StudentInvoice } from '../entities/student-invoice.entity';
import { Payment } from '../entities/payment.entity';
import type {
  CreateFeeItemDto,
  UpdateFeeItemDto,
  GenerateInvoicesDto,
  InitiatePaymentDto,
  ManualPaymentDto,
} from './dto/fees.dto';

@Injectable()
export class FeesService {
  private readonly razorpayKeyId: string | undefined;
  private readonly razorpayKeySecret: string | undefined;
  private readonly razorpayWebhookSecret: string | undefined;

  constructor(
    @InjectRepository(FeeItem) private readonly feeItemRepo: Repository<FeeItem>,
    @InjectRepository(StudentInvoice) private readonly invoiceRepo: Repository<StudentInvoice>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
  ) {
    this.razorpayKeyId = process.env['RAZORPAY_KEY_ID'];
    this.razorpayKeySecret = process.env['RAZORPAY_KEY_SECRET'];
    this.razorpayWebhookSecret = process.env['RAZORPAY_WEBHOOK_SECRET'];
  }

  // ─── Fee Structure ────────────────────────────────────────────────────────

  async createFeeItem(schoolId: string, dto: CreateFeeItemDto): Promise<FeeItem> {
    const item = this.feeItemRepo.create({
      schoolId,
      gradeId: dto.gradeId,
      academicYear: dto.academicYear,
      name: dto.name,
      amount: dto.amount,
      currency: dto.currency ?? 'INR',
      dueDate: dto.dueDate,
      lateFeeType: dto.lateFeeType ?? 'fixed',
      lateFeeValue: dto.lateFeeValue ?? 0,
      lateFeeAfterDays: dto.lateFeeAfterDays ?? 0,
      isActive: true,
    });
    return this.feeItemRepo.save(item);
  }

  async listFeeItems(
    schoolId: string,
    filters: { gradeId?: string; academicYear?: string },
  ): Promise<FeeItem[]> {
    const qb = this.feeItemRepo
      .createQueryBuilder('f')
      .where('f.schoolId = :schoolId', { schoolId })
      .andWhere('f.isActive = true');

    if (filters.gradeId) qb.andWhere('f.gradeId = :gradeId', { gradeId: filters.gradeId });
    if (filters.academicYear) qb.andWhere('f.academicYear = :academicYear', { academicYear: filters.academicYear });

    return qb.orderBy('f.dueDate', 'ASC').getMany();
  }

  async updateFeeItem(schoolId: string, id: string, dto: UpdateFeeItemDto): Promise<FeeItem> {
    const item = await this.feeItemRepo.findOne({ where: { id, schoolId } });
    if (!item) throw new NotFoundException('Fee item not found');

    Object.assign(item, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
      ...(dto.lateFeeType !== undefined && { lateFeeType: dto.lateFeeType }),
      ...(dto.lateFeeValue !== undefined && { lateFeeValue: dto.lateFeeValue }),
      ...(dto.lateFeeAfterDays !== undefined && { lateFeeAfterDays: dto.lateFeeAfterDays }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });

    return this.feeItemRepo.save(item);
  }

  async deactivateFeeItem(schoolId: string, id: string): Promise<{ success: boolean }> {
    const item = await this.feeItemRepo.findOne({ where: { id, schoolId } });
    if (!item) throw new NotFoundException('Fee item not found');
    item.isActive = false;
    await this.feeItemRepo.save(item);
    return { success: true };
  }

  // ─── Invoices ─────────────────────────────────────────────────────────────

  async generateInvoices(
    schoolId: string,
    dto: GenerateInvoicesDto,
  ): Promise<{ created: number; skipped: number }> {
    const feeItems = await this.feeItemRepo.find({
      where: { schoolId, gradeId: dto.gradeId, academicYear: dto.academicYear, isActive: true },
    });

    if (!feeItems.length) {
      throw new BadRequestException('No active fee items found for this grade and academic year');
    }

    if (!dto.studentIds?.length) {
      throw new BadRequestException('studentIds array is required (pass student IDs for the grade)');
    }

    let created = 0;
    let skipped = 0;

    for (const studentId of dto.studentIds) {
      for (const feeItem of feeItems) {
        const existing = await this.invoiceRepo.findOne({
          where: { schoolId, studentId, feeItemId: feeItem.id, academicYear: dto.academicYear },
        });

        if (existing) {
          skipped++;
          continue;
        }

        const invoice = this.invoiceRepo.create({
          schoolId,
          studentId,
          feeItemId: feeItem.id,
          academicYear: dto.academicYear,
          dueAmount: feeItem.amount,
          paidAmount: 0,
          status: 'unpaid',
          dueDate: feeItem.dueDate,
        });

        await this.invoiceRepo.save(invoice);
        created++;
      }
    }

    return { created, skipped };
  }

  async listInvoicesForStudent(schoolId: string, studentId: string): Promise<StudentInvoice[]> {
    return this.invoiceRepo.find({
      where: { schoolId, studentId },
      order: { dueDate: 'DESC' },
    });
  }

  async getStudentFeeAccount(schoolId: string, studentId: string) {
    const invoices = await this.invoiceRepo
      .createQueryBuilder('i')
      .leftJoinAndMapOne('i.feeItem', FeeItem, 'f', 'f.id = i.feeItemId')
      .where('i.schoolId = :schoolId', { schoolId })
      .andWhere('i.studentId = :studentId', { studentId })
      .orderBy('i.dueDate', 'DESC')
      .getMany();

    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.dueAmount), 0);
    const paidAmount = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    
    const now = new Date().toISOString().split('T')[0] ?? '';

    const installments = invoices.map((inv: any) => {
      let status = inv.status;
      if (['unpaid', 'partial'].includes(status) && inv.dueDate < now) {
        status = 'overdue';
      }
      return {
        id: inv.id,
        feeAccountId: `${studentId}-account`,
        feeHeadId: inv.feeItemId,
        feeHeadName: inv.feeItem?.name ?? 'Unknown Fee',
        dueDate: inv.dueDate,
        amount: Number(inv.dueAmount),
        lateFeeApplied: 0,
        status,
        paidAt: status === 'paid' ? inv.updatedAt.toISOString() : null,
        paymentReference: null,
      };
    });

    return {
      id: `${studentId}-account`,
      studentId,
      feeStructureId: invoices[0]?.academicYear ?? 'current',
      totalAmount,
      paidAmount,
      outstandingAmount: totalAmount - paidAmount,
      installments,
    };
  }

  async getStudentFeeSummary(schoolId: string, studentId: string) {
    const account = await this.getStudentFeeAccount(schoolId, studentId);
    const pendingInstallments = account.installments.filter((i: any) => ['unpaid', 'partial', 'overdue'].includes(i.status));
    const nextInstallment = pendingInstallments.sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate))[0] ?? null;

    return {
      totalDue: account.totalAmount,
      totalPaid: account.paidAmount,
      outstanding: account.outstandingAmount,
      nextInstallment,
    };
  }

  async listOverdueInvoices(schoolId: string, gradeId?: string): Promise<StudentInvoice[]> {
    const now = new Date().toISOString().split('T')[0] ?? '';

    // Mark overdue
    const unpaid = await this.invoiceRepo
      .createQueryBuilder('i')
      .where('i.schoolId = :schoolId', { schoolId })
      .andWhere("i.status IN ('unpaid', 'partial')")
      .andWhere('i.dueDate < :now', { now })
      .getMany();

    for (const inv of unpaid) {
      inv.status = 'overdue';
      await this.invoiceRepo.save(inv);
    }

    const qb = this.invoiceRepo
      .createQueryBuilder('i')
      .where('i.schoolId = :schoolId', { schoolId })
      .andWhere("i.status = 'overdue'");

    if (gradeId) {
      // Join with fee_items to filter by gradeId
      qb.innerJoin(FeeItem, 'f', 'f.id = i.feeItemId AND f.gradeId = :gradeId', { gradeId });
    }

    return qb.orderBy('i.dueDate', 'ASC').getMany();
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  async initiatePayment(
    schoolId: string,
    createdByUserId: string,
    dto: InitiatePaymentDto,
  ): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: dto.invoiceId, schoolId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    let gatewayOrderId: string;
    const currency = 'INR';

    if (this.razorpayKeyId && this.razorpayKeySecret) {
      try {
        // Use axios-style fetch via node built-ins to call Razorpay API
        const credentials = Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: dto.amount,
            currency,
            receipt: `inv_${dto.invoiceId.slice(0, 8)}`,
          }),
        });

        if (!response.ok) {
          throw new BadRequestException('Razorpay order creation failed');
        }

        const data = await response.json() as { id: string };
        gatewayOrderId = data.id;
      } catch (err) {
        throw new BadRequestException(`Razorpay error: ${(err as Error).message}`);
      }
    } else {
      // Dev mock
      gatewayOrderId = `order_mock_${Date.now()}`;
    }

    const payment = this.paymentRepo.create({
      schoolId,
      studentId: invoice.studentId,
      invoiceId: dto.invoiceId,
      amount: dto.amount,
      currency,
      method: 'online',
      gatewayOrderId,
      gatewayPaymentId: null,
      status: 'pending',
      receiptKey: null,
      notes: null,
      createdByUserId,
      paidAt: null,
    });
    await this.paymentRepo.save(payment);

    return {
      orderId: gatewayOrderId,
      amount: dto.amount,
      currency,
      keyId: this.razorpayKeyId ?? 'rzp_test_mock',
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<{ received: boolean }> {
    if (this.razorpayWebhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpayWebhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        // Still return 200 to avoid Razorpay retries flooding; just ignore
        return { received: true };
      }
    }

    let event: { event: string; payload: { payment: { entity: { id: string; order_id: string; amount: number } } } };
    try {
      event = JSON.parse(rawBody.toString()) as typeof event;
    } catch {
      return { received: true };
    }

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const payment = await this.paymentRepo.findOne({
        where: { gatewayOrderId: paymentEntity.order_id },
      });

      if (payment) {
        payment.status = 'success';
        payment.gatewayPaymentId = paymentEntity.id;
        payment.paidAt = new Date();
        await this.paymentRepo.save(payment);

        if (payment.invoiceId) {
          await this.updateInvoiceAfterPayment(payment.invoiceId, paymentEntity.amount);
        }
      }
    }

    return { received: true };
  }

  private async updateInvoiceAfterPayment(invoiceId: string, paidAmount: number): Promise<void> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) return;

    invoice.paidAmount = Number(invoice.paidAmount) + paidAmount;

    if (invoice.paidAmount >= invoice.dueAmount) {
      invoice.status = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partial';
    }

    await this.invoiceRepo.save(invoice);
  }

  async recordManualPayment(
    schoolId: string,
    createdByUserId: string,
    dto: ManualPaymentDto,
  ): Promise<Payment> {
    const payment = this.paymentRepo.create({
      schoolId,
      studentId: dto.studentId,
      invoiceId: dto.invoiceId ?? null,
      amount: dto.amount,
      currency: 'INR',
      method: dto.method,
      gatewayOrderId: null,
      gatewayPaymentId: null,
      status: 'success',
      receiptKey: null,
      notes: dto.notes ?? null,
      createdByUserId,
      paidAt: new Date(),
    });

    const saved = await this.paymentRepo.save(payment);

    if (dto.invoiceId) {
      await this.updateInvoiceAfterPayment(dto.invoiceId, dto.amount);
    }

    return saved;
  }

  async paymentHistory(schoolId: string, studentId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { schoolId, studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async collectionReport(
    schoolId: string,
    fromDate: string,
    toDate: string,
  ): Promise<{
    total: number;
    byMethod: Record<string, number>;
    payments: Payment[];
  }> {
    const payments = await this.paymentRepo
      .createQueryBuilder('p')
      .where('p.schoolId = :schoolId', { schoolId })
      .andWhere("p.status = 'success'")
      .andWhere('p.paidAt >= :fromDate', { fromDate: new Date(fromDate) })
      .andWhere('p.paidAt <= :toDate', { toDate: new Date(toDate + 'T23:59:59Z') })
      .orderBy('p.paidAt', 'DESC')
      .getMany();

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const byMethod: Record<string, number> = {};

    for (const p of payments) {
      byMethod[p.method] = (byMethod[p.method] ?? 0) + Number(p.amount);
    }

    return { total, byMethod, payments };
  }
}
