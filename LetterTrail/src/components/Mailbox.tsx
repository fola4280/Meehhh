import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ChatMessage, PenpalRequest, PostOfficeAgreement, UserProfile } from '../types';

interface MailboxProps {
  currentUser: UserProfile;
  users: UserProfile[];
  requests: PenpalRequest[];
  focusUserId: string | null;
  messages: ChatMessage[];
  agreements: PostOfficeAgreement[];
  onSendMessage: (userId: string, text: string) => void;
  onProposePostOffice: (agreement: PostOfficeAgreement) => void;
  onUpdatePostOfficeStatus: (userId: string, status: PostOfficeAgreement['status']) => void;
  onUnmatch: (userId: string) => void;
}

const suggestedPostOffices = [
  {
    name: 'Central City Post Office',
    address: '120 Market Street, Downtown',
  },
  {
    name: 'Riverside Postal Counter',
    address: '44 River Walk, Near Station Square',
  },
  {
    name: 'Museum District Mail Desk',
    address: '8 Archive Lane, Civic Quarter',
  },
];

export default function Mailbox({
  currentUser,
  users,
  requests,
  focusUserId,
  messages,
  agreements,
  onSendMessage,
  onProposePostOffice,
  onUpdatePostOfficeStatus,
  onUnmatch,
}: MailboxProps) {
  const acceptedRequests = requests.filter((request) => request.accepted);
  const pendingRequests = requests.filter((request) => !request.accepted);
  const firstConnectionId = acceptedRequests[0]?.userId ?? '';
  const [selectedUserId, setSelectedUserId] = useState(firstConnectionId);

  useEffect(() => {
    if (focusUserId && acceptedRequests.some((request) => request.userId === focusUserId)) {
      setSelectedUserId(focusUserId);
    }
  }, [acceptedRequests, focusUserId]);

  const selectedUser = acceptedRequests.some((request) => request.userId === selectedUserId)
    ? users.find((user) => user.id === selectedUserId)
    : undefined;
  const selectedMessages = useMemo(
    () => messages.filter((message) => message.userId === selectedUserId),
    [messages, selectedUserId]
  );
  const agreement = agreements.find((item) => item.userId === selectedUserId);

  return (
    <main className="space-y-6">
      <section className="rounded-lg border border-white/70 bg-white/80 p-6 shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-rust">Private mailbox</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Chat after trust is mutual.</h2>
        <p className="mt-3 max-w-3xl leading-8 text-slate-600">
          Chats unlock only after a penpal request is accepted. When you are ready to exchange
          physical letters, agree on a neutral post office or pickup counter instead of sharing a
          home address.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-soft">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-moss">Connections</p>
            <div className="mt-4 space-y-2">
              {acceptedRequests.length === 0 ? (
                <EmptyState text="No accepted penpals yet. Send or accept a request to unlock chat." />
              ) : (
                acceptedRequests.map((request) => {
                  const user = users.find((item) => item.id === request.userId);
                  if (!user) return null;

                  return (
                    <button
                      key={request.userId}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                        selectedUserId === user.id ? 'bg-lake text-white' : 'bg-sand/70 hover:bg-white'
                      }`}
                    >
                      <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-black">{user.name}</p>
                        <p className={`truncate text-sm font-semibold ${selectedUserId === user.id ? 'text-white/75' : 'text-slate-500'}`}>
                          Chat unlocked
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-soft">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-rust">Pending</p>
            <div className="mt-4 space-y-2">
              {pendingRequests.length === 0 ? (
                <EmptyState text="No pending requests." />
              ) : (
                pendingRequests.map((request) => {
                  const user = users.find((item) => item.id === request.userId);
                  return (
                    <div key={request.userId} className="rounded-lg bg-sand/70 p-3">
                      <p className="font-black text-slate-950">{user?.name ?? request.userId}</p>
                      <p className="text-sm font-semibold text-slate-500">Waiting for mutual acceptance</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {selectedUser ? (
          <section className="grid gap-6 2xl:grid-cols-[1fr_360px]">
            <ChatPanel
              currentUser={currentUser}
              user={selectedUser}
              messages={selectedMessages}
              onSendMessage={onSendMessage}
              onUnmatch={onUnmatch}
            />
            <PostOfficePanel
              currentUser={currentUser}
              user={selectedUser}
              agreement={agreement}
              onProposePostOffice={onProposePostOffice}
              onUpdatePostOfficeStatus={onUpdatePostOfficeStatus}
            />
          </section>
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-soft">
            <h2 className="text-2xl font-black text-slate-950">No chat selected</h2>
            <p className="mt-2 font-semibold text-slate-500">
              Accepted penpals will appear here with privacy-first chat and post office planning.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}

function ChatPanel({
  currentUser,
  user,
  messages,
  onSendMessage,
  onUnmatch,
}: {
  currentUser: UserProfile;
  user: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (userId: string, text: string) => void;
  onUnmatch: (userId: string) => void;
}) {
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    onSendMessage(user.id, trimmedMessage);
    setMessage('');
  };

  return (
    <div className="rounded-lg border border-white/70 bg-white/85 p-4 shadow-soft">
      <div className="flex items-center gap-3 border-b border-dashed border-slate-300 pb-4">
        <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-black text-slate-950">{user.name}</p>
          <p className="text-sm font-semibold text-slate-500">{user.city}</p>
        </div>
        <button
          type="button"
          onClick={() => onUnmatch(user.id)}
          className="rounded-lg bg-rust/10 px-4 py-2 text-sm font-black text-rust transition hover:bg-rust hover:text-white"
        >
          Unmatch
        </button>
      </div>

      <div className="mt-4 max-h-[430px] min-h-[320px] space-y-3 overflow-y-auto rounded-lg bg-sand/60 p-4">
        {messages.length === 0 ? (
          <EmptyState text="Start with a gentle hello. Keep personal addresses out of chat." />
        ) : (
          messages.map((item) => {
            const mine = item.authorId === currentUser.id;
            return (
              <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm ${mine ? 'bg-lake text-white' : 'bg-white text-slate-700'}`}>
                  <p className="leading-7">{item.text}</p>
                  <p className={`mt-2 text-xs font-bold ${mine ? 'text-white/65' : 'text-slate-400'}`}>
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write a note..."
          className="input"
        />
        <button type="submit" className="rounded-lg bg-rust px-6 py-3 font-black text-white shadow-sm transition hover:bg-rust/90">
          Send
        </button>
      </form>
    </div>
  );
}

function PostOfficePanel({
  currentUser,
  user,
  agreement,
  onProposePostOffice,
  onUpdatePostOfficeStatus,
}: {
  currentUser: UserProfile;
  user: UserProfile;
  agreement?: PostOfficeAgreement;
  onProposePostOffice: (agreement: PostOfficeAgreement) => void;
  onUpdatePostOfficeStatus: (userId: string, status: PostOfficeAgreement['status']) => void;
}) {
  const [selectedOffice, setSelectedOffice] = useState(suggestedPostOffices[0].name);
  const [customAddress, setCustomAddress] = useState('');
  const office = suggestedPostOffices.find((item) => item.name === selectedOffice) ?? suggestedPostOffices[0];

  const handlePropose = () => {
    onProposePostOffice({
      userId: user.id,
      name: office.name,
      address: customAddress.trim() || office.address,
      proposedBy: currentUser.id,
      status: 'proposed',
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <aside className="rounded-lg border border-white/70 bg-white/85 p-5 shadow-soft">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-moss">Privacy exchange</p>
      <h3 className="mt-2 text-2xl font-black text-slate-950">Mutual post office</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Agree on a public pickup point before mailing anything. LetterTrail never needs a home
        address for this workflow.
      </p>

      {agreement && (
        <div className="mt-5 rounded-lg border border-dashed border-lake/30 bg-lake/10 p-4">
          <p className="font-black text-slate-950">{agreement.name}</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">{agreement.address}</p>
          <p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-lake">
            {agreement.status.replace('-', ' ')}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Updated {new Date(agreement.updatedAt).toLocaleDateString()}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdatePostOfficeStatus(user.id, 'accepted')}
              className="rounded-lg bg-moss px-3 py-2 text-sm font-black text-white transition hover:bg-moss/90"
            >
              Agree
            </button>
            <button
              type="button"
              onClick={() => onUpdatePostOfficeStatus(user.id, 'needs-change')}
              className="rounded-lg bg-sand px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-rust/10"
            >
              Change
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-black text-slate-600">Suggested neutral point</span>
          <select
            value={selectedOffice}
            onChange={(event) => setSelectedOffice(event.target.value)}
            className="input mt-2"
          >
            {suggestedPostOffices.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-black text-slate-600">Address or pickup note</span>
          <textarea
            value={customAddress}
            onChange={(event) => setCustomAddress(event.target.value)}
            rows={3}
            placeholder={office.address}
            className="input mt-2 resize-none leading-7"
          />
        </label>
        <button
          type="button"
          onClick={handlePropose}
          className="w-full rounded-lg bg-lake px-5 py-3 font-black text-white shadow-lg shadow-lake/20 transition hover:bg-lake/90"
        >
          Propose post office
        </button>
      </div>
    </aside>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 bg-sand/60 p-4 text-sm font-semibold text-slate-500">
      {text}
    </p>
  );
}
