
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/useGame';
import type { Player, Cricketer } from '../types';
import { CricketerRole } from '../types';
import { TURN_DURATION_SECONDS } from '../constants';
import type { GameState } from '../context/GameContext';
import Modal from './Modal';

// --- Re-usable Icon Component ---
const RoleIcon: React.FC<{ role: CricketerRole }> = ({ role }) => {
    const iconMap = {
        [CricketerRole.Batsman]: <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.342.639l-.934 4.671a1 1 0 00.956 1.22l4.384-1.225a1 1 0 01.674 0l4.384 1.225a1 1 0 00.956-1.22l-.934-4.671a1 1 0 01.342-.639l2.644-1.071a1 1 0 000-1.84l-7-3zM12 14.633l-2-.556-2 .556v-2.349h4v2.349z" />,
        [CricketerRole.Bowler]: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />,
        [CricketerRole.AllRounder]: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />,
        [CricketerRole.WicketKeeper]: <path d="M6 3a1 1 0 011-1h6a1 1 0 011 1v2.586l1.293 1.293a1 1 0 01.293.707V16a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V7.586a1 1 0 01.293-.707L5.586 5.586 6 5.172V3z" />,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
            {iconMap[role] || null}
        </svg>
    );
};

const DetailedRoleIcon: React.FC<{ role: CricketerRole }> = ({ role }) => {
    const BatSVG = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-300 transform rotate-[-45deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12.3 3.3a1.5 1.5 0 0 0-2.12 0L3.3 10.18a1.5 1.5 0 0 0 0 2.12l8.48 8.48a1.5 1.5 0 0 0 2.12 0l8.48-8.48a1.5 1.5 0 0 0 0-2.12L12.3 3.3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.46 15.54L15.54 8.46" />
        </svg>
    );
    const BallSVG = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
    );
    const GlovesSVG = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-300" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6 3a1 1 0 011-1h6a1 1 0 011 1v2.586l1.293 1.293a1 1 0 01.293.707V16a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V7.586a1 1 0 01.293-.707L5.586 5.586 6 5.172V3z" />
        </svg>
    );

    switch(role) {
        case CricketerRole.Batsman:
            return BatSVG;
        case CricketerRole.Bowler:
            return BallSVG;
        case CricketerRole.WicketKeeper:
            return GlovesSVG;
        case CricketerRole.AllRounder:
            return <div className="flex items-center -space-x-2">{BatSVG}{BallSVG}</div>;
        default:
            return null;
    }
};

// --- New Timer Component ---
const TimerCircle: React.FC<{ timeLeft: number; duration: number }> = ({ timeLeft, duration }) => {
  const normalizedTime = Math.max(0, timeLeft / duration);
  const circumference = 2 * Math.PI * 16; // r=16
  const strokeDashoffset = circumference * (1 - normalizedTime);

  return (
    <div className="relative w-14 h-14 mx-auto mt-2">
      <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)">
        <circle
          className="text-gray-700/50"
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="18"
          cy="18"
        />
        <circle
          className="text-green-400 transition-[stroke-dashoffset] duration-100 linear"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="16"
          cx="18"
          cy="18"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white drop-shadow-lg">
          {Math.ceil(timeLeft)}
        </span>
      </div>
    </div>
  );
};


// --- Layout-Specific Components for this view ---
const CompactCricketerCard: React.FC<{ cricketer: Cricketer | null, winner?: Player | null, isUnsold?: boolean }> = ({ cricketer, winner, isUnsold }) => {
    if (!cricketer) {
        return <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 p-2">Loading next player...</div>;
    }
    
    return (
        <div className={`relative bg-gray-900 rounded-lg text-white overflow-hidden shadow-lg h-full border-2 ${winner ? 'border-green-400 animate-pulse' : 'border-transparent'}`}>
            <img src={cricketer.image} alt={cricketer.name} className="absolute inset-0 w-full h-full object-cover z-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-60% to-transparent z-10"></div>
            <div className="relative flex flex-col justify-between h-full p-2 md:p-3 z-20">
                <div className="text-right">
                    <p className="text-4xl md:text-5xl font-bold text-white leading-none drop-shadow-lg">{cricketer.overall}</p>
                </div>
                <div className="text-left space-y-1">
                    <div className="flex justify-between items-baseline">
                        <h2 className="text-lg md:text-xl font-bold text-white drop-shadow-md pr-2">{cricketer.name}</h2>
                        <div className="text-gray-300 text-xs md:text-sm flex-shrink-0">
                            Base: <span className="font-bold text-green-400">{cricketer.basePrice}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-teal-300 font-semibold text-xs md:text-sm">
                            <RoleIcon role={cricketer.role} />
                            <span>{cricketer.role}</span>
                        </div>
                        <div className="flex gap-2 md:gap-3 text-xs">
                            <div className="text-center">
                                <p className="text-gray-400 font-semibold">Bat</p>
                                <p className="font-bold text-amber-300">{cricketer.battingOVR}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400 font-semibold">Bow</p>
                                <p className="font-bold text-red-400">{cricketer.bowlingOVR}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400 font-semibold">Fie</p>
                                <p className="font-bold text-sky-300">{cricketer.fieldingOVR}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {winner && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg z-30">
                    <p className="text-sm md:text-lg text-gray-300">SOLD TO</p>
                    <p className="text-xl md:text-3xl font-bold text-green-400">{winner.name}</p>
                </div>
            )}
            {isUnsold && (
                <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-30">
                    <p className="text-2xl md:text-4xl font-bold text-gray-300">UNSOLD</p>
                </div>
            )}
        </div>
    );
};

const MyTeamSummary: React.FC<{ player: Player | undefined; auctionHistory: GameState['auctionHistory'] }> = ({ player, auctionHistory }) => {
    const winningBidMap = new Map(auctionHistory.map(h => [h.cricketer.id, h.winningBid]));

    return (
        <div className="bg-gray-800 p-2 md:p-3 rounded-lg border border-gray-700 flex flex-col h-full overflow-hidden">
            <p className="font-bold text-md md:text-lg text-center text-green-300 flex-shrink-0 pb-2 border-b border-gray-700">My Team ({player?.squad.length || 0})</p>
            <div className="mt-2 flex-grow overflow-y-auto pr-1 no-scrollbar">
                {player?.squad.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center text-gray-500 text-sm">No players bought yet.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {player?.squad.map(cricketer => (
                            <div key={cricketer.id} className="flex items-center justify-between bg-gray-900/50 p-1.5 rounded-md text-xs md:text-sm">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="flex-shrink-0 w-6 flex items-center justify-center">
                                      <DetailedRoleIcon role={cricketer.role} />
                                    </div>
                                    <span className="font-semibold text-gray-200 truncate">{cricketer.name}</span>
                                </div>
                                <span className="font-mono text-green-400 font-bold ml-2">{winningBidMap.get(cricketer.id) || cricketer.basePrice}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PlayerAvatar: React.FC<{ player: Player, isActive: boolean, isHighestBidder: boolean, isInRound: boolean, isCurrentUser: boolean }> = ({ player, isActive, isHighestBidder, isInRound, isCurrentUser }) => {
    const baseClasses = `flex flex-col items-center p-2 w-24 md:w-32 text-center transition-all duration-300`;
    const activeClasses = isActive ? 'scale-110' : '';
    const outOfRoundClasses = !isInRound ? 'opacity-40 grayscale' : '';

    return (
        <div className={`${baseClasses} ${activeClasses} ${outOfRoundClasses}`}>
          <div className="relative mb-1">
            <div className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 transition-colors ${isActive ? 'border-green-400' : 'border-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            </div>
            {isHighestBidder && <span className="absolute -top-1 -right-1 text-lg" role="img" aria-label="Highest Bidder">👑</span>}
          </div>
          <span className={`font-bold text-xs md:text-sm truncate w-full ${isCurrentUser ? 'text-green-300' : 'text-white'}`}>{player.name}</span>
          <span className="text-xs font-mono text-green-400/80">{player.budget.toLocaleString()}</span>
          {!isInRound && <p className="text-xs text-red-400 mt-1">Dropped</p>}
        </div>
    );
};

const PlayerReadyStatus: React.FC<{ player: Player }> = ({ player }) => (
    <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
        <span className='font-semibold text-gray-200'>{player.name}</span>
        {player.isReady ? (
            <div className="flex items-center gap-2 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>Ready</span>
            </div>
        ) : (
            <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span>Not Ready</span>
            </div>
        )}
    </div>
);

const Auction: React.FC = () => {
    const { 
        gameStatus, players, currentPlayerForAuction, currentBid, 
        highestBidderId, activePlayerId, playersInRound,
        placeBid, passTurn, dropFromRound, auctionHistory,
        subPools, subPoolOrder, currentSubPoolOrderIndex, currentPlayerInSubPoolIndex,
        nextSubPoolName, nextSubPoolPlayers, continueToNextSubPool, toggleReady,
        sessionId
    } = useGame();
    const [isSubPoolModalVisible, setIsSubPoolModalVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);

    useEffect(() => {
        if (gameStatus !== 'AUCTION') {
            return;
        }

        setTimeLeft(TURN_DURATION_SECONDS); // Reset on new turn

        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 0.1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prevTime - 0.1;
            });
        }, 100);

        return () => clearInterval(intervalId);
    }, [activePlayerId, gameStatus]);


    const user = players.find(p => p.id === sessionId);
    const otherPlayers = players.filter(p => p.id !== sessionId);
    const nonHostPlayers = players.filter(p => !p.isHost);
    const allNonHostsReady = nonHostPlayers.every(p => p.isReady);

    const isMyTurn = activePlayerId === sessionId;
    const amIInRound = playersInRound.includes(sessionId);

    const winnerId = gameStatus === 'ROUND_OVER' ? auctionHistory[auctionHistory.length-1]?.winnerId : null;
    const winner = players.find(p => p.id === winnerId);
    const isUnsold = gameStatus === 'ROUND_OVER' && winnerId === 'UNSOLD';
    
    const soldCricketer = gameStatus === 'ROUND_OVER' ? auctionHistory[auctionHistory.length - 1]?.cricketer : currentPlayerForAuction;

    const getPlayerProps = (player: Player) => ({
        player,
        isActive: player.id === activePlayerId && gameStatus === 'AUCTION',
        isHighestBidder: player.id === highestBidderId,
        isInRound: playersInRound.includes(player.id),
        isCurrentUser: player.id === sessionId,
    });

    const getBidIncrement = (bid: number): number => {
        if (bid < 100) return 5;
        if (bid < 200) return 10;
        if (bid < 500) return 20;
        return 25;
    };
    const bidIncrement = getBidIncrement(currentBid);
    
    // --- New Progress Bar Logic ---
    const currentSubPoolName = subPoolOrder[currentSubPoolOrderIndex] || '';
    const currentPool = subPools[currentSubPoolName] || [];
    const totalInPool = currentPool.length;
    // +1 because index is 0-based
    const currentNumberInPool = currentPlayerInSubPoolIndex + 1;
    // Protect against division by zero and negative numbers/bad states
    const progressPercent = totalInPool > 0 ? Math.max(0, (currentNumberInPool / totalInPool) * 100) : 0;
    
    // --- Modal Logic ---
    const soldPlayersInPool = auctionHistory.filter(h => 
        currentPool.some(p => p.id === h.cricketer.id)
    );
    const soldPlayerIds = new Set(soldPlayersInPool.map(p => p.cricketer.id));
    const upcomingPlayers = currentPool.filter(p => 
        !soldPlayerIds.has(p.id) && p.id !== currentPlayerForAuction?.id
    );

    const finishedSubPoolSummary = (subPools[subPoolOrder[currentSubPoolOrderIndex-1]] || []).map(player => {
        const historyEntry = auctionHistory.find(h => h.cricketer.id === player.id);
        if (historyEntry) {
            if (historyEntry.winnerId === 'UNSOLD') {
                return { ...player, status: 'Unsold', soldTo: '-', price: 0 };
            }
            const winner = players.find(p => p.id === historyEntry.winnerId);
            return { ...player, status: 'Sold', soldTo: winner?.name || 'Unknown', price: historyEntry.winningBid };
        }
        return null;
    }).filter(Boolean) as (Cricketer & { status: string, soldTo: string, price: number })[];


    return (
        <div className="h-full flex flex-col p-1 md:p-2 gap-2 text-sm md:text-base overflow-hidden">
            {(gameStatus === 'AUCTION' || gameStatus === 'ROUND_OVER') && currentSubPoolName && totalInPool > 0 && (
                <div 
                    onClick={() => setIsSubPoolModalVisible(true)}
                    className="flex-shrink-0 bg-gray-800/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition border border-gray-700 mb-2 space-y-2"
                >
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-bold text-teal-300">{currentSubPoolName}</p>
                        <p className="font-mono text-gray-400">{currentNumberInPool} / {totalInPool}</p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                            className="bg-green-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 md:gap-4 flex-shrink-0 h-[220px] md:h-[260px]">
                <div className="relative">
                    <CompactCricketerCard cricketer={soldCricketer} winner={winner} isUnsold={isUnsold} />
                </div>
                <MyTeamSummary player={user} auctionHistory={auctionHistory} />
            </div>

            <div className="flex-grow relative flex items-center justify-center bg-gray-900/30 rounded-lg p-2 md:p-4 border border-gray-700/50">
                <div className="absolute inset-0 bg-cricket-pitch-bg bg-center bg-no-repeat opacity-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[60%] bg-green-900/40 rounded-[50%] border-2 border-green-500/30 shadow-inner shadow-black/50 blur-sm"></div>
                <div className="w-full h-full relative">
                    {otherPlayers[0] && <div className="absolute top-0 left-1/2 -translate-x-1/2"><PlayerAvatar {...getPlayerProps(otherPlayers[0])} /></div>}
                    {user && <div className="absolute bottom-0 left-1/2 -translate-x-1/2"><PlayerAvatar {...getPlayerProps(user)} /></div>}
                    {otherPlayers[1] && <div className="absolute left-4 top-1/2 -translate-y-1/2"><PlayerAvatar {...getPlayerProps(otherPlayers[1])} /></div>}
                    {otherPlayers[2] && <div className="absolute right-4 top-1/2 -translate-y-1/2"><PlayerAvatar {...getPlayerProps(otherPlayers[2])} /></div>}
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-gray-400 text-xs md:text-sm">Current Bid</p>
                    <p className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-200">
                        {currentBid}
                    </p>
                    {gameStatus === 'AUCTION' && <TimerCircle timeLeft={timeLeft} duration={TURN_DURATION_SECONDS} />}
                </div>
            </div>

            <div className="flex-shrink-0 pt-2">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <button onClick={placeBid} disabled={!isMyTurn || !amIInRound} className="col-span-2 py-3 text-lg font-bold bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition transform hover:scale-105 disabled:transform-none">BID +{bidIncrement}</button>
                    <button onClick={dropFromRound} disabled={!isMyTurn || !amIInRound} className="py-2 font-bold bg-red-700 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition">DROP</button>
                    <button onClick={passTurn} disabled={!isMyTurn || !amIInRound} className="py-2 font-bold bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition">PASS</button>
                </div>
            </div>

            <Modal isVisible={isSubPoolModalVisible} onClose={() => setIsSubPoolModalVisible(false)} title={`Sub-Pool Details: ${currentSubPoolName}`}>
                <div className="space-y-4 text-gray-300">
                    {currentPlayerForAuction && (
                        <div>
                            <h3 className="text-lg font-bold text-green-400 border-b border-gray-600 pb-2 mb-2">Currently Auctioning</h3>
                            <div className="grid grid-cols-3 gap-2 items-center p-2 bg-gray-700/50 rounded-md">
                                <span className="font-semibold truncate">{currentPlayerForAuction.name}</span>
                                <span className="font-bold text-center">{currentPlayerForAuction.overall}</span>
                                <span className="text-xs text-gray-400 text-right">Base: {currentPlayerForAuction.basePrice}</span>
                            </div>
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-red-400 border-b border-gray-600 pb-2 mb-2">Sold Players ({soldPlayersInPool.length})</h3>
                        {soldPlayersInPool.length > 0 ? (
                            <div className="space-y-2">
                                {soldPlayersInPool.map(item => {
                                    const winner = players.find(p => p.id === item.winnerId);
                                    return (
                                        <div key={item.cricketer.id} className="grid grid-cols-3 gap-2 items-center p-2 bg-gray-700/50 rounded-md opacity-70">
                                            <div className="truncate">
                                                <p className="font-semibold truncate">{item.cricketer.name}</p>
                                                <p className="text-xs text-gray-400">Sold to {winner?.name || 'Unknown'}</p>
                                            </div>
                                            <span className="font-bold text-center">{item.cricketer.overall}</span>
                                            <span className="font-mono font-bold text-green-400 text-right">{item.winningBid}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <p className="text-gray-500 text-sm">No players sold from this pool yet.</p>}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-sky-400 border-b border-gray-600 pb-2 mb-2">Upcoming Players ({upcomingPlayers.length})</h3>
                        {upcomingPlayers.length > 0 ? (
                            <div className="space-y-2">
                                {upcomingPlayers.map(player => (
                                    <div key={player.id} className="grid grid-cols-3 gap-2 items-center p-2 bg-gray-700/50 rounded-md">
                                        <div className="truncate">
                                            <p className="font-semibold truncate">{player.name}</p>
                                            <p className="text-xs text-gray-400">{player.role}</p>
                                        </div>
                                        <span className="font-bold text-center">{player.overall}</span>
                                        <p className="text-right text-xs text-gray-400">Base: <span className="font-bold text-white">{player.basePrice}</span></p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500 text-sm">No more players in this pool.</p>}
                    </div>
                </div>
            </Modal>
            
            <Modal isVisible={gameStatus === 'SUBPOOL_BREAK'} onClose={() => {}} title={`Sub-Pool Over: ${subPoolOrder[currentSubPoolOrderIndex] || ''}`}>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-green-400 border-b border-gray-600 pb-2 mb-3">Finished Sub-Pool Summary</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-2">
                            {finishedSubPoolSummary.map(item => (
                                <div key={item.id} className={`grid grid-cols-3 gap-2 items-center p-2 rounded-md ${item.status === 'Unsold' ? 'bg-red-900/30' : 'bg-gray-700/50'}`}>
                                    <div className="truncate">
                                        <p className="font-semibold truncate">{item.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {item.status === 'Unsold' ? 'UNSOLD' : `Sold to ${item.soldTo}`}
                                        </p>
                                    </div>
                                    <span className="font-bold text-center">{item.overall}</span>
                                    {item.status !== 'Unsold' 
                                      ? <span className="font-mono font-bold text-green-400 text-right">{item.price}</span>
                                      : <span />
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-sky-400 border-b border-gray-600 pb-2 mb-3">Upcoming: {nextSubPoolName}</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-2">
                            {nextSubPoolPlayers.map(player => (
                                <div key={player.id} className="grid grid-cols-3 gap-2 items-center p-2 bg-gray-700/50 rounded-md">
                                    <div className="truncate">
                                        <p className="font-semibold truncate">{player.name}</p>
                                        <p className="text-xs text-gray-400">{player.role}</p>
                                    </div>
                                    <span className="font-bold text-center">{player.overall}</span>
                                    <p className="text-right text-xs text-gray-400">Base: <span className="font-bold text-white">{player.basePrice}</span></p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-600">
                        <h3 className="text-md font-bold text-gray-300">Player Status</h3>
                        {players.map(p => <PlayerReadyStatus key={p.id} player={p} />)}
                    </div>
                    
                    {user?.isHost ? (
                        <button 
                            onClick={continueToNextSubPool}
                            disabled={!allNonHostsReady}
                            className="w-full mt-4 bg-green-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-green-400 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {allNonHostsReady ? 'Continue to Next Sub-Pool' : 'Waiting for players...'}
                        </button>
                    ) : (
                        <button 
                            onClick={toggleReady}
                            className={`w-full mt-4 font-bold py-3 rounded-lg transition-all duration-300 ${
                                user?.isReady 
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-teal-500 hover:bg-teal-400'
                            }`}
                            disabled={user?.isReady}
                        >
                            {user?.isReady ? 'Waiting for Host...' : 'Ready for Next Round'}
                        </button>
                    )}
                </div>
            </Modal>

            <style>{`.bg-cricket-pitch-bg { background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }`}</style>
        </div>
    );
};

export default Auction;