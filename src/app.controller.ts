import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface WelcomeResponse {
  message: string;
  version: string;
  status: string;
}

interface StatusResponse {
  status: string;
  timestamp: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  welcome(): WelcomeResponse {
    return this.appService.getWelcome();
  }

  @Get('status')
  status(): StatusResponse {
    return this.appService.getStatus();
  }
}
