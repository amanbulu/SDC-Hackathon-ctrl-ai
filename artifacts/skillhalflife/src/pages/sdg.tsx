import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Btn, Card, CardTitle, Page, Pill, SegButton } from '@/components/bits';
import { FOCUS_GOALS, useApp } from '@/lib/store';

export default function Sdg() {
  const { t, lang, catalog, result, weights, setWeight, setAllWeights, careerName, careerMap } = useApp();
  const goals = catalog?.goals ?? [];
  const [pick, setPick] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!result) return [];
    const base = [...result.rankings].sort((a, b) => b.fitScore - a.fitScore);
    const adj = [...result.rankings].sort((a, b) => b.adjustedScore - a.adjustedScore);
    return adj.map((m, i) => ({
      m,
      adjRank: i + 1,
      baseRank: base.findIndex((x) => x.careerId === m.careerId) + 1,
    }));
  }, [result]);

  const sel = pick && careerMap.has(pick) ? pick : rows[0]?.m.careerId;
  const contribs = useMemo(() => {
    const c = sel ? careerMap.get(sel) : undefined;
    if (!c) return [];
    return goals
      .map((g) => ({ g, v: ((weights[String(g.id)] ?? 0) / 100) * (c.sdgContributions[String(g.id)] ?? 0) }))
      .sort((a, b) => b.v - a.v);
  }, [sel, careerMap, goals, weights]);
  const maxC = Math.max(1, ...contribs.map((c) => c.v));

  const preset = (fn: (id: number) => number) =>
    setAllWeights(Object.fromEntries(goals.map((g) => [String(g.id), fn(g.id)])));

  const renderGoals = (list: typeof goals, cls: string) => (
    <ul className={cls}>
            {list.map((g) => {
              const w = weights[String(g.id)] ?? 0;
              const focus = FOCUS_GOALS.includes(g.id);
              return (
                <li key={g.id} data-testid={`row-goal-${g.id}`} className={`rounded-lg p-3 ${g.id === 4 ? 'border-2 border-violet/40 bg-accent' : focus ? 'bg-accent/60' : ''}`}>
                  <label htmlFor={`sdg-${g.id}`} className="flex items-start justify-between gap-2 text-sm">
                    <span>
                      <span className="num mr-1.5 font-bold text-violet">{g.id}</span>
                      <span className="font-semibold">{lang === 'ms' ? g.nameMs : g.name}</span>
                      {g.id === 4 && <span className="ml-1.5 align-middle"><Pill tone="blue">{t('mainGoal')}</Pill></span>}
                      {focus && g.id !== 4 && <span className="ml-1.5 align-middle"><Pill tone="violet">{t('emphasized')}</Pill></span>}
                    </span>
                    <span className="num font-bold">{w}</span>
                  </label>
                  <input
                    id={`sdg-${g.id}`}
                    data-testid={`input-sdg-${g.id}`}
                    type="range"
                    min={0}
                    max={100}
                    value={w}
                    onChange={(e) => setWeight(g.id, Number(e.target.value))}
                    className="mt-1 h-11 w-full"
                  />
                  <p className="text-xs text-muted-foreground">{lang === 'ms' ? g.mechanismMs : g.mechanism}</p>
                </li>
              );
            })}
    </ul>
  );

  return (
    <Page title={t('sdgTitle')} lead={t('sdgLead')}>
      {rows[0] && (
        <div data-testid="summary-live-ranking" aria-live="polite" className="num rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-semibold">{t('liveRanking')}: </span>
          {rows.map((r) => `${r.adjRank}. ${careerName(r.m.careerId)} (${r.m.adjustedScore.toFixed(1)})`).join('  ·  ')}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-5">
        <Card id="card-weights" className="lg:col-span-3">
          <CardTitle note={<span className="num">{t('sdgFormula')}</span>}>{t('weight')} 0-100</CardTitle>
          <div className="mb-4 flex flex-wrap gap-2">
            <Btn testid="button-preset-focus" onClick={() => preset((id) => (FOCUS_GOALS.includes(id) ? 50 : 0))}>{t('presetFocus')}</Btn>
            <Btn testid="button-preset-zero" onClick={() => preset(() => 0)}>{t('presetZero')}</Btn>
            <Btn testid="button-preset-even" onClick={() => preset(() => 50)}>{t('presetEven')}</Btn>
          </div>
          {renderGoals(goals.filter((g) => g.id === 4), 'grid gap-3')}
          <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('otherGoals')}</p>
          {renderGoals(goals.filter((g) => g.id !== 4), 'grid gap-x-6 gap-y-2 md:grid-cols-2')}
        </Card>

        <div className="grid content-start gap-5 lg:col-span-2">
          <Card id="card-ranks">
            <CardTitle>{t('adjustedRank')}</CardTitle>
            <ol className="grid gap-2">
              {rows.map(({ m, adjRank, baseRank }) => {
                const d = baseRank - adjRank;
                return (
                  <li key={m.careerId} data-testid={`row-rank-${m.careerId}`} className="rounded-lg bg-muted/60 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold"><span className="num mr-2 text-primary">{adjRank}</span>{careerName(m.careerId)}</span>
                      <span className={`num inline-flex items-center gap-0.5 text-xs font-bold ${d > 0 ? 'text-primary' : d < 0 ? 'text-amber' : 'text-muted-foreground'}`}>
                        {d > 0 ? <ArrowUp className="h-3 w-3" /> : d < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {Math.abs(d)}
                      </span>
                    </div>
                    <p className="num mt-1 text-xs text-muted-foreground">
                      {t('baselineRank')} {baseRank} / {t('fit')} {m.fitScore.toFixed(1)} + {m.sdgBonus.toFixed(1)} {t('points')} = <strong className="text-foreground">{m.adjustedScore.toFixed(1)}</strong>
                    </p>
                  </li>
                );
              })}
            </ol>
          </Card>
          <Card id="card-contrib">
            <CardTitle>{t('contributions')}</CardTitle>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {rows.map(({ m }) => (
                <SegButton key={m.careerId} testid={`button-contrib-${m.careerId}`} active={m.careerId === sel} onClick={() => setPick(m.careerId)}>
                  {careerName(m.careerId)}
                </SegButton>
              ))}
            </div>
            <ul className="grid gap-1.5">
              {contribs.filter((c) => c.v > 0).map(({ g, v }) => (
                <li key={g.id} className="grid grid-cols-[2rem_1fr_3rem] items-center gap-2 text-xs">
                  <span className="num font-bold text-violet">{g.id}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full origin-left rounded-full bg-violet " style={{ transform: `scaleX(${v / maxC})` }} />
                  </div>
                  <span className="num text-right">{v.toFixed(1)}</span>
                </li>
              ))}
              {contribs.every((c) => c.v === 0) && <li className="text-sm text-muted-foreground">{t('none')}</li>}
            </ul>
          </Card>
        </div>
      </div>
    </Page>
  );
}
