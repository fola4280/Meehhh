import { FormEvent, useState } from 'react';
import type { JournalEntry, Mood } from '../types';

const moods: Mood[] = ['Inspired', 'Adventurous', 'Relaxed', 'Curious', 'Playful', 'Nostalgic'];

const locationCoordinates: Record<string, JournalEntry['coordinates']> = {
  lisbon: { lat: 38.7223, lng: -9.1393 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  'san juan': { lat: 18.4655, lng: -66.1057 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  reykjavik: { lat: 64.1466, lng: -21.9426 },
  naples: { lat: 40.8518, lng: 14.2681 },
  portland: { lat: 45.5152, lng: -122.6784 },
};

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (entries: JournalEntry[]) => void;
}

const emptyForm = {
  photo: '',
  location: '',
  date: new Date().toISOString().slice(0, 10),
  mood: 'Inspired' as Mood,
  story: '',
};

export default function Journal({ entries, onAddEntry }: JournalProps) {
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const coordinates = getCoordinates(form.location, entries.length);
    const nextEntry: JournalEntry = {
      id: crypto.randomUUID(),
      photo:
        form.photo ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80',
      location: form.location,
      date: form.date,
      mood: form.mood,
      story: form.story,
      coordinates,
    };

    onAddEntry([nextEntry, ...entries]);
    setForm(emptyForm);
  };

  return (
    <main className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-white/70 bg-white/80 p-6 shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-rust">Travel journal</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Add a memory</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Photo URL">
            <input
              value={form.photo}
              onChange={(event) => setForm({ ...form, photo: event.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="input"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <input
                required
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                placeholder="Naples, Italy"
                className="input"
              />
            </Field>
            <Field label="Date">
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                className="input"
              />
            </Field>
          </div>
          <Field label="Mood">
            <select
              value={form.mood}
              onChange={(event) => setForm({ ...form, mood: event.target.value as Mood })}
              className="input"
            >
              {moods.map((mood) => (
                <option key={mood}>{mood}</option>
              ))}
            </select>
          </Field>
          <Field label="Story">
            <textarea
              required
              value={form.story}
              onChange={(event) => setForm({ ...form, story: event.target.value })}
              placeholder="Write the scene, the weather, the postcard you mailed..."
              rows={6}
              className="input resize-none leading-7"
            />
          </Field>
          <button
            type="submit"
            className="w-full rounded-lg bg-lake px-5 py-3 font-black text-white shadow-lg shadow-lake/20 transition hover:bg-lake/90"
          >
            Save memory
          </button>
        </form>
      </section>

      <section className="space-y-5">
        {entries.map((entry) => (
          <article key={entry.id} className="postcard-card grid gap-5 md:grid-cols-[220px_1fr]">
            <img src={entry.photo} alt={entry.location} className="h-56 w-full rounded-lg object-cover md:h-full" />
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-moss">
                    {entry.mood}
                  </p>
                  <h2 className="text-2xl font-black text-slate-950">{entry.location}</h2>
                </div>
                <time className="rounded-md bg-sand px-3 py-1 text-sm font-black text-slate-600">
                  {new Date(`${entry.date}T00:00:00`).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-4 leading-8 text-slate-600">{entry.story}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
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

function getCoordinates(location: string, offset: number) {
  const normalized = location.toLowerCase();
  const knownKey = Object.keys(locationCoordinates).find((key) => normalized.includes(key));

  if (knownKey) {
    return locationCoordinates[knownKey];
  }

  return {
    lat: -35 + ((offset * 23) % 95),
    lng: -130 + ((offset * 47) % 260),
  };
}
