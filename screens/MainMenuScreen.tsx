

import React, { useContext } from 'react';
import { GameContext, GamePhase } from '../context/GameContext';
import { Play, History, Trophy, Settings } from 'lucide-react';

const MainMenuScreen: React.FC = () => {
  const { gameState, dispatch } = useContext(GameContext);
  const hasSavedGame = gameState.currentWeek > 1;

  const Button: React.FC<{ icon: React.ReactNode, text: string, onClick: () => void, primary?: boolean, disabled?: boolean }> = ({ icon, text, onClick, primary = false, disabled }) => (
    <button 
      onClick={() => {
        if (navigator.vibrate) navigator.vibrate(30);
        onClick();
      }}
      disabled={disabled}
      className={`w-full flex items-center justify-center text-lg font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-lg
      ${primary ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-white'}`}
    >
      {icon}
      <span className="ml-3">{text}</span>
    </button>
  );

  return (
    <div className="h-screen bg-zinc-900 bg-cover bg-center text-white flex flex-col items-center justify-center p-8" style={{backgroundImage: 'linear-gradient(rgba(18,18,18,0.8), rgba(18,18,18,1))'}}>
      <div className="text-center mb-16">
        <h1 className="text-6xl font-cinematic text-amber-400 tracking-widest" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.5)'}}>
          Blockbuster Tycoon
        </h1>
      </div>
      <div className="w-full max-w-xs space-y-4">
        <Button text="Start Game" icon={<Play />} onClick={() => dispatch({ type: 'SET_PHASE', payload: GamePhase.CREATION })} primary />
        <Button text="Continue Game" icon={<History />} onClick={() => dispatch({ type: 'SET_PHASE', payload: GamePhase.IN_GAME })} disabled={!hasSavedGame} />
        <Button text="Achievements" icon={<Trophy />} onClick={() => {}} disabled />
        <Button text="Settings" icon={<Settings />} onClick={() => {}} disabled />
      </div>
    </div>
  );
};

export default MainMenuScreen;