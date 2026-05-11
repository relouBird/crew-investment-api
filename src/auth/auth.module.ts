import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/auth/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { OtpModule } from 'src/auth/otp/otp.module';
import { SessionModule } from 'src/auth/session/session.module';
import { NotificationsModule } from '../mail/notifications/notifications.module';
import { SponsoringModule } from 'src/sponsoring/sponsoring.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    UsersModule,
    OtpModule,
    SessionModule,
    SponsoringModule,
    WalletModule,
    NotificationsModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' }, // '60s', '15m','1h', '7d', etc.
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
