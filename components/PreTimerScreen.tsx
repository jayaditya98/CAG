

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/useGame';
import { PRE_AUCTION_DURATION_SECONDS, PRE_ROUND_DURATION_SECONDS, PLAYER_BREAK_DURATION_SECONDS } from '../constants';
import type { Cricketer } from '../types';

const PreTimerScreen: React.FC = () => {
  const { gameStatus, subPools, subPoolOrder, nextSubPoolPlayers, currentPlayerForAuction } = useGame();
  
  const isPreAuction = gameStatus === 'PRE_AUCTION_TIMER';
  const isPreRound = gameStatus === 'PRE_ROUND_TIMER';
  const isPlayerBreak = gameStatus === 'PLAYER_BREAK_TIMER';

  let duration: number;
  let message: string;

  if (isPreAuction) {
    duration = PRE_AUCTION_DURATION_SECONDS;
    message = 'The auction is starting...';
  } else if (isPreRound) {
    duration = PRE_ROUND_DURATION_SECONDS;
    message = 'The next sub-pool is starting...';
  } else if (isPlayerBreak) {
    duration = PLAYER_BREAK_DURATION_SECONDS;
    message = 'Next player up...';
  } else {
    duration = 5; // Fallback
    message = 'Loading...';
  }

  const [timeLeft, setTimeLeft] = useState(duration);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [nextPlayer, setNextPlayer] = useState<Cricketer | null>(null);

  useEffect(() => {
    setTimeLeft(duration);
    setIsFadingOut(false);

    let determinedPlayer: Cricketer | null = null;
    try {
        if (isPreAuction) {
            const firstSubPoolName = subPoolOrder[0];
            if (firstSubPoolName && subPools[firstSubPoolName]?.[0]) {
                determinedPlayer = subPools[firstSubPoolName][0];
            }
        } else if (isPreRound) {
            if (nextSubPoolPlayers?.[0]) {
                determinedPlayer = nextSubPoolPlayers[0];
            }
        } else if (isPlayerBreak) {
            if (currentPlayerForAuction) {
                determinedPlayer = currentPlayerForAuction;
            }
        }
    } catch (error) {
        console.error("Could not determine next player for preloading.", error);
    }
    setNextPlayer(determinedPlayer);

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 2) {
          setIsFadingOut(true);
        }
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameStatus, duration, subPoolOrder, subPools, nextSubPoolPlayers, currentPlayerForAuction, isPreAuction, isPreRound, isPlayerBreak]);

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <p className="text-2xl md:text-4xl font-light mb-4">{message}</p>
      
      {nextPlayer && (
        <div className="text-center mb-6">
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-200">
                {nextPlayer.name}
            </h2>
            <p className="text-lg md:text-xl text-gray-400">{nextPlayer.role}</p>
        </div>
      )}

      <div className="text-8xl md:text-9xl font-bold">
        {timeLeft}
      </div>
      {nextPlayer?.image && <img src={nextPlayer.image} alt="Preloading next player" style={{ display: 'none' }} />}
       <style>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-fade-out {
          animation: fade-out 1s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default PreTimerScreen;
