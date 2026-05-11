import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { RequestAuth } from 'src/types/auth.type';
import { SponsoringService } from './sponsoring.service';
import {
  CreateSponsoringDto,
  UpdateSponsoringDto,
} from 'src/dto/sponsoring.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sponsoring')
@ApiBearerAuth()
@Controller('sponsoring')
export class SponsoringController {
  constructor(private sponsoringService: SponsoringService) {}

  /**
   * =========================
   * 📝 ROUTE SPONSOR ALL
   * =========================
   * GET /sponsoring/
   * Route Bearer
   */
  @HttpCode(HttpStatus.OK)
  @Get('')
  @ApiOperation({ summary: 'Liste toutes les sponsorisations' })
  getAll(@Request() req: RequestAuth) {
    const user = req['user'];
    return this.sponsoringService.findByStatus(user.id);
  }

  /**
   * =========================
   * 📝 ROUTE CREATE SPONSORING
   * =========================
   * POST /sponsoring/
   * Route Bearer
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  @ApiOperation({ summary: 'Créer une sponsorisation' })
  CreateSponsoring(
    @Request() req: RequestAuth,
    @Body() body: CreateSponsoringDto,
  ) {
    const user = req['user'];
    return this.sponsoringService.create(body);
  }

  /**
   * =========================
   * 📝 ROUTE GET SPONSORING
   * =========================
   * GET /sponsoring/:id
   * Route Bearer
   */
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une sponsorisation par ID' })
  getSponsoring(
    @Request() req: RequestAuth,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = req['user'];
    return this.sponsoringService.findOne(id);
  }

  /**
   * =========================
   * 📝 ROUTE UPDATE SPONSORING
   * =========================
   * PATCH /sponsoring/:id
   * Route Bearer
   */
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une sponsorisation par ID' })
  updateSponsoring(
    @Request() req: RequestAuth,
    @Body() body: UpdateSponsoringDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = req['user'];
    return this.sponsoringService.update(id, body);
  }

  /**
   * =========================
   * 📝 ROUTE DELETE SPONSORING
   * =========================
   * DELETE /sponsoring/:id
   * Route Bearer
   */
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une sponsorisation par ID' })
  deleteSponsoring(
    @Request() req: RequestAuth,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = req['user'];
    return this.sponsoringService.remove(id);
  }
}
