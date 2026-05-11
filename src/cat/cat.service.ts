// cat/cat.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatService {
  constructor(private prisma: PrismaService) {} // ✅ Injection du PrismaService

  // Créer un chat
  async create(data: { name: string, age: number }) {
    return this.prisma.cat.create({
      data: {
        name: data.name,
        age: data.age,
      },
    });
  }

  // Récupérer toutes les chats
  async findAll() {
    return this.prisma.cat.findMany();
  }

  // Récupérer un chat par ID
  async findOne(id: number) {
    const cat = await this.prisma.cat.findUnique({
      where: { id },
    });
    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    return cat;
  }

  // Mettre à jour un chat
  async update(id: number, data: { name: string }) {
    const cat = await this.findOne(id);
    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    return this.prisma.cat.update({
      where: { id },
      data,
    });
  }

  // Supprimer un chat
  async remove(id: number) {
    const cat = await this.findOne(id);
    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    return this.prisma.cat.delete({
      where: { id },
    });
  }
}
