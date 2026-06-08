import { useMemo, useState } from 'react';
import type { MatchResult, PenpalRequest, UserProfile } from '../types';
import { matchLabel } from '../utils/matching';

interface ProfilesProps {
  currentUser: UserProfile;
  users: UserProfile[];
  requests: PenpalRequest[];
  onSendRequest: (userId: string) => void;
  matchedSuggestions: MatchResult[];
}

export default function Profiles({
  currentUser,
  users,
  requests,
  onSendRequest,
  matchedSuggestions,
}: ProfilesProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('All');
  const [interest, setInterest] = useState('All');

  const languages = ['All', ...Array.from(new Set(users.flatMap((user) => user.languages))).sort()];
  const interests = ['All', ...Array.from(new Set(users.flatMap((user) => user.interests))).sort()];

  const filteredMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return matchedSuggestions.filter(({ user }) => {
      const searchable = [
        user.name,
        user.city,
        user.country,
        user.bio,
        user.matchingNotes,
        ...user.languages,
        ...user.interests,
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesLanguage = language === 'All' || user.languages.includes(language);
      const matchesInterest = interest === 'All' || user.interests.includes(interest);

      return matchesQuery && matchesLanguage && matchesInterest;
    });
  }, [interest, language, matchedSuggestions, query]);

  return (
    <main className="space-y-6">
      <section className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-black uppercase tracking-[0.18em] text-rust">
              Search penpals
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Kyoto, postcards, Spanish, markets..."
              className="mt-2 w-full rounded-lg border border-slate-200 bg-sand/70 px-4 py-3 font-semibold outline-none transition focus:border-lake focus:bg-white focus:ring-4 focus:ring-lake/10"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-500">Language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-lake focus:ring-4 focus:ring-lake/10 lg:w-48"
            >
              {languages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-500">Interest</span>
            <select
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-lake focus:ring-4 focus:ring-lake/10 lg:w-52"
            >
              {interests.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {filteredMatches.map(({ user, score, sharedLanguages, sharedInterests }) => {
          const request = requests.find((item) => item.userId === user.id);

          return (
            <article key={user.id} className="postcard-card">
              <div className="flex flex-col gap-5 sm:flex-row">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-40 w-full rounded-lg object-cover sm:h-auto sm:w-36"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-black text-slate-950">{user.name}</h2>
                      <p className="font-semibold text-slate-500">{user.city}</p>
                    </div>
                    <div className="stamp">{Math.min(score, 100)}%</div>
                  </div>
                  <p className="mt-3 leading-7 text-slate-600">{user.bio}</p>
                  <p className="mt-3 text-sm font-bold text-lake">{matchLabel(score)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TagGroup title="Shared languages" items={sharedLanguages} fallback="New language window" />
                <TagGroup title="Shared interests" items={sharedInterests} fallback="Fresh travel angle" />
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-dashed border-slate-300 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  <span className="font-black text-slate-800">Stamp:</span> {user.favoriteStamp}
                  <span className="mx-2 text-slate-300">/</span>
                  Replies in {user.responseTime}
                </div>
                <button
                  type="button"
                  onClick={() => onSendRequest(user.id)}
                  disabled={Boolean(request)}
                  className={`rounded-lg px-5 py-3 text-sm font-black shadow-sm transition ${
                    request
                      ? 'cursor-not-allowed bg-moss/15 text-moss'
                      : 'bg-rust text-white hover:bg-rust/90'
                  }`}
                >
                  {request?.accepted ? 'Connected' : request ? 'Request sent' : 'Send request'}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {filteredMatches.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">No penpals found</h2>
          <p className="mt-2 font-semibold text-slate-500">
            Clear a filter or search for a broader place, language, or interest.
          </p>
        </div>
      )}
    </main>
  );
}

function TagGroup({ title, items, fallback }: { title: string; items: string[]; fallback: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(items.length > 0 ? items : [fallback]).map((item) => (
          <span key={item} className="rounded-md bg-sand px-3 py-1 text-sm font-bold text-slate-700">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
