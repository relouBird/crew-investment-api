import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { MeService } from './me.service';
import { RequestAuth } from 'src/types/auth.type';
import { MeChangePasswordDto, MeUpdateInfosDto } from 'src/dto/me.dto';

@ApiTags('Me')
@ApiBearerAuth('access-token')
@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  /**
   * =========================
   * 🔐 ROUTE ME
   * =========================
   * GET /me/
   * Route pour avoir les informations d'un utilisateur
   */
  @HttpCode(HttpStatus.OK)
  @Get('')
  @ApiOperation({ summary: "Détails d'un compte utilisateur" })
  async GetMe(@Request() req: RequestAuth) {
    const user = req['user'];
    const data = this.meService.getMe(user.id);
    return data;
  }

  /**
   * =========================
   * 🧑🏿 ROUTE UPDATE USERS INFOS
   * =========================
   * POST /me/update-infos
   * Permet de changer le mot de passe de l'utilisateur connecté
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('update-infos')
  @ApiOperation({ summary: "Mettre à jour le profil d'un compte utilisateur" })
  async updateUserInfos(
    @Request() req: RequestAuth,
    @Body()
    body: MeUpdateInfosDto,
  ) {
    const user = req['user'];
    const data = await this.meService.updateInfos(user.id, body);
    return data;
  }

  /**
   * =========================
   * 🔐 ROUTE CHANGE PASSWORD
   * =========================
   * POST /me/change-password
   * Permet de changer le mot de passe de l'utilisateur connecté
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('change-password')
  @ApiOperation({ summary: "Changer le mot de Passe d'un compte utilisateur" })
  async changeUserPassword(
    @Request() req: RequestAuth,
    @Body()
    body: MeChangePasswordDto,
  ) {
    const user = req['user'];
    const data = await this.meService.changePassword(
      user.id,
      body.password,
      body.new_password,
      body.confirm_new_password,
    );
    return {
      message: 'Account Infos change password updated...',
      data,
    };
  }

  /**
   * =========================
   * 🪒 ROUTE DELETE USER
   * =========================
   * POST /me/delete-account
   * Permet de supprimer l'utilisateur
   */
  @HttpCode(HttpStatus.OK)
  @Post('delete-account')
  @ApiOperation({ summary: "Suppression coté client d'un compte utilisateur" })
  deleteUser(@Request() req: RequestAuth) {
    const user = req['user'];
    const data = this.meService.deleteAccount(user.id);
    return data;
  }
}
