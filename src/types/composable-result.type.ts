import { Transaction } from '@prisma/client';

// Type pour les statistiques de transactions
export interface TransactionStats {
  totalDeposits: number;
  totalWins: number;
  totalPending: number;
  totalFailed: number;
}

// Type pour l'évolution
export interface EvolutionData {
  digit: number;
  amount: string; // car .toFixed(2) retourne une chaîne
  percentage: string; // car .toFixed(1) + '%' retourne une chaîne
  isPositive: boolean;
}

// Type principal du retour
export interface TransactionComposableResult {
  balance: number; // solde du wallet
  transactionStats: TransactionStats;
  evolution: EvolutionData;
  transactions: Transaction[];
}
