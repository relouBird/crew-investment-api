import { Module } from '@nestjs/common';
import { AdminWalletController } from './admin-wallet.controller';
import { AdminWalletService } from './admin-wallet.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [PrismaModule, TransactionModule],
  controllers: [AdminWalletController],
  providers: [AdminWalletService],
  exports: [AdminWalletService],
})
export class AdminWalletModule {}
