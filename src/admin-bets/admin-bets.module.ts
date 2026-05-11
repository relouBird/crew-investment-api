import { Module } from '@nestjs/common';
import { AdminBetController } from './admin-bets.controller';
import { AdminBetService } from './admin-bets.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { AdminMatchService } from './admin-matches.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    WalletModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AdminBetController],
  providers: [AdminBetService, AdminMatchService],
  exports: [AdminBetService],
})
export class AdminBetModule {}
