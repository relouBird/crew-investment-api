import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { NotchPayPaymentService } from './transaction-payment.service';
import { NotchPayTransferService } from './transaction-transfer.service';
import { NotchPayBeneficiaryService } from './transaction-beneficiary.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    TransactionService,
    NotchPayPaymentService,
    NotchPayTransferService,
    NotchPayBeneficiaryService,
  ],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
