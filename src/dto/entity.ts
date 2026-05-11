// dto/bet/bet.entity.ts
export interface BetTeamType {
  name: string;
  crest: string;
  tla: string;
}

export interface BetEntity {
  id: string;
  score: string;
  winner: string;
  homeTeam: BetTeamType;
  awayTeam: BetTeamType;
  isActive: boolean;
  isEnded: boolean;
  start_at: Date;
  end_at: Date;
  winPercentage: number;
  lossPercentage: number;
  created_at: Date;
  updated_at: Date;
}

// dto/user-bet/user-bet.entity.ts
export interface UserBetEntity {
  id: string;
  uid: string;
  matchId: string;
  match?: BetEntity;
  prediction: string;
  win?: boolean;
  potentialGain: number;
  potentialLoss: number;
  isDelete: boolean;
  isPayed: boolean;
  created_at: Date;
  updated_at: Date;
}
