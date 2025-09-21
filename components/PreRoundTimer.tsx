
import React, { useState, useEffect } from 'react';
import { PRE_ROUND_DURATION_SECONDS } from '../constants';
import { useGame } from '../context/useGame';

const PreRoundTimer: React.FC = () => {
    const { nextSubPoolName } = useGame();
    const [countdown, setCountdown] = useState(PRE_ROUND_DURATION_SECONDS);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => (prev > 1 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in">
            <p className="text-2xl md:text-3xl text-gray-300 mb-4 animate-pulse">
                {nextSubPoolName ? `Next round '${nextSubPoolName}' starting in...` : 'Next round starting in...'}
            </p>
            <p className="text-8xl md:text-9xl font-bold text-white">{countdown}</p>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PreRoundTimer;
