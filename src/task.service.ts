import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import { AdminBetService } from './admin-bets/admin-bets.service';
import { TransactionService } from './transaction/transaction.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminBet: AdminBetService,
    private readonly transactionService: TransactionService,
  ) {}

  private readonly logger = new Logger(TaskService.name);

  // @Cron('45 * * * * *')
  // handleCron() {
  //   this.logger.debug('Appelé lorsque la seconde courante est à 45');
  // }

  @Cron('0 */2 * * * *')
  async handleEndBet() {
    this.logger.debug('Fermeture et Compensation des Matchs Achevés ‼');

    const matchesId = await this.adminBet.getToCloseBets();

    for (let i = 0; i < matchesId.length; i++) {
      await this.adminBet.processBetResults(matchesId[i]);
    }
  }

  @Cron('45 * * * * *')
  async handleCheckPayment() {
    this.logger.debug('Check Des Transactions de Type Payments ‼');

    const transactions = await this.transactionService.findAllByStatusAndType(
      'pending',
      'deposit',
    );

    const transaction_id_tab = transactions.map((elt) => {
      return elt.transactionId;
    });

    for (let index = 0; index < transaction_id_tab.length; index++) {
      await this.transactionService.checkPayment(transaction_id_tab[index]);
    }
  }

  @Cron('0 */4 * * * *')
  async handleCheckTransfer() {
    this.logger.debug('Check Des Transactions de Type Transfers ‼');

    const transactions = await this.transactionService.findAllByStatusAndType(
      'pending',
      'withdrawal',
    );

    const transaction_id_tab = transactions.map((elt) => {
      return elt.transactionId;
    });

    for (let index = 0; index < transaction_id_tab.length; index++) {
      await this.transactionService.checkTransfer(transaction_id_tab[index]);
    }
  }
}
