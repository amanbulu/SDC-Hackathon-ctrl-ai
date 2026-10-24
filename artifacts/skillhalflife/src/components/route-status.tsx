import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/lib/store';

export function RouteLoading() {
  const { lang } = useApp();
  return (
    <div role="status" aria-live="polite" className="flex min-h-48 items-center justify-center gap-3 p-6" data-testid="route-loading">
      <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden />
      <p>{lang === 'ms' ? 'Memuatkan bahagian…' : 'Loading section…'}</p>
    </div>
  );
}

export function RouteLoadError() {
  const { lang, t } = useApp();
  return (
    <section role="alert" className="rounded-xl border border-border bg-card p-6" data-testid="route-load-error">
      <h1 className="text-xl font-bold">
        {lang === 'ms' ? 'Bahagian ini tidak dapat dibuka' : 'This section could not be opened'}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {lang === 'ms'
          ? 'Semak sambungan internet anda dan muat semula halaman, atau buka bahagian lain melalui navigasi. Tetapan yang disimpan akan dikekalkan.'
          : 'Check your connection and reload the page, or open another section using navigation. Saved settings will be kept.'}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {/* React.lazy and browsers can cache rejected module imports. A deliberate
            reload reliably retries the download, including after a new release,
            without automatic reload loops on an unreliable connection. */}
        <button type="button" onClick={() => window.location.reload()} data-testid="button-reload-section"
          className="min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {lang === 'ms' ? 'Muat semula halaman' : 'Reload page'}
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">
          {t('nav.overview')}
        </Link>
      </div>
    </section>
  );
}
