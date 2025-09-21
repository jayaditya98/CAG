
import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import { GameProvider } from './context/GameProvider';
import type { GameStatus } from './types';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSessionId, saveGameSession, getGameSession, clearGameSession } from './utils/session';

// --- IMPORTANT ---
// Replace these placeholders with your actual Supabase URL and public anon key.
// You can find these in your Supabase project's "Settings" > "API" section.
const supabaseUrl = "https://mvxfdgmgfrgcrqvrtsaq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eGZkZ21nZnJnY3JxdnJ0c2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTIwMjUsImV4cCI6MjA3NDAyODAyNX0.y0_Ho2SmLnhmRIjkYW0tgENIORTIOm1bFDZevRwHsn8";

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('HOME');
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [sessionId] = useState(getSessionId());
  const [isLoading, setIsLoading] = useState(true); // Used for session restoration check

  useEffect(() => {
    const restoreSession = async () => {
      const savedSession = getGameSession();
      if (savedSession) {
        console.log('Found saved session:', savedSession);
        // Validate the session with the database to ensure the player is still in the room
        const { data: player } = await supabase
          .from('players')
          .select('session_id, is_host')
          .eq('room_code', savedSession.roomCode)
          .eq('session_id', sessionId)
          .single();
        
        if (player) {
          console.log('Session is valid. Restoring game state.');
          // If the player exists in that room, restore the application state
          setRoomCode(savedSession.roomCode);
          setIsHost(player.is_host); // Get the latest host status from DB
          setPlayerName(savedSession.playerName);
          setGameStatus('LOBBY'); // Go directly to lobby; GameProvider will sync the detailed game state
        } else {
          console.log('Session is invalid or player was removed. Clearing.');
          // If not, the session is stale (e.g., room was deleted). Clear it.
          clearGameSession();
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, [sessionId]); // Run only once on initial app load

  const handleCreateGame = async (name: string) => {
    console.log('--- handleCreateGame started ---');
    if (!name) {
        alert("Please enter a name before creating a game.");
        console.log('No name entered, exiting.');
        return;
    }

    try {
        console.log('Player name entered:', name);
        console.log('Session ID:', sessionId);

        let newRoomCode = '';
        let roomCreated = false;
        const maxRetries = 5;

        console.log('Starting loop to create room...');
        for (let i = 0; i < maxRetries; i++) {
            newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            console.log(`Attempt ${i + 1}: Trying code ${newRoomCode}`);
            
            const { error: roomError } = await supabase
              .from('rooms')
              .insert({ code: newRoomCode, host_id: sessionId });

            if (roomError) {
                if (roomError.code === '23505') { 
                    console.warn(`Room code collision for ${newRoomCode}. Retrying...`);
                    continue;
                } else {
                    console.error("CRITICAL: Error creating room:", roomError);
                    alert(`Error creating room: ${roomError.message}`);
                    return;
                }
            } else {
                console.log(`Successfully reserved room code ${newRoomCode}.`);
                roomCreated = true;
                break;
            }
        }

        if (!roomCreated) {
            console.error("Failed to create a unique room after several attempts.");
            alert("Failed to create a unique game room. Please try again.");
            return;
        }
        
        console.log(`Creating player record for ${name} in room ${newRoomCode}...`);
        const { error: playerError } = await supabase
          .from('players')
          .upsert({ session_id: sessionId, room_code: newRoomCode, name: name, is_host: true, is_ready: true });

        if (playerError) {
            console.error("CRITICAL: Error creating player:", playerError);
            alert(`Error creating player: ${playerError.message}`);
            // TODO: Clean up room if player creation fails
            return;
        }

        console.log('Player created successfully. Saving session and updating app state.');
        saveGameSession({ roomCode: newRoomCode, isHost: true, playerName: name });
        setPlayerName(name);
        setRoomCode(newRoomCode);
        setIsHost(true);
        setGameStatus('LOBBY');
        console.log('--- handleCreateGame finished successfully ---');

    } catch (error) {
        console.error("An unexpected error occurred in handleCreateGame:", error);
        alert("An unexpected error occurred. Please check the console and try again.");
    }
  };

  const handleJoinGame = async (code: string, name: string) => {
    if (!name) {
        alert("Please enter a name before joining a game.");
        return;
    }
    
    const roomCodeUpper = code.trim().toUpperCase();
    if (!roomCodeUpper) return;

    // 1. Verify the room exists
    const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('code')
        .eq('code', roomCodeUpper)
        .single();
    
    if (roomError || !room) {
        alert("Room not found. Please check the code and try again.");
        return;
    }

    // 2. Explicitly insert or update the player to GUARANTEE is_host is false.
    // This replaces the unreliable `upsert` logic that was causing the bug.
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('session_id')
      .eq('session_id', sessionId)
      .single();

    let playerError = null;

    if (existingPlayer) {
      console.log('Player record exists, updating...');
      const { error } = await supabase
        .from('players')
        .update({ 
          room_code: roomCodeUpper, 
          name: name, 
          is_host: false, // CRITICAL FIX: Explicitly set is_host to false
          is_ready: false // Reset ready status on join
        })
        .eq('session_id', sessionId);
      playerError = error;
    } else {
      console.log('New player, inserting record...');
      const { error } = await supabase
        .from('players')
        .insert({ 
          session_id: sessionId, 
          room_code: roomCodeUpper, 
          name: name, 
          is_host: false, // CRITICAL FIX: Explicitly set is_host to false
          is_ready: false
        });
      playerError = error;
    }

    if (playerError) {
        console.error("Error joining room:", playerError);
        alert(`Error joining room: ${playerError.message}`);
        return;
    }

    // 3. Update the app state
    saveGameSession({ roomCode: roomCodeUpper, isHost: false, playerName: name });
    setPlayerName(name);
    setRoomCode(roomCodeUpper);
    setIsHost(false);
    setGameStatus('LOBBY');
  };

  const handleLeaveGame = async () => {
    await supabase.from('players').delete().eq('session_id', sessionId);
    clearGameSession();
    setGameStatus('HOME');
    setRoomCode('');
  }
  
  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen text-xl text-gray-400">
              Loading Session...
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {gameStatus === 'HOME' ? (
        <HomePage onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
      ) : (
        <GameProvider 
            roomCode={roomCode} 
            isHost={isHost} 
            onLeave={handleLeaveGame} 
            supabase={supabase}
            sessionId={sessionId}
            playerName={playerName}
        >
          <GamePage />
        </GameProvider>
      )}
    </div>
  );
};

export default App;
