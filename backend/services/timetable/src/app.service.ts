import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck(): { status: string; service: string } {
    return { status: 'ok', service: 'timetable-service' };
  }
}
