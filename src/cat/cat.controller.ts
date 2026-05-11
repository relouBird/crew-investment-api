// cat/cat.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatService } from './cat.service';

@ApiTags('Cats')
@ApiBearerAuth('access-token')
@Controller('cats')
export class CatController {
  constructor(private catService: CatService) {}

  // This  Controller is used to created a cat
  @Post()
  @ApiOperation({ summary: 'Créer un Chat' })
  async create(@Body() createCatDto: { name: string; age: number }) {
    return this.catService.create(createCatDto);
  }

  // THis Controller is used to get all cat
  @Get()
  @ApiOperation({ summary: 'Liste de tous les chats' })
  async findAll() {
    return this.catService.findAll();
  }

  // This Controller is used to get a particular cat
  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un chat par ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catService.findOne(id);
  }

  // This Controller is used to update a cat
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un chat par ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCatDto: { name: string },
  ) {
    return this.catService.update(id, updateCatDto);
  }

  // This controller is used to delete a cat
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un chat par ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.catService.remove(id);
  }
}
