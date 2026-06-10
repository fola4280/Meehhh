import { FormEvent, useEffect, useState } from 'react';
import type { UserProfile, VibeProfile } from '../types';
import { defaultVibeProfile, normalizeVibeProfile } from '../utils/matching';

interface ProfileEditorProps {
  currentUser: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const vibeOptions = {
  travelTempo: ['Slow wandering', 'Packed itinerary', 'Local rhythm'],
  letterStyle: ['Long reflective letters', 'Short postcards', 'Photo-heavy updates'],
  socialEnergy: ['Quiet corners', 'Big city buzz', 'Flexible energy'],
  planningStyle: ['Plan ahead', 'Follow the moment', 'Loose outline'],
  exchangeStyle: ['Deep stories', 'Practical tips', 'Creative prompts'],
} satisfies { [Key in keyof VibeProfile]: VibeProfile[Key][] };

function createProfileForm(currentUser: UserProfile) {
  const vibeProfile = normalizeVibeProfile(currentUser);

  return {
    name: currentUser.name,
    city: currentUser.city,
    country: currentUser.country,
    avatar: currentUser.avatar,
    languages: currentUser.languages.join(', '),
    interests: currentUser.interests.join(', '),
    bio: currentUser.bio,
    matchingNotes: currentUser.matchingNotes,
    favoriteStamp: currentUser.favoriteStamp,
    responseTime: currentUser.responseTime,
    vibeProfile,
  };
}

export default function ProfileEditor({ currentUser, onSaveProfile }: ProfileEditorProps) {
  const [form, setForm] = useState(createProfileForm(currentUser));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(createProfileForm(currentUser));
  }, [currentUser]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSaveProfile({
      ...currentUser,
      name: form.name.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      avatar:
        form.avatar.trim() ||
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
      languages: splitList(form.languages),
      interests: splitList(form.interests),
      bio: form.bio.trim(),
      matchingNotes: form.matchingNotes.trim(),
      favoriteStamp: form.favoriteStamp.trim(),
      responseTime: form.responseTime.trim(),
      vibeProfile: form.vibeProfile,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-white/70 bg-white/80 p-6 shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-rust">My profile</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Create your penpal passport</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="input"
              />
            </Field>
            <Field label="City">
              <input
                required
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                placeholder="Portland, OR"
                className="input"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Country">
              <input
                required
                value={form.country}
                onChange={(event) => setForm({ ...form, country: event.target.value })}
                className="input"
              />
            </Field>
            <Field label="Avatar URL">
              <input
                value={form.avatar}
                onChange={(event) => setForm({ ...form, avatar: event.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="input"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Languages">
              <input
                required
                value={form.languages}
                onChange={(event) => setForm({ ...form, languages: event.target.value })}
                placeholder="English, Spanish, French"
                className="input"
              />
            </Field>
            <Field label="Interests">
              <input
                required
                value={form.interests}
                onChange={(event) => setForm({ ...form, interests: event.target.value })}
                placeholder="postcards, cafe hopping, nature trails"
                className="input"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Favorite stamp">
              <input
                required
                value={form.favoriteStamp}
                onChange={(event) => setForm({ ...form, favoriteStamp: event.target.value })}
                className="input"
              />
            </Field>
            <Field label="Response time">
              <input
                required
                value={form.responseTime}
                onChange={(event) => setForm({ ...form, responseTime: event.target.value })}
                placeholder="2 days"
                className="input"
              />
            </Field>
          </div>
          <Field label="Bio">
            <textarea
              required
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
              rows={4}
              className="input resize-none leading-7"
            />
          </Field>
          <Field label="Matching notes">
            <textarea
              required
              value={form.matchingNotes}
              onChange={(event) => setForm({ ...form, matchingNotes: event.target.value })}
              rows={3}
              className="input resize-none leading-7"
            />
          </Field>
          <div className="rounded-lg border border-dashed border-lake/25 bg-sand/60 p-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-lake">Vibe matching</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <VibeSelect
                label="Travel tempo"
                value={form.vibeProfile.travelTempo}
                options={vibeOptions.travelTempo}
                onChange={(travelTempo) =>
                  setForm({ ...form, vibeProfile: { ...form.vibeProfile, travelTempo } })
                }
              />
              <VibeSelect
                label="Letter style"
                value={form.vibeProfile.letterStyle}
                options={vibeOptions.letterStyle}
                onChange={(letterStyle) =>
                  setForm({ ...form, vibeProfile: { ...form.vibeProfile, letterStyle } })
                }
              />
              <VibeSelect
                label="Social energy"
                value={form.vibeProfile.socialEnergy}
                options={vibeOptions.socialEnergy}
                onChange={(socialEnergy) =>
                  setForm({ ...form, vibeProfile: { ...form.vibeProfile, socialEnergy } })
                }
              />
              <VibeSelect
                label="Planning style"
                value={form.vibeProfile.planningStyle}
                options={vibeOptions.planningStyle}
                onChange={(planningStyle) =>
                  setForm({ ...form, vibeProfile: { ...form.vibeProfile, planningStyle } })
                }
              />
              <VibeSelect
                label="Exchange style"
                value={form.vibeProfile.exchangeStyle}
                options={vibeOptions.exchangeStyle}
                onChange={(exchangeStyle) =>
                  setForm({ ...form, vibeProfile: { ...form.vibeProfile, exchangeStyle } })
                }
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-lake px-5 py-3 font-black text-white shadow-lg shadow-lake/20 transition hover:bg-lake/90"
          >
            {saved ? 'Profile saved' : 'Save profile'}
          </button>
        </form>
      </section>

      <section className="space-y-5">
        <article className="postcard-card">
          <div className="flex flex-col gap-5 md:flex-row">
            <img
              src={form.avatar || currentUser.avatar}
              alt={form.name || currentUser.name}
              className="h-72 w-full rounded-lg object-cover md:w-64"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-moss">
                    Passport preview
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-slate-950">{form.name}</h2>
                  <p className="font-semibold text-slate-500">
                    {form.city} / {form.country}
                  </p>
                </div>
                <div className="stamp">YOU</div>
              </div>
              <p className="mt-5 leading-8 text-slate-600">{form.bio}</p>
              <p className="mt-4 text-sm font-bold text-lake">{form.matchingNotes}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <PreviewTags title="Languages" value={form.languages} />
                <PreviewTags title="Interests" value={form.interests} />
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {Object.values(form.vibeProfile ?? defaultVibeProfile).map((item) => (
                  <span key={item} className="rounded-md bg-moss/10 px-3 py-2 text-sm font-bold text-moss">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        <div className="rounded-lg border border-white/70 bg-white/80 p-6 shadow-soft">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-rust">Matching impact</p>
          <p className="mt-3 leading-8 text-slate-600">
            Your languages and interests immediately update suggested penpals across the dashboard
            and browse page. The profile is stored in this browser with localStorage.
          </p>
        </div>
      </section>
    </main>
  );
}

function VibeSelect<T extends VibeProfile[keyof VibeProfile]>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="input mt-2"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-600">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function PreviewTags({ title, value }: { title: string; value: string }) {
  const items = splitList(value);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-md bg-sand px-3 py-1 text-sm font-bold text-slate-700">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
