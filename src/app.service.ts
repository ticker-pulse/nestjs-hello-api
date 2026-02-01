import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcome() {
    return {
      message: 'Welcome to NestJS API',
      version: '1.0.0',
      status: 'running',
    };
  }

  getStatus() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
