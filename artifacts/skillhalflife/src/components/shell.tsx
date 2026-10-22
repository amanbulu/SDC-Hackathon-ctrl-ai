import { type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  TrendingDown,
  Radar,
  Briefcase,
  Route as RouteIcon,
  Globe2,
  FlaskConical,
  BookMarked,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

const NAV = [
  { href: '/', key: 'overview', icon: LayoutDashboard },
  { href: '/half-life', key: 'half-life', icon: TrendingDown },
  { href: '/radar', key: 'radar', icon: Radar },
  { href: '/careers', key: 'careers', icon: Briefcase },
  { href: '/pathway', key: 'pathway', icon: RouteIcon },
  { href: '/sdg', key: 'sdg', icon: Globe2 },
  { href: '/lab', key: 'lab', icon: FlaskConical },
  { href: '/sources', key: 'sources', icon: BookMarked },
];

export function Shell({ children }: { children: ReactNode }) {
  const { t, lang, setLang, resetAll } = useApp();
  const [loc] = useLocation();
  const { toast } = useToast();
  const active = (h: string) => (h === '/' ? loc === '/' : loc.startsWith(h));

  const langToggle = (
    <div className="flex rounded-lg bg-sidebar-accent p-0.5" role="group" aria-label={t('language')}>
      {(['en', 'ms'] as const).map((l) => (
        <button
          key={l}
          type="button"
          data-testid={`button-lang-${l}`}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`rounded-md px-3 py-1 text-xs font-bold uppercase transition-all ${
            lang === l ? 'bg-sidebar-primary text-white' : 'text-sidebar-foreground hover:text-white'
          }`}
        >
          {l === 'en' ? 'EN' : 'BM'}
        </button>
      ))}
    </div>
  );

  const reset = (
    <button
      type="button"
      data-testid="button-reset-all"
      onClick={() => {
        resetAll();
        toast({ title: t('resetDone') });
      }}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-white"
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
      {t('resetAll')}
    </button>
  );

  return (
    <div className="min-h-[100dvh] md:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t('skipContent')}
      </a>
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:sticky md:top-0 md:flex md:h-[100dvh]">
        <div className="px-2 pb-6 pt-2">
          <div className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
              <circle cx="16" cy="16" r="14" fill="none" stroke="hsl(221 85% 62%)" strokeWidth="2.5" />
              <path d="M16 2 A14 14 0 0 1 16 30 Z" fill="hsl(258 70% 68%)" />
            </svg>
            <span className="font-display text-xl font-bold text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
              {t('appName')}
            </span>
          </div>
          <p className="mt-2 text-xs leading-snug text-sidebar-foreground/70">{t('tagline')}</p>
        </div>
        <nav aria-label={t('menu')} className="flex flex-1 flex-col gap-0.5">
          {NAV.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              data-testid={`link-nav-${key}`}
              aria-current={active(href) ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                active(href)
                  ? 'bg-sidebar-accent text-white shadow-[inset_3px_0_0_hsl(var(--sidebar-primary))]'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2 border-t border-sidebar-border pt-3">
          {langToggle}
          {reset}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between bg-sidebar px-4 py-2.5">
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--app-font-display)' }}>
              {t('appName')}
            </span>
            <div className="flex items-center gap-2">
              {langToggle}
              <button
                type="button"
                data-testid="button-reset-all-mobile"
                aria-label={t('resetAll')}
                onClick={() => {
                  resetAll();
                  toast({ title: t('resetDone') });
                }}
                className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <nav aria-label={t('menu')} className="flex gap-1 overflow-x-auto px-2 py-2">
            {NAV.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                data-testid={`link-mnav-${key}`}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  active(href) ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {t(`nav.${key}`)}
              </Link>
            ))}
          </nav>
        </header>
        <main id="main" className="px-4 py-6 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
