// auth.mapper.ts

import { User, Session } from '@prisma/client';
import { PayloadType } from 'src/types/auth.type';

export function mapUserResponse(user: User, session?: Session) {
  const userPayload = {
    id: user.id,
    aud: user.role, // "authenticated"
    role: user.role,
    email: user.email,
    email_confirmed_at: user.emailConfirmedAt,
    phone: user.phone ?? '',
    phone_confirmed_at: user.phoneConfirmedAt,
    confirmed_at: user.emailConfirmedAt,
    last_sign_in_at: user.lastSignInAt,
    app_metadata: {
      provider: 'email',
      providers: ['email'],
    },
    user_metadata: {
      country: user.country ?? '',
      email: user.email,
      email_verified: !!user.emailConfirmedAt,
      firstName: user.firstName,
      generatedId: user.generatedId,
      lastName: user.lastName,
      notifications: JSON.parse(user.notifications?.toString() ?? ''),
      phone: user.phone ?? '',
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
      type: user.type,
    },
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    is_anonymous: user.isAnonymous,
  };

  if (!session) return { user: userPayload };

  return {
    user: userPayload,
    session: {
      access_token: session.accessToken,
      token_type: session.tokenType,
      expires_in: session.expiresIn,
      expires_at: Math.floor(new Date(session.expiresAt).getTime() / 1000),
      refresh_token: session.refreshToken,
      user: userPayload,
      weak_password: null,
    },
  };
}

export function generatePayload(user: User): PayloadType {
  const times = Date.now() + 3600 * 1000;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ? user.phone : undefined,
    role: user.role,
    expiresAt: new Date(times),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt ? user.deletedAt : undefined,
  };
}

export function mapMeResponse(user: User) {
  return {
    country: user.country ?? '',
    email: user.email,
    email_verified: !!user.emailConfirmedAt,
    firstName: user.firstName,
    generatedId: user.generatedId,
    lastName: user.lastName,
    notifications: JSON.parse(user.notifications?.toString() ?? ''),
    phone: user.phone ?? '',
    status: user.status,
    twoFactorEnabled: user.twoFactorEnabled,
    type: user.type,
  };
}
