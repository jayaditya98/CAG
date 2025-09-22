

import React from 'react';
import { useGame } from '../context/useGame';
import Lobby from './Lobby';
import Auction from './Auction';
import AuctionPoolView from './AuctionPoolView';
import PreTimerScreen from './PreTimerScreen';
import GameOver from './GameOver';

const GamePage: React.FC = () => {
  const { gameStatus } = useGame();

  const renderContent = () => {
    switch (gameStatus) {
      case 'LOBBY':
        return <Lobby />;
      case 'AUCTION_POOL_VIEW':
        return <AuctionPoolView />;
      case 'AUCTION':
      case 'ROUND_OVER':
      case 'SUBPOOL_BREAK':
      case 'PRE_AUCTION_TIMER':
      case 'PRE_ROUND_TIMER':
      case 'PLAYER_BREAK_TIMER':
        return <Auction />;
      case 'GAME_OVER':
        return <GameOver />;
      default:
        // Fallback for any unknown state
        return null;
    }
  };

  return (
    <div className="container mx-auto p-2 md:p-4 max-w-7xl h-screen">
      {renderContent()}
      {(gameStatus === 'PRE_AUCTION_TIMER' || gameStatus === 'PRE_ROUND_TIMER' || gameStatus === 'PLAYER_BREAK_TIMER') && (
        <PreTimerScreen />
      )}
    </div>
  );
};

export default GamePage;
