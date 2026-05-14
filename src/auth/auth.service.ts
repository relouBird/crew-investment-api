import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/auth/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/auth/otp/otp.service';
import { SessionService } from 'src/auth/session/session.service';
import { NotificationsService } from 'src/mail/notifications/notifications.service';
import * as bcrypt from 'bcrypt';

import { LoginDto, RegisterDto } from 'src/dto/auth.dto';
import { generatePayload, mapUserResponse } from '../utils/mapper';
import { PayloadType } from 'src/types/auth.type';
import { rand } from 'src/utils';
import { SponsoringService } from 'src/sponsoring/sponsoring.service';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpService: OtpService,
    private sessionService: SessionService,
    private sponsoringService: SponsoringService,
    private walletService: WalletService,
    private jwtService: JwtService,
    private notificationService: NotificationsService,
  ) {}

  protected saltRounds = 10;

  // Méthode pour valider un utilisateur
  async signIn(data: LoginDto) {
    const user = await this.usersService.findByIdentifier(data.email);

    if (!user) {
      throw new NotFoundException('Invalid Credentials.');
    }

    const session = await this.sessionService.findSessionByUserId(user.id);

    if (!session) {
      throw new NotFoundException('Something Where Wrong.');
    }

    if (user.role == 'unauthenticated') {
      throw new ForbiddenException('User Unauthenticated.');
    }

    // comparer les hashs de mot de passe si le mot de passe est stocké sous forme de hash
    const isPasswordValid = await this.compareHashPassword(
      data.password,
      user?.password ?? '',
    );

    if (!user?.password || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.usersService.updateUser({
      where: {
        id: user.id,
      },
      data: {
        status: 'Actif',
        lastSignInAt: new Date(),
      },
    });

    const payload: PayloadType = generatePayload(user);

    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'user has Connected...',
      data: mapUserResponse(
        user,
        await this.sessionService.updateAccessToken(
          session.id,
          token,
          payload.expiresAt,
        ),
      ),
    };
  }

  // Méthode pour enregistrer un nouvel utilisateur
  async register(data: RegisterDto) {
    // Vous pouvez ajouter des validations ici (ex: vérifier si l'utilisateur existe déjà)
    const existingUser = await this.usersService.findByIdentifier(data.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    // Vous pouvez aussi hasher le mot de passe avant de le stocker
    const hashedPassword = await this.generateHashPassword(data.password);

    const generatedId = String(rand());

    const user = {
      email: data.email,
      type: data.type,
      password: hashedPassword,
      firstName: data.email.split('@')[0],
      lastName: generatedId,
      generatedId,
      phone: '',
    };
    const { password: pass, ...createdUser } =
      await this.usersService.createUser(user);

    // Création de son wallet...
    const wallet = await this.walletService.createWallet({
      uid: createdUser.id,
    });

    // Ici, vous pouvez générer un OTP, le stocker en base de données et l'envoyer à l'utilisateur
    const otp = this.generateOTP();

    await this.otpService.createOtp({
      user: {
        connect: { id: createdUser.id },
      },
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expire dans 10 minutes
    });

    await this.notificationService.send({
      type: 'OTP',
      email: user.email,
      payload: {
        otp,
        purpose: 'login',
        userName: user.firstName + ' ' + user.lastName,
      },
    });

    return {
      message: 'Compte créé. Vérifiez votre email pour entrer le code OTP.',
      data,
      verify: true,
    };
  }

  // Méthode pour un enregistrer un nouvel utilisateur with sponsor
  async registerWithSponsor(sponsor_id: string, data: RegisterDto) {
    const dataToReturn = await this.register(data);

    const user = await this.usersService.findByIdentifier(
      dataToReturn.data.email,
    );

    await this.sponsoringService.create({
      sponsorId: sponsor_id,
      sponsoredId: String(user?.id),
    });

    return dataToReturn;
  }

  // Méthode pour déconnecter un utilisateur (ex: supprimer le refresh token, blacklist, etc.)
  async logout(
    email: string,
  ): Promise<{ statusCode: number; message: string }> {
    const user = await this.usersService.findByIdentifier(email);

    if (!user) {
      throw new UnauthorizedException('User Not Found.');
    }

    this.usersService.updateUser({
      where: {
        id: user.id,
      },
      data: {
        status: 'Inactif',
      },
    });

    const session = this.sessionService.findSessionByUserId(user.id);

    await this.sessionService.logOutByUserId(user.id);

    return { message: 'Logged out successfully', statusCode: 200 };
  }

  // Méthode pour envoyer un OTP à l'utilisateur
  async sendOtp(identifier: string) {
    const user = await this.usersService.findByIdentifier(identifier);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otpModel = await this.otpService.findFirst({
      userId: user.id,
      used: false,
    });

    if (otpModel) {
      await this.otpService.updateOtp(otpModel.id, {
        used: true,
      });
    }
    // Ici, vous pouvez générer un OTP, le stocker en base de données et l'envoyer à l'utilisateur
    const otp = this.generateOTP();

    await this.otpService.createOtp({
      user: {
        connect: { id: user.id },
      },
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expire dans 10 minutes
    });

    await this.notificationService.send({
      type: 'OTP',
      email: user.email,
      payload: {
        otp,
        purpose: 'login',
        userName: user.firstName + ' ' + user.lastName,
      },
    });

    return {
      message: `OTP sent to ${identifier}`,
      data: {
        email: identifier,
      },
      verify: false,
      statusCode: 201,
    };
  }

  // Méthode pour envoyer un OTP à l'utilisateur
  async resendOtp(identifier: string) {
    const user = await this.usersService.findByIdentifier(identifier);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const otpModel = await this.otpService.findFirst({
      userId: user.id,
      used: false,
    });

    if (!otpModel) {
      throw new UnauthorizedException(
        'Cannot send resend without send first...',
      );
    }

    await this.otpService.updateOtp(otpModel.id, {
      used: true,
    });

    // Ici, vous pouvez générer un OTP, le stocker en base de données et l'envoyer à l'utilisateur
    const otp = this.generateOTP();

    await this.otpService.createOtp({
      user: {
        connect: { id: user.id },
      },
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Expire dans 10 minutes
    });

    await this.notificationService.send({
      type: 'OTP',
      email: user.email,
      payload: {
        otp,
        purpose: 'login',
        userName: user.firstName + ' ' + user.lastName,
      },
    });

    return {
      message: `OTP sent to ${identifier}`,
      data: {
        email: identifier,
      },
      verify: false,
      statusCode: 201,
    };
  }

  //  Mééthode pour confirmer l'email de l'utilisateur (ex: via un token de confirmation)

  async verifyOtp(identifier: string, password: string, code: string) {
    let user = await this.usersService.findByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const otp = await this.otpService.findFirst({ code: code });
    if (!otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    if (otp.userId !== user.id) {
      throw new UnauthorizedException('OTP does not match user');
    }
    if (otp.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }
    if (otp.used) {
      throw new UnauthorizedException('OTP has already been used');
    }

    // comparer les hashs de mot de passe si le mot de passe est stocké sous forme de hash
    const isPasswordValid = await this.compareHashPassword(
      password,
      user?.password ?? '',
    );

    if (!user?.password || !isPasswordValid) {
      throw new UnauthorizedException('Invalid password...');
    }

    await this.otpService.updateOtp(otp.id, { used: true });

    let session = await this.sessionService.findSessionByUserId(user.id);

    user = await this.usersService.updateUser({
      where: {
        id: user.id,
      },
      data: {
        role: 'authenticated',
        status: 'Actif',
        emailConfirmedAt: new Date(),
      },
    });

    const payload: PayloadType = generatePayload(user);

    const token = await this.jwtService.signAsync(payload);

    if (session) {
      return {
        message: 'user has Verified...',
        data: mapUserResponse(
          user,
          await this.sessionService.updateAccessToken(
            session.id,
            token,
            payload.expiresAt,
          ),
        ),
      };
    }

    session = await this.sessionService.createSession({
      user: {
        connect: { id: user.id },
      },
      accessToken: token,
      refreshToken: token,
      expiresAt: payload.expiresAt,
    });

    return {
      message: 'user has Verified...',
      data: mapUserResponse(user, session),
    };
  }

  async resetPassword(identifier: string, code: string) {
    const user = await this.usersService.findByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const otp = await this.otpService.findFirst({ code: code });
    if (!otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    if (otp.userId !== user.id) {
      throw new UnauthorizedException('OTP does not match user');
    }
    if (otp.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }
    if (otp.used) {
      throw new UnauthorizedException('OTP has already been used');
    }

    await this.usersService.updateUser({
      where: {
        id: user.id,
      },
      data: {
        role: 'unauthenticated',
        status: 'Inactif',
      },
    });

    return {
      message: 'Compte Verifié. changer votre mot de passe sur InvestIA.',
      data: true,
    };
  }

  async changePassword(
    identifier: string,
    password: string,
    password_confirmation: string,
  ) {
    const user = await this.usersService.findByIdentifier(identifier);

    if (!user) {
      throw new UnauthorizedException('User Not Found.');
    }

    if (password != password_confirmation) {
      throw new UnauthorizedException('Not Corresponding Password.');
    }

    const hashedNewPassword = await this.generateHashPassword(
      password_confirmation,
    );

    await this.usersService.updateUser({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        role: 'authenticated',
        status: 'Actif',
      },
    });
  }

  // Fonction utilitaires
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Génère un OTP à 6 chiffres
  }

  async generateHashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, this.saltRounds);
    return hash;
  }

  async compareHashPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
