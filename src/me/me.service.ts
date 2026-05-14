import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/auth/users/users.service';
import * as bcrypt from 'bcrypt';
import { mapMeResponse } from 'src/utils/mapper';
import { MeUpdateInfosDto } from 'src/dto/me.dto';

@Injectable()
export class MeService {
  constructor(private usersService: UsersService) {}

  protected saltRounds = 10;

  async getMe(userId: string) {
    const user = await this.usersService.user({ id: userId });

    if (!user) {
      throw new NotFoundException('User Not Found.');
    }

    return {
      message: 'Account Infos getted...',
      email: user.email,
      data: mapMeResponse(user),
    };
  }

  async updateInfos(userId: string, data: MeUpdateInfosDto) {
    let user = await this.usersService.user({ id: userId });

    if (!user) {
      throw new NotFoundException('User Not Found.');
    }

    user = await this.usersService.updateUser({
      where: {
        id: userId,
      },
      data: {
        country: data.country ? data.country : undefined,
        firstName: data.firstName ? data.firstName : undefined,
        lastName: data.lastName ? data.lastName : undefined,
        phone: data.phone ? data.phone : undefined,
        phoneConfirmedAt: user.phoneConfirmedAt ? undefined : new Date(),
        notifications: JSON.stringify(data.notifications),
        twoFactorEnabled: data.twoFactorEnabled ? data.twoFactorEnabled: undefined
      },
    });

    return {
      message: 'Account Infos updated...',
      data: mapMeResponse(user),
    };
  }

  async changePassword(
    userId: string,
    current_password: string,
    new_password: string,
    confirm_new_password: string,
  ) {
    let user = await this.usersService.user({ id: userId });

    const isPasswordValid = await this.compareHashPassword(
      current_password,
      user?.password ?? '',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (new_password != confirm_new_password) {
      throw new UnauthorizedException(
        'Confirmation Password do not Correspond.',
      );
    }

    const hashedNewPassword = await this.generateHashPassword(new_password);

    user = await this.usersService.updateUser({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return mapMeResponse(user);
  }

  async deleteAccount(userId: string) {
    let user = await this.usersService.user({ id: userId });

    if (!user) {
      throw new NotFoundException('User Not Found.');
    }

    try {
      user = await this.usersService.deleteUser({
        id: user.id,
      });
    } catch (error) {
      throw new NotFoundException('Error on deleting User.');
    }

    return {
      message: 'Account Infos deleted...',
      email: user.email,
      data: mapMeResponse(user),
    };
  }

  async generateHashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, this.saltRounds);
    return hash;
  }

  async compareHashPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
