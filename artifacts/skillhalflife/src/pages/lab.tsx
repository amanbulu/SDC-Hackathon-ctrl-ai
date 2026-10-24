import { useCv } from '@/lib/cv-context';
import { useActiveProfile } from '@/components/cv-profile';
import { cs } from '@/lib/cv-strings';
import { RotateCcw } from 'lucide-react';
import { Btn, Card, CardTitle, HypoBadge, Page, Pill } from '@/components/bits';
import { GapList } from '@/components/match-card';
import { useApp } from '@/lib/store';

export default function Lab() {
  const { t, lang, catalog, result, base, simulated, setSim, clearSim, skillName, careerName } = useApp();
  const profile = useActiveProfile()?.skills ?? {};
  const isCv = !!useCv().confirmed;
  const simCount = Object.keys(simulated).length;
  const ref = base ?? result;
  const baseRank = new Map((ref?.rankings ?? []).map((m, i) => [m.careerId, { i, s: m.adjustedScore }]));

  return (
    <Page title={t('labTitle')} lead={t('labLead')}>
      <div className="flex items-center gap-3 rounded-lg border border-violet/30 bg-violet/5 px-4 py-2.5 text-sm">
        <HypoBadge />
        <p>{t('labBanner')}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <Card id="card-sim" className="lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{t('simulated')}</CardTitle>
            <Btn testid="button-reset-sim" disabled={simCount === 0} onClick={() => clearSim()} icon={<RotateCcw className="h-4 w-4" />}>
              {t('resetSim')}
            </Btn>
          </div>
          <ul className="grid gap-5">
            {catalog?.skills.map((s) => {
              const real = profile[s.id] ?? 0;
              const val = simulated[s.id] ?? real;
              const on = s.id in simulated;
              return (
                <li key={s.id} data-testid={`row-sim-${s.id}`}>
                  <label htmlFor={`sim-${s.id}`} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-semibold">
                      {skillName(s.id)} {on && <HypoBadge />}
                    </span>
                    <span className="num text-right">
                      <span className="text-muted-foreground">{isCv ? cs(lang, 'labCv') : cs(lang, 'labSyn')} {Math.round(real)}</span>{' '}
                      <span aria-hidden>→</span> <strong className={on ? 'text-violet' : ''}>{t('hypoLevel')} {val}</strong>{' '}
                      <span className={on ? 'font-bold text-violet' : 'text-muted-foreground'}>(+{Math.round(val - real)})</span>
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id={`sim-${s.id}`}
                      data-testid={`input-sim-${s.id}`}
                      type="range"
                      min={real}
                      max={100}
                      value={val}
                      onChange={(e) => setSim(s.id, Number(e.target.value))}
                      className="h-11 w-full"
                    />
                    <button
                      type="button"
                      data-testid={`button-reset-${s.id}`}
                      disabled={!on}
                      onClick={() => clearSim(s.id)}
                      className="min-h-[44px] shrink-0 px-2 text-xs font-semibold text-primary disabled:opacity-30"
                    >
                      {t('resetSkill')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card id="card-sim-result" className="content-start lg:col-span-2">
          <CardTitle note={t('vsBaseline')}>{t('adjusted')}</CardTitle>
          {simCount === 0 && <p className="mb-3 text-sm text-muted-foreground">{t('noSim')}</p>}
          <ol className="grid gap-2">
            {result?.rankings.map((m, i) => {
              const b = baseRank.get(m.careerId);
              const ds = b ? m.adjustedScore - b.s : 0;
              const dr = b ? b.i - i : 0;
              return (
                <li key={m.careerId} data-testid={`row-simrank-${m.careerId}`} className="rounded-lg bg-muted/60 p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-bold"><span className="num mr-2 text-primary">{i + 1}</span>{careerName(m.careerId)}</span>
                    <span className="num font-bold">{m.adjustedScore.toFixed(1)}</span>
                  </div>
                  {simCount > 0 && (
                    <div className="mt-1 flex gap-1.5">
                      <Pill tone={ds > 0 ? 'blue' : 'muted'}>{ds >= 0 ? '+' : ''}{ds.toFixed(1)} {t('points')}</Pill>
                      {dr !== 0 && <Pill tone="violet">{dr > 0 ? '+' : ''}{dr} {t('rank')}</Pill>}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('missing')}: {m.missingSkills.length ? m.missingSkills.map(skillName).join(', ') : t('none')}
                  </p>
                </li>
              );
            })}
          </ol>
          {result?.rankings[0] && (
            <div className="mt-5">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('remainingGaps')}: {careerName(result.rankings[0].careerId)}</p>
              <GapList careerId={result.rankings[0].careerId} onlyGaps />
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
