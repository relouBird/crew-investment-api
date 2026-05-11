import { Injectable } from '@nestjs/common';
import { Otp, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  async createOtp(data: Prisma.OtpCreateInput) {
    return this.prisma.otp.create({
      data,
    });
  }

  async findFirst(OtpWhereInput: Prisma.OtpWhereInput): Promise<Otp | null> {
    return this.prisma.otp.findFirst({
      where: OtpWhereInput,
    });
  }

  async updateOtp(id: number, data: Prisma.OtpUpdateInput) {
    return this.prisma.otp.update({
      where: { id },
      data,
    });
  }
}
