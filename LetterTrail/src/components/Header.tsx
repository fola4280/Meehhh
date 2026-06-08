import type { UserProfile } from '../types';

type View = 'dashboard' | 'profiles' | 'journal' | 'map';

interface HeaderProps {
  activeView: View;
  onChangeView: (view: View) => void;
  currentUser: UserProfile;
}

const navItems: Array<{ id: View; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LT' },
  { id: 'profiles', label: 'Penpals', icon: 'PP' },
  { id: 'journal', label: 'Journal', icon: 'JR' },
  { id: 'map', label: 'Map', icon: 'MP' },
];

export default function Header({ activeView, onChangeView, currentUser }: HeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-lg border border-white/70 bg-white/75 p-4 shadow-soft backdrop-blur md:p-6">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(199,91,61,0.12),rgba(53,93,133,0.08),rgba(107,139,127,0.14))]" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-lake text-lg font-black text-white shadow-lg shadow-lake/25">
            LT
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rust">
              LetterTrail
            </p>
            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
              Letters, places, and people worth remembering.
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <nav className="grid grid-cols-4 gap-2 rounded-lg bg-sand/80 p-2 shadow-inner">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className={`group flex min-h-12 flex-col items-center justify-center rounded-lg px-3 text-xs font-bold transition duration-300 sm:min-w-20 ${
                  activeView === item.id
                    ? 'bg-white text-lake shadow-md'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-950'
                }`}
                aria-current={activeView === item.id ? 'page' : undefined}
                title={item.label}
              >
                <span className="text-[0.65rem] tracking-wider">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 rounded-lg bg-white/80 p-2 pr-4 shadow-sm">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">{currentUser.name}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{currentUser.city}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
