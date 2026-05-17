// src/sponsoring/sponsoring.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSponsoringDto,
  UpdateSponsoringDto,
} from 'src/dto/sponsoring.dto';

@Injectable()
export class SponsoringService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une relation de parrainage.
   * Vérifie que le parrain et le filleul existent et ne sont pas le même utilisateur.
   */
  async create(dto: CreateSponsoringDto) {
    const { sponsorId, sponsoredId } = dto;

    // Vérifier que le parrain et le filleul existent
    const [sponsor, sponsored] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: sponsorId } }),
      this.prisma.user.findUnique({ where: { id: sponsoredId } }),
    ]);

    if (!sponsor)
      throw new NotFoundException(`Parrain introuvable (id=${sponsorId})`);
    if (!sponsored)
      throw new NotFoundException(`Filleul introuvable (id=${sponsoredId})`);

    if (sponsorId === sponsoredId) {
      throw new ConflictException(
        'Un utilisateur ne peut pas se parrainer lui-même',
      );
    }

    // Optionnel : empêcher un utilisateur d'être parrainé plusieurs fois par la même personne
    const alreadySponsoring = await this.prisma.sponsoring.findFirst({
      where: { sponsorId, sponsoredId },
    });
    if (alreadySponsoring) {
      throw new ConflictException('Cette relation de parrainage existe déjà');
    }

    return this.prisma.sponsoring.create({
      data: {
        sponsorId,
        sponsoredId,
        firstDeposit: dto.firstDeposit ?? false,
      },
      include: {
        sponsor: true,
        sponsored: true,
      },
    });
  }

  /**
   * Retourne toutes les relations de parrainage.
   */
  async findAll() {
    return {
      message: 'Sponsoring Checked...',
      data: await this.prisma.sponsoring.findMany({
        include: {
          sponsor: true,
          sponsored: true,
        },
      }),
    };
  }

  /**
   * Retourne toutes les relations de parrainage d'une personne.
   */
  async findAllBySponsorId(uid: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: uid,
      },
      include: {
        sponsoredsByMe: {
          include: {
            sponsored: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Sponsoring introuvable (id=${uid})`);
    }

    const datas = user.sponsoredsByMe.map((data) => {
      const name = data.sponsored.firstName + ' ' + data.sponsored.lastName;
      const initials = name
        .split(' ')
        .map((nm) => nm[0].toLocaleUpperCase())
        .join('');
      return {
        id: data.id,
        sponsor_id: user.id,
        name,
        email: data.sponsored.email,
        initials,
        firstDeposit: data.firstDeposit,
      };
    });

    return {
      message: 'Sponsoring Checked...',
      data: datas,
    };
  }

  /**
   * Retourne les sponsors en fonction  du type de l'user
   */
  async findByStatus(uid: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: uid,
      },
    });

    if (user?.type == 'admin') {
      return await this.findAll();
    }

    return this.findAllBySponsorId(uid);
  }

  /**
   * Retourne une relation de parrainage par son ID.
   */
  async findOne(id: number) {
    const sponsoring = await this.prisma.sponsoring.findUnique({
      where: { id },
      include: {
        sponsor: true,
        sponsored: true,
      },
    });
    if (!sponsoring) {
      throw new NotFoundException(`Sponsoring introuvable (id=${id})`);
    }
    return sponsoring;
  }

  /**
   * Met à jour une relation de parrainage.
   * Permet typiquement de changer le statut `firstDeposit`.
   */
  async update(id: number, dto: UpdateSponsoringDto) {
    await this.findOne(id); // Vérifie l'existence

    // Si on change les clés étrangères, vérifier l'existence et les doublons
    if (dto.sponsorId || dto.sponsoredId) {
      const sponsorId = dto.sponsorId ?? (await this.findOne(id)).sponsorId;
      const sponsoredId =
        dto.sponsoredId ?? (await this.findOne(id)).sponsoredId;

      if (sponsorId === sponsoredId) {
        throw new ConflictException(
          'Un utilisateur ne peut pas se parrainer lui-même',
        );
      }

      const [sponsor, sponsored] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: sponsorId } }),
        this.prisma.user.findUnique({ where: { id: sponsoredId } }),
      ]);
      if (!sponsor)
        throw new NotFoundException(`Parrain introuvable (id=${sponsorId})`);
      if (!sponsored)
        throw new NotFoundException(`Filleul introuvable (id=${sponsoredId})`);

      const duplicate = await this.prisma.sponsoring.findFirst({
        where: { sponsorId, sponsoredId, id: { not: id } },
      });
      if (duplicate) {
        throw new ConflictException('Une autre relation identique existe déjà');
      }
    }

    return this.prisma.sponsoring.update({
      where: { id },
      data: dto,
      include: {
        sponsor: true,
        sponsored: true,
      },
    });
  }

  /**
   * Supprime une relation de parrainage.
   */
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.sponsoring.delete({
      where: { id },
    });
  }

  /**
   * Récuperer tous les users ayant déjà sponsorisé.
   */
  async findSponsor() {
    let sponsoringModelList = await this.prisma.sponsoring.findMany({
      where: {
        firstDeposit: false,
      },
      include: {
        sponsor: true,
        sponsored: true,
      },
    });

    type ToValidateProps = {
      sponsoringId: number;
      sponsorId: string;
    };

    // On Liste tous les sponsorings
    // Dont les premiers depots sont à mettre à TRUE
    const listToValidate: ToValidateProps[] = [];

    for (let i = 0; i < sponsoringModelList.length; i++) {
      const sponsoring = sponsoringModelList[i];
      const sponsored = sponsoring.sponsored;
      const sponsor = sponsoring.sponsor;

      const transaction = await this.prisma.transaction.findFirst({
        where: {
          creator: {
            id: sponsored.id,
          },
          type: 'deposit',
          status: 'done',
        },
      });

      if (!transaction) {
        continue;
      }
      listToValidate.push({
        sponsoringId: sponsoring.id,
        sponsorId: sponsor.id,
      });
    }

    return listToValidate;
  }

  /**
   * Sponsoring à mettre à jour
   */
  async toValidate(sponsoringList: number[]) {
    return await this.prisma.sponsoring.updateMany({
      where: {
        id: { in: sponsoringList },
      },
      data: {
        firstDeposit: true,
      },
    });
  }
}
