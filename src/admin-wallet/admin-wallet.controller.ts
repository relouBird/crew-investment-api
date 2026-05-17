import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminWalletService } from './admin-wallet.service';
import { RequestAuth } from 'src/types/auth.type';
import { RefillWalletDTO, WithdrawalWalletDto } from 'src/dto/wallet.dto';

@ApiTags('Admin Wallets')
@ApiBearerAuth('access-token')
@Controller('admin/wallets')
export class AdminWalletController {
  constructor(private walletService: AdminWalletService) {}
  /**
   * =========================
   * 🔐 ROUTE STAT WALLET
   * =========================
   * GET /admin/wallets/summary
   * Route pour avoir les informations statistiques coté administrateur
   */
  @HttpCode(HttpStatus.OK)
  @Get('summary')
  @ApiOperation({
    summary: "Détail et statistiques coté administrateur",
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
   * POST /admin/wallets/refill-account
   * Route pour recharger son compte en fonds
   */
  @HttpCode(HttpStatus.OK)
  @Post('refill-account')
  @ApiOperation({
    summary: "Effectuer une recharge coté administrateur",
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
   * POST /admin/wallets/withdraw-account
   * Route pour retirer des fonds de son compte
   */
  @HttpCode(HttpStatus.OK)
  @Post('withdraw-account')
  @ApiOperation({
    summary: 'Effectuer un retrait sur le porte feuille admin',
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

    /**
     * GET /transactions/:id/check
     * Vérifie l’état de la transaction et retourne le portefeuille associé.
     */
    @Get('check-transaction/:id')
    @ApiOperation({ summary: "Vérifier l'état de la transaction" })
    async checkState(@Param('id') id: number) {
      return this.walletService.checkState(id);
    }
}
