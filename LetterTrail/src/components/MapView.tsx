import { useMemo, useState } from 'react';
import type { JournalEntry } from '../types';

interface MapViewProps {
  entries: JournalEntry[];
}

export default function MapView({ entries }: MapViewProps) {
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? '');
  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? entries[0];

  const pins = useMemo(
    () =>
      entries.map((entry) => ({
        entry,
        left: ((entry.coordinates.lng + 180) / 360) * 100,
        top: ((90 - entry.coordinates.lat) / 180) * 100,
      })),
    [entries]
  );

  return (
    <main className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-soft">
          <div className="map-surface" aria-label="Interactive visited places map">
            <div className="map-grid" />
            <div className="continent continent-one" />
            <div className="continent continent-two" />
            <div className="continent continent-three" />
            <div className="continent continent-four" />
            <div className="route-line route-one" />
            <div className="route-line route-two" />
            {pins.map(({ entry, left, top }) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedId(entry.id)}
                className={`map-pin ${selectedEntry?.id === entry.id ? 'is-active' : ''}`}
                style={{ left: `${left}%`, top: `${top}%` }}
                title={entry.location}
              >
                <span className="sr-only">{entry.location}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-white/70 bg-white/80 p-6 shadow-soft">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-moss">Selected place</p>
          {selectedEntry ? (
            <div className="mt-4">
              <img
                src={selectedEntry.photo}
                alt={selectedEntry.location}
                className="h-48 w-full rounded-lg object-cover"
              />
              <h2 className="mt-4 text-2xl font-black text-slate-950">{selectedEntry.location}</h2>
              <p className="mt-1 text-sm font-bold text-rust">
                {selectedEntry.mood} / {new Date(`${selectedEntry.date}T00:00:00`).toLocaleDateString()}
              </p>
              <p className="mt-4 leading-7 text-slate-600">{selectedEntry.story}</p>
            </div>
          ) : (
            <p className="mt-4 font-semibold text-slate-500">Add a journal entry to place your first pin.</p>
          )}
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setSelectedId(entry.id)}
            className={`postcard-card text-left transition ${
              selectedEntry?.id === entry.id ? 'ring-4 ring-rust/20' : 'hover:-translate-y-1'
            }`}
          >
            <p className="text-sm font-black uppercase tracking-[0.18em] text-moss">{entry.mood}</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">{entry.location}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{entry.story}</p>
          </button>
        ))}
      </section>
    </main>
  );
}
