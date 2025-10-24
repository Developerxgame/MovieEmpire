
import React, { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { Film, User, Award, Clapperboard, Briefcase, PlusCircle, ChevronsUp, GraduationCap } from 'lucide-react';
import MovieProductionScreen from './MovieProductionScreen';
import Modal from '../components/Modal';
import { STAFF_POOL, TRAINING_CONFIG } from '../constants';
import { Staff } from '../types';
import ProgressBar from '../components/ProgressBar';

const StudioScreen: React.FC = () => {
  const { gameState, dispatch } = useContext(GameContext);
  const { studioName, ownerName, completedMovies, currentMovieInProduction, hiredStaff, playerStats } = gameState;
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);

  const handleHireStaff = (staff: Staff) => {
      dispatch({ type: 'HIRE_STAFF', payload: staff });
  }

  const handleTrainStaff = (staff: Staff) => {
      const trainingInfo = TRAINING_CONFIG[staff.tier];
      if (!trainingInfo || playerStats.money < trainingInfo.cost) return;
      
      if(window.confirm(`Train ${staff.name} to become a ${trainingInfo.nextTier} ${staff.role}?\n\nCost: $${trainingInfo.cost.toLocaleString()}\nDuration: ${trainingInfo.weeks} weeks`)) {
          dispatch({ type: 'START_STAFF_TRAINING', payload: { staffId: staff.id, cost: trainingInfo.cost } });
      }
  }

  if (currentMovieInProduction || showCreationForm) {
      return <MovieProductionScreen />;
  }
  
  const isStaffInProduction = (staffId: string) => {
    if (!currentMovieInProduction) return false;
    return [
      currentMovieInProduction.writer?.id,
      currentMovieInProduction.director?.id,
      currentMovieInProduction.cinematographer?.id,
      currentMovieInProduction.composer?.id,
      currentMovieInProduction.cameraMan?.id
    ].includes(staffId);
  }

  return (
    <div className="p-4 space-y-6">
      <header className="text-center">
        <h1 className="text-4xl font-cinematic text-amber-400 tracking-wider">{studioName}</h1>
        <p className="text-zinc-400 flex items-center justify-center gap-2 mt-1">
          <User size={16} />
          Owned by: {ownerName}
        </p>
      </header>
      
      <div className="px-4 py-6">
        <button
            onClick={() => setShowCreationForm(true)}
            className="w-full flex items-center justify-center text-xl font-semibold bg-amber-500 hover:bg-amber-400 text-black py-4 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100 shadow-lg shadow-amber-500/20"
        >
            <Clapperboard className="mr-2" />
            Produce New Movie
        </button>
      </div>


      <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center border-b-2 border-amber-500/20 pb-2 mb-3">
            <h2 className="text-2xl font-cinematic text-amber-400">Staff Roster</h2>
            <button onClick={() => setIsRecruitModalOpen(true)} className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-100">
                <PlusCircle size={16}/>
                Recruit
            </button>
        </div>

        {hiredStaff.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">No staff hired yet. Recruit some talent to start making movies!</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {hiredStaff.map(staff => {
              const trainingInfo = TRAINING_CONFIG[staff.tier];
              const isMaxTier = trainingInfo === null;
              const canAffordTraining = !isMaxTier && playerStats.money >= trainingInfo.cost;
              const isInProduction = isStaffInProduction(staff.id);

              return (
                <div key={staff.id} className="bg-zinc-700 p-3 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.03] hover:bg-zinc-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white">{staff.name}</h3>
                      <p className="text-sm text-zinc-400">{staff.role} • <span className="font-semibold text-amber-300">{staff.tier}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-red-400 font-semibold">${staff.weeklySalary.toLocaleString()}/week</p>
                    </div>
                  </div>
                  {staff.isTraining && trainingInfo ? (
                      <div className="mt-3">
                        <ProgressBar progress={((staff.weeksInTraining || 0) / trainingInfo.weeks) * 100} label={`Training... (${staff.weeksInTraining}/${trainingInfo.weeks} wks)`} />
                      </div>
                  ) : isInProduction ? (
                      <div className="mt-2 text-center text-xs font-semibold bg-zinc-600 text-zinc-300 rounded-full py-1">
                          On Production
                      </div>
                  ) : (
                    <button 
                        onClick={() => handleTrainStaff(staff)}
                        disabled={isMaxTier || !canAffordTraining}
                        className="w-full mt-2 text-sm font-semibold bg-blue-600 text-white py-1.5 rounded-full flex items-center justify-center gap-2 transition-all duration-200 ease-in-out transform hover:bg-blue-500 hover:scale-105 active:scale-100 disabled:bg-zinc-600 disabled:cursor-not-allowed"
                    >
                        {isMaxTier 
                            ? <><Award size={16}/> Max Tier</>
                            : <><ChevronsUp size={16}/> Train ($ {trainingInfo.cost.toLocaleString()})</>
                        }
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>


      <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-cinematic text-amber-400 border-b-2 border-amber-500/20 pb-2 mb-3">Filmography</h2>
        {completedMovies.length === 0 ? (
          <p className="text-zinc-500 text-center py-4">No movies produced yet. Time to make some blockbusters!</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {completedMovies.map(movie => (
              <div key={movie.id} className="bg-zinc-700 p-3 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.03] hover:bg-zinc-600">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{movie.title}</h3>
                    <p className="text-sm text-zinc-400">{movie.genre} • {movie.runtime}min</p>

                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                     <Award size={16} />
                     <span className="font-bold">{movie.criticRating}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-zinc-300">
                  <p><strong>Box Office:</strong> <span className="text-green-400 font-semibold">${movie.totalBoxOffice.toLocaleString()}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isRecruitModalOpen} onClose={() => setIsRecruitModalOpen(false)} title="Recruit Staff">
         <div className="space-y-3">
            {STAFF_POOL.filter(s => !hiredStaff.some(h => h.id === s.id)).map(staff => (
                <div key={staff.id} className="bg-zinc-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-bold text-white">{staff.name}</p>
                        <p className="text-sm text-zinc-300">{staff.role} - <span className="text-amber-400">{staff.tier}</span></p>
                        <p className="text-xs text-red-400 mt-1">${staff.weeklySalary.toLocaleString()} per week</p>
                    </div>
                    <button onClick={() => handleHireStaff(staff)} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-green-500 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-100">
                        Hire
                    </button>
                </div>
            ))}
            {STAFF_POOL.filter(s => !hiredStaff.some(h => h.id === s.id)).length === 0 && (
                <p className="text-zinc-400 text-center py-5">No available staff for recruitment.</p>
            )}
         </div>
      </Modal>

    </div>
  );
};

export default StudioScreen;