import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import { GameContext } from './GameContext';
import type { GameState } from './GameContext';
import { STARTING_BUDGET, TOTAL_PLAYERS_TO_AUCTION } from '../constants';
import type { Player, Cricketer } from '../types';
import { CricketerRole } from '../types';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

type Action =
  | { type: 'SET_GAME_STATE'; payload: Partial<GameState> }
  | { type: 'LOAD_CRICKETERS_SUCCESS'; payload: Cricketer[] }
  | { type: 'LOAD_CRICKETERS_FAILURE' }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'DRAW_PLAYERS' }
  | { type: 'START_GAME' }
  | { type: 'START_NEXT_ROUND' }
  | { type: 'PLACE_BID'; payload: { playerId: string } }
  | { type: 'PASS_TURN'; payload: { playerId: string } }
  | { type: 'DROP_FROM_ROUND'; payload: { playerId: string } }
  | { type: 'AUTO_PASS_TURN' }
  | { type: 'END_ROUND' }
  | { type: 'CONTINUE_TO_NEXT_SUBPOOL' }
  | { type: 'END_GAME' };

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const initialStateFactory = (roomCode: string, isHost: boolean, sessionId: string, playerName: string): GameState => {
  const userPlayer: Player = { id: sessionId, name: playerName, budget: STARTING_BUDGET, squad: [], isHost };

  return {
    gameStatus: 'LOBBY',
    roomCode,
    sessionId,
    players: [userPlayer],
    auctionPool: [],
    subPools: {},
    subPoolOrder: [],
    cricketersMasterList: [],
    currentPlayerForAuction: null,
    auctionHistory: [],
    currentBid: 0,
    highestBidderId: null,
    activePlayerId: '',
    masterBiddingOrder: [],
    biddingOrder: [],
    startingPlayerIndex: 0,
    playersInRound: [],
    lastActionMessage: 'Welcome to the lobby!',
    isLoading: true,
    currentSubPoolName: '',
    currentSubPoolPlayers: [],
    nextSubPoolName: '',
    nextSubPoolPlayers: [],
  };
};

const getBidIncrement = (currentBid: number): number => {
  if (currentBid < 100) return 5;
  if (currentBid < 200) return 10;
  if (currentBid < 500) return 20;
  return 25;
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'SET_GAME_STATE':
        return { ...state, ...action.payload };
    case 'LOAD_CRICKETERS_SUCCESS':
      return { ...state, cricketersMasterList: action.payload, isLoading: false };
    case 'LOAD_CRICKETERS_FAILURE':
      return { ...state, isLoading: false, lastActionMessage: 'Error: Could not load player data.' };
    case 'SET_PLAYERS': {
        const currentPlayersMap = new Map(state.players.map(p => [p.id, p]));
        const updatedPlayers = action.payload.map(p => ({
            ...p,
            budget: currentPlayersMap.get(p.id)?.budget || STARTING_BUDGET,
            squad: currentPlayersMap.get(p.id)?.squad || [],
        }));

        const masterBiddingOrder = state.masterBiddingOrder.length > 0 ? state.masterBiddingOrder : shuffleArray(updatedPlayers.map(p => p.id));
        return { ...state, players: updatedPlayers, masterBiddingOrder };
    }
    case 'DRAW_PLAYERS': {
      const { cricketersMasterList } = state;
      
      const batsmen = shuffleArray(cricketersMasterList.filter(p => p.role === CricketerRole.Batsman));
      const bowlers = shuffleArray(cricketersMasterList.filter(p => p.role === CricketerRole.Bowler));
      const allRounders = shuffleArray(cricketersMasterList.filter(p => p.role === CricketerRole.AllRounder));
      const wicketKeepers = shuffleArray(cricketersMasterList.filter(p => p.role === CricketerRole.WicketKeeper));

      if (batsmen.length < 17 || bowlers.length < 15 || allRounders.length < 20 || wicketKeepers.length < 8) {
        return {...state, lastActionMessage: "Error: Not enough players in the database to form sub-pools." };
      }

      const subPools: Record<string, Cricketer[]> = {
        'Batters-1': batsmen.slice(0, 8), 'Batters-2': batsmen.slice(8, 17),
        'Bowlers-1': bowlers.slice(0, 7), 'Bowlers-2': bowlers.slice(7, 15),
        'All-rounders-1': allRounders.slice(0, 6), 'All-rounders-2': allRounders.slice(6, 13), 'All-rounders-3': allRounders.slice(13, 20),
        'Wicket-Keepers': wicketKeepers.slice(0, 8),
      };

      return { ...state, gameStatus: 'AUCTION_POOL_VIEW', subPools, lastActionMessage: 'Player sub-pools have been drawn!' };
    }
    case 'START_GAME': {
      const { subPools } = state;
      const subPoolNames = shuffleArray(Object.keys(subPools));

      const finalAuctionPool = subPoolNames.reduce((acc: Cricketer[], poolName: string) => {
        const shuffledPlayersInPool = shuffleArray(subPools[poolName]);
        return [...acc, ...shuffledPlayersInPool];
      }, []);

      return { ...state, gameStatus: 'AUCTION', auctionPool: finalAuctionPool, subPoolOrder: subPoolNames, lastActionMessage: 'Auction has started! Good luck!' };
    }
    case 'START_NEXT_ROUND': {
        if (state.currentSubPoolName) {
            const allPlayersInCurrentSubpoolAuctioned = state.currentSubPoolPlayers.every(p => state.auctionHistory.some(h => h.cricketer.id === p.id));
            if (allPlayersInCurrentSubpoolAuctioned && state.auctionPool.length > 0) {
                const nextPlayerForAuction = state.auctionPool[0];
                let nextSubPoolName = '';
                let nextSubPoolPlayers: Cricketer[] = [];
                for (const [name, playersInPool] of Object.entries(state.subPools)) {
                  if (playersInPool.some(p => p.id === nextPlayerForAuction.id)) {
                    nextSubPoolName = name; nextSubPoolPlayers = playersInPool; break;
                  }
                }
                return { ...state, gameStatus: 'SUBPOOL_BREAK', nextSubPoolName, nextSubPoolPlayers, lastActionMessage: `Sub-pool '${state.currentSubPoolName}' has ended.` };
            }
        }
        if (state.auctionPool.length === 0) return { ...state, gameStatus: 'GAME_OVER', lastActionMessage: "The auction is over!" };
        
        const nextCricketer = state.auctionPool[0];
        const remainingPool = state.auctionPool.slice(1);
        const playersWithBudget = state.players.filter(p => p.budget >= nextCricketer.basePrice).map(p => p.id);
        
        let currentSubPoolName = state.currentSubPoolName;
        let currentSubPoolPlayers = state.currentSubPoolPlayers;
        if (!currentSubPoolPlayers.some(p => p.id === nextCricketer.id)) {
          for (const [name, playersInPool] of Object.entries(state.subPools)) {
            if (playersInPool.some(p => p.id === nextCricketer.id)) {
              currentSubPoolName = name; currentSubPoolPlayers = playersInPool; break;
            }
          }
        }

        if (playersWithBudget.length < 2) {
             const winner = state.players.find(p => p.id === playersWithBudget[0]);
             if(winner) {
                 const updatedPlayers = state.players.map(p => p.id === winner.id ? { ...p, budget: p.budget - nextCricketer.basePrice, squad: [...p.squad, nextCricketer] } : p);
                 return { ...state, players: updatedPlayers, auctionPool: remainingPool, auctionHistory: [...state.auctionHistory, { cricketer: nextCricketer, winningBid: nextCricketer.basePrice, winnerId: winner.id }], lastActionMessage: `${winner.name} wins ${nextCricketer.name} uncontested!` }
             }
        }
        const roundOrder = [...state.masterBiddingOrder.slice(state.startingPlayerIndex), ...state.masterBiddingOrder.slice(0, state.startingPlayerIndex)];
        const activeBiddingOrder = roundOrder.filter(id => playersWithBudget.includes(id));
        const nextStartingPlayerIndex = (state.startingPlayerIndex + 1) % state.masterBiddingOrder.length;
        return { ...state, gameStatus: 'AUCTION', currentPlayerForAuction: nextCricketer, auctionPool: remainingPool, currentBid: nextCricketer.basePrice, highestBidderId: null, biddingOrder: activeBiddingOrder, playersInRound: activeBiddingOrder, activePlayerId: activeBiddingOrder[0] || '', startingPlayerIndex: nextStartingPlayerIndex, lastActionMessage: `${nextCricketer.name} is up for auction!`, currentSubPoolName, currentSubPoolPlayers };
    }
    case 'PLACE_BID': {
        if (!state.currentPlayerForAuction) return state;
        const bidder = state.players.find(p => p.id === action.payload.playerId);
        if (!bidder) return state;

        const increment = getBidIncrement(state.currentBid);
        const newBid = state.currentBid + increment;

        if (bidder.budget < newBid) return { ...state, lastActionMessage: `${bidder.name} doesn't have enough budget!` };

        const currentIndex = state.biddingOrder.indexOf(state.activePlayerId);
        let nextIndex = currentIndex;
        let nextActivePlayerId = '';
        do {
            nextIndex = (nextIndex + 1) % state.biddingOrder.length;
        } while (!state.playersInRound.includes(state.biddingOrder[nextIndex]));
        nextActivePlayerId = state.biddingOrder[nextIndex];
        
        return { ...state, currentBid: newBid, highestBidderId: bidder.id, activePlayerId: nextActivePlayerId, lastActionMessage: `${bidder.name} bids ${newBid}!` };
    }
     case 'PASS_TURN':
     case 'AUTO_PASS_TURN': {
        const currentIndex = state.biddingOrder.indexOf(state.activePlayerId);
        let nextIndex = currentIndex;
        do {
            nextIndex = (nextIndex + 1) % state.biddingOrder.length;
        } while (!state.playersInRound.includes(state.biddingOrder[nextIndex]));
        const nextActivePlayerId = state.biddingOrder[nextIndex];
        const passerName = state.players.find(p => p.id === state.activePlayerId)?.name || 'Someone';
        return { ...state, activePlayerId: nextActivePlayerId, lastActionMessage: action.type === 'AUTO_PASS_TURN' ? `${passerName} timed out!` : `${passerName} passes.` };
    }
    case 'DROP_FROM_ROUND': {
        const newPlayersInRound = state.playersInRound.filter(id => id !== action.payload.playerId);
        if (newPlayersInRound.length === 0) return state;

        const currentIndex = state.biddingOrder.indexOf(state.activePlayerId);
        let nextIndex = currentIndex;
        let nextActivePlayerId = state.activePlayerId;
        if(state.activePlayerId === action.payload.playerId) {
            do {
                nextIndex = (nextIndex + 1) % state.biddingOrder.length;
            } while (!newPlayersInRound.includes(state.biddingOrder[nextIndex]));
            nextActivePlayerId = state.biddingOrder[nextIndex];
        }

        const dropperName = state.players.find(p => p.id === action.payload.playerId)?.name || 'Someone';
        return { ...state, playersInRound: newPlayersInRound, activePlayerId: nextActivePlayerId, lastActionMessage: `${dropperName} has dropped.` };
    }
    case 'END_ROUND': {
        const { highestBidderId, currentPlayerForAuction, currentBid, players } = state;
        if (!currentPlayerForAuction) return state;
        if (!highestBidderId) return { ...state, gameStatus: 'ROUND_OVER', auctionHistory: [...state.auctionHistory, { cricketer: currentPlayerForAuction, winningBid: 0, winnerId: 'UNSOLD' }], lastActionMessage: `${currentPlayerForAuction.name} was unsold.`, currentPlayerForAuction: null };

        const winner = players.find(p => p.id === highestBidderId);
        if (!winner) return state;

        const updatedPlayers = players.map(p => p.id === winner.id ? { ...p, budget: p.budget - currentBid, squad: [...p.squad, currentPlayerForAuction] } : p );
        return { ...state, gameStatus: 'ROUND_OVER', players: updatedPlayers, auctionHistory: [...state.auctionHistory, { cricketer: currentPlayerForAuction, winningBid: currentBid, winnerId: winner.id }], lastActionMessage: `${winner.name} wins ${currentPlayerForAuction.name} for ${currentBid}!`, currentPlayerForAuction: null };
    }
    case 'CONTINUE_TO_NEXT_SUBPOOL':
        return { ...state, gameStatus: 'AUCTION', currentPlayerForAuction: null, currentSubPoolName: state.nextSubPoolName, currentSubPoolPlayers: state.nextSubPoolPlayers, nextSubPoolName: '', nextSubPoolPlayers: [], lastActionMessage: `Starting next sub-pool: ${state.nextSubPoolName}` };
    case 'END_GAME':
        return { ...state, gameStatus: 'GAME_OVER' };
    default:
      return state;
  }
};

interface GameProviderProps {
  roomCode: string; isHost: boolean; onLeave: () => void; supabase: SupabaseClient; sessionId: string; playerName: string;
}

export const GameProvider: React.FC<React.PropsWithChildren<GameProviderProps>> = ({ children, roomCode, isHost, onLeave, supabase, sessionId, playerName }) => {
  const [state, dispatch] = useReducer(gameReducer, initialStateFactory(roomCode, isHost, sessionId, playerName));
  const stateRef = useRef(state);
  stateRef.current = state;

  const updateGameStateInSupabase = async (newState: GameState) => {
    const { error } = await supabase
      .from('rooms')
      .update({ game_state: newState })
      .eq('code', roomCode);
    if (error) console.error("Error updating game state:", error);
  };

  const handleHostAction = (action: Action) => {
    if (!isHost) return;
    const newState = gameReducer(stateRef.current, action);
    updateGameStateInSupabase(newState);
  };

  useEffect(() => {
    const fetchCricketers = async () => {
      const { data, error } = await supabase.from('cricketers').select('*');
      if (error) {
        console.error('Error fetching cricketers:', error);
        dispatch({ type: 'LOAD_CRICKETERS_FAILURE' });
      } else if (data) {
        const transformedData: Cricketer[] = data.map((item: any) => {
          let role: CricketerRole | null = null;
          const roleStr = item.ROLE?.trim().toLowerCase();
          if (['batsman', 'batter'].includes(roleStr)) role = CricketerRole.Batsman;
          else if (roleStr === 'bowler') role = CricketerRole.Bowler;
          else if (roleStr === 'all-rounder') role = CricketerRole.AllRounder;
          else if (['wicket-keeper', 'wk'].includes(roleStr)) role = CricketerRole.WicketKeeper;
          
          return {
            id: item.id, name: item.Name, role: role, basePrice: item.base_price || 50, image: item.image,
            overall: item.OVR || 0, battingOVR: item['Batting OVR'] || 0,
            bowlingOVR: item['Bowling OVR'] || 0, fieldingOVR: item['Fielding OVR'] || 0,
          };
        }).filter((c): c is Cricketer => c.role !== null && Object.values(CricketerRole).includes(c.role));
        dispatch({ type: 'LOAD_CRICKETERS_SUCCESS', payload: transformedData });
      }
    };
    fetchCricketers();
  }, [supabase]);

  useEffect(() => {
    let playersChannel: RealtimeChannel;
    let roomChannel: RealtimeChannel;
  
    const fetchInitialPlayers = async () => {
      const { data, error } = await supabase.from('players').select('session_id, name, is_host').eq('room_code', roomCode);
      if (error) console.error("Error fetching initial players:", error);
      else if (data) {
        const players = data.map((p): Player => ({
          id: p.session_id, name: p.name, isHost: p.is_host, budget: STARTING_BUDGET, squad: [],
        }));
        dispatch({ type: 'SET_PLAYERS', payload: players });
      }
    };
    fetchInitialPlayers();
  
    playersChannel = supabase.channel(`players-${roomCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_code=eq.${roomCode}` }, fetchInitialPlayers)
      .subscribe();
      
    roomChannel = supabase.channel(`room-${roomCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}`}, (payload) => {
          if (payload.new.game_state) {
            dispatch({ type: 'SET_GAME_STATE', payload: payload.new.game_state });
          }
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [supabase, roomCode]);

  const drawPlayers = () => handleHostAction({ type: 'DRAW_PLAYERS' });
  const startGame = () => handleHostAction({ type: 'START_GAME' });
  const continueToNextSubPool = () => handleHostAction({ type: 'CONTINUE_TO_NEXT_SUBPOOL' });
  
  // TODO: Player actions need to be broadcasted to the host
  const placeBid = () => dispatch({ type: 'PLACE_BID', payload: { playerId: sessionId } });
  const passTurn = () => dispatch({ type: 'PASS_TURN', payload: { playerId: sessionId } });
  const dropFromRound = () => dispatch({ type: 'DROP_FROM_ROUND', payload: { playerId: sessionId } });

  const leaveGame = onLeave;

  useEffect(() => {
    if (!isHost) return; // Only host runs the game timer logic
    if (state.gameStatus === 'AUCTION' && state.currentPlayerForAuction === null) {
      const timer = setTimeout(() => handleHostAction({ type: 'START_NEXT_ROUND' }), 1000);
      return () => clearTimeout(timer);
    }
    if (state.gameStatus === 'ROUND_OVER') {
        const timer = setTimeout(() => handleHostAction({ type: 'START_NEXT_ROUND' }), 4000);
        return () => clearTimeout(timer);
    }
    if (state.gameStatus === 'AUCTION' && state.currentPlayerForAuction) {
       if (state.playersInRound.length === 1) {
            const lastPlayerId = state.playersInRound[0];
            if (state.highestBidderId === null) {
                if (lastPlayerId) {
                    // This is still local, needs to be a broadcast action
                    // handleHostAction({ type: 'PLACE_BID', payload: { playerId: lastPlayerId } });
                }
            } else {
                 handleHostAction({ type: 'END_ROUND' });
            }
       }
       else if (state.highestBidderId && state.activePlayerId === state.highestBidderId) {
            handleHostAction({ type: 'END_ROUND' });
       }
    }
  }, [isHost, state.gameStatus, state.playersInRound, state.activePlayerId, state.highestBidderId, state.currentPlayerForAuction]);

  return (
    <GameContext.Provider value={{ ...state, drawPlayers, startGame, placeBid, passTurn, dropFromRound, leaveGame, continueToNextSubPool }}>
      {children}
    </GameContext.Provider>
  );
};