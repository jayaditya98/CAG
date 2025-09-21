
import React, { useReducer, useEffect, useRef, useCallback } from 'react';
import { GameContext, GameState } from './GameContext';
import { STARTING_BUDGET } from '../constants';
import type { Player } from '../types';
import { saveGameSession, clearGameSession } from '../utils/session';

// --- IMPORTANT ---
// This should point to your deployed WebSocket server.
// For local development, it might be 'ws://localhost:8080'.
const WEBSOCKET_URL = 'wss://cag-backend-server.onrender.com/';

type Action = 
  | { type: 'SET_STATE'; payload: Partial<GameState> }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connecting' | 'connected' | 'disconnected' };

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    // You could add more client-side specific state changes here if needed
    default:
      return state;
  }
};

const initialStateFactory = (sessionId: string, playerName: string): GameState => ({
  gameStatus: 'LOBBY',
  roomCode: '',
  sessionId,
  // FIX: Add readyForAuction to initial player state.
  players: [{ id: sessionId, name: playerName, budget: STARTING_BUDGET, squad: [], isHost: false, isReady: false, readyForAuction: false }],
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
  lastActionMessage: 'Connecting to server...',
  isLoading: true,
  currentSubPoolName: '',
  currentSubPoolPlayers: [],
  nextSubPoolName: '',
  nextSubPoolPlayers: [],
  // New properties for robust progress tracking
  currentSubPoolOrderIndex: 0,
  currentPlayerInSubPoolIndex: -1,
  // New properties for unsold players round
  unsoldPool: [],
  isSecondRound: false,
  nextPlayerForAuction: null,
});

interface GameProviderProps {
  initialRoomCode: string | null;
  isHost: boolean;
  onLeave: () => void;
  sessionId: string;
  playerName: string;
}

export const GameProvider: React.FC<React.PropsWithChildren<GameProviderProps>> = ({ children, initialRoomCode, isHost, onLeave, sessionId, playerName }) => {
  const [state, dispatch] = useReducer(gameReducer, initialStateFactory(sessionId, playerName));
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Establish WebSocket connection
    const socket = new WebSocket(WEBSOCKET_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      dispatch({ type: 'SET_STATE', payload: { lastActionMessage: 'Connected to server.' } });

      // After connecting, send message to either create or join a room
      const action = isHost 
        ? { type: 'CREATE_ROOM', payload: { sessionId, playerName } }
        : { type: 'JOIN_ROOM', payload: { sessionId, playerName, roomCode: initialRoomCode } };
      
      socket.send(JSON.stringify(action));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message from server:', message.type);

      switch (message.type) {
        case 'GAME_STATE_UPDATE':
          dispatch({ type: 'SET_STATE', payload: message.payload });
          break;
        case 'ROOM_CREATED':
          // The server created a room and sent back the state, including the new roomCode
          saveGameSession({ roomCode: message.payload.roomCode, isHost: true, playerName });
          dispatch({ type: 'SET_STATE', payload: message.payload });
          break;
        case 'JOIN_SUCCESS':
           saveGameSession({ roomCode: message.payload.roomCode, isHost: false, playerName: message.payload.players.find(p => p.id === sessionId)?.name || playerName });
           dispatch({ type: 'SET_STATE', payload: message.payload });
           break;
        case 'ERROR':
          alert(`Server Error: ${message.payload.message}`);
          // If the error is critical (e.g., room not found), leave the game
          if (message.payload.fatal) {
            leaveGame();
          }
          break;
        default:
          console.warn('Unknown message type received:', message.type);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
      dispatch({ type: 'SET_STATE', payload: { lastActionMessage: 'Connection lost. Please refresh.' } });
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      dispatch({ type: 'SET_STATE', payload: { lastActionMessage: 'Failed to connect to the server.' } });
    };

    // Cleanup on component unmount
    return () => {
      socket.close();
    };
  }, [initialRoomCode, isHost, playerName, sessionId]); // Re-connect if these initial props change

  const sendAction = useCallback((type: string, payload: object = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.error('Cannot send action, WebSocket is not open.');
    }
  }, []);
  
  const leaveGame = () => {
    if (socketRef.current) {
        socketRef.current.close();
    }
    clearGameSession();
    onLeave();
  };

  const drawPlayers = () => sendAction('DRAW_PLAYERS');
  const startGame = () => sendAction('START_GAME');
  const placeBid = () => sendAction('PLACE_BID');
  const passTurn = () => sendAction('PASS_TURN');
  const dropFromRound = () => sendAction('DROP_FROM_ROUND');
  const continueToNextSubPool = () => sendAction('CONTINUE_TO_NEXT_SUBPOOL');
  const toggleReady = () => sendAction('TOGGLE_READY');
  const toggleReadyForAuction = () => sendAction('TOGGLE_READY_FOR_AUCTION');
  const openMyTeamModal = () => {}; // Dummy function, implementation is in the component

  return (
    <GameContext.Provider value={{ ...state, drawPlayers, startGame, placeBid, passTurn, dropFromRound, leaveGame, continueToNextSubPool, toggleReady, toggleReadyForAuction, openMyTeamModal }}>
      {children}
    </GameContext.Provider>
  );
};