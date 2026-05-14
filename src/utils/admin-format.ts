import { Session, Transaction, User, Wallet } from '@prisma/client';
import { mapUserResponse } from './mapper';

interface AdminUser extends User {
  session: Session | null;
  transactions: Transaction[] | null;
  wallet: Wallet | null;
}

export function formatAllUsersByAdmin(users: AdminUser[]) {
  const newUsers = users.map((user) => {
    return {
      ...mapUserResponse(user, user.session != null ? user.session : undefined)
        .user,
      transactions: user.transactions,
      wallet: user.wallet,
    };
  });

  const returnedUsers = newUsers.map((user) => {
    let totalInvested = 0;
    user.transactions?.forEach((trans) => {
      if (trans.type == 'deposit' && trans.status == 'done') {
        totalInvested += trans.amount;
      }
    });
    return {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        balance: user.wallet?.funds ?? 0,
        totalInvested,
        profitLoss: 0,
      },
      transactions: null,
      wallet: null,
    };
  });

  return returnedUsers;
}
