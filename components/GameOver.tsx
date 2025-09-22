
import React from 'react';
import { useGame } from '../context/useGame';
import type { Player, Cricketer } from '../types';
import { MAX_SQUAD_SIZE } from '../constants';

const CricketerCard: React.FC<{ cricketer: Cricketer }> = ({ cricketer }) => (
    <div className="bg-gray-800 p-2 rounded-md flex items-center gap-3">
        <img src={cricketer.image} alt={cricketer.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-600" />
        <div className="flex-grow min-w-0">
            <p className="font-semibold text-sm text-gray-200 truncate">{cricketer.name}</p>
            <p className="text-xs text-gray-400">{cricketer.role}</p>
        </div>
        <div className="text-right flex-shrink-0">
            <p className="font-bold text-lg text-green-400">{cricketer.overall}</p>
        </div>
    </div>
);

const PlayerResultCard: React.FC<{ player: Player }> = ({ player }) => (
    <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-700 flex flex-col h-[45vh] md:h-auto">
        <div className="flex-shrink-0 pb-3 border-b border-gray-600 mb-3">
            <h3 className="text-xl font-bold text-teal-300 truncate">{player.name}</h3>
            <p className="font-mono text-sm text-green-400">Budget Left: {player.budget.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Squad: {player.squad.length}/{MAX_SQUAD_SIZE}</p>
        </div>
        <div className="flex-grow overflow-y-auto no-scrollbar pr-1 space-y-2">
            {player.squad.length > 0 ? (
                player.squad.map(cricketer => <CricketerCard key={cricketer.id} cricketer={cricketer} />)
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No players bought.</p>
                </div>
            )}
        </div>
    </div>
);

const GameOver: React.FC = () => {
    const { players, sessionId, backToLobby } = useGame();
    const currentUser = players.find(p => p.id === sessionId);

    return (
        <div className="flex flex-col h-full p-2 md:p-4 animate-fade-in">
            <div className="text-center mb-6 flex-shrink-0">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300">
                    The Auction Has Ended
                </h1>
                <p className="text-gray-400 mt-2">Here are the final teams.</p>
            </div>

            <div className="flex-grow w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
                {players.map(player => (
                    <PlayerResultCard key={player.id} player={player} />
                ))}
            </div>

            <div className="text-center mt-6 flex-shrink-0">
                {currentUser?.isHost ? (
                    <button
                        onClick={backToLobby}
                        className="px-8 py-3 font-bold text-gray-900 bg-green-400 rounded-lg hover:bg-green-300 transition-all duration-300 transform hover:scale-105"
                    >
                        Back to Lobby
                    </button>
                ) : (
                    <p className="text-center text-gray-400">Waiting for the host to return to the lobby...</p>
                )}
            </div>

             <style>{`
                @keyframes fade-in {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default GameOver;
