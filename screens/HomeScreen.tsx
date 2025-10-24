

import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import StatCard from '../components/StatCard';
import { DollarSign, Star, Award, BarChart, Calendar, Clapperboard, Film, Users } from 'lucide-react';

interface HomeScreenProps {
    setActiveScreen: (screen: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveScreen }) => {
  const { gameState, dispatch } = useContext(GameContext);
  const { playerStats, studioName, currentWeek, events, currentMovieInProduction } = gameState;

  const handleAdvanceWeek = () => {
    dispatch({ type: 'ADVANCE_WEEK' });
  };
  
  const handleGoToProduction = () => {
      setActiveScreen('Studio');
  }

  const ActionButton: React.FC<{onClick: () => void, children: React.ReactNode, primary?: boolean}> = ({ onClick, children, primary = false }) => (
     <button
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(30);
          onClick();
        }}
        className={`w-full flex items-center justify-center text-lg font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100 shadow-lg ${
            primary ? 'bg-amber-500 text-black' : 'bg-zinc-700 text-white'
        }`}
    >
        {children}
    </button>
  );

  return (
    <div className="p-4 space-y-6">
      <header className="text-center">
        <h1 className="text-4xl font-cinematic text-amber-400 tracking-wider">{studioName}</h1>
        <p className="text-zinc-400">Week {currentWeek}</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
            <StatCard icon={<DollarSign size={20} />} label="Money" value={`$${playerStats.money.toLocaleString()}`} colorClass="bg-green-500/20 text-green-400" />
        </div>
        <StatCard icon={<Star size={20} />} label="Fame" value={playerStats.fame} colorClass="bg-yellow-500/20 text-yellow-400" />
        <StatCard icon={<Users size={20} />} label="Fans" value={playerStats.fans.toLocaleString()} colorClass="bg-pink-500/20 text-pink-400" />
        <StatCard icon={<Award size={20} />} label="Reputation" value={playerStats.reputation} colorClass="bg-blue-500/20 text-blue-400" />
        <StatCard icon={<BarChart size={20} />} label="Studio Level" value={playerStats.studioLevel} colorClass="bg-purple-500/20 text-purple-400" />
      </div>

      <div className="space-y-3">
         <ActionButton onClick={handleAdvanceWeek}>
            <Calendar className="mr-2" size={20}/>
            Advance Week
        </ActionButton>
        {currentMovieInProduction ? (
            <ActionButton onClick={handleGoToProduction} primary>
                <Film className="mr-2" size={20}/>
                View Production
            </ActionButton>
        ) : (
            <ActionButton onClick={handleGoToProduction} primary>
                <Clapperboard className="mr-2" size={20}/>
                Produce New Movie
            </ActionButton>
        )}
      </div>

       <div className="space-y-2">
        <h2 className="text-2xl font-cinematic text-amber-400">Recent Events</h2>
        <div className="bg-zinc-800 p-4 rounded-2xl max-h-48 overflow-y-auto space-y-3">
            {events.slice(0, 5).map(event => (
                 <div key={event.id} className="text-sm p-1 rounded-md transition-colors duration-200 hover:bg-zinc-700/50">
                    <span className="font-bold text-zinc-400">Week {event.week}:</span> 
                    <span className="text-zinc-200 ml-1">{event.message}</span>
                 </div>
            ))}
             {events.length === 0 && <p className="text-zinc-500 text-center py-4">No events yet.</p>}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-cinematic text-amber-400">Filmography</h2>
        <div className="bg-zinc-800 p-3 rounded-2xl min-h-[100px] space-y-2">
            {gameState.completedMovies.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No movies released yet.</p>
            ) : (
                <div className="space-y-2">
                {gameState.completedMovies.map(movie => (
                    <div key={movie.id} className="flex justify-between items-center bg-zinc-700/50 p-3 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.03] hover:bg-zinc-700">
                        <div className="flex items-center">
                            <Film className="text-amber-400 mr-4"/>
                            <div>
                                <p className="font-bold text-white">{movie.title}</p>
                                <p className="text-xs text-zinc-400">{movie.genre}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-green-400">${movie.totalBoxOffice.toLocaleString()}</p>
                             <p className="text-xs text-zinc-400">Box Office</p>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;