import React from 'react';
import { useGame } from '../context/useGame';
import type { Player } from '../types';

const PlayerReadyStatus: React.FC<{ player: Player; isCurrentUser: boolean }> = ({ player, isCurrentUser }) => (
    <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
        <span className={`font-semibold ${isCurrentUser ? 'text-green-300' : 'text-gray-200'}`}>
            {player.name}
        </span>
        {player.readyForAuction ? (
            <div className="flex items-center gap-2 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Ready</span>
            </div>
        ) : (
            <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Not Ready</span>
            </div>
        )}
    </div>
);

const AuctionPoolView: React.FC = () => {
  const { subPools, startGame, players, sessionId, toggleReadyForAuction } = useGame();
  
  const currentUser = players.find(p => p.id === sessionId);
  const isUserHost = !!currentUser?.isHost;
  const nonHostPlayers = players.filter(p => !p.isHost);
  const allReadyForAuction = nonHostPlayers.every(p => p.readyForAuction);

  const totalPlayers = Object.values(subPools).reduce((sum, pool) => sum + pool.length, 0);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="text-center my-4 md:my-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-green-400">Auction Pool</h1>
        <p className="text-gray-400">Here are the {totalPlayers} players available, divided into sub-pools.</p>
      </div>

      <div className="flex-grow overflow-y-auto bg-gray-800 rounded-lg border border-gray-700 mb-40 md:mb-32 relative no-scrollbar">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 md:px-6 py-3">Player Name</th>
              <th scope="col" className="px-4 md:px-6 py-3">Role</th>
              <th scope="col" className="px-2 md:px-6 py-3 text-center">OVR</th>
              <th scope="col" className="px-2 md:px-6 py-3 text-center">Bat</th>
              <th scope="col" className="px-2 md:px-6 py-3 text-center">Bow</th>
              <th scope="col" className="px-2 md:px-6 py-3 text-center">Fie</th>
              <th scope="col" className="px-4 md:px-6 py-3 text-right">Base Price</th>
            </tr>
          </thead>
          {Object.entries(subPools).map(([poolName, players]) => (
            <tbody key={poolName}>
              <tr className="bg-gray-700/80 backdrop-blur-sm sticky top-12 z-[9]">
                <th colSpan={7} className="px-4 md:px-6 py-2 text-left text-md font-bold text-teal-300 tracking-wider">
                  {poolName} <span className="font-normal text-gray-400">({players.length} players)</span>
                </th>
              </tr>
              {players.length > 0 ? (
                players.map((player) => (
                  <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <th scope="row" className="px-4 md:px-6 py-4 font-medium text-white whitespace-nowrap">
                      {player.name}
                    </th>
                    <td className="px-4 md:px-6 py-4">{player.role}</td>
                    <td className="px-2 md:px-6 py-4 text-center font-bold text-lg">{player.overall}</td>
                    <td className="px-2 md:px-6 py-4 text-center text-amber-300">{player.battingOVR}</td>
                    <td className="px-2 md:px-6 py-4 text-center text-red-400">{player.bowlingOVR}</td>
                    <td className="px-2 md:px-6 py-4 text-center text-sky-300">{player.fieldingOVR}</td>
                    <td className="px-4 md:px-6 py-4 text-right font-mono text-green-400">{player.basePrice}</td>
                  </tr>
                ))
               ) : (
                <tr>
                  <td colSpan={7} className="px-4 md:px-6 py-4 text-center text-gray-500">No players in this pool.</td>
                </tr>
              )}
            </tbody>
          ))}
        </table>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 z-20">
           <div className="max-w-4xl mx-auto space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {players.map(p => <PlayerReadyStatus key={p.id} player={p} isCurrentUser={p.id === sessionId}/>)}
              </div>
              {isUserHost ? (
                  <button
                    onClick={startGame}
                    disabled={!allReadyForAuction}
                    className="w-full bg-green-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {allReadyForAuction ? 'Start Auction' : 'Waiting for players to be ready...'}
                  </button>
              ) : (
                  <button
                      onClick={toggleReadyForAuction}
                      className={`w-full font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                          currentUser?.readyForAuction 
                          ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                          : 'bg-teal-500 text-white hover:bg-teal-400'
                      }`}
                  >
                      {currentUser?.readyForAuction ? 'Set to Not Ready' : 'Ready for Auction!'}
                  </button>
              )}
           </div>
        </div>
    </div>
  );
};

export default AuctionPoolView;