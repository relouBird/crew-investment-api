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

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MeModule,
    SponsoringModule,
    WalletModule,
    TransactionModule,
    CatModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
