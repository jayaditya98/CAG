import React from 'react';
import { useGame } from '../context/useGame';

const AuctionPoolView: React.FC = () => {
  const { subPools, startGame, players, sessionId } = useGame();
  
  const currentUser = players.find(p => p.id === sessionId);
  const isUserHost = !!currentUser?.isHost;

  const totalPlayers = Object.values(subPools).reduce((sum, pool) => sum + pool.length, 0);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="text-center my-4 md:my-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-green-400">Auction Pool</h1>
        <p className="text-gray-400">Here are the {totalPlayers} players available, divided into sub-pools.</p>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-grow overflow-y-auto bg-gray-800 rounded-lg border border-gray-700 mb-24 relative no-scrollbar">
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

      {/* Fixed Start Auction Button */}
      {isUserHost && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 z-20">
           <div className="max-w-4xl mx-auto">
               <button
                  onClick={startGame}
                  className="w-full bg-green-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105"
                >
                  Start Auction
                </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AuctionPoolView;