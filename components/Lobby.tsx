import React from 'react';
import { useGame } from '../context/useGame';
import type { Player } from '../types';

const PlayerLobbyCard: React.FC<{ player: Player; isCurrentUser: boolean }> = ({ player, isCurrentUser }) => (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow-lg border border-gray-700">
        <div className="flex items-center gap-3">
            {player.isReady ? (
                <div className="w-5 h-5 flex items-center justify-center bg-green-500 rounded-full" title="Ready">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            ) : (
                <div className="w-5 h-5 bg-gray-600 rounded-full" title="Not Ready"></div>
            )}
            <span className={`font-semibold ${isCurrentUser ? 'text-green-400' : 'text-gray-300'}`}>
                {player.name} {isCurrentUser && '(You)'}
            </span>
        </div>
        {player.isHost && <span className="text-xs font-bold bg-yellow-500 text-gray-900 px-2 py-1 rounded-full">HOST</span>}
    </div>
);

const Lobby: React.FC = () => {
  const { roomCode, players, drawPlayers, leaveGame, isLoading, lastActionMessage, sessionId, toggleReady } = useGame();
  
  const currentUser = players.find(p => p.id === sessionId);
  const isUserHost = !!currentUser?.isHost;

  const nonHostPlayers = players.filter(p => !p.isHost);
  const allPlayersReady = nonHostPlayers.every(p => p.isReady);
  const canStartGame = isUserHost && (nonHostPlayers.length > 0 ? allPlayersReady : true) && players.length > 1;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  const getHostButtonText = () => {
    if (isLoading) return 'Loading Player Data...';
    if (players.length <= 1) return 'Waiting for players...';
    if (!allPlayersReady) return 'Waiting for players to be ready...';
    return 'Draw Players';
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full bg-gray-900/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-teal-500/20">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-300">Lobby</h2>
                <p className="text-gray-400">Waiting for players to join</p>
            </div>
            
            <div className="mb-6 text-center">
                <label className="text-sm text-gray-500">Room Code</label>
                <div 
                    className="mt-1 text-3xl font-bold tracking-widest text-green-400 bg-gray-800 p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2"
                    onClick={handleCopyCode}
                    title="Copy to clipboard"
                >
                    {roomCode}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            <h3 className="text-lg font-semibold mb-3 text-gray-400">Players ({players.length}/4)</h3>
            <div className="space-y-3 mb-8">
                {players.map(player => <PlayerLobbyCard key={player.id} player={player} isCurrentUser={player.id === sessionId}/>)}
            </div>

            {isUserHost ? (
                <button 
                    onClick={drawPlayers}
                    disabled={isLoading || !canStartGame}
                    className="w-full bg-green-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {getHostButtonText()}
                </button>
            ) : (
                <button
                    onClick={toggleReady}
                    className={`w-full font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                        currentUser?.isReady 
                        ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                        : 'bg-teal-500 text-white hover:bg-teal-400'
                    }`}
                >
                    {currentUser?.isReady ? 'Set to Not Ready' : 'Ready Up!'}
                </button>
            )}
            
            {!isUserHost && !currentUser?.isReady && (
                <p className="text-center text-teal-300 animate-pulse mt-4">Waiting for you to be ready...</p>
            )}
            {!isUserHost && currentUser?.isReady && (
                 <p className="text-center text-gray-400 mt-4">Waiting for the host to start the game...</p>
            )}
            
            {lastActionMessage.startsWith('Error') && (
                <div className="text-center text-red-300 bg-red-900/50 border border-red-500/50 rounded-lg p-3 mt-4 min-h-[4rem] flex items-center justify-center">
                    <p>{lastActionMessage}</p>
                </div>
            )}

            <button 
                onClick={leaveGame}
                className="w-full mt-4 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-500 transition-all duration-200"
            >
                Leave Lobby
            </button>
        </div>
    </div>
  );
};

export default Lobby;