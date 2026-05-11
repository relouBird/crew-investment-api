import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import { AdminBetService } from './admin-bets/admin-bets.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminBet: AdminBetService,
  ) {}

  private readonly logger = new Logger(TaskService.name);

  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Appelé lorsque la seconde courante est à 45');
  }

  @Cron('45 */2 * * * *')
  async handleEndBet() {
    this.logger.debug('Fermeture et Compensation des Matchs Achevés ‼');

    const matchesId = await this.adminBet.getToCloseBets();

    for (let i = 0; i < matchesId.length; i++) {
      await this.adminBet.processBetResults(matchesId[i]);
    }
  }
}
