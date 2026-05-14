import { Module } from '@nestjs/common';
import { BetController } from './bets.controller';
import { BetService } from './bets.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminBetModule } from 'src/admin-bets/admin-bets.module';

@Module({
  imports: [PrismaModule, AdminBetModule],
  controllers: [BetController],
  providers: [BetService],
  exports: [BetService],
})
export class BetModule {}
