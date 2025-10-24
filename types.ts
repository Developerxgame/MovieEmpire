

export enum Genre {
  ACTION = 'Action',
  COMEDY = 'Comedy',
  DRAMA = 'Drama',
  HORROR = 'Horror',
  SCIFI = 'Sci-Fi',
  ROMANCE = 'Romance',
}

export enum Rating {
  PG = 'PG',
  PG13 = 'PG-13',
  R = 'R',
}

export enum MovieProductionPhase {
  SCRIPTWRITING = 'Script Writing',
  CASTING = 'Cast & Crew Selection',
  SHOOTING = 'Shooting',
  POST_PRODUCTION = 'Post-Production',
  TEASER_RELEASE = 'Teaser Release',
  TRAILER_RELEASE = 'Trailer Release',
  THEATRE_RELEASE = 'Theatre Release',
  OTT_RELEASE = 'OTT Release',
  COMPLETED = 'Completed',
}

export interface Staff {
  id: string;
  name: string;
  role: 'Writer' | 'Director' | 'Cinematographer' | 'Composer' | 'Camera Man';
  tier: 'Rookie' | 'Experienced' | 'Veteran' | 'Legendary';
  weeklySalary: number;
  isTraining?: boolean;
  weeksInTraining?: number;
}

export interface Actor {
  id: string;
  name: string;
  tier: 'Unknown' | 'Rising Star' | 'B-List' | 'A-List' | 'Superstar';
}

export interface MarketingStrategy {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface MarketingResult {
    week: number;
    strategyId: string;
    message: string;
    bonus: number;
}

export interface Movie {
  id:string;
  title: string;
  genre: Genre;
  rating: Rating;
  runtime: number;
  synopsis: string;
  
  productionPhase: MovieProductionPhase;
  weeksInPhase: number;
  totalWeeks: number;

  writer?: Staff;
  director?: Staff;
  cinematographer?: Staff;
  composer?: Staff;
  cameraMan?: Staff;
  cast: { roleName: string, actor: Actor | null }[];

  quality: number; // 0-100, calculated based on staff/cast
  hype: number; // 0-100, built during marketing
  marketingBudget: number;

  teaserStats: { views: number; likes: number; };
  trailerStats: { views: number; likes: number; };
  
  boxOfficeRevenue: number[];
  totalBoxOffice: number;
  criticRating: number; // 0-100

  // New fields for marketing minigame
  weeklyMarketingChoiceId: string | null;
  marketingHistory: MarketingResult[];
}

export interface PlayerStats {
  money: number;
  fame: number;
  reputation: number;
  studioLevel: number;
  fans: number;
}

export interface GameEvent {
    id: string;
    week: number;
    message: string;
    type: 'info' | 'warning' | 'success';
}