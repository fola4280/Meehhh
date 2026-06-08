import { useMemo, useState } from 'react';
import type { JournalEntry, PenpalRequest, UserProfile } from './types';
import { initialJournalEntries, initialUsers } from './data';
import { useLocalStorage } from './hooks';
import { buildMatches } from './utils/matching';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Profiles from './components/Profiles';
import Journal from './components/Journal';
import MapView from './components/MapView';

const currentUser: UserProfile = {
  id: 'lettertrail-user',
  name: 'Sora Wells',
  city: 'Portland, OR',
  country: 'United States',
  avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
  languages: ['English', 'Spanish', 'French'],
  interests: ['postcards', 'cafe hopping', 'museum sketches', 'nature trails'],
  bio: 'A travel writer who collects stamps, stories, and new penpals from every horizon.',
  matchingNotes: 'Yearns for travel letters that feel like a warm postcard on a rainy afternoon.',
  favoriteStamp: 'Rainy window',
  responseTime: '2 days',
};

function App() {
  const [view, setView] = useState<'dashboard' | 'profiles' | 'journal' | 'map'>('dashboard');
  const [users] = useLocalStorage<UserProfile[]>('lettertrail-users', initialUsers);
  const [requests, setRequests] = useLocalStorage<PenpalRequest[]>('lettertrail-requests', []);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('lettertrail-journal', initialJournalEntries);

  const pendingRequests = useMemo(
    () => requests.filter((request) => !request.accepted),
    [requests]
  );

  const matchedSuggestions = useMemo(
    () =>
      buildMatches(currentUser, users),
    [users]
  );

  const handleSendRequest = (userId: string) => {
    if (requests.some((req) => req.userId === userId)) return;
    setRequests([...requests, { userId, accepted: false, sentAt: new Date().toISOString() }]);
  };

  const handleAcceptRequest = (userId: string) => {
    setRequests(
      requests.map((request) =>
        request.userId === userId ? { ...request, accepted: true } : request
      )
    );
  };

  return (
    <div className="min-h-screen bg-parchment text-slate-900">
      <div className="fixed inset-0 -z-10 paper-noise" />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header activeView={view} onChangeView={setView} currentUser={currentUser} />

        <div className="mt-6 space-y-6">
          {view === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              pendingRequests={pendingRequests}
              journalEntries={journalEntries}
              matchedSuggestions={matchedSuggestions.slice(0, 3)}
              onAcceptRequest={handleAcceptRequest}
            />
          )}
          {view === 'profiles' && (
            <Profiles
              currentUser={currentUser}
              users={users}
              requests={requests}
              onSendRequest={handleSendRequest}
              matchedSuggestions={matchedSuggestions}
            />
          )}
          {view === 'journal' && (
            <Journal entries={journalEntries} onAddEntry={setJournalEntries} />
          )}
          {view === 'map' && (
            <MapView entries={journalEntries} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
