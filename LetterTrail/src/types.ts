export type Mood = 'Inspired' | 'Adventurous' | 'Relaxed' | 'Curious' | 'Playful' | 'Nostalgic';

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  country: string;
  avatar: string;
  languages: string[];
  interests: string[];
  bio: string;
  matchingNotes: string;
  favoriteStamp: string;
  responseTime: string;
}

export interface PenpalRequest {
  userId: string;
  accepted: boolean;
  sentAt: string;
}

export interface JournalEntry {
  id: string;
  photo: string;
  location: string;
  date: string;
  mood: Mood;
  story: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface MatchResult {
  user: UserProfile;
  score: number;
  sharedLanguages: string[];
  sharedInterests: string[];
}
