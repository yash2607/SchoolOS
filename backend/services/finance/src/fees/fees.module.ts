import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { FeesController } from './fees.controller';
import { FeesService } from './fees.service';
import { FeeItem } from '../entities/fee-item.entity';
import { StudentInvoice } from '../entities/student-invoice.entity';
import { Payment } from '../entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeeItem, StudentInvoice, Payment]),
    JwtModule.register({}),
  ],
  controllers: [FeesController],
  providers: [FeesService],
  exports: [FeesService],
})
export class FeesModule {}
