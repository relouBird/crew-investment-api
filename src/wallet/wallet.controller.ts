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
import { WalletService } from './wallet.service';
import { RequestAuth } from 'src/types/auth.type';
import { RefillWalletDTO, WithdrawalWalletDto } from 'src/dto/wallet.dto';

@ApiTags('Wallets')
@ApiBearerAuth('access-token')
@Controller('wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}

  /**
   * =========================
   * 🔐 ROUTE WALLET
   * =========================
   * GET /wallets/
   * Route pour avoir les informations du compte d'un utilisateur
   */
  @HttpCode(HttpStatus.OK)
  @Get('')
  @ApiOperation({ summary: "Détail du porte-feuille d'un utilisateur " })
  GetWallet(@Request() req: RequestAuth) {
    const user = req['user'];
    return this.walletService.getWalletByUserId(user.id);
  }

  /**
   * =========================
   * 🔐 ROUTE STAT WALLET
   * =========================
   * GET /wallets/summary
   * Route pour avoir les informations statistiques du compte d'un utilisateur
   */
  @HttpCode(HttpStatus.OK)
  @Get('summary')
  @ApiOperation({
    summary: "Détail et statistique du porte-feuille d'un utilisateur ",
  })
  async GetStatWallet(@Request() req: RequestAuth) {
    const user = req['user'];
    const data = await this.walletService.getStatisticWalletByUserId(user.id);
    return {
      message: 'Statistics are generated.',
      ...data,
    };
  }

  /**
   * =========================
   * 🔐 ROUTE ALL WALLETS
   * =========================
   * GET /wallets/all
   * Route pour avoir les informations de tous les comptes utilisateurs
   */
  @HttpCode(HttpStatus.OK)
  @Get('all')
  @ApiOperation({ summary: 'Liste de tous les portes feuilles électroniques' })
  GetAllWallets(@Request() req: RequestAuth) {
    const user = req['user'];
    return this.walletService.getAllWallets();
  }

  /**
   * =========================
   * 🔐 ROUTE WALLET REFILL ACCOUNT
   * =========================
   * POST /wallets/refill-account
   * Route pour recharger son compte en fonds
   */
  @HttpCode(HttpStatus.OK)
  @Post('refill-account')
  @ApiOperation({
    summary: "Effectuer une recharge d'un porte feuille électronique",
  })
  async PostRefillAccount(
    @Request() req: RequestAuth,
    @Body() body: RefillWalletDTO,
  ) {
    const user = req['user'];
    const data = await this.walletService.refillUserAccount(user.id, body);
    return {
      message: 'Transaction Initialized...',
      data,
    };
  }

  /**
   * =========================
   * 🔐 ROUTE WALLET WITHDRAW ACCOUNT
   * =========================
   * POST /wallets/withdraw-account
   * Route pour retirer des fonds de son compte
   */
  @HttpCode(HttpStatus.OK)
  @Post('withdraw-account')
  @ApiOperation({
    summary: 'Effectuer un retrait sur un porte feuille électronique',
  })
  async PostWithdrawAccount(
    @Request() req: RequestAuth,
    @Body() body: WithdrawalWalletDto,
  ) {
    const user = req['user'];
    const data = await this.walletService.withdrawUserAccount(user.id, body);
    return {
      message: 'Retrait Initialized...',
      data,
    };
  }
}
