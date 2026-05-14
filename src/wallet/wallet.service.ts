// wallet/wallet.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWalletDTO,
  RefillWalletDTO,
  UpdateWalletDTO,
  WithdrawalWalletDto,
} from 'src/dto/wallet.dto';
import { Wallet, Transaction } from '@prisma/client';
import { NotchPayPaymentService } from 'src/transaction/transaction-payment.service';
import { NotchPayTransferService } from 'src/transaction/transaction-transfer.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { METHOD_PAYMENT } from 'src/types/notchpay/all.type';
import { properTxComposable } from 'src/utils/mapper';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: NotchPayPaymentService,
    private readonly transferService: NotchPayTransferService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Créer un wallet pour un utilisateur
   */
  async createWallet(data: CreateWalletDTO) {
    // Vérifier que l'utilisateur existe
    const userExists = await this.prisma.user.findUnique({
      where: { id: data.uid },
    });

    if (!userExists) {
      throw new NotFoundException(
        `Utilisateur avec l'ID '${data.uid}' n'existe pas`,
      );
    }

    // Vérifier que l'utilisateur n'a pas déjà un wallet
    const walletExists = await this.prisma.wallet.findUnique({
      where: { uid: data.uid },
    });

    if (walletExists) {
      throw new BadRequestException(`L'utilisateur possède déjà un wallet`);
    }

    // Créer le wallet
    const wallet = await this.prisma.wallet.create({
      data: {
        user: {
          connect: { id: data.uid },
        },
        funds: 0,
      },
    });

    return this.formatWalletResponse(wallet);
  }

  /**
   * Récupérer tous les wallets
   */
  async getAllWallets() {
    const wallets = await this.prisma.wallet.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return wallets.map((wallet) => this.formatWalletResponse(wallet));
  }

  /**
   * Récupérer le wallet d'un utilisateur par UID
   */
  async getWalletByUserId(uid: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { uid },
    });

    if (!wallet) {
      throw new NotFoundException(
        `Wallet de l'utilisateur '${uid}' n'existe pas`,
      );
    }

    const transaction_datas = await this.prisma.transaction.findMany({
      where: {
        creatorId: uid,
      },
    });

    let deposit: number = 0;
    let withdraw: number = 0;
    let growth: number = 0;

    transaction_datas
      .filter(
        (transaction) =>
          transaction.type == 'deposit' && transaction.status == 'done',
      )
      .forEach((trans) => {
        deposit += trans.amount;
      });

    // calcul la somme de tout les retraits...
    transaction_datas
      .filter(
        (transaction) =>
          transaction.type == 'withdrawal' && transaction.status == 'done',
      )
      .forEach((trans) => {
        withdraw += trans.amount;
      });

    // calcul l'évolution...
    growth =
      deposit != 0 ? ((wallet.funds + withdraw - deposit) / deposit) * 100 : 0;

    return {
      message: 'User wallet getted...',
      data: this.formatWalletResponse(wallet, growth),
    };
  }

  /**
   * Retourner les statistiques d'un utilisateurs
   */
  async getStatisticWalletByUserId(uid: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: uid,
      },
      include: {
        transactions: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User Not Found.');
    }

    const wallet = user.wallet as Wallet;
    const transactions = user.transactions as Transaction[];

    return properTxComposable(wallet, transactions);
  }

  /**
   * Récupérer un wallet par ID
   */
  async getWalletById(id: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet avec l'ID '${id}' n'existe pas`);
    }

    return this.formatWalletResponse(wallet);
  }

  /**
   * Récupérer un wallet par funds_id
   */
  async getWalletByFundsId(funds_id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { fundsId: funds_id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException(
        `Wallet avec funds_id '${funds_id}' n'existe pas`,
      );
    }

    return this.formatWalletResponse(wallet);
  }

  /**
   * Recharger un compte Utilisateur
   */
  async refillUserAccount(uid: string, data: RefillWalletDTO) {
    const user = await this.getUserLocaly(uid);

    const description = `Depot - ${data.service}`;

    const external_transaction = await this.paymentService.createPayment(
      user.email,
      data.transaction_number,
      data.amount,
      description,
    );

    await this.paymentService.completePayment(
      external_transaction.transaction.reference,
      data.service as unknown as METHOD_PAYMENT,
      data.transaction_number,
    );

    const transaction = await this.transactionService.createNotchPayTransaction(
      {
        amount: data.amount,
        description,
        type: 'deposit',
        transaction_id: external_transaction.transaction.reference,
        uid: user.id,
      },
    );

    return {
      ...data,
      transaction_id: transaction.id,
      transaction_details: external_transaction.transaction,
    };
  }

  /**
   * Recharger un compte Utilisateur
   */
  async withdrawUserAccount(uid: string, data: WithdrawalWalletDto) {
    const user = await this.getUserLocaly(uid);

    const description = `Retrait - ${data.service}`;

    const external_transaction =
      await this.transferService.createSimpleTransfer(
        user.firstName + ' ' + user.lastName,
        data.transaction_number,
        data.amount,
      );

    const transaction = await this.transactionService.createNotchPayTransaction(
      {
        amount: data.amount,
        description,
        type: 'withdrawal',
        transaction_id: external_transaction.transfer.reference,
        uid: user.id,
      },
    );

    await this.withdrawFunds(uid, data.amount);

    const wallet = (await this.getWalletByUserId(uid)).data;

    return {
      ...data,
      transaction_id: transaction.id,
      wallet,
      transaction_details: external_transaction.transfer,
    };
  }

  /**
   * Ajouter des fonds au wallet
   */
  async addFunds(uid: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à 0');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { uid },
    });

    if (!wallet) {
      throw new NotFoundException(
        `Wallet de l'utilisateur '${uid}' n'existe pas`,
      );
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { uid },
      data: {
        funds: {
          increment: amount,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.formatWalletResponse(updatedWallet);
  }

  /**
   * Retirer des fonds du wallet
   */
  async withdrawFunds(uid: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à 0');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { uid },
    });

    if (!wallet) {
      throw new NotFoundException(
        `Wallet de l'utilisateur '${uid}' n'existe pas`,
      );
    }

    if (wallet.funds < amount) {
      throw new BadRequestException('Fonds insuffisants');
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { uid },
      data: {
        funds: {
          decrement: amount,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.formatWalletResponse(updatedWallet);
  }

  /**
   * Mettre à jour le wallet
   */
  async updateWallet(id: number, data: UpdateWalletDTO) {
    const walletExists = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!walletExists) {
      throw new NotFoundException(`Wallet avec l'ID '${id}' n'existe pas`);
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { id },
      data: {
        ...(data.funds !== undefined && { funds: data.funds }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.formatWalletResponse(updatedWallet);
  }

  /**
   * Supprimer un wallet
   */
  async deleteWallet(id: number) {
    const walletExists = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!walletExists) {
      throw new NotFoundException(`Wallet avec l'ID '${id}' n'existe pas`);
    }

    // Vérifier s'il y a des transactions liées
    const hasTransactions = await this.prisma.wallet.findFirst({
      where: { uid: walletExists.uid },
    });

    if (hasTransactions) {
      throw new BadRequestException(
        'Impossible de supprimer ce wallet car il possède des transactions',
      );
    }

    const wallet = await this.prisma.wallet.delete({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return this.formatWalletResponse(wallet);
  }

  /**
   * Permet de recuperer un User
   */
  private async getUserLocaly(uid: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: uid,
      },
    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
  }
  /**
   * Formater la réponse du wallet
   */
  private formatWalletResponse(wallet: Wallet, growth?: number) {
    return {
      id: wallet.id,
      uid: wallet.uid,
      funds_id: wallet.fundsId,
      funds: wallet.funds,
      growth: growth ? growth : undefined,
      created_at: wallet.createdAt,
      updated_at: wallet.createdAt,
    };
  }
}
