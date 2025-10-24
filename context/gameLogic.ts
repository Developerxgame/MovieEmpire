

import { GameState } from './GameContext';
import { MOVIE_PRODUCTION_WEEKS, TIER_MULTIPLIERS, MARKETING_STRATEGIES, TRAINING_CONFIG } from '../constants';
import { Movie, MovieProductionPhase, PlayerStats, MarketingStrategy, Staff } from '../types';

function calculateWeeklyYouTubeViews(movie: Movie, playerFame: number): number {
    const qualityFactor = movie.quality / 100; // 0 to 1
    const fameFactor = playerFame / 100; // 
    const baseViews = 50000;
    const weeklyViews = baseViews * (1 + qualityFactor * 2) * (1 + fameFactor) + Math.random() * 25000;
    return Math.floor(weeklyViews);
}

function applyMarketingStrategy(strategy: MarketingStrategy, baseBoxOffice: number): { bonus: number; message: string } {
    let bonus = 0;
    let message = '';
    const rand = Math.random();

    switch (strategy.id) {
        case 'ms1': // Social Media Blitz
            if (rand < 0.8) { // 80% success
                bonus = baseBoxOffice * (0.15 + rand * 0.1); // 15-25% bonus
                message = `The Social Media Blitz went viral! It brought in an extra $${Math.floor(bonus).toLocaleString()}.`;
            } else {
                message = "The Social Media Blitz didn't gain much traction.";
            }
            break;
        case 'ms2': // TV Talk Show
            if (rand < 0.6) { // 60% success
                bonus = baseBoxOffice * (0.3 + rand * 0.2); // 30-50% bonus
                message = `The cast charmed the audience on the talk show! A massive success, adding $${Math.floor(bonus).toLocaleString()}.`;
            } else {
                bonus = baseBoxOffice * -0.05; // 5% penalty
                message = `The TV appearance was a bit awkward, slightly hurting ticket sales by $${Math.abs(Math.floor(bonus)).toLocaleString()}.`;
            }
            break;
        case 'ms3': // Discount Tuesdays
             bonus = baseBoxOffice * (0.08 + rand * 0.04); // 8-12% guaranteed bonus
             message = `Discount Tuesdays were a hit, reliably adding $${Math.floor(bonus).toLocaleString()} to the pile.`;
            break;
        case 'ms4': // Controversial Stunt
            if (rand < 0.25) { // 25% success
                bonus = baseBoxOffice * (0.8 + rand * 0.4); // 80-120% massive bonus
                message = `The stunt was outrageous, but it worked! The box office exploded with an extra $${Math.floor(bonus).toLocaleString()}!`;
            } else {
                bonus = baseBoxOffice * -0.2; // 20% penalty
                message = `The stunt backfired badly, causing a public outcry and losing $${Math.abs(Math.floor(bonus)).toLocaleString()}.`;
            }
            break;
    }

    return { bonus: Math.floor(bonus), message };
}


export function processWeeklyUpdate(state: GameState): GameState {
  let newState = { ...state, currentWeek: state.currentWeek + 1 };
  let newEvents = [...newState.events];

  // 0. Passive fan income
  const fanIncome = Math.floor(newState.playerStats.fans * 0.5);
  if (fanIncome > 0) {
      newState.playerStats = { ...newState.playerStats, money: newState.playerStats.money + fanIncome };
      newEvents.push({
          id: `evt-${newState.currentWeek}-fans`,
          week: newState.currentWeek,
          message: `Earned $${fanIncome.toLocaleString()} from your loyal fanbase.`,
          type: 'info'
      });
  }
  
  // 1. Pay Staff Salaries
  const totalWeeklySalary = newState.hiredStaff.reduce((sum, staff) => sum + staff.weeklySalary, 0);
  newState.playerStats = { ...newState.playerStats, money: newState.playerStats.money - totalWeeklySalary };
  if (totalWeeklySalary > 0) {
      newEvents.push({
          id: `evt-${newState.currentWeek}-payroll`,
          week: newState.currentWeek,
          message: `Paid $${totalWeeklySalary.toLocaleString()} in weekly staff salaries.`,
          type: 'info'
      });
  }

  // 2. Process Staff Training
  newState.hiredStaff = newState.hiredStaff.map(staff => {
      if (staff.isTraining) {
          const newWeeksInTraining = (staff.weeksInTraining || 0) + 1;
          const trainingInfo = TRAINING_CONFIG[staff.tier];
          if (trainingInfo && newWeeksInTraining >= trainingInfo.weeks) {
              // Training complete!
              newEvents.push({
                  id: `evt-${newState.currentWeek}-training-${staff.id}`,
                  week: newState.currentWeek,
                  message: `${staff.name} has completed training and is now a ${trainingInfo.nextTier} ${staff.role}!`,
                  type: 'success'
              });
              return {
                  ...staff,
                  tier: trainingInfo.nextTier,
                  weeklySalary: staff.weeklySalary + trainingInfo.salaryIncrease,
                  isTraining: false,
                  weeksInTraining: 0,
              };
          }
          return { ...staff, weeksInTraining: newWeeksInTraining };
      }
      return staff;
  });


  // 3. Process movie in production
  if (newState.currentMovieInProduction) {
    let movie = { ...newState.currentMovieInProduction };
    movie.weeksInPhase += 1;
    movie.totalWeeks += 1;

    const currentPhaseDuration = MOVIE_PRODUCTION_WEEKS[movie.productionPhase];

    // Weekly logic for specific phases
    if (movie.productionPhase === MovieProductionPhase.TEASER_RELEASE) {
        const weeklyViews = calculateWeeklyYouTubeViews(movie, newState.playerStats.fame);
        const weeklyLikes = Math.floor(weeklyViews * (0.03 + Math.random() * 0.02));
        movie.teaserStats.views += weeklyViews;
        movie.teaserStats.likes += weeklyLikes;
        movie.hype += Math.floor(weeklyViews / 150000); // Build hype, not fame
        movie.hype = Math.min(movie.hype, 100);
    }

    if (movie.productionPhase === MovieProductionPhase.TRAILER_RELEASE) {
        const weeklyViews = calculateWeeklyYouTubeViews(movie, newState.playerStats.fame) * 1.5;
        const weeklyLikes = Math.floor(weeklyViews * (0.04 + Math.random() * 0.02));
        movie.trailerStats.views += weeklyViews;
        movie.trailerStats.likes += weeklyLikes;
        movie.hype += Math.floor(weeklyViews / 100000); // Build hype, not fame
        movie.hype = Math.min(movie.hype, 100);
    }
    
    if(movie.productionPhase === MovieProductionPhase.THEATRE_RELEASE) {
        let weeklyBoxOffice = calculateWeeklyBoxOffice(movie, movie.weeksInPhase, newState.playerStats);
        let marketingBonus = 0;

        if (movie.weeklyMarketingChoiceId) {
            const strategy = MARKETING_STRATEGIES.find(s => s.id === movie.weeklyMarketingChoiceId);
            if (strategy && newState.playerStats.money >= strategy.cost) {
                newState.playerStats.money -= strategy.cost;
                const result = applyMarketingStrategy(strategy, weeklyBoxOffice);
                marketingBonus = result.bonus;

                movie.marketingHistory.push({
                    week: movie.weeksInPhase,
                    strategyId: strategy.id,
                    message: result.message,
                    bonus: marketingBonus
                });

                 newEvents.push({
                    id: `evt-${newState.currentWeek}-marketing-result`,
                    week: newState.currentWeek,
                    message: result.message,
                    type: marketingBonus >= 0 ? 'success' : 'warning'
                });
            }
            movie.weeklyMarketingChoiceId = null; // Reset for next week
        }

        const totalWeeklyEarning = Math.max(0, weeklyBoxOffice + marketingBonus);
        
        movie.boxOfficeRevenue.push(totalWeeklyEarning);
        movie.totalBoxOffice += totalWeeklyEarning;
        
        const newMoney = newState.playerStats.money + totalWeeklyEarning;
        newState.playerStats = { ...newState.playerStats, money: newMoney };
        
        const fameGain = Math.floor(totalWeeklyEarning / 50000);
        newState.playerStats.fame += fameGain;

        newEvents.push({
            id: `evt-${newState.currentWeek}-bo`,
            week: newState.currentWeek,
            message: `Week ${movie.weeksInPhase} Box Office for '${movie.title}': $${totalWeeklyEarning.toLocaleString()}.`,
            type: 'success'
        });
    }

    // Advance to next phase if current one is complete
    if (movie.weeksInPhase >= currentPhaseDuration) {
      const manualTransitionPhases = [
          MovieProductionPhase.POST_PRODUCTION,
          MovieProductionPhase.TEASER_RELEASE,
          MovieProductionPhase.TRAILER_RELEASE
      ];
      
      if (manualTransitionPhases.includes(movie.productionPhase)) {
        // Halt automatic progression, requires manual trigger from UI
      } else {
        movie.weeksInPhase = 0;
        const phaseOrder = Object.values(MovieProductionPhase);
        const currentPhaseIndex = phaseOrder.indexOf(movie.productionPhase);
        
        if (currentPhaseIndex < phaseOrder.length - 1) {
          const nextPhase = phaseOrder[currentPhaseIndex + 1];
          movie.productionPhase = nextPhase;

          newEvents.push({
              id: `evt-${newState.currentWeek}-phase`,
              week: newState.currentWeek,
              message: `'${movie.title}' has entered the ${nextPhase} phase.`,
              type: 'info'
          });

          // Special actions on phase transition
          if (nextPhase === MovieProductionPhase.TEASER_RELEASE) {
              movie = finalizeMovieQuality(movie);
              newEvents.push({
                  id: `evt-${newState.currentWeek}-marketing`,
                  week: newState.currentWeek,
                  message: `Marketing for '${movie.title}' has begun! Final quality: ${movie.quality}/100. Initial hype: ${movie.hype}/100.`,
                  type: 'info'
              });
          }
          
          if (nextPhase === MovieProductionPhase.THEATRE_RELEASE) {
              const totalViews = movie.teaserStats.views + movie.trailerStats.views;
              const hypeFameGain = Math.floor(totalViews / 100000);
              newState.playerStats.fame += hypeFameGain;

               newEvents.push({
                  id: `evt-${newState.currentWeek}-release`,
                  week: newState.currentWeek,
                  message: `'${movie.title}' has been released! Critics rating: ${movie.criticRating}/100. Hype from marketing brought in ${hypeFameGain} fame!`,
                  type: 'success'
              });
          }

          if (nextPhase === MovieProductionPhase.OTT_RELEASE) { // Theatre run has finished
            const fanGain = Math.floor(movie.totalBoxOffice / 200000) + (movie.criticRating * 50);
            if (fanGain > 0) {
                newState.playerStats.fans += fanGain;
                newEvents.push({
                    id: `evt-${newState.currentWeek}-fangain`,
                    week: newState.currentWeek,
                    message: `'${movie.title}' was a success, gaining you ${fanGain.toLocaleString()} new fans!`,
                    type: 'success'
                });
            }
          }
        }
      }
    }
    
    newState.currentMovieInProduction = movie;
  }

  newState.events = newEvents.sort((a, b) => b.week - a.week);
  return newState;
}

function finalizeMovieQuality(movie: Movie): Movie {
    let qualityScore = 0;
    
    // Staff contribution (max 50 points)
    const staff = [movie.writer, movie.director, movie.cinematographer, movie.composer, movie.cameraMan];
    const staffScore = staff.reduce((acc, s) => {
        if (!s) return acc;
        return acc + TIER_MULTIPLIERS[s.tier] * 10; // each staff can contribute up to 10 points
    }, 0);
    qualityScore += staffScore;

    // Cast contribution (max 50 points)
    const castScore = movie.cast.reduce((acc, c) => {
        if (!c.actor) return acc;
        // Lead roles have more impact, assuming first 2 are leads
        const isLead = movie.cast.indexOf(c) < 2;
        const weight = isLead ? 6 : 3; // Max 50 points from 2 leads and 8 supporting
        return acc + TIER_MULTIPLIERS[c.actor.tier] * weight;
    }, 0);
    qualityScore += Math.min(castScore, 50);

    movie.quality = Math.min(Math.round(qualityScore), 100);

    // Calculate initial hype based on staff and cast quality
    const hypeScore = (staffScore + castScore) / 2; // Average of staff and cast scores
    movie.hype = Math.min(Math.round(hypeScore), 100);
    
    movie.criticRating = movie.quality + Math.floor(Math.random() * 10) - 5; // Add some randomness
    movie.criticRating = Math.max(0, Math.min(100, movie.criticRating));
    return movie;
}

function calculateWeeklyBoxOffice(movie: Movie, week: number, stats: PlayerStats): number {
    const hypeFactor = movie.hype / 100; // 0 to 1
    const basePotential = movie.quality * 5000 + movie.marketingBudget + (stats.fame * 100);
    const dropOff = 1 / (week * 0.8); // Revenue decreases each week
    const weeklyEarning = basePotential * dropOff * (1 + movie.criticRating / 100) * (1 + hypeFactor * 1.2);
    return Math.floor(weeklyEarning > 0 ? weeklyEarning + Math.random() * 10000 : 0);
}