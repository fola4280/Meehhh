import type { MatchResult, UserProfile } from '../types';

export function buildMatches(currentUser: UserProfile, users: UserProfile[]): MatchResult[] {
  return users
    .map((user) => {
      const sharedLanguages = user.languages.filter((language) =>
        currentUser.languages.includes(language)
      );
      const sharedInterests = user.interests.filter((interest) =>
        currentUser.interests.includes(interest)
      );
      const score = sharedLanguages.length * 16 + sharedInterests.length * 12;

      return { user, score, sharedLanguages, sharedInterests };
    })
    .sort((a, b) => b.score - a.score);
}

export function matchLabel(score: number) {
  if (score >= 44) return 'Excellent match';
  if (score >= 28) return 'Strong match';
  if (score >= 12) return 'Curious match';
  return 'Fresh perspective';
}
