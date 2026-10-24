import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Link } from 'wouter';
import { FileText, Upload, Trash2, RefreshCw, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardTitle, Pill, Skeleton } from '@/components/bits';
import { useApp } from '@/lib/store';
import { useCv, type CvDraft } from '@/lib/cv-context';
import { cs } from '@/lib/cv-strings';
import { translateInterest } from '@/lib/i18n';

const INTERESTS = ['software', 'cloud', 'social-impact', 'infrastructure', 'security', 'data', 'ai'] as const;
const EDU = ['unconfirmed', 'secondary', 'diploma', 'bachelor', 'postgraduate'] as const;
const SECTIONS = ['education', 'experience', 'projects', 'certifications', 'achievements'] as const;
const btn = 'inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-input bg-card px-4 py-1.5 text-sm font-semibold hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40';
const field = 'w-full rounded-lg border border-input bg-card px-3 py-2 text-sm min-h-[44px]';

export default function MyCv() {
  const { lang, catalog, catalogError, refetchCatalog, skillName } = useApp();
  const cv = useCv();
  const c = (k: string) => cs(lang, k);
  const { draft, confirmed, status, error } = cv;
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [ackFor, setAckFor] = useState<object | null>(null);
  const ack = !!draft && ackFor === draft.analysis;

  const pick = (f: File | undefined) => { if (f) void cv.upload(f); };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); };
  const patch = (p: Partial<CvDraft>) => cv.setDraft((d) => (d ? { ...d, ...p } : d));
  const dirty = !!draft && !!confirmed && JSON.stringify(draft) !== JSON.stringify(confirmed);
  const processing = status === 'processing';
  useEffect(() => {
    document.title = `${c('title')} · SkillHalfLife`;
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]']) {
      document.querySelector(selector)?.setAttribute('content', c('lead'));
    }
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  }, [lang]);

  const mapOf = (id: string | null) => (id ? skillName(id) : c('noMap'));
  const grouped = new Map<string, { i: number; cand: CvDraft['analysis']['candidates'][number] }[]>();
  draft?.analysis.candidates.forEach((cand, i) => {
    const arr = grouped.get(cand.category) ?? [];
    arr.push({ i, cand });
    grouped.set(cand.category, arr);
  });
  const mentionCount = (id: string) => draft?.analysis.candidates.filter((x) => x.skillId === id).length ?? 0;

  return (
    <div className="rise mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header className="max-w-2xl">
        <h1 data-testid="text-page-title" className="text-2xl font-bold md:text-3xl">{c('title')}</h1>
        <p className="mt-2 text-muted-foreground">{c('lead')}</p>
      </header>

      <Card id="card-cv-privacy">
        <CardTitle note={<ShieldCheck className="h-4 w-4" aria-hidden />}>{c('privacy')}</CardTitle>
        <p className="text-sm">{c('privacyBody')}</p>
        {!cv.storageAvailable && <p role="status" data-testid="text-cv-memory-only" className="mt-2 text-sm font-semibold">{c('memOnly')}</p>}
      </Card>

      <Card id="card-cv-upload">
        <CardTitle note={status === 'applied' && !dirty ? <Pill tone="blue">{c('stApplied')}</Pill> : draft ? <Pill tone="amber">{c(dirty ? 'stEdited' : 'stDraft')}</Pill> : undefined}>{c('file')}</CardTitle>
        <input ref={input} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only" tabIndex={-1} aria-label={c('choose')} data-testid="file-input-cv"
          onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={onDrop}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center ${over ? 'border-primary bg-muted' : 'border-input'}`}>
          <Upload className="h-6 w-6 text-muted-foreground" aria-hidden />
          <p className="font-semibold">{c('dropTitle')}</p>
          <p className="text-sm text-muted-foreground">{c('dropHint')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {!draft && !confirmed ? (
              <button type="button" className={btn} data-testid="button-choose-cv" onClick={() => input.current?.click()}>
                <FileText className="h-4 w-4" aria-hidden />{c('choose')}
              </button>
            ) : (
              <button type="button" className={btn} data-testid="button-replace-cv" onClick={() => input.current?.click()}>
                <RefreshCw className="h-4 w-4" aria-hidden />{c('replace')}
              </button>
            )}
            {processing && <button type="button" className={btn} data-testid="button-cancel-cv" onClick={cv.cancelUpload}><X className="h-4 w-4" aria-hidden />{c('cancel')}</button>}
            {(draft || confirmed) && <button type="button" className={btn} data-testid="button-remove-cv" onClick={cv.removeCv}><Trash2 className="h-4 w-4" aria-hidden />{c('remove')}</button>}
          </div>
        </div>
        {processing && (
          <div role="status" data-testid="status-cv-processing" className="mt-3">
            <p className="text-sm">{c('processing')}</p>
            <p className="mt-1 break-all text-sm font-semibold">{cv.processingFilename}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={c('processing')}>
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        )}
        {status === 'error' && error && (
          <p role="alert" data-testid="text-cv-error" className="mt-3 rounded-lg bg-muted p-3 text-sm font-semibold">
            {c(`err.${error}`) === `err.${error}` ? c('err.unreadable') : c(`err.${error}`)} {c('retryHint')}
          </p>
        )}
        {draft && <p className="mt-3 text-sm" data-testid="text-cv-filename"><span className="text-muted-foreground">{c('file')}: </span><strong>{draft.filename}</strong></p>}
        {(draft || confirmed) && <p className="mt-2 text-xs text-muted-foreground">{c('replaceNote')} {c('draftVsApplied')}</p>}
      </Card>

      {draft && (
        <>
          <Card id="card-cv-sections">
            <CardTitle>{c('sectionsH')}</CardTitle>
            <p className="mb-3 text-sm text-muted-foreground">{c('sectionsNote')}</p>
            <label className="mb-3 block text-sm font-semibold">{c('name')}
              <input className={`${field} mt-1 font-normal`} maxLength={80} value={draft.displayName} data-testid="input-cv-name"
                onChange={(e) => patch({ displayName: e.target.value })} />
            </label>
            {draft.analysis.warnings.length > 0 && (
              <div className="mb-3 rounded-lg bg-muted p-3 text-sm" data-testid="text-cv-warnings">
                <p className="font-semibold">{c('warnings')}</p>
                <ul className="list-disc pl-4">{draft.analysis.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {SECTIONS.map((s) => (
                <label key={s} className="block text-sm font-semibold">{c(s)}
                  <textarea rows={5} maxLength={10000} className={`${field} mt-1 font-normal`} data-testid={`input-cv-section-${s}`}
                    value={draft.sections[s]} onChange={(e) => patch({ sections: { ...draft.sections, [s]: e.target.value } })} />
                </label>
              ))}
            </div>
            <details className="mt-3">
              <summary className="min-h-[44px] cursor-pointer py-2 text-sm font-semibold">{c('rawText')}</summary>
              <pre data-testid="text-cv-raw" className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">{draft.analysis.text}</pre>
            </details>
          </Card>

          <Card id="card-cv-candidates">
            <CardTitle>{c('candH')}</CardTitle>
            <p className="mb-3 text-sm text-muted-foreground">{c('candNote')}</p>
            {grouped.size === 0 && <p className="text-sm">{c('candNone')}</p>}
            <div className="grid gap-4 md:grid-cols-2">
              {[...grouped.entries()].map(([cat, rows]) => (
                <div key={cat}>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{cat}</p>
                  <ul className="space-y-2">
                    {rows.map(({ i, cand }) => (
                      <li key={i} data-testid={`row-cv-candidate-${i}`} className="flex items-start justify-between gap-2 rounded-lg border p-2.5 text-sm">
                        <div className="min-w-0">
                          <p className="font-semibold">{cand.name} {cand.uncertain && <Pill tone="amber">{c('uncertain')}</Pill>}</p>
                          <p className="text-xs text-muted-foreground">{c('mapsTo')}: {mapOf(cand.skillId)}</p>
                          <p className="break-words text-xs text-muted-foreground">{c('evidence')}: {cand.evidence}</p>
                        </div>
                        <button type="button" className={btn} data-testid={`button-remove-candidate-${i}`}
                          aria-label={`${c('removeCand')} ${cand.name}`}
                          onClick={() => cv.setDraft((d) => d ? { ...d, analysis: { ...d.analysis, candidates: d.analysis.candidates.filter((_, j) => j !== i) } } : d)}>
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card id="card-cv-levels">
            <CardTitle>{c('levelsH')}</CardTitle>
            <p className="mb-3 text-sm text-muted-foreground">{c('levelsNote')}</p>
            {!catalog ? (catalogError ? (
              <div role="alert" className="text-sm"><p>{c('catError')}</p><button type="button" className={btn} onClick={refetchCatalog}>{c('retry')}</button></div>
            ) : <div aria-label={c('catLoading')}><Skeleton /></div>) : (
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {catalog.skills.map((s) => {
                  const v = draft.levels[s.id] ?? 0;
                  return (
                    <li key={s.id}>
                      <label htmlFor={`cv-level-${s.id}`} className="mb-1 flex justify-between text-sm font-semibold">
                        <span>{skillName(s.id)} <span className="text-xs font-normal text-muted-foreground">({mentionCount(s.id)} {c('mentions')})</span></span>
                        <span className="num">{v}</span>
                      </label>
                      <input id={`cv-level-${s.id}`} data-testid={`cv-level-${s.id}`} type="range" min={0} max={100} step={1} value={v}
                        className="h-11 w-full accent-[hsl(var(--primary))]"
                        onChange={(e) => patch({ levels: { ...draft.levels, [s.id]: Number(e.target.value) } })} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card id="card-cv-profile">
            <CardTitle>{c('profileH')}</CardTitle>
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">{c('interestsH')}</legend>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <label key={i} className="flex min-h-[44px] items-center gap-2 rounded-lg border px-3 text-sm">
                    <input type="checkbox" className="h-4 w-4" data-testid={`cv-interest-${i}`} checked={draft.interests.includes(i)}
                      onChange={(e) => patch({ interests: e.target.checked ? [...draft.interests, i] : draft.interests.filter((x) => x !== i) })} />
                    {translateInterest(lang, i)}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mt-4 block text-sm font-semibold">{c('eduLevel')}
              <select className={`${field} mt-1 font-normal`} data-testid="cv-education-level" value={draft.educationLevel}
                onChange={(e) => patch({ educationLevel: e.target.value as CvDraft['educationLevel'] })}>
                {EDU.map((e) => <option key={e} value={e}>{c(`edu.${e}`)}</option>)}
              </select>
            </label>
            <label className="mt-3 flex min-h-[44px] items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" data-testid="cv-experience-confirmed" checked={draft.relevantExperience}
                onChange={(e) => patch({ relevantExperience: e.target.checked })} />
              {c('relExp')}
            </label>
            <p className="mt-2 rounded-lg bg-muted p-3 text-xs">{c('eduExplain')}</p>
          </Card>

          <Card id="card-cv-apply">
            <label className="flex min-h-[44px] items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4" data-testid="cv-confirm-review" checked={ack}
                onChange={(e) => setAckFor(e.target.checked ? draft.analysis : null)} />
              {c('confirmReview')}
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={!ack} data-testid="button-apply-cv" onClick={cv.applyDraft}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-40">
                {c('apply')}
              </button>
              {status === 'applied' && !dirty && (
                <>
                  <Link href="/careers" data-testid="link-cv-matches" className={btn}>{c('viewMatches')} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                  <Link href="/pathway" data-testid="link-cv-roadmap" className={btn}>{c('pickRoadmap')} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                </>
              )}
            </div>
            {status === 'applied' && !dirty && <p role="status" data-testid="text-cv-applied" className="mt-3 text-sm font-semibold">{c('applied')}</p>}
            <p className="mt-2 text-xs text-muted-foreground">{c('fitNote')}</p>
          </Card>
        </>
      )}
    </div>
  );
}
