import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminUserService } from './admin-users.service';
import { RequestAuth } from 'src/types/auth.type';
import { RegisterDto } from 'src/dto/auth.dto';
import { MeUpdateInfosDto } from 'src/dto/me.dto';

@ApiTags('Admin Users')
@ApiBearerAuth('access-token')
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @ApiOperation({ summary: 'Permet de recuperer tous les utilisateurs' })
  async findAllUsers(@Request() req: RequestAuth) {
    const user = req['user'];
    const data = this.adminUserService.getAllUsers(user.id);
    return {
      message: 'Utilisateurs récupérés avec succès',
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Permet de créer un utilisateur coté Admin' })
  async create(@Request() req: RequestAuth, @Body() body: RegisterDto) {
    const data = await this.adminUserService.register(req.user.id, body);
    return {
      message: 'User créé avec succès',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Permet de recuperer un User par ID coté Admin' })
  async findUserById(@Param('id') id: string) {
    const data = null;
    return {
      message: 'Matchs récupérés avec succès',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      "Permet de mettre à jour les informations d'un Utilisateur coté Admin",
  })
  async updateUserById(
    @Request() req: RequestAuth,
    @Param('id') id: string,
    @Body() body: MeUpdateInfosDto,
  ) {
    const data = await this.adminUserService.updateInfos(req.user.id, id, body);
    return {
      message: 'Utilisateur mis à jour avec succès',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Permet de supprimer un utilisateur coté Admin.',
  })
  async deleteUserById(@Request() req: RequestAuth, @Param('id') id: string) {
    const data = await this.adminUserService.deleteUser(req.user.id, id);
    return {
      message: 'User Supprimé avec succès',
      data,
    };
  }
}
