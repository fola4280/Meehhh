import { useMemo, useState } from 'react';
import type {
  ChatMessage,
  JournalEntry,
  MemoryReview,
  PenpalRequest,
  PostOfficeAgreement,
  UserProfile,
} from './types';
import { initialJournalEntries, initialUsers } from './data';
import { useLocalStorage } from './hooks';
import { buildMatches } from './utils/matching';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Profiles from './components/Profiles';
import Journal from './components/Journal';
import MapView from './components/MapView';
import ProfileEditor from './components/ProfileEditor';
import Mailbox from './components/Mailbox';

const defaultCurrentUser: UserProfile = {
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
  vibeProfile: {
    travelTempo: 'Slow wandering',
    letterStyle: 'Long reflective letters',
    socialEnergy: 'Quiet corners',
    planningStyle: 'Loose outline',
    exchangeStyle: 'Deep stories',
  },
};

type View = 'dashboard' | 'profiles' | 'mailbox' | 'journal' | 'map' | 'profile';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [mailboxFocusUserId, setMailboxFocusUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useLocalStorage<UserProfile>(
    'lettertrail-current-user',
    defaultCurrentUser
  );
  const [users] = useLocalStorage<UserProfile[]>('lettertrail-users', initialUsers);
  const [requests, setRequests] = useLocalStorage<PenpalRequest[]>('lettertrail-requests', []);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('lettertrail-journal', initialJournalEntries);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('lettertrail-messages', []);
  const [postOfficeAgreements, setPostOfficeAgreements] = useLocalStorage<PostOfficeAgreement[]>(
    'lettertrail-post-offices',
    []
  );

  const hydratedJournalEntries = useMemo(
    () => journalEntries.map((entry) => enrichJournalEntry(entry)),
    [journalEntries]
  );

  const pendingRequests = useMemo(
    () => requests.filter((request) => !request.accepted),
    [requests]
  );

  const matchedSuggestions = useMemo(
    () =>
      buildMatches(currentUser, users),
    [currentUser, users]
  );

  const handleSendRequest = (userId: string) => {
    if (requests.some((req) => req.userId === userId)) return;
    setRequests([...requests, { userId, accepted: false, sentAt: new Date().toISOString() }]);
  };

  const handleUnsendRequest = (userId: string) => {
    setRequests(requests.filter((request) => request.userId !== userId || request.accepted));
  };

  const handleUnmatch = (userId: string) => {
    setRequests(requests.filter((request) => request.userId !== userId));
    setMessages(messages.filter((message) => message.userId !== userId));
    setPostOfficeAgreements(
      postOfficeAgreements.filter((agreement) => agreement.userId !== userId)
    );
    if (mailboxFocusUserId === userId) {
      setMailboxFocusUserId(null);
    }
  };

  const handleOpenMailbox = (userId: string) => {
    setMailboxFocusUserId(userId);
    setView('mailbox');
  };

  const handleAcceptRequest = (userId: string) => {
    setRequests(
      requests.map((request) =>
        request.userId === userId ? { ...request, accepted: true } : request
      )
    );
  };

  const handleAddReview = (entryId: string, review: MemoryReview) => {
    setJournalEntries(
      journalEntries.map((entry) => {
        if (entry.id !== entryId) return entry;

        const hydratedEntry = enrichJournalEntry(entry);
        return { ...hydratedEntry, reviews: [review, ...(hydratedEntry.reviews ?? [])] };
      })
    );
  };

  const handleSendMessage = (userId: string, text: string) => {
    setMessages([
      ...messages,
      {
        id: crypto.randomUUID(),
        userId,
        authorId: currentUser.id,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleProposePostOffice = (agreement: PostOfficeAgreement) => {
    setPostOfficeAgreements([
      ...postOfficeAgreements.filter((item) => item.userId !== agreement.userId),
      agreement,
    ]);
  };

  const handleUpdatePostOfficeStatus = (
    userId: string,
    status: PostOfficeAgreement['status']
  ) => {
    setPostOfficeAgreements(
      postOfficeAgreements.map((agreement) =>
        agreement.userId === userId
          ? { ...agreement, status, updatedAt: new Date().toISOString() }
          : agreement
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
              journalEntries={hydratedJournalEntries}
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
              onUnsendRequest={handleUnsendRequest}
              onUnmatch={handleUnmatch}
              onOpenMailbox={handleOpenMailbox}
              matchedSuggestions={matchedSuggestions}
            />
          )}
          {view === 'mailbox' && (
            <Mailbox
              currentUser={currentUser}
              users={users}
              requests={requests}
              focusUserId={mailboxFocusUserId}
              messages={messages}
              agreements={postOfficeAgreements}
              onSendMessage={handleSendMessage}
              onProposePostOffice={handleProposePostOffice}
              onUpdatePostOfficeStatus={handleUpdatePostOfficeStatus}
              onUnmatch={handleUnmatch}
            />
          )}
          {view === 'journal' && (
            <Journal
              entries={hydratedJournalEntries}
              currentUser={currentUser}
              onAddEntry={setJournalEntries}
              onAddReview={handleAddReview}
            />
          )}
          {view === 'map' && (
            <MapView
              entries={hydratedJournalEntries}
              currentUser={currentUser}
              onAddReview={handleAddReview}
            />
          )}
          {view === 'profile' && (
            <ProfileEditor currentUser={currentUser} onSaveProfile={setCurrentUser} />
          )}
        </div>
      </div>
    </div>
  );
}

function enrichJournalEntry(entry: JournalEntry): JournalEntry {
  const seededEntry = initialJournalEntries.find(
    (item) => item.id === entry.id || item.location === entry.location
  );

  return {
    ...entry,
    galleryPhotos: entry.galleryPhotos ?? seededEntry?.galleryPhotos ?? [],
    reviews: entry.reviews ?? seededEntry?.reviews ?? [],
    landmarks: entry.landmarks ?? seededEntry?.landmarks ?? [],
    restaurants: entry.restaurants ?? seededEntry?.restaurants ?? [],
  };
}

export default App;
