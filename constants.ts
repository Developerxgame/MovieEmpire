
import { MovieProductionPhase, Genre, Rating, Staff, Actor, MarketingStrategy } from './types';

export const MOVIE_PRODUCTION_WEEKS: Record<MovieProductionPhase, number> = {
  [MovieProductionPhase.SCRIPTWRITING]: 4,
  [MovieProductionPhase.CASTING]: 2,
  [MovieProductionPhase.SHOOTING]: 2,
  [MovieProductionPhase.POST_PRODUCTION]: 3,
  [MovieProductionPhase.TEASER_RELEASE]: 2,
  [MovieProductionPhase.TRAILER_RELEASE]: 1,
  [MovieProductionPhase.THEATRE_RELEASE]: 5,
  [MovieProductionPhase.OTT_RELEASE]: 2,
  [MovieProductionPhase.COMPLETED]: 0,
};

export const GENRES = Object.values(Genre);
export const RATINGS = Object.values(Rating);
export const RUNTIMES = [90, 130, 160];

export const STAFF_POOL: Staff[] = [
    { id: 'w1', name: 'Sam Esmail', role: 'Writer', tier: 'Veteran', weeklySalary: 10000 },
    { id: 'w2', name: 'Jane Goldman', role: 'Writer', tier: 'Experienced', weeklySalary: 5000 },
    { id: 'd1', name: 'Denis Villeneuve', role: 'Director', tier: 'Legendary', weeklySalary: 25000 },
    { id: 'd2', name: 'Greta Gerwig', role: 'Director', tier: 'Veteran', weeklySalary: 15000 },
    { id: 'c1', name: 'Roger Deakins', role: 'Cinematographer', tier: 'Legendary', weeklySalary: 20000 },
    { id: 'c2', name: 'Rachel Morrison', role: 'Cinematographer', tier: 'Experienced', weeklySalary: 7000 },
    { id: 'm1', name: 'Hans Zimmer', role: 'Composer', tier: 'Legendary', weeklySalary: 22000 },
    { id: 'm2', name: 'Hildur Guðnadóttir', role: 'Composer', tier: 'Veteran', weeklySalary: 12000 },
    { id: 'cm1', name: 'John Toll', role: 'Camera Man', tier: 'Veteran', weeklySalary: 8000},
    { id: 'cm2', name: 'Jane Doe', role: 'Camera Man', tier: 'Rookie', weeklySalary: 2000}
];

export const ACTOR_POOL: Actor[] = [
    { id: 'a1', name: 'Timothée Chalamet', tier: 'A-List' },
    { id: 'a2', name: 'Zendaya', tier: 'A-List' },
    { id: 'a3', name: 'Florence Pugh', tier: 'A-List' },
    { id: 'a4', name: 'Austin Butler', tier: 'B-List' },
    { id: 'a5', name: 'Anya Taylor-Joy', tier: 'B-List' },
    { id: 'a6', name: 'Paul Mescal', tier: 'Rising Star' },
    { id: 'a7', name: 'Jenna Ortega', tier: 'Rising Star' },
    { id: 'a8', name: 'John Smith', tier: 'Unknown' },
    { id: 'a9', name: 'Emily Jones', tier: 'Unknown' },
];

export const TIER_MULTIPLIERS = {
    'Unknown': 0.2,
    'Rising Star': 0.4,
    'B-List': 0.6,
    'A-List': 0.8,
    'Superstar': 1.0,
    'Rookie': 0.3,
    'Experienced': 0.6,
    'Veteran': 0.8,
    'Legendary': 1.0
};

export const MARKETING_STRATEGIES: MarketingStrategy[] = [
    { id: 'ms1', name: 'Social Media Blitz', description: 'High chance of a solid boost.', cost: 25000 },
    { id: 'ms2', name: 'TV Talk Show', description: 'Expensive, but can pay off big.', cost: 75000 },
    { id: 'ms3', name: 'Discount Tuesdays', description: 'A small, reliable earner.', cost: 10000 },
    { id: 'ms4', name: 'Controversial Stunt', description: 'High risk, high reward.', cost: 5000 },
];

export const TRAINING_CONFIG: Record<string, { cost: number, weeks: number, nextTier: Staff['tier'], salaryIncrease: number } | null> = {
    'Rookie': { cost: 15000, weeks: 4, nextTier: 'Experienced', salaryIncrease: 3000 },
    'Experienced': { cost: 50000, weeks: 6, nextTier: 'Veteran', salaryIncrease: 8000 },
    'Veteran': { cost: 150000, weeks: 8, nextTier: 'Legendary', salaryIncrease: 15000 },
    'Legendary': null
};