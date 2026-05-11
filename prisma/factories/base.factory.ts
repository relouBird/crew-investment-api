// prisma/factories/base.factory.ts
import { PrismaClient } from '@prisma/client';

export abstract class BaseFactory<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(modelName: string, prismaClient : PrismaClient) {
    this.prisma = prismaClient;
    this.modelName = modelName;
  }

  // Définit les données par défaut pour le modèle (doit être implémenté)
  protected abstract getDefaultData(overrideData?: Partial<T>): Promise<T> | T;

  // Crée UN enregistrement
  async create(overrideData: Partial<T> = {}): Promise<T> {
    const data = await this.getDefaultData(overrideData);
    // @ts-ignore - Prisma accepte dynamiquement n'importe quel modèle
    return this.prisma[this.modelName].create({ data });
  }

  // Crée PLUSIEURS enregistrements en une seule fois
  async createMany(count: number, overrideData: Partial<T> = {}): Promise<T[]> {
    const promises = Array(count)
      .fill(null)
      .map(() => this.create(overrideData));
    return Promise.all(promises);
  }

  // Crée des enregistrements avec des données différentes pour chacun
  async createManyWithVariations(variations: Partial<T>[]): Promise<T[]> {
    const promises = variations.map((variation) => this.create(variation));
    return Promise.all(promises);
  }

  // Nettoie la table (optionnel)
  async deleteAll(): Promise<void> {
    // @ts-ignore
    await this.prisma[this.modelName].deleteMany();
  }
}