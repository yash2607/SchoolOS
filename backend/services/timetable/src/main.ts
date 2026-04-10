import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '../../../libs/filters/GlobalExceptionFilter';
import { LoggingInterceptor } from '../../../libs/interceptors/LoggingInterceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  if (process.env['APP_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SchoolOS Timetable Service')
      .setDescription('Timetable microservice API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env['PORT'] ?? 3008;
  await app.listen(port);
  console.log(`SchoolOS Timetable Service running on port ${port}`);
}

void bootstrap();
