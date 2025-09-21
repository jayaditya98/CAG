
import React from 'react';
import { useGame } from '../context/useGame';
import Lobby from './Lobby';
import Auction from './Auction';
import AuctionPoolView from './AuctionPoolView';

const GamePage: React.FC = () => {
  const { gameStatus } = useGame();

  return (
    <div className="container mx-auto p-2 md:p-4 max-w-7xl h-screen">
      {gameStatus === 'LOBBY' && <Lobby />}
      {gameStatus === 'AUCTION_POOL_VIEW' && <AuctionPoolView />}
      {(gameStatus === 'AUCTION' || gameStatus === 'ROUND_OVER' || gameStatus === 'SUBPOOL_BREAK') && <Auction />}
      {gameStatus === 'GAME_OVER' && (
        <div className="flex items-center justify-center h-full text-4xl font-bold">
            Game Over!
        </div>
      )}
    </div>
  );
};

export default GamePage;