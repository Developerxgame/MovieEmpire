import React, { useContext, useEffect } from 'react';
import { GameContext, GamePhase } from '../context/GameContext';
import { Clapperboard } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const { dispatch } = useContext(GameContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_PHASE', payload: GamePhase.MAIN_MENU });
    }, 3000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <div className="animate-pulse">
        <Clapperboard className="text-amber-400" size={80} />
      </div>
      <h1 className="text-5xl font-cinematic mt-4 text-amber-400 tracking-widest">
        Blockbuster Tycoon
      </h1>
      <p className="text-zinc-400 mt-2">Your movie empire awaits...</p>
    </div>
  );
};

export default SplashScreen;