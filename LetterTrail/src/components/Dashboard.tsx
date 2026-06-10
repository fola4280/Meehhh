import type { JournalEntry, MatchResult, PenpalRequest, UserProfile } from '../types';
import { matchLabel } from '../utils/matching';

interface DashboardProps {
  currentUser: UserProfile;
  pendingRequests: PenpalRequest[];
  journalEntries: JournalEntry[];
  matchedSuggestions: MatchResult[];
  onAcceptRequest: (userId: string) => void;
}

export default function Dashboard({
  currentUser,
  pendingRequests,
  journalEntries,
  matchedSuggestions,
  onAcceptRequest,
}: DashboardProps) {
  const countries = new Set(
    journalEntries.map((entry) => {
      const parts = entry.location.split(',');
      return parts[parts.length - 1]?.trim();
    })
  );

  return (
    <main className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-lg border border-white/70 bg-white/80 p-6 shadow-soft">
          <div className="absolute right-6 top-6 hidden rotate-6 border-2 border-dashed border-rust/50 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-rust/70 md:block">
            Air Mail
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-moss">Your trail</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black text-slate-950 md:text-5xl">
            A living desk of letters, stamps, and travel memories.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Welcome back, {currentUser.name}. Your newest matches are tuned to shared languages,
            overlapping interests, and the kind of travel stories you like to trade.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="Journal entries" value={journalEntries.length.toString()} />
            <Stat label="Places visited" value={countries.size.toString()} />
            <Stat label="Open requests" value={pendingRequests.length.toString()} />
          </div>
        </div>

        <div className="rounded-lg border border-lake/15 bg-lake p-6 text-white shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-sand">Passport profile</p>
          <div className="mt-5 flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-20 w-20 rounded-lg border-4 border-white/40 object-cover"
            />
            <div>
              <h3 className="text-2xl font-black">{currentUser.name}</h3>
              <p className="font-semibold text-white/75">{currentUser.city}</p>
            </div>
          </div>
          <p className="mt-5 leading-7 text-white/80">{currentUser.bio}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {currentUser.languages.map((language) => (
              <span key={language} className="rounded-md bg-white/15 px-3 py-1 text-sm font-bold">
                {language}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-white/70 bg-white/80 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-rust">Incoming</p>
              <h2 className="text-2xl font-black text-slate-950">Penpal requests</h2>
            </div>
            <span className="rounded-md bg-rust/10 px-3 py-1 text-sm font-black text-rust">
              {pendingRequests.length}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {pendingRequests.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-sand/60 p-4 text-sm font-semibold text-slate-500">
                No pending requests yet. Browse penpals and start a new correspondence.
              </p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.userId} className="flex items-center justify-between gap-3 rounded-lg bg-sand/70 p-4">
                  <div>
                    <p className="font-black text-slate-950">{request.userId}</p>
                    <p className="text-sm text-slate-500">
                      Sent {new Date(request.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAcceptRequest(request.userId)}
                    className="rounded-lg bg-lake px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-lake/90"
                  >
                    Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/70 bg-white/80 p-6 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-moss">Suggested matches</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {matchedSuggestions.map(({ user, score, sharedInterests, sharedLanguages }) => (
              <article key={user.id} className="postcard-card">
                <img src={user.avatar} alt={user.name} className="h-28 w-full rounded-lg object-cover" />
                <div className="mt-3">
                  <h3 className="font-black text-slate-950">{user.name}</h3>
                  <p className="text-sm font-semibold text-slate-500">{user.city}</p>
                </div>
                <p className="mt-3 text-sm font-bold text-lake">{matchLabel(score)}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {sharedLanguages.length} languages, {sharedInterests.length} interests in common
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-sand/80 p-4">
      <p className="text-3xl font-black text-lake">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}
