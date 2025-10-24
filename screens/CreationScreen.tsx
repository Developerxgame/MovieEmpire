import React, { useState, useContext } from 'react';
import { GameContext } from '../context/GameContext';

const CreationScreen: React.FC = () => {
  const [studioName, setStudioName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const { dispatch } = useContext(GameContext);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (studioName.trim() && ownerName.trim()) {
      dispatch({ type: 'START_NEW_GAME', payload: { studioName, ownerName } });
    }
  };

  return (
    <div className="h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-5xl font-cinematic text-amber-400 mb-10 tracking-wider">
          Create Your Studio
        </h1>
        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label htmlFor="studioName" className="block text-left text-sm font-medium text-zinc-300 mb-2">
              Studio Name
            </label>
            <input
              type="text"
              id="studioName"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              placeholder="e.g., Starstruck Pictures"
              required
            />
          </div>
          <div>
            <label htmlFor="ownerName" className="block text-left text-sm font-medium text-zinc-300 mb-2">
              Your Name (Producer)
            </label>
            <input
              type="text"
              id="ownerName"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              placeholder="e.g., Alex Reed"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!studioName.trim() || !ownerName.trim()}
            className="w-full text-xl font-semibold bg-amber-500 text-black py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed"
          >
            Found Your Empire
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreationScreen;