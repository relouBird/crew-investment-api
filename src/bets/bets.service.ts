// user-bet/user-bet.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminBetService } from 'src/admin-bets/admin-bets.service';
import { CreateUserBetDTO, UpdateUserBetDTO } from 'src/dto/bet.dto';
import { BetEntity, UserBetEntity } from 'src/dto/entity';

@Injectable()
export class BetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly betService: AdminBetService,
  ) {}

  /**
   * Créer un pari utilisateur
   */
  async createUserBet(data: CreateUserBetDTO): Promise<UserBetEntity> {
    // Vérifier que l'utilisateur existe
    const userExists = await this.prisma.user.findUnique({
      where: { id: data.uid },
    });

    if (!userExists) {
      throw new NotFoundException(
        `Utilisateur avec l'ID '${data.uid}' n'existe pas`,
      );
    }

    // Vérifier que le match existe et est actif
    const match = await this.betService.getBetById(data.matchId);

    if (!match.isActive || match.isEnded) {
      throw new BadRequestException(
        "Ce match n'est plus disponible pour parier",
      );
    }

    // Vérifier que l'utilisateur n'a pas déjà parié sur ce match
    const existingBet = await this.prisma.userBet.findFirst({
      where: {
        uid: data.uid,
        matchId: data.matchId,
        isDelete: false,
      },
    });

    if (existingBet) {
      throw new BadRequestException('Vous avez déjà parié sur ce match');
    }

    // Créer le pari
    const userBet = await this.prisma.userBet.create({
      data: {
        uid: data.uid,
        matchId: data.matchId,
        prediction: data.prediction,
        potentialGain: data.potentialGain,
        potentialLoss: data.potentialLoss,
      },
    });

    return this.formatUserBetResponse(userBet, match);
  }

  /**
   * Récupérer tous les paris (admin)
   */
  async getAllUserBets(): Promise<UserBetEntity[]> {
    const userBets = await this.prisma.userBet.findMany({
      where: { isDelete: false },
      orderBy: { created_at: 'desc' },
    });

    // Récupérer les matchs associés
    const matchIds = [...new Set(userBets.map((bet) => bet.matchId))];
    const matches = await this.betService.getBetsByIds(matchIds);
    const matchesMap = new Map(matches.map((m) => [m.id, m]));

    return userBets.map((bet) =>
      this.formatUserBetResponse(bet, matchesMap.get(bet.matchId)),
    );
  }

  /**
   * Récupérer les paris d'un utilisateur
   */
  async getUserBetsByUserId(uid: string): Promise<UserBetEntity[]> {
    const userExists = await this.prisma.user.findUnique({
      where: { id: uid },
    });

    if (!userExists) {
      throw new NotFoundException(
        `Utilisateur avec l'ID '${uid}' n'existe pas`,
      );
    }

    const userBets = await this.prisma.userBet.findMany({
      where: {
        uid,
        isDelete: false,
      },
      orderBy: { created_at: 'desc' },
    });

    // Récupérer les matchs associés
    const matchIds = [...new Set(userBets.map((bet) => bet.matchId))];
    const matches = await this.betService.getBetsByIds(matchIds);
    const matchesMap = new Map(matches.map((m) => [m.id, m]));

    return userBets.map((bet) =>
      this.formatUserBetResponse(bet, matchesMap.get(bet.matchId)),
    );
  }

  /**
   * Recuperer tous les paris en fonction du type d'utilisateurs
   * @param uid
   * @returns
   */
  async getByType(uid: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: uid,
      },
    });

    if (!user) {
      throw new NotFoundException('User Not Found.');
    }
    if (user.type == 'admin') {
      return await this.getAllUserBets();
    }
    return await this.getUserBetsByUserId(uid);
  }

  async getMatches(): Promise<BetEntity[]> {
    const matches = await this.betService.getActiveBets();
    return this.formatBetResponse(matches);
  }

  /**
   * Récupérer un pari par ID
   */
  async getUserBetById(id: string): Promise<UserBetEntity> {
    const userBet = await this.prisma.userBet.findUnique({
      where: { id },
    });

    if (!userBet || userBet.isDelete) {
      throw new NotFoundException(`Pari avec l'ID '${id}' n'existe pas`);
    }

    const match = await this.betService.getBetById(userBet.matchId);

    return this.formatUserBetResponse(userBet, match);
  }

  /**
   * Mettre à jour un pari
   */
  async updateUserBet(
    id: string,
    data: UpdateUserBetDTO,
  ): Promise<UserBetEntity> {
    const userBet = await this.prisma.userBet.findUnique({
      where: { id },
    });

    if (!userBet || userBet.isDelete) {
      throw new NotFoundException(`Pari avec l'ID '${id}' n'existe pas`);
    }

    // Ne pas permettre la modification si le match est terminé
    const match = await this.betService.getBetById(userBet.matchId);
    if (match.isEnded && data.prediction) {
      throw new BadRequestException(
        'Impossible de modifier le pronostic, le match est terminé',
      );
    }

    const updatedUserBet = await this.prisma.userBet.update({
      where: { id },
      data: {
        ...(data.prediction && { prediction: data.prediction }),
        ...(data.win !== undefined && { win: data.win }),
        ...(data.isDelete !== undefined && { isDelete: data.isDelete }),
        ...(data.isPayed !== undefined && { isPayed: data.isPayed }),
        ...(data.potentialGain !== undefined && {
          potentialGain: data.potentialGain,
        }),
        ...(data.potentialLoss !== undefined && {
          potentialLoss: data.potentialLoss,
        }),
      },
    });

    return this.formatUserBetResponse(updatedUserBet, match);
  }

  /**
   * Supprimer (soft delete) un pari
   */
  async deleteUserBet(id: string): Promise<UserBetEntity> {
    const userBet = await this.prisma.userBet.findUnique({
      where: { id },
    });

    if (!userBet || userBet.isDelete) {
      throw new NotFoundException(`Pari avec l'ID '${id}' n'existe pas`);
    }

    const match = await this.betService.getBetById(userBet.matchId);

    if (match.isEnded) {
      throw new BadRequestException(
        'Impossible de supprimer un pari sur un match terminé',
      );
    }

    const deletedUserBet = await this.prisma.userBet.update({
      where: { id },
      data: { isDelete: true },
    });

    return this.formatUserBetResponse(deletedUserBet, match);
  }

  /**
   * Formater la réponse du pari utilisateur
   */
  private formatUserBetResponse(userBet: any, match?: any): UserBetEntity {
    return {
      id: userBet.id,
      uid: userBet.uid,
      matchId: userBet.matchId,
      ...(match && { match }),
      prediction: userBet.prediction,
      win: userBet.win,
      potentialGain: userBet.potentialGain,
      potentialLoss: userBet.potentialLoss,
      isDelete: userBet.isDelete,
      isPayed: userBet.isPayed,
      created_at: userBet.created_at,
      updated_at: userBet.updated_at,
    };
  }

  /**
   * Formater la réponse d'un pari Admin
   */
  private formatBetResponse(matches: BetEntity[]): BetEntity[] {
    return matches.map((match) => ({
      ...match,
      score: '',
      winner: '',
    }));
  }
}
