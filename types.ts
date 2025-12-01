export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export interface Voter {
  id: string;
  name: string;
  gender: Gender;
  pollBoothNumber: string;
  voterId: string;
  hasVoted: boolean;
  avatarUrl?: string;
  timestamp?: number;
}

export interface GroupStat {
  group: string;
  total: number;
  voted: number;
  percentage: number;
}

export interface VoterStats {
  total: number;
  voted: number;
  remaining: number;
  turnoutPercentage: number;
  byGender: GroupStat[];
  byBooth: GroupStat[];
}

export type FilterStatus = 'ALL' | 'VOTED' | 'NOT_VOTED';