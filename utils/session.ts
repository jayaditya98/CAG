
import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'cricket-auction-session-id';
const GAME_SESSION_KEY = 'cricket-auction-game-session';

interface GameSession {
  roomCode: string;
  isHost: boolean;
  playerName: string;
}

/**
 * Retrieves a persistent, unique session ID for the user from localStorage.
 * Creates a new one if it doesn't exist.
 */
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Saves the user's current game session details to localStorage.
 * @param session - The game session data to save.
 */
export const saveGameSession = (session: GameSession): void => {
  try {
    localStorage.setItem(GAME_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save game session to localStorage", e);
  }
};

/**
 * Retrieves the user's game session from localStorage.
 * @returns The saved game session object, or null if none exists or it's invalid.
 */
export const getGameSession = (): GameSession | null => {
  const sessionStr = localStorage.getItem(GAME_SESSION_KEY);
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr) as GameSession;
  } catch (e) {
    console.error("Failed to parse game session from localStorage", e);
    // If parsing fails, the data is corrupt, so clear it.
    clearGameSession();
    return null;
  }
};

/**
 * Removes the user's game session from localStorage.
 */
export const clearGameSession = (): void => {
  localStorage.removeItem(GAME_SESSION_KEY);
};
