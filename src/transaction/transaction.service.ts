// src/transactions/transactions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  User,
} from '@prisma/client';
import { CreateTransactionDTO } from 'src/dto/transaction.dto';
import { NotchPayPaymentService } from './transaction-payment.service';
import { NotchPayTransferService } from './transaction-transfer.service';

// Simulons l’appel externe à une passerelle de paiement (NotchPay)

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: NotchPayPaymentService,
    private readonly transferService: NotchPayTransferService,
  ) {}

  /**
   * Récupère toutes les transactions (admin) ou uniquement celles de l’utilisateur.
   */
  async findAll(
    userId: string,
  ): Promise<{ message: string; data: Transaction[] }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID '${userId}' n'existe pas`,
      );
    }

    if (user.type === 'admin') {
      const transactions = await this.prisma.transaction.findMany({
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return {
        message: 'Transaction Checked...',
        data: transactions.map((data) => ({
          ...data,
          name: data.creator.firstName + ' ' + data.creator.lastName,
          creator: undefined,
        })),
      };
    }
    return {
      message: 'Transaction Checked...',
      data:
        (await this.prisma.transaction.findMany({
          where: { creatorId: user.id },
        })) ?? [],
    };
  }

  /**
   * Filtre par status
   */
  async findAllByStatusAndType(
    status: TransactionStatus,
    type: TransactionType,
  ) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        status,
        type,
      },
    });

    return transactions;
  }

  /**
   * Crée une transaction. Le statut initial est "pending".
   */
  async create(
    dto: CreateTransactionDTO,
    userId: string,
  ): Promise<Transaction> {
    return await this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        type: dto.type,
        creatorId: userId,
        // status: 'pending' par défaut dans le modèle
      },
      include: { creator: true },
    });
  }

  /**
   * Récupère une transaction par son transactionId (UUID unique).
   */
  async findOne(transactionId: string, user?: User): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { transactionId },
      include: { creator: true },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction introuvable (transactionId=${transactionId})`,
      );
    }

    // Si un utilisateur non-admin essaie de voir une transaction qui ne lui appartient pas
    if (user && user.type !== 'admin' && transaction.creatorId !== user.id) {
      throw new ForbiddenException('Accès interdit à cette transaction');
    }

    return transaction;
  }

  /**
   * Récupère une transaction par son id (Numero unique).
   */
  async findById(transactionId: number, user?: User): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { creator: true },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction introuvable (transactionId=${transactionId})`,
      );
    }

    // Si un utilisateur non-admin essaie de voir une transaction qui ne lui appartient pas
    if (user && user.type !== 'admin' && transaction.creatorId !== user.id) {
      throw new ForbiddenException('Accès interdit à cette transaction');
    }

    return transaction;
  }

  /**
   * Vérifie l'état de la transaction et retourne également le portefeuille du créateur.
   */
  async checkState(transactionId: number) {
    const transaction = await this.findById(transactionId);

    // Récupération du porte‑feuille lié à l’utilisateur (suppose un modèle Wallet avec userId)
    const wallet = await this.prisma.wallet.findUnique({
      where: { uid: transaction.creatorId },
    });

    return { transaction, wallet };
  }

  /**
   * Vérifie le paiement auprès de la passerelle et finalise la transaction.
   */
  async checkPayment(transactionId: string) {
    const transaction = await this.findOne(transactionId);

    // Appel à l'API externe de vérification du paiement
    const paymentStatus = await this.paymentService.checkPayment(transactionId);

    // Mise à jour du statut local en fonction de la réponse
    if (paymentStatus.transaction.status === 'complete') {
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'done' },
      });

      // Incrémente le portefeuille de l’utilisateur
      await this.prisma.wallet.update({
        where: { uid: transaction.creatorId },
        data: {
          funds: { increment: paymentStatus.transaction.amount },
        },
      });
    } else if (paymentStatus.transaction.status == 'pending') {
      // Rien du tout
    } else if (paymentStatus.transaction.status == 'processing') {
      // Rien du tout
    } else if (paymentStatus.transaction.status === 'failed') {
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'failed' },
      });
    } else {
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'failed' },
      });
    }
    // les statuts 'pending'/'processing' ne modifient rien pour l’instant

    return paymentStatus;
  }

  /**
   * Creer le payment de sponsoring
   */
  async addSponsoringPayment(uidList: string[]) {
    let amount: number = 300;
    const dataTransaction = uidList.map((uid) => ({
      amount,
      description: 'Sponsorisation Utilisateur',
      type: 'deposit' as TransactionType,
      creatorId: uid,
    }));

    const trans = await this.prisma.transaction.createMany({
      data: dataTransaction,
    });

    await this.prisma.wallet.updateMany({
      where: { uid: { in: uidList } },
      data: {
        funds: { increment: amount },
      },
    });

    return trans;
  }

  /**
   * Vérifie le transfert (retrait) auprès de la passerelle et finalise la transaction.
   */
  async checkTransfer(transactionId: string) {
    const transaction = await this.findOne(transactionId);

    // Appel à l'API externe
    const transferStatus =
      await this.transferService.checkTransfer(transactionId);

    if (transferStatus.transfer.status === 'complete') {
      // Le transfert a réussi : la somme a déjà été débitée, on cloture en "done"
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'done' },
      });
    } else if (transferStatus.transfer.status === 'failed') {
      //---------------- à remplacer plus tard par complete
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'done' },
      });
    } else if (transferStatus.transfer.status == 'pending') {
      // Rien du tout
    } else if (transferStatus.transfer.status == 'processing') {
      // Rien du tout
    } else {
      // Le transfert a échoué : on rembourse le portefeuille
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'failed' },
      });

      await this.prisma.wallet.update({
        where: { uid: transaction.creatorId },
        data: {
          funds: { increment: transferStatus.transfer.amount },
        },
      });
    }
    // les statuts 'pending'/'processing' restent inchangés

    return transferStatus;
  }

  async createNotchPayTransaction({
    uid,
    transaction_id,
    amount,
    type,
    description,
  }: {
    uid: string;
    transaction_id: string;
    amount: number;
    type: TransactionType;
    description: string;
  }) {
    return await this.prisma.transaction.create({
      data: {
        amount: amount,
        description: description,
        type: type,
        creatorId: uid,
        transactionId: transaction_id,
        // status: 'pending' par défaut dans le modèle
      },
      include: { creator: true },
    });
  }

  async createWinBetTransaction(
    uid: string,
    amount: number,
    description: string,
  ) {
    return this.prisma.transaction.create({
      data: {
        amount: amount,
        description: description,
        type: 'bet_win',
        status: 'done',
        creator: {
          connect: {
            id: uid,
          },
        },
      },
    });
  }

  async createLossBetTransaction(
    uid: string,
    amount: number,
    description: string,
  ) {
    return this.prisma.transaction.create({
      data: {
        amount: amount,
        description: description,
        type: 'bet_loss',
        status: 'done',
        creator: {
          connect: {
            id: uid,
          },
        },
      },
    });
  }
}
