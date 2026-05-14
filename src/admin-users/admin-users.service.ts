import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDto } from 'src/dto/auth.dto';
import { MeUpdateInfosDto } from 'src/dto/me.dto';
import { MeService } from 'src/me/me.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { formatAllUsersByAdmin } from 'src/utils/admin-format';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly meService: MeService,
  ) {}

  async getAllUsers(uid: string) {
    // Check
    await this.checkUser(uid);

    const users = await this.prisma.user.findMany({
      where: {
        type: 'guest',
      },
      include: {
        session: true,
        transactions: true,
        wallet: true,
      },
    });


    return formatAllUsersByAdmin(users);
  }

  async register(uid: string, body: RegisterDto) {
    // Check
    await this.checkUser(uid);

    return await this.authService.register(body);
  }

  async updateInfos(uid: string, uidToUpdate: string, body: MeUpdateInfosDto) {
    // Check
    await this.checkUser(uid);

    return await this.meService.updateInfos(uidToUpdate, body);
  }

  async deleteUser(uid: string, uidToUpdate: string) {
    // Check
    await this.checkUser(uid);

    return await this.meService.deleteAccount(uidToUpdate);
  }

  async checkUser(uid: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: uid,
      },
    });

    if (!user) {
      throw new NotFoundException('Admin User Not Found.');
    } else if (user && user.type == 'guest') {
      throw new UnauthorizedException("This User don't have authorization.");
    }
  }
}
