// src/transactions/transactions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction, User } from '@prisma/client';
import { CreateTransactionDTO } from 'src/dto/transaction.dto';

// Simulons l’appel externe à une passerelle de paiement (NotchPay)
interface PaymentStatus {
  status: 'pending' | 'processing' | 'complete' | 'failed';
  amount: number;
}

interface TransferStatus {
  status: 'pending' | 'processing' | 'failed' | 'success';
  amount: number;
}

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

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
   * Crée une transaction. Le statut initial est "pending".
   */
  async create(
    dto: CreateTransactionDTO,
    userId: string,
  ): Promise<Transaction> {
    return this.prisma.transaction.create({
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
   * Vérifie l'état de la transaction et retourne également le portefeuille du créateur.
   */
  async checkState(transactionId: string) {
    const transaction = await this.findOne(transactionId);

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
    const paymentStatus = await this.checkPaymentStatus(transactionId);

    // Mise à jour du statut local en fonction de la réponse
    if (paymentStatus.status === 'complete') {
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'done' },
      });

      // Incrémente le portefeuille de l’utilisateur
      await this.prisma.wallet.update({
        where: { uid: transaction.creatorId },
        data: {
          funds: { increment: paymentStatus.amount },
        },
      });
    } else if (paymentStatus.status === 'failed') {
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'failed' },
      });
    }
    // les statuts 'pending'/'processing' ne modifient rien pour l’instant

    return paymentStatus;
  }

  /**
   * Vérifie le transfert (retrait) auprès de la passerelle et finalise la transaction.
   */
  async checkTransfer(transactionId: string) {
    const transaction = await this.findOne(transactionId);

    // Appel à l'API externe
    const transferStatus = await this.checkTransferStatus(transactionId);

    if (transferStatus.status === 'success') {
      // Le transfert a réussi : la somme a déjà été débitée, on cloture en "done"
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'done' },
      });
    } else if (transferStatus.status === 'failed') {
      // Le transfert a échoué : on rembourse le portefeuille
      await this.prisma.transaction.update({
        where: { transactionId },
        data: { status: 'failed' },
      });

      await this.prisma.wallet.update({
        where: { uid: transaction.creatorId },
        data: {
          funds: { increment: transferStatus.amount },
        },
      });
    }
    // les statuts 'pending'/'processing' restent inchangés

    return transferStatus;
  }

  // ─── Méthodes simulées d’appel à la passerelle de paiement ─────────────
  private async checkPaymentStatus(transactionId: string) {
    // TODO: Remplacer par un vrai appel à NotchPay ou autre SDK
    // Exemple fictif :
    return { status: 'complete', amount: 5000 };
  }

  private async checkTransferStatus(transactionId: string) {
    // TODO: Remplacer par l’appel réel
    return { status: 'success', amount: 5000 };
  }
}
