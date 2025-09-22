

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/useGame';
import { PRE_AUCTION_DURATION_SECONDS, PRE_ROUND_DURATION_SECONDS, PLAYER_BREAK_DURATION_SECONDS } from '../constants';

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
    message = 'Next player in...';
  } else {
    duration = 5; // Fallback
    message = 'Loading...';
  }

  const [timeLeft, setTimeLeft] = useState(duration);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
    setIsFadingOut(false);

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
  }, [gameStatus, duration]);

  let nextPlayerImage: string | null = null;
  try {
    if (isPreAuction) {
        const firstSubPoolName = subPoolOrder[0];
        if (firstSubPoolName && subPools[firstSubPoolName]?.[0]) {
            nextPlayerImage = subPools[firstSubPoolName][0].image;
        }
    } else if (isPreRound) {
        if (nextSubPoolPlayers?.[0]) {
            nextPlayerImage = nextSubPoolPlayers[0].image;
        }
    } else if (isPlayerBreak) {
        if (currentPlayerForAuction) {
            nextPlayerImage = currentPlayerForAuction.image;
        }
    }
  } catch (error) {
      console.error("Could not determine next player for preloading.", error);
  }

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <p className="text-2xl md:text-4xl font-light mb-4">{message}</p>
      <div className="text-8xl md:text-9xl font-bold">
        {timeLeft}
      </div>
      {nextPlayerImage && <img src={nextPlayerImage} alt="Preloading next player" style={{ display: 'none' }} />}
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