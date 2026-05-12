// bet/bet.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBetDTO, UpdateBetDTO } from 'src/dto/bet.dto';
import { BetEntity, BetTeamType } from 'src/dto/entity';
import { WalletService } from 'src/wallet/wallet.service';
import {
  CompetitionModel,
  ApiFootballCompetitionResponse,
  TeamModel,
  ApiFootballTeamsResponse,
} from 'src/types/api-bet.type';
import { AdminMatchService } from './admin-matches.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class AdminBetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminMatchService: AdminMatchService,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Créer un match/pari
   */
  async createBet(data: CreateBetDTO): Promise<BetEntity> {
    // Vérifier les dates
    const startDate = new Date(data.start_at);
    const endDate = new Date(data.end_at);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'La date de fin doit être après la date de début',
      );
    }

    const bet = await this.prisma.bet.create({
      data: {
        homeTeam: JSON.stringify(data.homeTeam),
        awayTeam: JSON.stringify(data.awayTeam),
        start_at: startDate,
        end_at: endDate,
        winPercentage: data.winPercentage,
        lossPercentage: data.lossPercentage,
        isActive: data.isActive,
      },
    });

    return this.formatBetResponse(bet);
  }

  /**
   * Récupérer tous les matchs
   */
  async getAllBets(): Promise<BetEntity[]> {
    const bets = await this.prisma.bet.findMany({
      orderBy: { start_at: 'desc' },
    });

    return bets.map((bet) => this.formatBetResponse(bet));
  }

  /**
   * Récupérer les matchs actifs
   */
  async getActiveBets(): Promise<BetEntity[]> {
    const bets = await this.prisma.bet.findMany({
      where: {
        isActive: true,
        isEnded: false,
      },
      orderBy: { start_at: 'asc' },
    });

    return bets.map((bet) => this.formatBetResponse(bet));
  }

  /**
   * Récuperer les matches actifs à fermer et les ferme.
   */
  async getToCloseBets() {
    const bets = await this.getActiveBets();

    const toEnd: BetEntity[] = [];

    for (let i = 0; i < bets.length; i++) {
      const bet = bets[i];
      let now = new Date();
      let endDate = new Date(bet.end_at);
      if (now > endDate) {
        toEnd.push(bet);
      }
    }

    const idsList = toEnd.map((b) => b.id);

    await this.prisma.bet.updateMany({
      where: {
        id: { in: idsList },
      },
      data: {
        isEnded: true,
        isActive: true,
      },
    });

    return idsList;
  }

  /**
   * Récupérer un match par ID
   */
  async getBetById(id: string): Promise<BetEntity> {
    const bet = await this.prisma.bet.findUnique({
      where: { id },
    });

    if (!bet) {
      throw new NotFoundException(`Match avec l'ID '${id}' n'existe pas`);
    }

    return this.formatBetResponse(bet);
  }

  /**
   * Récupérer plusieurs matchs par leurs IDs
   */
  async getBetsByIds(ids: string[]): Promise<BetEntity[]> {
    const bets = await this.prisma.bet.findMany({
      where: {
        id: { in: ids },
      },
    });

    return bets.map((bet) => this.formatBetResponse(bet));
  }

  /**
   * Mettre à jour un match
   */
  async updateBet(id: string, data: UpdateBetDTO): Promise<BetEntity> {
    const betExists = await this.prisma.bet.findUnique({
      where: { id },
    });

    if (!betExists) {
      throw new NotFoundException(`Match avec l'ID '${id}' n'existe pas`);
    }

    // Vérifier les dates si fournies
    if (data.start_at && data.end_at) {
      const startDate = new Date(data.start_at);
      const endDate = new Date(data.end_at);

      if (endDate <= startDate) {
        throw new BadRequestException(
          'La date de fin doit être après la date de début',
        );
      }
    }

    const updatedBet = await this.prisma.bet.update({
      where: { id },
      data: {
        ...(data.score !== undefined && { score: data.score }),
        ...(data.winner !== undefined && { winner: data.winner }),
        ...(data.homeTeam && { homeTeam: JSON.stringify(data.homeTeam) }),
        ...(data.awayTeam && { awayTeam: JSON.stringify(data.awayTeam) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isEnded !== undefined && { isEnded: data.isEnded }),
        ...(data.start_at && { start_at: new Date(data.start_at) }),
        ...(data.end_at && { end_at: new Date(data.end_at) }),
        ...(data.winPercentage !== undefined && {
          winPercentage: data.winPercentage,
        }),
        ...(data.lossPercentage !== undefined && {
          lossPercentage: data.lossPercentage,
        }),
      },
    });

    return this.formatBetResponse(updatedBet);
  }

  /**
   * Terminer un match et définir le gagnant
   */
  async endBet(id: string, score: string, winner: string): Promise<BetEntity> {
    const bet = await this.prisma.bet.findUnique({
      where: { id },
    });

    if (!bet) {
      throw new NotFoundException(`Match avec l'ID '${id}' n'existe pas`);
    }

    if (bet.isEnded) {
      throw new BadRequestException('Ce match est déjà terminé');
    }

    const updatedBet = await this.prisma.bet.update({
      where: { id },
      data: {
        score,
        winner,
        isEnded: true,
        isActive: false,
      },
    });

    return this.formatBetResponse(updatedBet);
  }

  /**
   * Supprimer un match
   */
  async deleteBet(id: string): Promise<BetEntity> {
    const bet = await this.prisma.bet.findUnique({
      where: { id },
    });

    if (!bet) {
      throw new NotFoundException(`Match avec l'ID '${id}' n'existe pas`);
    }

    // Vérifier s'il y a des paris associés
    const hasBets = await this.prisma.userBet.findFirst({
      where: { matchId: id },
    });

    if (hasBets) {
      throw new BadRequestException(
        'Impossible de supprimer ce match car il possède des paris associés',
      );
    }

    const deletedBet = await this.prisma.bet.delete({
      where: { id },
    });

    return this.formatBetResponse(deletedBet);
  }

  /**
   * Traiter les résultats d'un match et payer les gagnants
   */
  async processBetResults(matchId: string): Promise<void> {
    const match = await this.getBetById(matchId);

    if (!match.isEnded) {
      throw new BadRequestException("Le match n'est pas encore terminé");
    }

    const userBets = await this.prisma.userBet.findMany({
      where: {
        matchId,
        isDelete: false,
        isPayed: false,
      },
    });

    for (const bet of userBets) {
      const hasWon = bet.prediction === match.winner;

      // Mettre à jour le statut du pari
      await this.prisma.userBet.update({
        where: { id: bet.id },
        data: {
          win: hasWon,
          isPayed: true,
        },
      });

      // Ajuster le wallet en fonction du résultat
      if (hasWon) {
        await this.walletService.addFunds(bet.uid, bet.potentialGain);
        await this.transactionService.createWinBetTransaction(
          bet.uid,
          bet.potentialGain,
          `Gain - ${bet.prediction}`,
        );
      } else {
        await this.walletService.withdrawFunds(bet.uid, bet.potentialLoss);
        await this.transactionService.createLossBetTransaction(
          bet.uid,
          bet.potentialLoss,
          `Perte - ${bet.prediction}`,
        );
      }
    }
  }

  async getAllCompetitions(): Promise<null | CompetitionModel[]> {
    const datas =
      (await this.adminMatchService.getAllMatchCompetitions()) ??
      ({} as ApiFootballCompetitionResponse);

    return datas.competitions;
  }

  async getAllTeamCompetitions(id: string): Promise<null | TeamModel[]> {
    const datas =
      (await this.adminMatchService.getAllTeamsCompetitions(id)) ??
      ({} as ApiFootballTeamsResponse);

    return datas.teams;
  }

  /**
   * Formater la réponse du match
   */
  formatBetResponse(bet: any): BetEntity {
    return {
      id: bet.id,
      score: bet.score,
      winner: bet.winner,
      homeTeam: JSON.parse(bet.homeTeam) as BetTeamType,
      awayTeam: JSON.parse(bet.awayTeam) as BetTeamType,
      isActive: bet.isActive,
      isEnded: bet.isEnded,
      start_at: bet.start_at,
      end_at: bet.end_at,
      winPercentage: bet.winPercentage,
      lossPercentage: bet.lossPercentage,
      created_at: bet.created_at,
      updated_at: bet.updated_at,
    };
  }
}
