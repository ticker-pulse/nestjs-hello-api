import { Injectable } from '@nestjs/common';

interface WelcomeResponse {
  message: string;
  version: string;
  status: string;
}

interface StatusResponse {
  status: string;
  timestamp: string;
}

@Injectable()
export class AppService {
  getWelcome(): WelcomeResponse {
    return {
      message: 'Welcome to NestJS API',
      version: '1.0.0',
      status: 'running',
    };
  }

  getStatus(): StatusResponse {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
