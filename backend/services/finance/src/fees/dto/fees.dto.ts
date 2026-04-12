import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeeItemDto {
  @ApiProperty()
  @IsString()
  gradeId: string;

  @ApiProperty({ example: '2025-26' })
  @IsString()
  academicYear: string;

  @ApiProperty({ example: 'Tuition Fee' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Amount in paise/cents' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2025-06-30' })
  @IsString()
  dueDate: string;

  @ApiPropertyOptional({ enum: ['fixed', 'percentage'], default: 'fixed' })
  @IsIn(['fixed', 'percentage'])
  @IsOptional()
  lateFeeType?: 'fixed' | 'percentage';

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  lateFeeValue?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  lateFeeAfterDays?: number;
}

export class UpdateFeeItemDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: ['fixed', 'percentage'] })
  @IsIn(['fixed', 'percentage'])
  @IsOptional()
  lateFeeType?: 'fixed' | 'percentage';

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  lateFeeValue?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  lateFeeAfterDays?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class GenerateInvoicesDto {
  @ApiProperty()
  @IsString()
  gradeId: string;

  @ApiProperty({ example: '2025-26' })
  @IsString()
  academicYear: string;

  @ApiPropertyOptional({ description: 'Array of studentIds to generate for (defaults to all in grade)' })
  @IsString({ each: true })
  @IsOptional()
  studentIds?: string[];
}

export class InitiatePaymentDto {
  @ApiProperty()
  @IsString()
  invoiceId: string;

  @ApiProperty({ description: 'Amount in paise' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Optional callback URL after payment completion' })
  @IsString()
  @IsOptional()
  callbackUrl?: string;
}

export class VerifyPaymentDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsString()
  paymentId: string;

  @ApiProperty()
  @IsString()
  signature: string;
}

export class ManualPaymentDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  invoiceId?: string;

  @ApiProperty({ description: 'Amount in paise' })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['cash', 'cheque', 'bank_transfer'] })
  @IsIn(['cash', 'cheque', 'bank_transfer'])
  method: 'cash' | 'cheque' | 'bank_transfer';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
