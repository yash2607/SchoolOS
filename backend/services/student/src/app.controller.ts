import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthCheck(): { status: string; service: string } {
    return this.appService.healthCheck();
  }
}
