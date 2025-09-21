export enum CricketerRole {
  Batsman = 'Batsman',
  Bowler = 'Bowler',
  AllRounder = 'All-Rounder',
  WicketKeeper = 'Wicket-Keeper',
}

export interface Cricketer {
  id: number;
  name: string; // From 'Name' column
  role: CricketerRole; // From 'ROLE' column
  basePrice: number; // From 'base_price' column
  image: string;
  overall: number; // From 'OVR' column
  battingOVR: number; // From 'Batting OVR' column
  bowlingOVR: number; // From 'Bowling OVR' column
  fieldingOVR: number; // From 'Fielding OVR' column
}

export interface Player {
  id: string;
  name: string;
  budget: number;
  squad: Cricketer[];
  isHost: boolean;
  isReady: boolean;
  // FIX: Add readyForAuction to distinguish from lobby ready state.
  readyForAuction: boolean;
}

export type GameStatus = 'HOME' | 'LOBBY' | 'AUCTION_POOL_VIEW' | 'AUCTION' | 'ROUND_OVER' | 'GAME_OVER' | 'SUBPOOL_BREAK' | 'PRE_ROUND_TIMER';