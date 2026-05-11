import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async createSession(data: Prisma.SessionCreateInput) {
    return this.prisma.session.create({
      data,
    });
  }

  async findSessionById(id: string) {
    return this.prisma.session.findFirst({
      where: { id },
    });
  }

  async findSessionByToken(token: string) {
    return this.prisma.session.findFirst({
      where: { accessToken: token },
    });
  }

  async findSessionByUserId(uid: string) {
    return this.prisma.session.findFirst({
      where: { userId: uid },
    });
  }

  async logOutByUserId(uid: string) {
    const session = await this.findSessionByUserId(uid);

    if (!session) {
      throw new NotFoundException('Error on Session...');
    }

    return this.prisma.session.update({
      where: { id: session.id },
      data: {
        loggedOut: true,
      },
    });
  }

  async updateAccessToken(id: string, token: string, at: Date | string) {
    const session = await this.prisma.session.findFirst({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Error on Session...');
    }

    return this.prisma.session.update({
      where: { id },
      data: {
        accessToken: token,
        refreshToken: token,
        loggedOut: false,
        expiresAt: at,
      },
    });
  }

  async deleteSession(id: string) {
    return this.prisma.session.delete({
      where: { id },
    });
  }
}
