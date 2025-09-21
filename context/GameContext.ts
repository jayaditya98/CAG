import React from 'react';
import type { Player, Cricketer, GameStatus } from '../types';

export interface GameState {
  gameStatus: GameStatus;
  roomCode: string;
  sessionId: string;
  players: Player[];
  auctionPool: Cricketer[];
  subPools: Record<string, Cricketer[]>;
  subPoolOrder: string[];
  cricketersMasterList: Cricketer[];
  currentPlayerForAuction: Cricketer | null;
  auctionHistory: { cricketer: Cricketer; winningBid: number; winnerId: string }[];
  currentBid: number;
  highestBidderId: string | null;
  activePlayerId: string;
  masterBiddingOrder: string[];
  biddingOrder: string[];
  startingPlayerIndex: number;
  playersInRound: string[]; // Changed from Set<string> to string[] for JSON serialization
  lastActionMessage: string;
  isLoading: boolean;
  currentSubPoolName: string;
  currentSubPoolPlayers: Cricketer[];
  nextSubPoolName: string;
  nextSubPoolPlayers: Cricketer[];
}

export interface GameContextType extends GameState {
  drawPlayers: () => void;
  startGame: () => void;
  placeBid: () => void;
  passTurn: () => void;
  dropFromRound: () => void;
  leaveGame: () => void;
  continueToNextSubPool: () => void;
  toggleReady: () => void;
  toggleReadyForAuction: () => void;
}

export const GameContext = React.createContext<GameContextType | undefined>(undefined);