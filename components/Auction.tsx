
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/useGame';
import type { Player, Cricketer } from '../types';
import { CricketerRole } from '../types';
import { TURN_DURATION_SECONDS, ROUND_OVER_DURATION_MS } from '../constants';
import type { GameState } from '../context/GameContext';
import Modal from './Modal';

// --- Utility Functions ---
const shrinkName = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return `${parts[0].charAt(0)}. ${parts.slice(-1)[0]}`;
    }
    return name;
};

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

// --- Timer Component ---
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
        return <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg text-gray-400 p-2">Waiting for next player...</div>;
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

const MyTeamSummary: React.FC<{ player: Player | undefined; onOpenModal: () => void }> = ({ player, onOpenModal }) => {
    return (
        <div onClick={onOpenModal} className="bg-gray-800 p-2 md:p-3 rounded-lg border border-gray-700 flex flex-col h-full overflow-hidden cursor-pointer hover:border-green-400/50 transition">
            <p className="font-bold text-md md:text-lg text-center text-green-300 flex-shrink-0 pb-2 border-b border-gray-700">My Team ({player?.squad.length || 0})</p>
            <div className="mt-2 flex-grow overflow-y-auto pr-1 no-scrollbar">
                {player?.squad.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center text-gray-500 text-sm">No players bought yet.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {player?.squad.map(cricketer => (
                            <div key={cricketer.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-x-2 items-center bg-gray-900/50 p-1.5 rounded-md text-xs md:text-sm">
                                <div className="w-5 flex items-center justify-center"><DetailedRoleIcon role={cricketer.role} /></div>
                                <span className="font-semibold text-gray-200 truncate">{shrinkName(cricketer.name)}</span>
                                <span className="font-bold text-gray-300 pr-2">{cricketer.overall}</span>
                                <span className="font-mono text-green-400 font-bold">{cricketer.basePrice}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const MyTeamDetailsModal: React.FC<{isVisible: boolean; onClose: () => void; squad: Cricketer[]}> = ({isVisible, onClose, squad}) => {
    return (
        <Modal isVisible={isVisible} onClose={onClose} title="My Team Details">
            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                {squad.length > 0 ? squad.map(player => (
                    <div key={player.id} className="bg-gray-700/50 p-3 rounded-lg grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="col-span-2 flex items-center gap-3">
                            <DetailedRoleIcon role={player.role} />
                            <h3 className="text-lg font-bold text-white">{player.name}</h3>
                        </div>
                        <div className="text-center bg-gray-800/50 p-2 rounded-md">
                            <p className="text-xs text-gray-400">Overall</p>
                            <p className="text-2xl font-bold text-green-400">{player.overall}</p>
                        </div>
                        <div className="text-center bg-gray-800/50 p-2 rounded-md">
                            <p className="text-xs text-gray-400">Base Price</p>
                            <p className="text-2xl font-bold text-gray-300">{player.basePrice}</p>
                        </div>
                        <div className="text-center bg-gray-800/50 p-2 rounded-md">
                            <p className="text-xs text-gray-400">Batting</p>
                            <p className="text-xl font-bold text-amber-300">{player.battingOVR}</p>
                        </div>
                        <div className="text-center bg-gray-800/50 p-2 rounded-md">
                            <p className="text-xs text-gray-400">Bowling</p>
                            <p className="text-xl font-bold text-red-400">{player.bowlingOVR}</p>
                        </div>
                         <div className="col-span-2 text-center bg-gray-800/50 p-2 rounded-md">
                            <p className="text-xs text-gray-400">Fielding</p>
                            <p className="text-xl font-bold text-sky-300">{player.fieldingOVR}</p>
                        </div>
                    </div>
                )) : <p className="text-center text-gray-400">Your squad is empty.</p>}
            </div>
        </Modal>
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

const RoundOverTimer: React.FC = () => {
    const [countdown, setCountdown] = useState(ROUND_OVER_DURATION_MS / 1000);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => (prev > 1 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <p className="text-2xl text-gray-300 mb-4">Next player in...</p>
            <p className="text-8xl font-bold text-white">{countdown}</p>
        </div>
    );
};


const Auction: React.FC = () => {
    const { 
        gameStatus, players, currentPlayerForAuction, currentBid, 
        highestBidderId, activePlayerId, playersInRound,
        placeBid, passTurn, dropFromRound, auctionHistory,
        subPools, subPoolOrder, currentSubPoolOrderIndex, currentPlayerInSubPoolIndex,
        currentSubPoolName, currentSubPoolPlayers,
        nextSubPoolName, nextSubPoolPlayers, continueToNextSubPool, toggleReady,
        sessionId, nextPlayerForAuction
    } = useGame();
    
    const [isSubPoolModalVisible, setIsSubPoolModalVisible] = useState(false);
    const [isBreakModalVisible, setIsBreakModalVisible] = useState(true);
    const [isMyTeamModalVisible, setIsMyTeamModalVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TURN_DURATION_SECONDS);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (gameStatus === 'AUCTION') {
            setTimeLeft(TURN_DURATION_SECONDS); // Reset on new turn
            const intervalId = setInterval(() => {
                setTimeLeft(prevTime => prevTime > 0.1 ? prevTime - 0.1 : 0);
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, [activePlayerId, gameStatus]);
    
    useEffect(() => {
        if(gameStatus === 'SUBPOOL_BREAK') {
            setIsBreakModalVisible(true); // Re-show the modal when a new break starts
        }
    }, [gameStatus]);

    // Re-enable action buttons on new turn or game status change
    useEffect(() => {
        setIsSubmitting(false);
    }, [activePlayerId, gameStatus]);
    
    // Preload images for smoother transitions
    useEffect(() => {
        const preloadImage = (url: string) => {
            const img = new Image();
            img.src = url;
        };

        // Preload next single player during the round over screen
        if (gameStatus === 'ROUND_OVER' && nextPlayerForAuction?.image) {
            preloadImage(nextPlayerForAuction.image);
        }
        
        // Preload all players for the next sub-pool during the pre-round timer
        if (gameStatus === 'PRE_ROUND_TIMER' && nextSubPoolPlayers?.length > 0) {
            nextSubPoolPlayers.forEach(player => {
                if (player.image) {
                    preloadImage(player.image);
                }
            });
        }
    }, [gameStatus, nextPlayerForAuction, nextSubPoolPlayers]);


    const user = players.find(p => p.id === sessionId);
    const otherPlayers = players.filter(p => p.id !== sessionId);
    const allNonHostsReady = players.filter(p => !p.isHost).every(p => p.isReady);

    const isMyTurn = activePlayerId === sessionId;
    const amIInRound = playersInRound.includes(sessionId);
    const canPerformAction = isMyTurn && amIInRound && !isSubmitting;

    const winnerId = gameStatus === 'ROUND_OVER' ? auctionHistory[auctionHistory.length-1]?.winnerId : null;
    const winner = players.find(p => p.id === winnerId);
    const isUnsold = gameStatus === 'ROUND_OVER' && winnerId === 'UNSOLD';
    
    const displayedCricketer = gameStatus === 'ROUND_OVER' ? auctionHistory[auctionHistory.length - 1]?.cricketer : currentPlayerForAuction;

    const handleAction = (action: () => void) => {
        if (!canPerformAction) return;
        setIsSubmitting(true);
        action();
    };

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
    
    const poolForProgress = subPools[currentSubPoolName] || [];
    const totalInPool = poolForProgress.length;
    const currentNumberInPool = currentPlayerInSubPoolIndex + 1;
    const progressPercent = totalInPool > 0 ? Math.max(0, (currentNumberInPool / totalInPool) * 100) : 0;
    
    const finishedSubPoolSummary = currentSubPoolPlayers.map(player => {
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
        <div className="h-full flex flex-col p-1 md:p-2 gap-2 text-sm md:text-base overflow-hidden relative">
            {gameStatus === 'ROUND_OVER' && <RoundOverTimer />}
            
            {(gameStatus === 'AUCTION' || gameStatus === 'ROUND_OVER' || (gameStatus === 'SUBPOOL_BREAK' && !isBreakModalVisible)) && currentSubPoolName && totalInPool > 0 && (
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
                    <CompactCricketerCard cricketer={displayedCricketer} winner={winner} isUnsold={isUnsold} />
                </div>
                <MyTeamSummary player={user} onOpenModal={() => setIsMyTeamModalVisible(true)} />
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
                    <button onClick={() => handleAction(placeBid)} disabled={!canPerformAction} className="col-span-2 py-3 text-lg font-bold bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition transform hover:scale-105 disabled:transform-none">BID +{bidIncrement}</button>
                    <button onClick={() => handleAction(dropFromRound)} disabled={!canPerformAction} className="py-2 font-bold bg-red-700 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition">DROP</button>
                    <button onClick={() => handleAction(passTurn)} disabled={!canPerformAction} className="py-2 font-bold bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition">PASS</button>
                </div>
            </div>

            {/* FIX: Added content for the sub-pool details modal to resolve missing 'children' prop error. */}
            <Modal isVisible={isSubPoolModalVisible} onClose={() => setIsSubPoolModalVisible(false)} title={`Sub-Pool Details: ${currentSubPoolName}`}>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                    {(subPools[currentSubPoolName] || []).map((player, index) => {
                        const historyEntry = auctionHistory.find(h => h.cricketer.id === player.id);
                        const isCurrent = index === currentPlayerInSubPoolIndex && gameStatus === 'AUCTION';
                        
                        let status = 'Upcoming';
                        let soldTo = '-';
                        let price = 0;

                        if (historyEntry) {
                            if (historyEntry.winnerId === 'UNSOLD') {
                                status = 'Unsold';
                            } else {
                                status = 'Sold';
                                const winner = players.find(p => p.id === historyEntry.winnerId);
                                soldTo = winner?.name || 'Unknown';
                                price = historyEntry.winningBid;
                            }
                        } else if (isCurrent) {
                            status = 'In Auction';
                        }

                        return (
                            <div key={player.id} className={`grid grid-cols-3 gap-2 items-center p-2 rounded-md ${
                                isCurrent ? 'bg-green-900/50 ring-2 ring-green-500' : 
                                !historyEntry && !isCurrent ? 'bg-gray-700/30' : 
                                status === 'Unsold' ? 'bg-red-900/30' : 'bg-gray-700/50'
                            }`}>
                                <div className="truncate">
                                    <p className="font-semibold truncate">{player.name}</p>
                                    <p className="text-xs text-gray-400">
                                        {status === 'Sold' ? `Sold to ${soldTo}` : status}
                                    </p>
                                </div>
                                <span className="font-bold text-center">{player.overall}</span>
                                {status === 'Sold'
                                  ? <span className="font-mono font-bold text-green-400 text-right">{price}</span>
                                  : <p className="text-right text-xs text-gray-400">Base: <span className="font-bold text-white">{player.basePrice}</span></p>
                                }
                            </div>
                        );
                    })}
                </div>
            </Modal>
            
            <Modal isVisible={gameStatus === 'SUBPOOL_BREAK' && isBreakModalVisible} onClose={() => setIsBreakModalVisible(false)} title={`Sub-Pool '${currentSubPoolName}' has ended.`}>
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

            <MyTeamDetailsModal isVisible={isMyTeamModalVisible} onClose={() => setIsMyTeamModalVisible(false)} squad={user?.squad || []} />

            <style>{`.bg-cricket-pitch-bg { background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }`}</style>
        </div>
    );
};

export default Auction;