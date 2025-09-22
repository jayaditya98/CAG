
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/useGame';
import { PRE_AUCTION_DURATION_SECONDS, PRE_ROUND_DURATION_SECONDS } from '../constants';

const PreTimerScreen: React.FC = () => {
  const { gameStatus } = useGame();
  
  const isPreAuction = gameStatus === 'PRE_AUCTION_TIMER';
  const duration = isPreAuction ? PRE_AUCTION_DURATION_SECONDS : PRE_ROUND_DURATION_SECONDS;
  const message = isPreAuction ? 'The auction is starting...' : 'The next sub-pool is starting...';

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

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <p className="text-2xl md:text-4xl font-light mb-4">{message}</p>
      <div className="text-8xl md:text-9xl font-bold">
        {timeLeft}
      </div>
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
