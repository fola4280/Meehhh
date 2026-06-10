import { useMemo, useState } from 'react';
import type { MatchResult, PenpalRequest, UserProfile } from '../types';
import { matchLabel } from '../utils/matching';

interface ProfilesProps {
  currentUser: UserProfile;
  users: UserProfile[];
  requests: PenpalRequest[];
  onSendRequest: (userId: string) => void;
  onUnsendRequest: (userId: string) => void;
  onUnmatch: (userId: string) => void;
  onOpenMailbox: (userId: string) => void;
  matchedSuggestions: MatchResult[];
}

type MatchMode = 'compatible' | 'vibes';

export default function Profiles({
  currentUser,
  users,
  requests,
  onSendRequest,
  onUnsendRequest,
  onUnmatch,
  onOpenMailbox,
  matchedSuggestions,
}: ProfilesProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('All');
  const [interest, setInterest] = useState('All');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [matchMode, setMatchMode] = useState<MatchMode>('compatible');
  const [showSampleProfiles, setShowSampleProfiles] = useState(true);

  const languages = ['All', ...Array.from(new Set(users.flatMap((user) => user.languages))).sort()];
  const interests = ['All', ...Array.from(new Set(users.flatMap((user) => user.interests))).sort()];

  const filteredMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return matchedSuggestions
      .filter(({ user, vibeMatches }) => {
        if (user.isSample && !showSampleProfiles) return false;

        const searchable = [
          user.name,
          user.city,
          user.country,
          user.bio,
          user.matchingNotes,
          ...user.languages,
          ...user.interests,
          ...vibeMatches,
          ...Object.values(user.vibeProfile ?? {}),
        ]
          .join(' ')
          .toLowerCase();

        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        const matchesLanguage = language === 'All' || user.languages.includes(language);
        const matchesInterest = interest === 'All' || user.interests.includes(interest);

        return matchesQuery && matchesLanguage && matchesInterest;
      })
      .sort((a, b) => getModeScore(b, matchMode) - getModeScore(a, matchMode));
  }, [interest, language, matchMode, matchedSuggestions, query, showSampleProfiles]);

  const selectedMatch = filteredMatches.find(({ user }) => user.id === selectedUserId);

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
        <div className="mt-5 grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-sand/80 p-2 shadow-inner">
            {(['compatible', 'vibes'] as MatchMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setMatchMode(mode)}
                className={`rounded-lg px-4 py-3 text-sm font-black capitalize transition ${
                  matchMode === mode ? 'bg-white text-lake shadow-sm' : 'text-slate-500 hover:bg-white/70'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold leading-6 text-slate-500">
            {matchMode === 'compatible'
              ? 'Compatible mode prioritizes shared languages, interests, and practical conversation hooks.'
              : 'Vibes mode prioritizes travel tempo, letter style, social energy, planning style, and exchange style.'}
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-sand/60 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black text-slate-950">LetterTrail is a new network.</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Sample travelers are here for product testing. Hide them to see the real early-app state.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSampleProfiles(!showSampleProfiles)}
            className={`rounded-lg px-5 py-3 text-sm font-black shadow-sm transition ${
              showSampleProfiles
                ? 'bg-lake text-white hover:bg-lake/90'
                : 'bg-white text-slate-700 hover:bg-white/80'
            }`}
          >
            {showSampleProfiles ? 'Showing samples' : 'Samples hidden'}
          </button>
        </div>
      </section>

      {selectedMatch && (
        <ProfileDetail
          currentUser={currentUser}
          match={selectedMatch}
          matchMode={matchMode}
          request={requests.find((item) => item.userId === selectedMatch.user.id)}
          onClose={() => setSelectedUserId(null)}
          onSendRequest={onSendRequest}
          onUnsendRequest={onUnsendRequest}
          onUnmatch={onUnmatch}
          onOpenMailbox={onOpenMailbox}
        />
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        {filteredMatches.map((match) => {
          const {
            user,
            sharedLanguages,
            sharedInterests,
            compatibilityScore,
            vibeScore,
            vibeMatches,
          } = match;
          const request = requests.find((item) => item.userId === user.id);
          const modeScore = getModeScore(match, matchMode);

          return (
            <article
              key={user.id}
              className={`postcard-card ${selectedUserId === user.id ? 'ring-4 ring-rust/20' : ''}`}
            >
              <button
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className="flex w-full flex-col gap-5 text-left transition hover:-translate-y-1 sm:flex-row"
              >
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
                      {user.isSample && (
                        <span className="mt-2 inline-flex rounded-md bg-rust/10 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-rust">
                          Sample traveler
                        </span>
                      )}
                    </div>
                    <div className="stamp">{Math.min(modeScore, 100)}%</div>
                  </div>
                  <p className="mt-3 leading-7 text-slate-600">{user.bio}</p>
                  <p className="mt-3 text-sm font-bold text-lake">
                    {matchMode === 'compatible' ? 'Compatibility' : 'Vibes'} / {matchLabel(modeScore)}
                  </p>
                </div>
              </button>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <TagGroup title="Shared languages" items={sharedLanguages} fallback="New language window" />
                <TagGroup title="Shared interests" items={sharedInterests} fallback="Fresh travel angle" />
                <TagGroup title="Vibe signals" items={vibeMatches} fallback="Different but interesting" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ScoreBar label="Compatible" value={compatibilityScore} active={matchMode === 'compatible'} />
                <ScoreBar label="Vibes" value={vibeScore} active={matchMode === 'vibes'} />
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-dashed border-slate-300 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  <span className="font-black text-slate-800">Stamp:</span> {user.favoriteStamp}
                  <span className="mx-2 text-slate-300">/</span>
                  Replies in {user.responseTime}
                </div>
                <RelationshipButton
                  userId={user.id}
                  request={request}
                  onSendRequest={onSendRequest}
                  onUnsendRequest={onUnsendRequest}
                  onUnmatch={onUnmatch}
                  onOpenMailbox={onOpenMailbox}
                />
                <button
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className="rounded-lg bg-lake px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-lake/90"
                >
                  View profile
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {filteredMatches.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            {showSampleProfiles ? 'No penpals found' : 'No live penpals yet'}
          </h2>
          <p className="mt-2 font-semibold text-slate-500">
            {showSampleProfiles
              ? 'Clear a filter or search for a broader place, language, or interest.'
              : 'That is okay for a new app. Create your profile, set your vibes, and invite the first real penpals.'}
          </p>
        </div>
      )}
    </main>
  );
}

function ProfileDetail({
  currentUser,
  match,
  matchMode,
  request,
  onClose,
  onSendRequest,
  onUnsendRequest,
  onUnmatch,
  onOpenMailbox,
}: {
  currentUser: UserProfile;
  match: MatchResult;
  matchMode: MatchMode;
  request?: PenpalRequest;
  onClose: () => void;
  onSendRequest: (userId: string) => void;
  onUnsendRequest: (userId: string) => void;
  onUnmatch: (userId: string) => void;
  onOpenMailbox: (userId: string) => void;
}) {
  const {
    user,
    compatibilityScore,
    vibeScore,
    sharedLanguages,
    sharedInterests,
    vibeMatches,
    compatibilityNotes,
  } = match;
  const allShared = [...sharedLanguages, ...sharedInterests];
  const primaryScore = getModeScore(match, matchMode);

  return (
    <section className="rounded-lg border border-white/70 bg-white/90 p-5 shadow-soft md:p-6">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div>
          <img src={user.avatar} alt={user.name} className="h-80 w-full rounded-lg object-cover shadow-md" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ProfileMetric
              label={matchMode === 'compatible' ? 'Compatible' : 'Vibes'}
              value={`${Math.min(primaryScore, 100)}%`}
            />
            <ProfileMetric label="Replies" value={user.responseTime} />
          </div>
          <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-sand/70 p-4">
            <ScoreBar label="Compatible" value={compatibilityScore} active={matchMode === 'compatible'} />
            <ScoreBar label="Vibes" value={vibeScore} active={matchMode === 'vibes'} />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-rust">Penpal profile</p>
              <h2 className="mt-1 text-4xl font-black text-slate-950">{user.name}</h2>
              <p className="mt-1 font-semibold text-slate-500">
                {user.city} / {user.country}
              </p>
              {user.isSample && (
                <span className="mt-3 inline-flex rounded-md bg-rust/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-rust">
                  Sample traveler
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-sand px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-rust/10 hover:text-rust"
            >
              Close
            </button>
          </div>

          <p className="mt-5 text-lg leading-8 text-slate-600">{user.bio}</p>
          <div className="mt-5 rounded-lg border border-dashed border-rust/30 bg-rust/10 p-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rust">
              {matchMode === 'compatible' ? 'Why you are compatible' : 'Why the vibes match'}
            </p>
            <p className="mt-2 leading-7 text-slate-700">{user.matchingNotes}</p>
            <p className="mt-3 text-sm font-bold text-slate-500">
              {matchMode === 'compatible'
                ? `${currentUser.name} shares ${allShared.length || 'new'} practical conversation hooks with ${user.name}.`
                : `${currentUser.name} shares ${vibeMatches.length || 'a different but workable'} vibe signals with ${user.name}.`}
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TagGroup title="Languages" items={user.languages} fallback="No languages listed" />
            <TagGroup title="Interests" items={user.interests} fallback="No interests listed" />
            <TagGroup title="Compatibility signals" items={compatibilityNotes} fallback="Learn from each other" />
            <TagGroup title="Vibe signals" items={vibeMatches} fallback="Different but interesting" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="rounded-lg bg-sand/70 p-4 text-sm text-slate-600">
              <span className="font-black text-slate-900">Favorite stamp:</span> {user.favoriteStamp}
              <span className="mx-2 text-slate-300">/</span>
              <span className="font-black text-slate-900">Best opener:</span> Ask about {user.interests[0] ?? 'their travels'}.
            </div>
            <RelationshipButton
              userId={user.id}
              request={request}
              onSendRequest={onSendRequest}
              onUnsendRequest={onUnsendRequest}
              onUnmatch={onUnmatch}
              onOpenMailbox={onOpenMailbox}
              wide
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function RelationshipButton({
  userId,
  request,
  onSendRequest,
  onUnsendRequest,
  onUnmatch,
  onOpenMailbox,
  wide = false,
}: {
  userId: string;
  request?: PenpalRequest;
  onSendRequest: (userId: string) => void;
  onUnsendRequest: (userId: string) => void;
  onUnmatch: (userId: string) => void;
  onOpenMailbox: (userId: string) => void;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!request) {
    return (
      <button
        type="button"
        onClick={() => onSendRequest(userId)}
        className={`${wide ? 'w-full md:w-auto' : ''} rounded-lg bg-rust px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-rust/90`}
      >
        Send request
      </button>
    );
  }

  if (!request.accepted) {
    return (
      <div className={`relative ${wide ? 'w-full md:w-auto' : ''}`}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full rounded-lg bg-moss/15 px-5 py-3 text-sm font-black text-moss shadow-sm transition hover:bg-moss/25"
        >
          Request sent
        </button>
        {open && (
          <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
            <button
              type="button"
              onClick={() => {
                onUnsendRequest(userId);
                setOpen(false);
              }}
              className="block w-full px-4 py-3 text-left text-sm font-black text-rust transition hover:bg-rust/10"
            >
              Unsend request
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${wide ? 'w-full md:w-auto' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg bg-lake px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-lake/90"
      >
        Chat
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
          <button
            type="button"
            onClick={() => {
              onOpenMailbox(userId);
              setOpen(false);
            }}
            className="block w-full px-4 py-3 text-left text-sm font-black text-slate-700 transition hover:bg-sand"
          >
            Open chat
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenMailbox(userId);
              setOpen(false);
            }}
            className="block w-full px-4 py-3 text-left text-sm font-black text-slate-700 transition hover:bg-sand"
          >
            Mutual post office
          </button>
          <button
            type="button"
            onClick={() => {
              onUnmatch(userId);
              setOpen(false);
            }}
            className="block w-full px-4 py-3 text-left text-sm font-black text-rust transition hover:bg-rust/10"
          >
            Unmatch
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-sand/70 p-4">
      <p className="text-2xl font-black text-lake">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function ScoreBar({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-black ${active ? 'text-lake' : 'text-slate-500'}`}>{label}</p>
        <p className="text-sm font-black text-slate-700">{Math.min(value, 100)}%</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${active ? 'bg-lake' : 'bg-moss/60'}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
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

function getModeScore(match: MatchResult, matchMode: MatchMode) {
  return matchMode === 'compatible' ? match.compatibilityScore : match.vibeScore;
}
