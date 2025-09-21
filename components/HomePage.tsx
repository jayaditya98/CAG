
import React, { useState } from 'react';
import Modal from './Modal';

interface HomePageProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (roomCode: string, playerName: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCreateGame, onJoinGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName && roomCode) {
      onJoinGame(roomCode, playerName);
    }
  };

  const handleCreate = () => {
    if (playerName) {
      onCreateGame(playerName);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-cricket-ball-bg bg-cover bg-center">
      <div className="w-full max-w-md text-center bg-gray-900 bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-green-500/20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300 mb-2">
          Cricket Auction
        </h1>
        <p className="text-gray-400 mb-8">Build your ultimate team.</p>
        
        <div className="space-y-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter Your Name"
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-center"
          />

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter Room Code"
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-center uppercase tracking-widest"
              disabled={!playerName}
            />
            <button
              type="submit"
              disabled={!roomCode || !playerName}
              className="w-full px-4 py-3 font-bold text-gray-900 bg-green-400 rounded-lg hover:bg-green-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              Join Game
            </button>
          </form>
        </div>
        
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!playerName}
          className="w-full px-4 py-3 font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Create New Game
        </button>

        <button onClick={() => setIsHelpVisible(true)} className="mt-6 text-sm text-gray-400 hover:text-green-400 transition">
          How to Play?
        </button>
      </div>

      <Modal isVisible={isHelpVisible} onClose={() => setIsHelpVisible(false)} title="How to Play">
        <div className="space-y-3 text-gray-300">
          <p><strong>Objective:</strong> Build the best cricket team by outbidding your opponents in a live auction.</p>
          <p><strong>1. Create/Join:</strong> Enter your name first. Then, create a new game to get a room code, or join a friend's game using their code.</p>
          <p><strong>2. Lobby:</strong> Wait for all players to join. The host will start the auction when ready.</p>
          <p><strong>3. Auction:</strong> Players are brought up for auction one by one. On your turn, you have three choices:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li><strong className="text-green-400">Bid:</strong> Increase the current bid by the set increment.</li>
            <li><strong className="text-yellow-400">Pass:</strong> Skip your turn but stay in the bidding for the current player.</li>
            <li><strong className="text-red-400">Drop:</strong> Exit the bidding for the current player completely.</li>
          </ul>
          <p><strong>4. Winning:</strong> The last bidder standing wins the player! The winning amount is deducted from their budget.</p>
          <p><strong>Budget:</strong> Manage your budget wisely to build a balanced squad. Good luck!</p>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;