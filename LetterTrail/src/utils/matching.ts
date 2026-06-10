import type { MatchResult, UserProfile, VibeProfile } from '../types';

export const defaultVibeProfile: VibeProfile = {
  travelTempo: 'Slow wandering',
  letterStyle: 'Long reflective letters',
  socialEnergy: 'Quiet corners',
  planningStyle: 'Loose outline',
  exchangeStyle: 'Deep stories',
};

export function buildMatches(currentUser: UserProfile, users: UserProfile[]): MatchResult[] {
  return users
    .map((user) => {
      const sharedLanguages = user.languages.filter((language) =>
        currentUser.languages.includes(language)
      );
      const sharedInterests = user.interests.filter((interest) =>
        currentUser.interests.includes(interest)
      );
      const compatibilityScore = Math.min(
        100,
        sharedLanguages.length * 18 + sharedInterests.length * 12
      );
      const currentVibe = normalizeVibeProfile(currentUser);
      const userVibe = normalizeVibeProfile(user);
      const vibeMatches = getVibeMatches(currentVibe, userVibe);
      const vibeScore = Math.min(100, vibeMatches.length * 20);
      const score = Math.round(compatibilityScore * 0.58 + vibeScore * 0.42);

      return {
        user,
        score,
        compatibilityScore,
        vibeScore,
        sharedLanguages,
        sharedInterests,
        vibeMatches,
        compatibilityNotes: [
          ...sharedLanguages.map((language) => `Both write in ${language}`),
          ...sharedInterests.map((interest) => `Both care about ${interest}`),
        ],
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function matchLabel(score: number) {
  if (score >= 44) return 'Excellent match';
  if (score >= 28) return 'Strong match';
  if (score >= 12) return 'Curious match';
  return 'Fresh perspective';
}

export function normalizeVibeProfile(user: UserProfile): VibeProfile {
  return user.vibeProfile ?? defaultVibeProfile;
}

function getVibeMatches(currentVibe: VibeProfile, userVibe: VibeProfile) {
  const matches: string[] = [];

  if (currentVibe.travelTempo === userVibe.travelTempo) {
    matches.push(`Both prefer ${currentVibe.travelTempo.toLowerCase()}`);
  }
  if (currentVibe.letterStyle === userVibe.letterStyle) {
    matches.push(`Both like ${currentVibe.letterStyle.toLowerCase()}`);
  }
  if (currentVibe.socialEnergy === userVibe.socialEnergy) {
    matches.push(`Both gravitate toward ${currentVibe.socialEnergy.toLowerCase()}`);
  }
  if (currentVibe.planningStyle === userVibe.planningStyle) {
    matches.push(`Both travel with ${currentVibe.planningStyle.toLowerCase()} energy`);
  }
  if (currentVibe.exchangeStyle === userVibe.exchangeStyle) {
    matches.push(`Both want ${currentVibe.exchangeStyle.toLowerCase()}`);
  }

  return matches;
}
