

import React, { createContext, useReducer, Dispatch, ReactNode, useEffect } from 'react';
import { PlayerStats, Movie, Staff, GameEvent, MovieProductionPhase } from '../types';
import { processWeeklyUpdate } from './gameLogic';

export enum GamePhase {
  SPLASH = 'SPLASH',
  MAIN_MENU = 'MAIN_MENU',
  CREATION = 'CREATION',
  IN_GAME = 'IN_GAME',
}

// FIX: Export the GameState interface to allow it to be imported in other files.
export interface GameState {
  phase: GamePhase;
  playerStats: PlayerStats;
  studioName: string;
  ownerName: string;
  currentWeek: number;
  completedMovies: Movie[];
  currentMovieInProduction: Movie | null;
  hiredStaff: Staff[];
  events: GameEvent[];
}

const SAVED_GAME_KEY = 'blockbuster_tycoon_save';

const initialState: GameState = {
  phase: GamePhase.SPLASH,
  playerStats: {
    money: 15000000,
    fame: 10,
    reputation: 10,
    studioLevel: 1,
    fans: 1000,
  },
  studioName: '',
  ownerName: '',
  currentWeek: 1,
  completedMovies: [],
  currentMovieInProduction: null,
  hiredStaff: [],
  events: [],
};

type GameAction =
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'START_NEW_GAME'; payload: { studioName: string; ownerName: string } }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'START_MOVIE_PRODUCTION'; payload: Movie }
  | { type: 'UPDATE_MOVIE_IN_PRODUCTION'; payload: Movie }
  | { type: 'COMPLETE_MOVIE_PRODUCTION' }
  | { type: 'UPDATE_PLAYER_STATS'; payload: Partial<PlayerStats> }
  | { type: 'RELEASE_TEASER' }
  | { type: 'RELEASE_TRAILER' }
  | { type: 'RELEASE_TO_THEATRES' }
  | { type: 'HIRE_STAFF'; payload: Staff }
  | { type: 'START_STAFF_TRAINING'; payload: { staffId: string; cost: number } };


const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'START_NEW_GAME':
      localStorage.removeItem(SAVED_GAME_KEY);
      return {
        ...initialState,
        phase: GamePhase.IN_GAME,
        studioName: action.payload.studioName,
        ownerName: action.payload.ownerName,
        events: [{id: 'evt-start', week: 1, message: `Welcome! ${action.payload.studioName} is officially open for business.`, type: 'success'}]
      };
    case 'ADVANCE_WEEK':
        return processWeeklyUpdate(state);
    case 'START_MOVIE_PRODUCTION':
      return { ...state, currentMovieInProduction: action.payload };
    case 'UPDATE_MOVIE_IN_PRODUCTION':
        return { ...state, currentMovieInProduction: action.payload };
    case 'COMPLETE_MOVIE_PRODUCTION':
        if(!state.currentMovieInProduction) return state;
        return {
            ...state,
            completedMovies: [...state.completedMovies, state.currentMovieInProduction],
            currentMovieInProduction: null
        }
    case 'UPDATE_PLAYER_STATS':
        return { ...state, playerStats: {...state.playerStats, ...action.payload }};
    case 'RELEASE_TEASER':
        if (!state.currentMovieInProduction) return state;
        return {
            ...state,
            currentMovieInProduction: {
                ...state.currentMovieInProduction,
                productionPhase: MovieProductionPhase.TEASER_RELEASE,
                weeksInPhase: 0,
            }
        };
    case 'RELEASE_TRAILER':
        if (!state.currentMovieInProduction) return state;
        return {
            ...state,
            currentMovieInProduction: {
                ...state.currentMovieInProduction,
                productionPhase: MovieProductionPhase.TRAILER_RELEASE,
                weeksInPhase: 0,
            }
        };
    case 'RELEASE_TO_THEATRES':
        if (!state.currentMovieInProduction) return state;
        return {
            ...state,
            currentMovieInProduction: {
                ...state.currentMovieInProduction,
                productionPhase: MovieProductionPhase.THEATRE_RELEASE,
                weeksInPhase: 0,
            }
        };
    case 'HIRE_STAFF':
        return {
            ...state,
            hiredStaff: [...state.hiredStaff, action.payload]
        };
    case 'START_STAFF_TRAINING':
        return {
            ...state,
            playerStats: {
                ...state.playerStats,
                money: state.playerStats.money - action.payload.cost,
            },
            hiredStaff: state.hiredStaff.map(staff => 
                staff.id === action.payload.staffId 
                ? { ...staff, isTraining: true, weeksInTraining: 0 } 
                : staff
            ),
        };
    default:
      return state;
  }
};

export const GameContext = createContext<{
  gameState: GameState;
  dispatch: Dispatch<GameAction>;
}>({
  gameState: initialState,
  dispatch: () => null,
});

const loadState = (): GameState => {
    try {
        const serializedState = localStorage.getItem(SAVED_GAME_KEY);
        if (serializedState === null) {
            return initialState;
        }
        const savedState = JSON.parse(serializedState);
        // Reset to main menu on load to not throw user directly into the game
        if (savedState.currentWeek > 1) {
            return { ...savedState, phase: GamePhase.MAIN_MENU };
        }
        return initialState;
    } catch (err) {
        console.warn("Could not load saved game:", err);
        return initialState;
    }
};

export const GameProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    if (gameState.phase === GamePhase.IN_GAME) {
        try {
            const serializedState = JSON.stringify(gameState);
            localStorage.setItem(SAVED_GAME_KEY, serializedState);
        } catch (err) {
            console.error("Could not save game:", err);
        }
    }
  }, [gameState]);

  return (
    <GameContext.Provider value={{ gameState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};