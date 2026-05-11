// src/transactions/transactions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { RequestAuth } from 'src/types/auth.type';
import { CreateTransactionDTO } from 'src/dto/transaction.dto';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * GET /transactions
   * Liste toutes les transactions (admin) ou celles de l'utilisateur connecté.
   */
  @Get()
  @ApiOperation({ summary: 'Liste des transactions' })
  async findAll(@Request() req: RequestAuth) {
    return this.transactionService.findAll(req.user.id);
  }

  /**
   * POST /transactions
   * Crée une nouvelle transaction.
   */
  @Post()
  @ApiOperation({ summary: 'Créer une transaction' })
  async create(@Body() dto: CreateTransactionDTO, @Req() req: RequestAuth) {
    const userId = req.user.id;
    return this.transactionService.create(dto, userId);
  }

  /**
   * GET /transactions/:id
   * Récupère une transaction par son transactionId unique.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une transaction par ID' })
  async findOne(@Param('id') id: string, @Req() req: RequestAuth) {
    return this.transactionService.findOne(id, req.user as any);
  }

  /**
   * GET /transactions/:id/check
   * Vérifie l’état de la transaction et retourne le portefeuille associé.
   */
  @Get(':id/check')
  @ApiOperation({ summary: "Vérifier l'état de la transaction" })
  async checkState(@Param('id') id: string) {
    return this.transactionService.checkState(id);
  }

  /**
   * GET /transactions/:id/check-payment
   * Vérifie le paiement via la passerelle et finalise la transaction.
   */
  @Get(':id/check-payment')
  @ApiOperation({ summary: 'Vérifier et finaliser un paiement' })
  async checkPayment(@Param('id') id: string) {
    return this.transactionService.checkPayment(id);
  }

  /**
   * GET /transactions/:id/check-transfer
   * Vérifie le transfert via la passerelle et finalise la transaction.
   */
  @Get(':id/check-transfer')
  @ApiOperation({ summary: 'Vérifier et finaliser un transfert' })
  async checkTransfer(@Param('id') id: string) {
    return this.transactionService.checkTransfer(id);
  }
}
