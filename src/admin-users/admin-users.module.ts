import { Module } from '@nestjs/common';
import { AdminUserController } from './admin-users.controller';
import { AdminUserService } from './admin-users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { MeModule } from 'src/me/me.module';

@Module({
  imports: [PrismaModule, AuthModule, MeModule],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
