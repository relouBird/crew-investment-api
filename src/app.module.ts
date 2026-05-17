import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { CatModule } from './cat/cat.module';
import { LoggerMiddleware } from './app.middleware';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { WalletModule } from './wallet/wallet.module';
import { SponsoringModule } from './sponsoring/sponsoring.module';
import { TransactionModule } from './transaction/transaction.module';
import { BetModule } from './bets/bets.module';
import { AdminBetModule } from './admin-bets/admin-bets.module';
import { AdminUserModule } from './admin-users/admin-users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskService } from './task.service';
import { AdminWalletModule } from './admin-wallet/admin-wallet.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminUserModule,
    MeModule,
    SponsoringModule,
    AdminWalletModule,
    WalletModule,
    TransactionModule,
    AdminBetModule,
    BetModule,
    CatModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, TaskService],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
