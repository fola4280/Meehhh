import { useMemo, useState } from 'react';
import type { JournalEntry, MemoryReview, UserProfile } from '../types';
import MemoryDetail from './MemoryDetail';

interface MapViewProps {
  entries: JournalEntry[];
  currentUser: UserProfile;
  onAddReview: (entryId: string, review: MemoryReview) => void;
}

export default function MapView({ entries, currentUser, onAddReview }: MapViewProps) {
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? '');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(3);
  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const detailEntry = entries.find((entry) => entry.id === detailId);
  const mapCenter = selectedEntry?.coordinates ?? getEntriesCenter(entries);
  const centerPixel = projectLatLng(mapCenter.lat, mapCenter.lng, zoom);

  const markers = useMemo(
    () =>
      entries.map((entry) => ({
        entry,
        pixel: projectLatLng(entry.coordinates.lat, entry.coordinates.lng, zoom),
      })),
    [entries, zoom]
  );

  const tiles = useMemo(
    () => buildTiles(centerPixel, zoom),
    [centerPixel.x, centerPixel.y, zoom]
  );

  return (
    <main className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-soft">
          <div className="real-map-surface" aria-label="OpenStreetMap visited places map">
            {tiles.map((tile) => (
              <img
                key={`${tile.z}-${tile.x}-${tile.y}`}
                src={`https://tile.openstreetmap.org/${tile.z}/${tile.wrappedX}/${tile.y}.png`}
                alt=""
                className="map-tile"
                style={{
                  left: `calc(50% + ${tile.left}px)`,
                  top: `calc(50% + ${tile.top}px)`,
                }}
                draggable={false}
              />
            ))}

            <div className="absolute left-4 top-4 z-20 flex overflow-hidden rounded-lg bg-white shadow-lg">
              <button
                type="button"
                onClick={() => setZoom((currentZoom) => Math.min(12, currentZoom + 1))}
                className="grid h-11 w-11 place-items-center border-r border-slate-200 text-xl font-black text-lake transition hover:bg-sand"
                title="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoom((currentZoom) => Math.max(2, currentZoom - 1))}
                className="grid h-11 w-11 place-items-center text-xl font-black text-lake transition hover:bg-sand"
                title="Zoom out"
              >
                -
              </button>
            </div>

            <div className="absolute right-4 top-4 z-20 rounded-lg bg-white/95 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 shadow-lg">
              Zoom {zoom}
            </div>

            {markers.map(({ entry, pixel }) => {
              const left = pixel.x - centerPixel.x;
              const top = pixel.y - centerPixel.y;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(entry.id);
                    setDetailId(entry.id);
                  }}
                  className={`real-map-pin ${selectedEntry?.id === entry.id ? 'is-active' : ''}`}
                  style={{
                    left: `calc(50% + ${left}px)`,
                    top: `calc(50% + ${top}px)`,
                  }}
                  title={entry.location}
                >
                  <span className="sr-only">{entry.location}</span>
                </button>
              );
            })}

            <div className="absolute bottom-3 right-3 z-20 rounded-md bg-white/90 px-2 py-1 text-[0.65rem] font-bold text-slate-500 shadow">
              Map data OpenStreetMap
            </div>
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
              <button
                type="button"
                onClick={() => setDetailId(selectedEntry.id)}
                className="mt-5 w-full rounded-lg bg-lake px-5 py-3 font-black text-white shadow-lg shadow-lake/20 transition hover:bg-lake/90"
              >
                View reviews and nearby spots
              </button>
            </div>
          ) : (
            <p className="mt-4 font-semibold text-slate-500">Add a journal entry to place your first pin.</p>
          )}
        </aside>
      </section>

      {detailEntry && (
        <MemoryDetail
          entry={detailEntry}
          currentUser={currentUser}
          onClose={() => setDetailId(null)}
          onAddReview={onAddReview}
        />
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => {
              setSelectedId(entry.id);
              setDetailId(entry.id);
            }}
            className={`postcard-card text-left transition ${
              selectedEntry?.id === entry.id ? 'ring-4 ring-rust/20' : 'hover:-translate-y-1'
            }`}
          >
            <p className="text-sm font-black uppercase tracking-[0.18em] text-moss">{entry.mood}</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">{entry.location}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{entry.story}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-slate-500">
              <span className="rounded-md bg-sand px-2 py-1">{(entry.reviews ?? []).length} reviews</span>
              <span className="rounded-md bg-sand px-2 py-1">{(entry.landmarks ?? []).length} landmarks</span>
              <span className="rounded-md bg-sand px-2 py-1">{(entry.restaurants ?? []).length} eats</span>
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}

const tileSize = 256;

function projectLatLng(lat: number, lng: number, zoom: number) {
  const sinLat = Math.sin((clamp(lat, -85.05112878, 85.05112878) * Math.PI) / 180);
  const scale = tileSize * 2 ** zoom;

  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

function buildTiles(centerPixel: { x: number; y: number }, zoom: number) {
  const centerTileX = Math.floor(centerPixel.x / tileSize);
  const centerTileY = Math.floor(centerPixel.y / tileSize);
  const maxTile = 2 ** zoom;
  const tiles = [];

  for (let xOffset = -3; xOffset <= 3; xOffset += 1) {
    for (let yOffset = -3; yOffset <= 3; yOffset += 1) {
      const x = centerTileX + xOffset;
      const y = centerTileY + yOffset;

      if (y < 0 || y >= maxTile) continue;

      tiles.push({
        x,
        wrappedX: ((x % maxTile) + maxTile) % maxTile,
        y,
        z: zoom,
        left: x * tileSize - centerPixel.x,
        top: y * tileSize - centerPixel.y,
      });
    }
  }

  return tiles;
}

function getEntriesCenter(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return { lat: 20, lng: 0 };
  }

  return {
    lat: entries.reduce((sum, entry) => sum + entry.coordinates.lat, 0) / entries.length,
    lng: entries.reduce((sum, entry) => sum + entry.coordinates.lng, 0) / entries.length,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
