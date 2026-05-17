// auth.mapper.ts

import {
  User,
  Session,
  Wallet,
  Transaction,
  TransactionType,
} from '@prisma/client';
import { PayloadType } from 'src/types/auth.type';
import { safeJsonParse } from '.';
import {
  AdminTransactionComposableResult,
  TransactionComposableResult,
} from 'src/types/composable-result.type';

export interface NotificationsType {
  email: boolean;
  push: boolean;
  betResults: boolean;
  promotions: boolean;
}

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
      notifications: safeJsonParse(user.notifications) as NotificationsType,
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
    notifications: safeJsonParse(user.notifications) as NotificationsType,
    phone: user.phone ?? '',
    status: user.status,
    twoFactorEnabled: user.twoFactorEnabled,
    type: user.type,
  };
}

export function properTxComposable(
  wallet: Wallet,
  transactions: Transaction[],
): TransactionComposableResult {
  // Initialiser les stats
  let totalDeposits = 0;
  let totalWins = 0;
  let totalPending = 0;
  let totalFailed = 0;
  let totalIncome = 0;
  let totalExpenses = 0;

  // Parcours unique des transactions
  for (const tx of transactions) {
    if (tx.status === 'done') {
      if (tx.type === 'deposit' || tx.type === 'bet_win') {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
      }

      if (tx.type === 'deposit') {
        totalDeposits += tx.amount;
      } else if (tx.type === 'bet_win') {
        totalWins += tx.amount;
      }
    } else if (tx.status === 'pending') {
      totalPending += tx.amount;
    } else if (tx.status === 'failed') {
      totalFailed += tx.amount;
    }
  }

  const evolution = totalIncome - totalExpenses;
  const volume = totalIncome + totalExpenses;
  const percentage = volume !== 0 ? (evolution / volume) * 100 : 0;

  return {
    // Utilise le solde réel du wallet au lieu de recalculer
    balance: wallet.funds,
    transactionStats: {
      totalDeposits,
      totalWins,
      totalPending,
      totalFailed,
    },
    evolution: {
      digit: evolution,
      amount: evolution.toFixed(2),
      percentage: percentage.toFixed(1) + '%',
      isPositive: evolution >= 0,
    },
    transactions,
  };
}

export function properAdminTxComposable(
  transactions: Transaction[],
): AdminTransactionComposableResult {
  // Initialiser les stats
  let totalDeposits = 0; // Les dépots effectués
  let totalWithdraws = 0; // Les retraits effectués
  let totalWins = 0; // Ce qu'on gagne via les defaites des users
  let totalLoss = 0; // Ce qu'on perd via les defaites des users
  let totalPending = 0; // Transaction en attente
  let totalFailed = 0; // Transaction échoué

  // Parcours unique des transactions
  for (const tx of transactions) {
    if (tx.status === 'done') {

      if (tx.type === 'deposit') {
        totalDeposits += tx.amount;
      } else if (tx.type === 'withdrawal') {
        totalWithdraws += tx.amount;
      } else if (tx.type === 'bet_win') {
        totalLoss += tx.amount;
      } else if (tx.type === 'bet_loss') {
        totalWins += tx.amount;
      }
    } else if (tx.status === 'pending') {
      totalPending += tx.amount;
    } else if (tx.status === 'failed') {
      totalFailed += tx.amount;
    }
  }

  const balance = totalDeposits - totalWithdraws;
  const evolution = totalWins - totalLoss;
  const volume = totalWins + totalLoss;
  const percentage = volume !== 0 ? (evolution / volume) * 100 : 0;

  return {
    // Utilise le solde réel du wallet au lieu de recalculer
    balance,
    transactionStats: {
      totalDeposits,
      totalWithdraws,
      totalWins,
      totalLoss,
      totalPending,
      totalFailed,
    },
    evolution: {
      digit: evolution,
      amount: evolution.toFixed(2),
      percentage: percentage.toFixed(1) + '%',
      isPositive: evolution >= 0,
    },
    transactions,
  };
}
