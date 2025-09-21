import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import { GameProvider } from './context/GameProvider';
import type { GameStatus } from './types';
import { getSessionId, saveGameSession, getGameSession, clearGameSession } from './utils/session';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('HOME');
  const [roomCode, setRoomCode] = useState<string | null>(''); // Can be null for creation
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [sessionId] = useState(getSessionId());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect now only restores the UI state from localStorage
    // The actual reconnection logic is handled by the GameProvider's WebSocket
    const restoreSession = () => {
      const savedSession = getGameSession();
      if (savedSession) {
        console.log('Found saved session, attempting to restore UI:', savedSession);
        setPlayerName(savedSession.playerName);
        setRoomCode(savedSession.roomCode);
        setIsHost(savedSession.isHost);
        setGameStatus('LOBBY'); // Go to game, GameProvider will handle reconnect
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const handleCreateGame = (name: string) => {
    if (!name) {
        alert("Please enter a name before creating a game.");
        return;
    }
    setPlayerName(name);
    setIsHost(true);
    setRoomCode(null); // Signal to GameProvider to create a new room
    setGameStatus('LOBBY');
  };

  const handleJoinGame = (code: string, name: string) => {
    if (!name) {
        alert("Please enter a name before joining a game.");
        return;
    }
    const roomCodeUpper = code.trim().toUpperCase();
    if (!roomCodeUpper) return;

    setPlayerName(name);
    setIsHost(false);
    setRoomCode(roomCodeUpper);
    setGameStatus('LOBBY');
  };

  const handleLeaveGame = () => {
    clearGameSession();
    // Reset state completely
    setGameStatus('HOME');
    setRoomCode('');
    setPlayerName('');
    setIsHost(false);
  };
  
  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen text-xl text-gray-400">
              Loading Session...
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {gameStatus === 'HOME' ? (
        <HomePage onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
      ) : (
        <GameProvider 
            initialRoomCode={roomCode} 
            isHost={isHost} 
            onLeave={handleLeaveGame} 
            sessionId={sessionId}
            playerName={playerName}
        >
          <GamePage />
        </GameProvider>
      )}
    </div>
  );
};

export default App;