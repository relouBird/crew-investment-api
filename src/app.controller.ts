import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/auth.public';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Documentation Swagger UI' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @ApiOperation({ summary: 'Endpoint de Test Server' })
  @HttpCode(HttpStatus.OK)
  @Get('health')
  getHealth() {
    return JSON.stringify({
      server: 'online',
      status: 'OK',
    });
  }
}
