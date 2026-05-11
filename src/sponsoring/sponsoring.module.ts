import { Module } from '@nestjs/common';
import { SponsoringController } from './sponsoring.controller';
import { SponsoringService } from './sponsoring.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SponsoringController],
  providers: [SponsoringService],
  exports: [SponsoringService],
})
export class SponsoringModule {}
