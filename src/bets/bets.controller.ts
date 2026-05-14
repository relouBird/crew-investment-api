// user-bet/user-bet.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { BetService } from './bets.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateUserBetDTO, UpdateUserBetDTO } from 'src/dto/bet.dto';
import { RequestAuth } from 'src/types/auth.type';

@ApiTags('User Bets')
@ApiBearerAuth('access-token')
@Controller('bets')
export class BetController {
  constructor(private readonly userBetService: BetService) {}

  @Post()
  @ApiOperation({ summary: 'Permet de créer un pari sur un Match' })
  async create(
    @Body() createUserBetDto: CreateUserBetDTO,
    @Request() req: RequestAuth,
  ) {
    // Utiliser l'ID de l'utilisateur connecté
    const data = await this.userBetService.createUserBet({
      ...createUserBetDto,
      uid: req.user.id,
    });
    return {
      message: 'Pari créé avec succès',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Permet de recuperer tous les paris.' })
  async findAll(@Request() req: RequestAuth) {
    const data = await this.userBetService.getByType(req.user.id);
    return {
      message: 'Paris récupérés avec succès',
      data,
    };
  }

  @Get('matches')
  @ApiOperation({ summary: 'Permet de recuperer tous matchs en cours.' })
  async findAllMatches(@Request() req: RequestAuth) {
    const data = await this.userBetService.getMatches();
    return {
      message: 'Matchs récupérés avec succès',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Permet de recuperer un pari par son ID.' })
  async findOne(@Param('id') id: string) {
    const data = await this.userBetService.getUserBetById(id);
    return {
      message: 'Pari récupéré avec succès',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Permet de mettre à jour un pari par son ID.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserBetDto: UpdateUserBetDTO,
  ) {
    const data = await this.userBetService.updateUserBet(id, updateUserBetDto);
    return {
      message: 'Pari mis à jour avec succès',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permet de supprimer un pari par son ID.' })
  async remove(@Param('id') id: string) {
    const data = await this.userBetService.deleteUserBet(id);
    return {
      message: 'Pari supprimé avec succès',
      data,
    };
  }
}
