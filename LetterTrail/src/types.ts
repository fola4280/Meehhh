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
  vibeProfile?: VibeProfile;
  isSample?: boolean;
}

export interface PenpalRequest {
  userId: string;
  accepted: boolean;
  sentAt: string;
}

export interface JournalEntry {
  id: string;
  photo: string;
  galleryPhotos?: string[];
  location: string;
  date: string;
  mood: Mood;
  story: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  reviews?: MemoryReview[];
  landmarks?: NearbyPlace[];
  restaurants?: NearbyPlace[];
}

export interface MatchResult {
  user: UserProfile;
  score: number;
  compatibilityScore: number;
  vibeScore: number;
  sharedLanguages: string[];
  sharedInterests: string[];
  vibeMatches: string[];
  compatibilityNotes: string[];
}

export interface VibeProfile {
  travelTempo: 'Slow wandering' | 'Packed itinerary' | 'Local rhythm';
  letterStyle: 'Long reflective letters' | 'Short postcards' | 'Photo-heavy updates';
  socialEnergy: 'Quiet corners' | 'Big city buzz' | 'Flexible energy';
  planningStyle: 'Plan ahead' | 'Follow the moment' | 'Loose outline';
  exchangeStyle: 'Deep stories' | 'Practical tips' | 'Creative prompts';
}

export interface MemoryReview {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  type: string;
  distance: string;
  photo: string;
  note: string;
  rating: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface PostOfficeAgreement {
  userId: string;
  name: string;
  address: string;
  proposedBy: string;
  status: 'proposed' | 'accepted' | 'needs-change';
  updatedAt: string;
}
