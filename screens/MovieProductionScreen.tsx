


import React, { useContext, useState, useEffect } from 'react';
import { GameContext } from '../context/GameContext';
import { Movie, MovieProductionPhase, Genre, Rating, Staff, Actor } from '../types';
import { GENRES, RATINGS, RUNTIMES, ACTOR_POOL, MOVIE_PRODUCTION_WEEKS, MARKETING_STRATEGIES } from '../constants';
import { generateMovieSynopsis } from '../services/geminiService';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { Clapperboard, Youtube, ThumbsUp, Eye, Calendar, Film, CheckCircle } from 'lucide-react';

const YouTubeCard: React.FC<{type: 'Teaser' | 'Trailer'; title: string; views: number; likes: number; isActive: boolean;}> = ({ type, title, views, likes, isActive }) => {
  const containerClasses = isActive 
    ? 'bg-zinc-800 border-white/10' 
    : 'bg-zinc-800/50 border-transparent';
  const textClasses = isActive ? 'text-white' : 'text-zinc-500';

  return (
    <div className={`p-4 rounded-2xl border ${containerClasses} transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-3">
        <Youtube className={isActive ? 'text-red-500' : 'text-zinc-600'} size={40} />
        <div>
          <p className={`font-bold text-lg ${textClasses}`}>{title} - Official {type}</p>
          <p className={`text-sm ${isActive ? 'text-zinc-400' : 'text-zinc-600'}`}>{isActive ? 'Now Live!' : 'Coming Soon'}</p>
        </div>
      </div>
      <div className="flex justify-around items-center text-center mt-2">
        <div className={textClasses}>
          <Eye className="mx-auto mb-1" />
          <p className="font-bold text-xl">{views.toLocaleString()}</p>
          <p className="text-xs uppercase tracking-wider text-zinc-400">Views</p>
        </div>
        <div className={textClasses}>
          <ThumbsUp className="mx-auto mb-1" />
          <p className="font-bold text-xl">{likes.toLocaleString()}</p>
          <p className="text-xs uppercase tracking-wider text-zinc-400">Likes</p>
        </div>
      </div>
    </div>
  );
};

const ReleaseButton = ({ onClick, children }: {onClick: () => void, children: React.ReactNode}) => (
    <button
        onClick={onClick}
        className="w-full mt-4 flex items-center justify-center text-xl font-semibold bg-amber-500 hover:bg-amber-400 text-black py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100 shadow-lg"
    >
        <Film className="mr-2" size={20}/>
        {children}
    </button>
);


const MovieProductionScreen: React.FC = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const { currentMovieInProduction: movie, ownerName, playerStats, hiredStaff } = gameState;

    // --- SCRIPT WRITING ---
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState<Genre>(GENRES[0]);
    const [rating, setRating] = useState<Rating>(RATINGS[0]);
    const [runtime, setRuntime] = useState<number>(RUNTIMES[0]);
    const [isGeneratingSynopsis, setIsGeneratingSynopsis] = useState(false);
    
    // --- THEATRE RELEASE ---
    const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);

    const handleAdvanceWeek = () => {
        dispatch({ type: 'ADVANCE_WEEK' });
    };

    const handleStartProduction = async () => {
        if (!title) return;
        setIsGeneratingSynopsis(true);
        const synopsis = await generateMovieSynopsis(title, genre);
        setIsGeneratingSynopsis(false);
        
        const newMovie: Movie = {
            id: `movie-${Date.now()}`,
            title,
            genre,
            rating,
            runtime,
            synopsis,
            productionPhase: MovieProductionPhase.SCRIPTWRITING,
            weeksInPhase: 0,
            totalWeeks: 0,
            cast: Array(5).fill(null).map((_, i) => ({ roleName: i < 2 ? `Lead Role ${i+1}` : `Supporting Role ${i-1}`, actor: null })),
            quality: 0,
            hype: 0,
            marketingBudget: 50000,
            teaserStats: { views: 0, likes: 0 },
            trailerStats: { views: 0, likes: 0 },
            boxOfficeRevenue: [],
            totalBoxOffice: 0,
            criticRating: 0,
            weeklyMarketingChoiceId: null,
            marketingHistory: [],
        };
        dispatch({type: 'UPDATE_PLAYER_STATS', payload: {money: playerStats.money - 50000}})
        dispatch({ type: 'START_MOVIE_PRODUCTION', payload: newMovie });
    };
    
    const FormInput: React.FC<{children: React.ReactNode}> = ({children}) => <div className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700">{children}</div>;
    
    const renderScriptWriting = () => (
        <div className="p-4 space-y-4">
            <h2 className="text-3xl font-cinematic text-amber-400">New Production</h2>
             <p className="text-zinc-400 pb-2">Initial Cost: $50,000</p>
            <FormInput>
              <input type="text" placeholder="Movie Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-transparent outline-none"/>
            </FormInput>
             <FormInput>
              <select value={genre} onChange={e => setGenre(e.target.value as Genre)} className="w-full bg-transparent outline-none appearance-none">
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </FormInput>
            <FormInput>
              <select value={rating} onChange={e => setRating(e.target.value as Rating)} className="w-full bg-transparent outline-none appearance-none">
                  {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormInput>
            <FormInput>
              <select value={runtime} onChange={e => setRuntime(Number(e.target.value))} className="w-full bg-transparent outline-none appearance-none">
                  {RUNTIMES.map(t => <option key={t} value={t}>{t} mins</option>)}
              </select>
            </FormInput>

            <button onClick={handleStartProduction} disabled={!title || isGeneratingSynopsis || playerStats.money < 50000} className="w-full font-semibold bg-amber-500 text-black py-3 rounded-full disabled:bg-zinc-700 disabled:text-zinc-500 flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100">
                {isGeneratingSynopsis ? <Spinner /> : 'Start Scriptwriting'}
            </button>
        </div>
    );
    
    // --- CASTING ---
    const handleAssignStaff = (staff: Staff) => {
        if (!movie) return;
        const updatedMovie = {...movie};
        if(staff.role === 'Writer') updatedMovie.writer = staff;
        if(staff.role === 'Director') updatedMovie.director = staff;
        if(staff.role === 'Cinematographer') updatedMovie.cinematographer = staff;
        if(staff.role === 'Composer') updatedMovie.composer = staff;
        if(staff.role === 'Camera Man') updatedMovie.cameraMan = staff;
        dispatch({ type: 'UPDATE_MOVIE_IN_PRODUCTION', payload: updatedMovie });
    };

    const handleAssignActor = (actor: Actor, roleIndex: number) => {
        if (!movie) return;
        const updatedMovie = {...movie};
        updatedMovie.cast[roleIndex].actor = actor;
        dispatch({ type: 'UPDATE_MOVIE_IN_PRODUCTION', payload: updatedMovie });
    };
    
    const renderCasting = () => {
        if (!movie) return null;
        const roles: {name: Staff['role'], current: Staff | undefined}[] = [
            {name: 'Writer', current: movie.writer},
            {name: 'Director', current: movie.director},
            {name: 'Cinematographer', current: movie.cinematographer},
            {name: 'Composer', current: movie.composer},
            {name: 'Camera Man', current: movie.cameraMan}
        ];

        const assignedStaffIds = [movie.writer, movie.director, movie.cinematographer, movie.composer, movie.cameraMan].filter(Boolean).map(s => s?.id);

        return (
            <div className="p-4 space-y-6">
                <h2 className="text-3xl font-cinematic text-amber-400">Casting & Crew</h2>
                <div>
                    <h3 className="font-cinematic text-2xl text-amber-300">Crew</h3>
                    <div className="space-y-2 mt-2">
                        {roles.map(role => {
                             const availableStaff = hiredStaff.filter(s => s.role === role.name && !s.isTraining && !assignedStaffIds.includes(s.id));
                            return (
                                <div key={role.name} className="bg-zinc-800 p-3 rounded-lg">
                                    <p className="font-bold text-white">{role.name}: {role.current ? <span className="text-amber-400">{role.current.name} ({role.current.tier})</span> : '...'}</p>
                                    {!role.current && (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                        {availableStaff.length > 0 ? availableStaff.map(s => (
                                            <button key={s.id} onClick={() => handleAssignStaff(s)} className="text-xs font-semibold bg-blue-600 px-3 py-1 rounded-full hover:bg-blue-500 transition-all transform hover:scale-105">
                                                Assign {s.name}
                                            </button>
                                        )) : <p className="text-xs text-zinc-500">No available staff for this role.</p>}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                         <div className="bg-zinc-800 p-3 rounded-lg">
                            <p className="font-bold text-white">Producer: <span className="text-amber-400">{ownerName}</span></p>
                         </div>
                    </div>
                </div>
                 <div>
                    <h3 className="font-cinematic text-2xl text-amber-300">Cast</h3>
                     <div className="space-y-2 mt-2">
                     {movie.cast.map((role, index) => (
                         <div key={index} className="bg-zinc-800 p-3 rounded-lg">
                              <p className="font-bold">{role.roleName}: {role.actor ? <span className="text-amber-400">{role.actor.name}</span> : '...'}</p>
                               {!role.actor && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {ACTOR_POOL.filter(a => !movie.cast.find(c => c.actor?.id === a.id)).slice(0, 4).map(actor => (
                                         <button key={actor.id} onClick={() => handleAssignActor(actor, index)} className="text-xs font-semibold bg-green-600 px-3 py-1 rounded-full hover:bg-green-500 transition-all transform hover:scale-105">
                                            Assign {actor.name}
                                        </button>
                                    ))}
                                </div>
                               )}
                         </div>
                     ))}
                     </div>
                </div>
            </div>
        )
    };
    
    const renderMarketingPhase = () => {
        if (!movie) return null;
        const totalWeeks = MOVIE_PRODUCTION_WEEKS[MovieProductionPhase.TEASER_RELEASE] + MOVIE_PRODUCTION_WEEKS[MovieProductionPhase.TRAILER_RELEASE];
        const currentWeekInMarketing = movie.productionPhase === MovieProductionPhase.TEASER_RELEASE 
            ? movie.weeksInPhase 
            : MOVIE_PRODUCTION_WEEKS[MovieProductionPhase.TEASER_RELEASE] + movie.weeksInPhase;
        const progress = (currentWeekInMarketing / totalWeeks) * 100;

        const isTeaserPhaseDone = movie.productionPhase === MovieProductionPhase.TEASER_RELEASE && movie.weeksInPhase >= MOVIE_PRODUCTION_WEEKS[MovieProductionPhase.TEASER_RELEASE];
        const isTrailerPhaseDone = movie.productionPhase === MovieProductionPhase.TRAILER_RELEASE && movie.weeksInPhase >= MOVIE_PRODUCTION_WEEKS[MovieProductionPhase.TRAILER_RELEASE];

        return (
            <div className="p-4 space-y-4">
                <h2 className="text-3xl font-cinematic text-amber-400">Marketing Campaign</h2>
                <p className="text-zinc-400">"{movie.title}" | Quality: <span className="font-bold text-amber-400">{movie.quality}/100</span> | Hype: <span className="font-bold text-purple-400">{movie.hype}/100</span></p>
                <div className="w-full bg-zinc-800 p-4 rounded-2xl">
                    <ProgressBar progress={progress} label={`Week ${currentWeekInMarketing} of ${totalWeeks}`} />
                </div>
                <div className="space-y-4">
                    <YouTubeCard 
                        type="Teaser"
                        title={movie.title}
                        views={movie.teaserStats.views}
                        likes={movie.teaserStats.likes}
                        isActive={movie.productionPhase === MovieProductionPhase.TEASER_RELEASE || movie.productionPhase === MovieProductionPhase.TRAILER_RELEASE}
                    />
                    <YouTubeCard 
                        type="Trailer"
                        title={movie.title}
                        views={movie.trailerStats.views}
                        likes={movie.trailerStats.likes}
                        isActive={movie.productionPhase === MovieProductionPhase.TRAILER_RELEASE}
                    />
                </div>
                {/* FIX: The ReleaseButton component requires a 'children' prop. */}
                {isTeaserPhaseDone && <ReleaseButton onClick={() => dispatch({type: 'RELEASE_TRAILER'})}>Release Trailer</ReleaseButton>}
                {/* FIX: The ReleaseButton component requires a 'children' prop. */}
                {isTrailerPhaseDone && <ReleaseButton onClick={() => dispatch({type: 'RELEASE_TO_THEATRES'})}>Release to Theatres</ReleaseButton>}
            </div>
        );
    };
    
    const handleConfirmMarketing = () => {
        if (!movie || !selectedStrategyId) return;
        const strategy = MARKETING_STRATEGIES.find(s => s.id === selectedStrategyId);
        if(!strategy || playerStats.money < strategy.cost) return;
        
        const updatedMovie = { ...movie, weeklyMarketingChoiceId: selectedStrategyId };
        dispatch({ type: 'UPDATE_MOVIE_IN_PRODUCTION', payload: updatedMovie });
        setSelectedStrategyId(null);
    };

    // --- GENERIC PROGRESS VIEW ---
    const renderProgressView = (phase: MovieProductionPhase) => {
        if (!movie) return null;
        const totalWeeksForPhase = MOVIE_PRODUCTION_WEEKS[phase];
        const progress = (movie.weeksInPhase / totalWeeksForPhase) * 100;
        const isPhaseComplete = movie.weeksInPhase >= totalWeeksForPhase;
        
        return (
             <div className="p-4 space-y-4 text-center">
                 <h2 className="text-3xl font-cinematic text-amber-400">{phase}</h2>
                 <p className="text-zinc-400">"{movie.title}"</p>
                 <div className="w-full bg-zinc-800 p-4 rounded-2xl">
                    <ProgressBar progress={progress} label={isPhaseComplete ? 'Completed' : `Week ${movie.weeksInPhase} of ${totalWeeksForPhase}`} />
                 </div>

                 {isPhaseComplete && phase === MovieProductionPhase.POST_PRODUCTION && (
                     // FIX: The ReleaseButton component requires a 'children' prop.
                     <ReleaseButton onClick={() => dispatch({ type: 'RELEASE_TEASER' })}>
                        Start Marketing
                     </ReleaseButton>
                 )}

                  {phase === MovieProductionPhase.THEATRE_RELEASE && (
                    <div className="space-y-4">
                    <div className="bg-zinc-800 p-4 rounded-2xl text-left space-y-4">
                        <div>
                          <p className="text-sm uppercase text-zinc-400">Critic Rating</p>
                          <p className="font-bold text-2xl text-amber-400">{movie.criticRating}/100</p>
                        </div>
                        <div>
                          <p className="text-sm uppercase text-zinc-400">Total Box Office</p>
                          <p className="font-bold text-2xl text-green-400">${movie.totalBoxOffice.toLocaleString()}</p>
                        </div>
                        <div>
                        <h4 className="font-cinematic text-lg text-white">Weekly Revenue</h4>
                         <div className="flex items-end h-24 bg-zinc-700 p-2 rounded-lg mt-1 space-x-1">
                            {movie.boxOfficeRevenue.map((rev, i) => {
                                const maxRev = Math.max(...movie.boxOfficeRevenue, 1);
                                const height = (rev / maxRev) * 100;
                                return <div key={i} className="bg-green-500 w-full rounded-t-sm" style={{height: `${height}%`}}></div>
                            })}
                         </div>
                        </div>
                    </div>
                     <div className="bg-zinc-800 p-4 rounded-2xl text-left">
                        <h3 className="font-cinematic text-xl text-amber-300 mb-2">Week {movie.weeksInPhase} Marketing</h3>
                        {movie.weeklyMarketingChoiceId === null && movie.weeksInPhase < 5 ? (
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    {MARKETING_STRATEGIES.map(s => {
                                        const isSelected = selectedStrategyId === s.id;
                                        const canAfford = playerStats.money >= s.cost;
                                        return (
                                            <button 
                                                key={s.id} 
                                                onClick={() => canAfford && setSelectedStrategyId(s.id)}
                                                disabled={!canAfford}
                                                className={`p-3 rounded-lg border-2 w-full text-left transition-all duration-200 flex items-center transform hover:scale-[1.02] ${
                                                    isSelected ? 'bg-amber-500/10 border-amber-400' : 'bg-zinc-700 border-zinc-600'
                                                } ${canAfford ? 'hover:border-amber-400' : 'opacity-50 cursor-not-allowed'}`}
                                            >
                                                <div className="flex-grow">
                                                  <p className="font-bold text-white">{s.name}</p>
                                                  <p className="text-xs text-zinc-300">{s.description}</p>
                                                  <p className={`text-xs font-bold mt-1 ${canAfford ? 'text-red-400' : 'text-red-500'}`}>Cost: ${s.cost.toLocaleString()}</p>
                                                </div>
                                                {isSelected && <CheckCircle className="text-amber-400 ml-3" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button 
                                    onClick={handleConfirmMarketing} 
                                    disabled={!selectedStrategyId}
                                    className="w-full font-semibold bg-green-600 text-white py-2 rounded-full disabled:bg-zinc-600 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-100"
                                >
                                    Confirm Strategy
                                </button>
                            </div>
                        ) : movie.weeksInPhase < 5 ? (
                            <p className="text-center text-green-400 p-4 bg-zinc-700 rounded-lg">Marketing strategy is locked in for this week. Advance the week to see the results!</p>
                        ) : (
                            <p className="text-center text-zinc-400 p-4 bg-zinc-700 rounded-lg">The theatre run has concluded!</p>
                        )}

                        {movie.marketingHistory.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-cinematic text-lg">Marketing History</h4>
                                <div className="space-y-1 text-sm max-h-24 overflow-y-auto pr-2 mt-2">
                                    {movie.marketingHistory.slice().reverse().map(h => {
                                        const strategyName = MARKETING_STRATEGIES.find(s => s.id === h.strategyId)?.name;
                                        return (
                                            <div key={h.week} className="bg-zinc-900/50 p-2 rounded-md">
                                                <p><span className="font-bold text-zinc-300">Week {h.week} ({strategyName}):</span> <span className={h.bonus >= 0 ? 'text-green-400' : 'text-red-400'}>{h.bonus >= 0 ? '+' : ''}${h.bonus.toLocaleString()}</span></p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                 )}

                 {phase === MovieProductionPhase.OTT_RELEASE && (
                     <div className="bg-zinc-800 p-4 rounded-2xl space-y-3 text-center">
                        <p className="text-lg font-bold">Your movie was a hit!</p>
                        <p className="text-zinc-300">StreamFlix has offered to buy the streaming rights.</p>
                        <button onClick={() => {
                            const ottMoney = movie.totalBoxOffice * 0.5;
                            dispatch({type: 'UPDATE_PLAYER_STATS', payload: { money: playerStats.money + ottMoney }});
                            dispatch({type: 'COMPLETE_MOVIE_PRODUCTION' });
                        }} className="font-semibold bg-green-600 text-white px-6 py-2 rounded-full mt-2 transition-all transform hover:scale-105 active:scale-100">Accept Offer (+${(movie.totalBoxOffice * 0.5).toLocaleString()})</button>
                     </div>
                 )}
            </div>
        )
    };

    const renderCurrentPhase = () => {
        if (!movie) return renderScriptWriting();
        switch (movie.productionPhase) {
            case MovieProductionPhase.SCRIPTWRITING:
                return renderProgressView(MovieProductionPhase.SCRIPTWRITING);
            case MovieProductionPhase.CASTING:
                return renderCasting();
            case MovieProductionPhase.SHOOTING:
                return renderProgressView(MovieProductionPhase.SHOOTING);
            case MovieProductionPhase.POST_PRODUCTION:
                return renderProgressView(MovieProductionPhase.POST_PRODUCTION);
            case MovieProductionPhase.TEASER_RELEASE:
            case MovieProductionPhase.TRAILER_RELEASE:
                return renderMarketingPhase();
            case MovieProductionPhase.THEATRE_RELEASE:
                return renderProgressView(MovieProductionPhase.THEATRE_RELEASE);
            case MovieProductionPhase.OTT_RELEASE:
                return renderProgressView(MovieProductionPhase.OTT_RELEASE);
            default:
                return <p>Unknown phase</p>;
        }
    }
    
    // --- MAIN RENDER ---
    return (
        <div className="p-4">
            {movie && (
                <div className="mb-4 bg-zinc-800 p-4 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-cinematic text-white tracking-wider truncate pr-4">🎬 {movie.title}</h1>
                         <div className="text-right flex-shrink-0">
                             <p className="text-lg font-semibold text-amber-400">{movie.productionPhase}</p>
                             <p className="text-xs text-zinc-400">Total Weeks: {movie.totalWeeks}</p>
                         </div>
                    </div>
                </div>
            )}
            {movie && (
                <button
                    onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(30);
                        handleAdvanceWeek();
                    }}
                    className="w-full mb-4 flex items-center justify-center text-lg font-semibold bg-zinc-700 hover:bg-zinc-600 text-white py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-100 shadow-lg"
                >
                    <Calendar className="mr-2" size={20}/>
                    Advance Week
                </button>
            )}
            <div className="bg-black/20 rounded-2xl">
                {renderCurrentPhase()}
            </div>
        </div>
    );
};

export default MovieProductionScreen;