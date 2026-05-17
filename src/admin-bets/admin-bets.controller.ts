import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AdminBetService } from './admin-bets.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateBetDTO, UpdateBetDTO } from 'src/dto/bet.dto';

@ApiTags('Admin Bets')
@ApiBearerAuth('access-token')
@Controller('admin/bets')
export class AdminBetController {
  constructor(private readonly betService: AdminBetService) {}

  @Post()
  @ApiOperation({ summary: 'Permet de créer un match virtuel' })
  async create(@Body() createBetDto: CreateBetDTO) {
    const data = await this.betService.createBet(createBetDto);
    return {
      message: 'Match créé avec succès',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Permet de recuperer tous les matchs' })
  async findAll() {
    const data = await this.betService.getAllBets();
    return {
      message: 'Matchs récupérés avec succès',
      data,
    };
  }

  @Get('active')
  @ApiOperation({ summary: 'Permet de recuperer tous les matchs actifs' })
  async findActive() {
    const data = await this.betService.getActiveBets();
    return {
      message: 'Matchs actifs récupérés avec succès',
      data,
    };
  }

  @Get('competitions')
  @ApiOperation({
    summary: 'Permet de recuperer toutes les competitions de Foot Disponible',
  })
  async findCompetitions() {
    const data = await this.betService.getAllCompetitions();
    return {
      message: 'Toutes les competitions récupérées avec succès',
      data: data ?? [],
    };
  }

  @Get('competitions/:id/teams')
  @ApiOperation({
    summary: "Permet de recuperer toutes les equipes d'une Competition",
  })
  async findTeamsOnCompetitions(@Param('id') id: number | string) {
    const data = await this.betService.getAllTeamCompetitions(String(id));
    return {
      message: 'Toutes les equipes récupérées avec succès',
      data: data ?? [],
    };
  }

  @Post('process/:matchId')
  @ApiOperation({
    summary:
      'Permet de comptabiliser les victoires et les defaites sur un match',
  })
  async processResults(@Param('matchId') matchId: string) {
    await this.betService.processBetResults(matchId);
    return {
      message: 'Résultats traités avec succès',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Permet de recuperer un match par son ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.betService.getBetById(id);
    return {
      message: 'Match récupéré avec succès',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Permet de mettre à jour un match par son ID' })
  async update(@Param('id') id: string, @Body() updateBetDto: UpdateBetDTO) {
    const data = await this.betService.updateBet(id, updateBetDto);
    return {
      message: 'Match mis à jour avec succès',
      data,
    };
  }

  @Patch(':id/end')
  @ApiOperation({ summary: 'Permet de mettre fin à un match par son ID' })
  async end(
    @Param('id') id: string,
    @Body() body: { score: string; winner: string },
  ) {
    const data = await this.betService.endBet(id, body.score, body.winner);
    return {
      message: 'Match terminé avec succès',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permet de supprimer un match par son ID' })
  async remove(@Param('id') id: string) {
    const data = await this.betService.deleteBet(id);
    return {
      message: 'Match supprimé avec succès',
      data,
    };
  }
}
