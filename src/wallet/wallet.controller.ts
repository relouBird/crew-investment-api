import {
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
  @ApiOperation({ summary: 'Détail du porte-feuille d\'un utilisateur ' })
  GetWallet(@Request() req: RequestAuth) {
    const user = req['user'];
    return this.walletService.getWalletByUserId(user.id);
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
  @ApiOperation({ summary: 'Effectuer une recharge d\'un porte feuille électronique' })
  PostRefillAccount(@Request() req: RequestAuth) {
    const user = req['user'];
    return this.walletService.addFunds(user.id, 1000);
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
  @ApiOperation({ summary: 'Effectuer un retrait sur un porte feuille électronique' })
  PostWithdrawAccount(@Request() req: RequestAuth) {
    const user = req['user'];
    return this.walletService.withdrawFunds(user.id, 1000);
  }
}
