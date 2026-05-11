import { UserRole } from '@prisma/client';
import { Request } from 'express';

export type PayloadType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  expiresAt: Date | string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date;
};

export interface RequestAuth extends Request {
  user: PayloadType;
}
