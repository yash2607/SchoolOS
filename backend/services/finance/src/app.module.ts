import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeesModule } from './fees/fees.module';
import { FeeItem } from './entities/fee-item.entity';
import { StudentInvoice } from './entities/student-invoice.entity';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL') ?? '',
        entities: [FeeItem, StudentInvoice, Payment],
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        logging: config.get('APP_ENV') !== 'production',
      }),
    }),
    FeesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
