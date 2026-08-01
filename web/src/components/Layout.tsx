import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export type PageKey =
  | 'chat'
  | 'documents'
  | 'learning'
  | 'doubts'
  | 'revision-planner'
  | 'quiz'
  | 'pyq'
  | 'progress'
  | 'settings'
  | 'account'
  | 'usage';

interface NavItem {
  key: PageKey;
  label: string;
  icon: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'chat', label: 'Chat', icon: 'chat', to: '/chat' },
  { key: 'documents', label: 'Documents', icon: 'description', to: '/documents' },
  { key: 'learning', label: 'Learning', icon: 'menu_book', to: '/learning' },
  { key: 'doubts', label: 'Doubts', icon: 'psychology_alt', to: '/doubts' },
  { key: 'revision-planner', label: 'Revision Planner', icon: 'event_note', to: '/revision-planner' },
  { key: 'quiz', label: 'Quiz', icon: 'quiz', to: '/quiz' },
  { key: 'pyq', label: 'PYQ', icon: 'school', to: '/pyq' },
  { key: 'progress', label: 'Progress', icon: 'leaderboard', to: '/progress' },
];

const MOBILE_NAV_ITEMS: NavItem[] = [
  { key: 'chat', label: 'Chat', icon: 'chat', to: '/chat' },
  { key: 'documents', label: 'Docs', icon: 'description', to: '/documents' },
  { key: 'learning', label: 'Learn', icon: 'menu_book', to: '/learning' },
  { key: 'doubts', label: 'Doubts', icon: 'psychology_alt', to: '/doubts' },
  { key: 'pyq', label: 'PYQ', icon: 'school', to: '/pyq' },
  { key: 'account', label: 'Profile', icon: 'settings', to: '/account' },
];

interface LayoutProps {
  activePage: PageKey;
  children: ReactNode;
  /** Header title shown on the top bar (desktop). Defaults to app name. */
  title?: string;
  /** Optional search bar placeholder; omit to hide search box in header. */
  searchPlaceholder?: string;
}

export default function Layout({ activePage, children, title, searchPlaceholder }: LayoutProps) {
  const { currentUser } = useAuth();
  const avatarLetter = (currentUser?.displayName || currentUser?.email || 'U')
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex h-screen w-full bg-background text-on-background font-body-md text-body-md antialiased overflow-hidden">
      {/* SideNavBar (Desktop Only) */}
      <aside className="hidden md:flex flex-col bg-surface dark:bg-inverse-surface shadow-sm h-full w-64 z-40 shrink-0 py-margin-desktop px-4 border-r border-border fixed left-0 top-0">
        <div className="flex items-center gap-3 mb-stack-lg px-2">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold text-lg shadow-soft">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed">
              my_assistant
            </h1>
            <p className="font-label-sm text-label-sm text-text-muted">GATE CS Aspirant</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.key === activePage;
            return (
              <Link
                key={item.key}
                to={item.to}
                className={
                  active
                    ? 'flex items-center gap-3 px-3 py-2 text-primary dark:text-primary-fixed font-bold bg-secondary-container/10 dark:bg-secondary-container/20 rounded-lg transition-all duration-200 ease-in-out'
                    : 'flex items-center gap-3 px-3 py-2 text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-high dark:hover:bg-surface-variant rounded-lg transition-all duration-200 ease-in-out'
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-1">
          <Link
            to="/settings"
            className={
              activePage === 'settings'
                ? 'flex items-center gap-3 px-3 py-2 text-primary dark:text-primary-fixed font-bold bg-secondary-container/10 dark:bg-secondary-container/20 rounded-lg transition-all duration-200 ease-in-out'
                : 'flex items-center gap-3 px-3 py-2 text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-high dark:hover:bg-surface-variant rounded-lg transition-all duration-200 ease-in-out'
            }
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          <Link
            to="/account"
            className="flex items-center gap-3 px-2 py-2 mt-2 rounded-lg hover:bg-surface-container-high dark:hover:bg-surface-variant transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md truncate text-on-surface dark:text-inverse-on-surface">
                {currentUser?.displayName || currentUser?.email || 'Account'}
              </p>
              <p className="font-label-sm text-label-sm text-text-muted truncate">View profile</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden md:ml-64">
        {/* TopNavBar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-30 flex justify-between items-center px-gutter py-4 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-xl shadow-sm border-b border-border/50">
          <div className="flex items-center gap-4 md:hidden">
            <button className="p-2 text-on-surface-variant rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
              my_assistant
            </h2>
          </div>
          {title && (
            <h2 className="hidden md:block font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
              {title}
            </h2>
          )}
          {searchPlaceholder && (
            <div className="hidden md:flex flex-1 max-w-md mx-4 items-center">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md text-on-surface placeholder:text-text-muted transition-all"
                  placeholder={searchPlaceholder}
                  type="text"
                />
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all scale-95 active:scale-90">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link
              to="/account"
              className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-soft cursor-pointer text-primary font-bold text-sm"
            >
              {avatarLetter}
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pt-[80px] pb-20 md:pb-0">{children}</main>

        {/* Bottom Nav for Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface dark:bg-inverse-surface border-t border-border flex justify-around items-center h-16 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active =
              item.key === activePage || (item.key === 'account' && activePage === 'settings');
            return (
              <Link
                key={item.key}
                to={item.to}
                className={
                  active
                    ? 'flex flex-col items-center justify-center w-full h-full text-primary'
                    : 'flex flex-col items-center justify-center w-full h-full text-on-surface-variant hover:text-primary transition-colors'
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-label-sm text-[10px] mt-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

