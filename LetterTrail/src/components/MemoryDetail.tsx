import { FormEvent, useMemo, useState } from 'react';
import type { JournalEntry, MemoryReview, NearbyPlace, UserProfile } from '../types';

interface MemoryDetailProps {
  entry: JournalEntry;
  currentUser: UserProfile;
  onClose: () => void;
  onAddReview: (entryId: string, review: MemoryReview) => void;
}

type DetailTab = 'reviews' | 'photos' | 'landmarks' | 'restaurants';

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: 'reviews', label: 'Reviews' },
  { id: 'photos', label: 'Photos' },
  { id: 'landmarks', label: 'Landmarks' },
  { id: 'restaurants', label: 'Restaurants' },
];

export default function MemoryDetail({ entry, currentUser, onClose, onAddReview }: MemoryDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('reviews');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const photos = useMemo(() => [entry.photo, ...(entry.galleryPhotos ?? [])], [entry]);
  const reviews = entry.reviews ?? [];
  const landmarks = entry.landmarks ?? [];
  const restaurants = entry.restaurants ?? [];

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedReview = reviewText.trim();

    if (!trimmedReview) return;

    onAddReview(entry.id, {
      id: crypto.randomUUID(),
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      rating,
      text: trimmedReview,
      createdAt: new Date().toISOString(),
    });
    setReviewText('');
    setRating(5);
    setActiveTab('reviews');
  };

  return (
    <section className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-soft md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        <img
          src={entry.photo}
          alt={entry.location}
          className="h-72 w-full rounded-lg object-cover lg:w-80"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-rust">
                Memory details
              </p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">{entry.location}</h2>
              <p className="mt-1 text-sm font-bold text-moss">
                {entry.mood} / {new Date(`${entry.date}T00:00:00`).toLocaleDateString()}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-sand px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-rust/10 hover:text-rust"
            >
              Close
            </button>
          </div>
          <p className="mt-4 leading-8 text-slate-600">{entry.story}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Metric label="Reviews" value={reviews.length.toString()} />
            <Metric label="Photos" value={photos.length.toString()} />
            <Metric label="Landmarks" value={landmarks.length.toString()} />
            <Metric label="Eats" value={restaurants.length.toString()} />
          </div>
        </div>
      </div>

      <nav className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-sand/80 p-2 md:grid-cols-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-3 text-sm font-black transition ${
              activeTab === tab.id ? 'bg-white text-lake shadow-sm' : 'text-slate-500 hover:bg-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-5">
        {activeTab === 'reviews' && (
          <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <EmptyState text="No reviews yet. Be the first app user to leave a note." />
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-lg border border-slate-200 bg-sand/60 p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.authorAvatar}
                        alt={review.authorName}
                        className="h-11 w-11 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-black text-slate-950">{review.authorName}</p>
                        <p className="text-sm font-bold text-rust">
                          {stars(review.rating)} / {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 leading-7 text-slate-600">{review.text}</p>
                  </article>
                ))
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="rounded-lg border border-dashed border-lake/30 bg-white/75 p-4">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-lake">Add review</p>
              <label className="mt-4 block">
                <span className="text-sm font-black text-slate-600">Rating</span>
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  className="input mt-2"
                >
                  {[5, 4, 3, 2, 1].map((item) => (
                    <option key={item} value={item}>
                      {stars(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-black text-slate-600">Review</span>
                <textarea
                  required
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  rows={5}
                  placeholder="Share what another traveler should know..."
                  className="input mt-2 resize-none leading-7"
                />
              </label>
              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-rust px-5 py-3 font-black text-white shadow-lg shadow-rust/20 transition hover:bg-rust/90"
              >
                Post review
              </button>
            </form>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {photos.map((photo, index) => (
              <img
                key={`${photo}-${index}`}
                src={photo}
                alt={`${entry.location} gallery ${index + 1}`}
                className="h-56 w-full rounded-lg object-cover shadow-md"
              />
            ))}
          </div>
        )}

        {activeTab === 'landmarks' && (
          <PlaceGrid items={landmarks} emptyText="No landmarks have been added near this memory yet." />
        )}

        {activeTab === 'restaurants' && (
          <PlaceGrid items={restaurants} emptyText="No nearby restaurants have been added yet." />
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-sand/70 p-3">
      <p className="text-2xl font-black text-lake">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    </div>
  );
}

function PlaceGrid({ items, emptyText }: { items: NearbyPlace[]; emptyText: string }) {
  if (items.length === 0) {
    return <EmptyState text={emptyText} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.id} className="postcard-card">
          <img src={item.photo} alt={item.name} className="h-40 w-full rounded-lg object-cover" />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-moss">{item.type}</p>
              <h3 className="mt-1 text-xl font-black text-slate-950">{item.name}</h3>
            </div>
            <span className="rounded-md bg-rust/10 px-2 py-1 text-sm font-black text-rust">
              {item.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-500">{item.distance} away</p>
          <p className="mt-3 leading-7 text-slate-600">{item.note}</p>
        </article>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 bg-sand/60 p-5 text-sm font-semibold text-slate-500">
      {text}
    </p>
  );
}

function stars(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}
