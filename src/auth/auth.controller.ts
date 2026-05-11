import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.public';
import { BadRequestException } from '@nestjs/common';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SendOtpDto,
  VerifyOtpDto,
} from 'src/dto/auth.dto';
import { RequestAuth } from 'src/types/auth.type';

// Déclaration du contrôleur avec le préfixe global "auth"
// Toutes les routes commenceront par /auth
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * =========================
   * 🔐 ROUTE LOGIN
   * =========================
   * POST /auth/login
   * Route publique (pas besoin de token)
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto);
  }

  /**
   * =========================
   * 📝 ROUTE REGISTER
   * =========================
   * POST /auth/register
   * Route publique
   */
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * =========================
   * 📝 ROUTE REGISTER WITH SPONSOR
   * =========================
   * POST /auth/register/:id
   * Route publique
   */
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register/:id')
  registerWithSponsor(
    @Body() registerDto: RegisterDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (
      id.toLocaleLowerCase() === 'undefined' ||
      id.toLocaleLowerCase() === 'null'
    ) {
      throw new NotFoundException(`l'ID du sponsor n'existe pas`);
    }
    return this.authService.registerWithSponsor(id, registerDto);
  }

  /**
   * =========================
   * 🚪 ROUTE LOGOUT
   * =========================
   * POST /auth/logout
   * Permet de déconnecter l'utilisateur
   * (ex: suppression refresh token, blacklist, etc.)
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Request() req: RequestAuth) {
    return this.authService.logout(req.user.email);
  }

  /**
   * =========================
   *  🔢 ROUTE SEND OTP
   * =========================
   * POST /auth/send-otp
   * Envoi d'un code OTP à l'utilisateur
   */
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('send-otp')
  postSendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.email);
  }

  /**
   * =========================
   *  🔢 ROUTE RESEND OTP
   * =========================
   * POST /auth/resend-otp
   * Envoi d'un code OTP à l'utilisateur
   */
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('resend-otp')
  postResendOtp(@Body() sendOtpDto: SendOtpDto) {
    if (!sendOtpDto.email) {
      throw new BadRequestException('Identifier is required');
    }
    return this.authService.resendOtp(sendOtpDto.email);
  }

  /**
   * =========================
   *  🔢 ROUTE VERIFY OTP
   * =========================
   * POST /auth/verify-otp
   * Permet de vérifier le code OTP envoyé à l'utilisateur
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  postVerifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.password,
      verifyOtpDto.otp,
    );
  }

  /**
   * =========================
   * 🔐 ROUTE CHANGE PASSWORD
   * =========================
   * POST /auth/change-password
   * Permet de changer le mot de passe de l'utilisateur connecté
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassword(
    @Body()
    body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      body.email,
      body.password,
      body.password_confirmation,
    );
  }

  /**
   * =========================
   * 🔐 ROUTE RESET PASSWORD
   * =========================
   * POST /auth/reset-password
   * Permet de réinitialiser le mot de passe de l'utilisateur
   * (Dans notre concept, recreer un nouveau mot de passe)
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(
    @Body()
    body: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(body.email, body.otp);
  }
}
