import { useEffect, type ReactNode } from 'react';
import { AlertTriangle, Info, Loader2, RefreshCw, CheckCircle2, FlaskConical } from 'lucide-react';
import { useApp } from '@/lib/store';

export function Card({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      data-testid={id}
      className={`rounded-xl border border-card-border bg-card p-5 shadow-[var(--shadow-sm)] ${className}`}
    >
      {children}
    </section>
  );
}

export function CardTitle({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold leading-tight">{children}</h2>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
    </div>
  );
}

export function Pill({
  children,
  tone = 'blue',
}: {
  children: ReactNode;
  tone?: 'blue' | 'violet' | 'amber' | 'muted';
}) {
  const c = {
    blue: 'bg-primary/10 text-primary',
    violet: 'bg-violet/10 text-violet',
    amber: 'bg-amber/10 text-amber',
    muted: 'bg-muted text-muted-foreground',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${c}`}>
      {children}
    </span>
  );
}

export function Bar({
  value,
  max = 100,
  tone = 'blue',
  label,
}: {
  value: number;
  max?: number;
  tone?: 'blue' | 'violet' | 'amber';
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bg = { blue: 'bg-primary', violet: 'bg-violet', amber: 'bg-amber' }[tone];
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className={`h-full rounded-full ${bg} transition-transform duration-500 ease-out origin-left`}
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}

export function Disclaimer() {
  const { t } = useApp();
  return (
    <aside
      data-testid="banner-disclaimer"
      className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div>
        <p className="font-semibold">{t('disclaimerTitle')}</p>
        <p className="mt-1 text-muted-foreground">{t('disclaimer1')}</p>
        <p className="text-muted-foreground">{t('disclaimer2')}</p>
      </div>
    </aside>
  );
}

export function SegButton({
  active,
  onClick,
  children,
  testid,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  testid: string;
}) {
  return (
    <button
      type="button"
      data-testid={testid}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all active:scale-95 ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted text-foreground hover:bg-secondary'
      }`}
    >
      {children}
    </button>
  );
}

export function Btn({
  children,
  onClick,
  testid,
  icon,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  testid: string;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      data-testid={testid}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-semibold transition-all hover:border-primary hover:text-primary active:scale-95 disabled:pointer-events-none disabled:opacity-40"
    >
      {icon}
      {children}
    </button>
  );
}

export function ScenarioControls() {
  const { t, scenario, setScenario, years, setYears } = useApp();
  return (
    <Card id="card-scenario">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold">{t('scenario')}</p>
          <div className="flex gap-2" role="group" aria-label={t('scenario')}>
            <SegButton testid="button-scenario-moderate" active={scenario === 'moderate'} onClick={() => setScenario('moderate')}>
              {t('moderate')}
            </SegButton>
            <SegButton testid="button-scenario-fast" active={scenario === 'fast'} onClick={() => setScenario('fast')}>
              {t('fast')}
            </SegButton>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t(scenario === 'fast' ? 'fastDesc' : 'moderateDesc')}</p>
        </div>
        <div>
          <label htmlFor="years" className="mb-2 flex items-baseline justify-between text-sm font-semibold">
            <span>{t('horizon')}</span>
            <span className="num text-primary">
              {years} {t('yearsUnit')}
            </span>
          </label>
          <input
            id="years"
            data-testid="input-years"
            type="range"
            min={0}
            max={20}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full"
          />
          <div className="num flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>10</span>
            <span>20</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function StatusPill() {
  const { t, status, retry } = useApp();
  if (status === 'loading')
    return (
      <span data-testid="status-eval" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        {t('recalculating')}
      </span>
    );
  if (status === 'error')
    return (
      <span data-testid="status-eval" className="inline-flex items-center gap-2 text-xs font-semibold text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
        {t('errorTitle')}
        <button type="button" data-testid="button-retry-status" onClick={retry} className="underline">
          {t('retry')}
        </button>
      </span>
    );
  if (status === 'ready')
    return (
      <span data-testid="status-eval" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden />
        {t('upToDate')}
      </span>
    );
  return null;
}

export function HypoBadge() {
  const { t } = useApp();
  return (
    <Pill tone="violet">
      <FlaskConical className="h-3 w-3" aria-hidden />
      {t('hypothetical')}
    </Pill>
  );
}

export function Skeleton() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <div className="skel h-28" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skel h-64" />
        <div className="skel h-64" />
      </div>
    </div>
  );
}

export function ErrorBox({ title, onRetry }: { title: string; onRetry: () => void }) {
  const { t } = useApp();
  return (
    <Card id="card-error" className="border-destructive/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" aria-hidden />
        <div>
          <p className="font-bold">{title}</p>
          <button
            type="button"
            data-testid="button-retry"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground active:scale-95"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            {t('retry')}
          </button>
        </div>
      </div>
    </Card>
  );
}

export function Page({
  title,
  lead,
  children,
  needsResult = true,
  showDisclaimer = true,
}: {
  title: string;
  lead: string;
  children: ReactNode;
  needsResult?: boolean;
  showDisclaimer?: boolean;
}) {
  const { t, catalog, catalogError, refetchCatalog, result, status, retry } = useApp();
  useEffect(() => {
    document.title = `${title} | SkillHalfLife`;
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      document.querySelector(selector)?.setAttribute('content', lead);
    }
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      document.querySelector(selector)?.setAttribute('content', document.title);
    }
  }, [title, lead]);
  let body: ReactNode;
  if (!catalog) {
    body = catalogError ? (
      <ErrorBox title={t('errorCatalog')} onRetry={refetchCatalog} />
    ) : (
      <div aria-label={t('loading')}>
        <Skeleton />
      </div>
    );
  } else if (needsResult && !result) {
    body =
      status === 'error' ? <ErrorBox title={t('errorTitle')} onRetry={retry} /> : <Skeleton />;
  } else {
    body = (
      <>
        {needsResult && status === 'error' && <ErrorBox title={t('errorTitle')} onRetry={retry} />}
        {children}
      </>
    );
  }
  return (
    <div className="rise mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h1 data-testid="text-page-title" className="text-3xl font-bold leading-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-muted-foreground">{lead}</p>
        </div>
        {needsResult && <StatusPill />}
      </header>
      {showDisclaimer && <Disclaimer />}
      {body}
    </div>
  );
}
