import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchoolModule } from './school/school.module';
import { StudentModule } from './students/student.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AcademicYear } from './entities/academic-year.entity';
import { Grade } from './entities/grade.entity';
import { Section } from './entities/section.entity';
import { Subject } from './entities/subject.entity';
import { Student } from './entities/student.entity';
import { Guardian } from './entities/guardian.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL') ?? '',
        entities: [AcademicYear, Grade, Section, Subject, Student, Guardian],
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        logging: config.get('APP_ENV') !== 'production',
      }),
    }),
    SchoolModule,
    StudentModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
