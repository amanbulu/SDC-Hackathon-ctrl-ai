import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Btn, Card, CardTitle, ErrorBox, Page, ScenarioControls, Skeleton } from '@/components/bits';
import { useApp } from '@/lib/store';
import { useScenarioComparison } from '@/hooks/use-scenario-comparison';

export const PALETTE = [
  '#2a4fc8', '#7c4dcc', '#0f748c', '#9c5e10', '#a13275',
  '#345cab', '#6542a3', '#236752', '#97501d', '#4b5aab',
];

export default function HalfLife() {
  const { t, lang, catalog, skillName, years } = useApp();
  const comparison = useScenarioComparison();
  const [selected, setSelected] = useState<Set<string>>(new Set(['programming', 'communication']));
  const text = (en: string, ms: string) => lang === 'ms' ? ms : en;
  const projections = comparison.data?.moderate.projections ?? [];
  const fastMap = useMemo(
    () => new Map(comparison.data?.fast.projections.map(p => [p.skillId, p]) ?? []),
    [comparison.data],
  );
  const data = useMemo(() => {
    if (!comparison.data) return [];
    return comparison.data.moderate.projections[0]?.points.map((point, i) => {
      const row: Record<string, number> = { year: point.year };
      for (const scenario of ['moderate', 'fast'] as const) {
        for (const p of comparison.data![scenario].projections) {
          const value = p.points[i]?.relevance;
          if (value !== undefined) row[`${p.skillId}|${scenario}`] = value;
        }
      }
      return row;
    }) ?? [];
  }, [comparison.data]);
  const toggle = (id: string) => setSelected(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <Page title={t('halfLifeTitle')} lead={text(
      'Compare two disruption assumptions at the same horizon. Neither curve predicts employment outcomes.',
      'Bandingkan dua andaian gangguan pada ufuk yang sama. Kedua-dua lengkung tidak meramal hasil pekerjaan.',
    )}>
      <ScenarioControls />
      <Card id="card-chart" className="min-w-0">
        <CardTitle note={text('Solid: Moderate AI Disruption · Dashed: Fast AI Disruption', 'Garis penuh: Gangguan AI Sederhana · Garis putus: Gangguan AI Pantas')}>
          {text('Two scenarios. One skill horizon.', 'Dua senario. Satu ufuk kemahiran.')}
        </CardTitle>
        <p className="mb-4 text-sm text-muted-foreground">{text(
          'Choose skills to compare. Both scenarios are shown independently of your selected dashboard scenario.',
          'Pilih kemahiran untuk dibandingkan. Kedua-dua senario dipaparkan berasingan daripada senario papan pemuka pilihan anda.',
        )}</p>
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={t('showSkills')}>
          {catalog?.skills.map((s, i) => (
            <button key={s.id} type="button" data-testid={`chip-skill-${s.id}`} aria-pressed={selected.has(s.id)}
              onClick={() => toggle(s.id)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${selected.has(s.id) ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:bg-muted'}`}>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} aria-hidden />
              {selected.has(s.id) && <span aria-hidden>✓</span>}{skillName(s.id)}
            </button>
          ))}
          <Btn testid="button-show-all" onClick={() => setSelected(new Set(catalog?.skills.map(s => s.id)))}>{t('showAll')}</Btn>
          <Btn testid="button-clear-all" onClick={() => setSelected(new Set())}>{t('clearAll')}</Btn>
        </div>
        {comparison.isError ? <ErrorBox title={text('Scenario comparison could not be loaded', 'Perbandingan senario tidak dapat dimuatkan')} onRetry={() => void comparison.refetch()} />
          : !comparison.data ? <div aria-label={t('loading')}><Skeleton /></div>
          : selected.size === 0 ? <p className="rounded-lg bg-muted p-6 text-sm" data-testid="comparison-empty">{text('Select a skill above to show both scenario curves.', 'Pilih kemahiran di atas untuk memaparkan kedua-dua lengkung senario.')}</p>
          : <>
            <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground" data-testid="comparison-legend">
              <span className="inline-flex items-center gap-2"><span className="w-7 border-t-2 border-primary" />{t('moderate')}</span>
              <span className="inline-flex items-center gap-2"><span className="w-7 border-t-2 border-dashed border-primary" />{t('fast')}</span>
            </div>
            <div className="h-[340px] w-full sm:h-[380px]" role="img" aria-label={text('Skill relevance under moderate and fast AI disruption. Exact values are in the table below.', 'Kerelevanan kemahiran di bawah gangguan AI sederhana dan pantas. Nilai tepat dalam jadual di bawah.')}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 12, right: 14, bottom: 24, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="hsl(222 25% 89%)" strokeDasharray="3 3" />
                  <XAxis dataKey="year" type="number" domain={[0, Math.max(1, years)]}
                    tick={{ fontSize: 11 }} tickFormatter={value => Number(value).toFixed(1).replace(/\.0$/, '')}
                    label={{ value: `${t('year')} (${t('yearsUnit')})`, position: 'insideBottom', offset: -14, fontSize: 12 }} />
                  <YAxis domain={[0, 100]} width={38} tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={value => `${t('year')} ${Number(value).toFixed(1)}`}
                    formatter={(value: number, key: string) => {
                      const [id, scenario] = key.split('|');
                      return [value.toFixed(1), `${skillName(id!)} · ${t(scenario!)}`];
                    }}
                    contentStyle={{ borderRadius: 8, fontSize: 12, maxWidth: 'min(340px, 80vw)' }} />
                  {catalog?.skills.filter(s => selected.has(s.id)).flatMap(s => {
                    const index = catalog.skills.findIndex(x => x.id === s.id);
                    return (['moderate', 'fast'] as const).map(scenario => (
                      <Line key={`${s.id}|${scenario}`} dataKey={`${s.id}|${scenario}`}
                        stroke={PALETTE[index % PALETTE.length]} strokeWidth={2.5}
                        strokeDasharray={scenario === 'fast' ? '6 4' : undefined}
                        dot={years === 0 ? { r: 3 } : false} isAnimationActive={false} />
                    ));
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t('relevanceIdx')} · {t('assumeIllustrative')}</p>
          </>}
      </Card>
      {comparison.data && <Card id="card-table" className="min-w-0">
        <CardTitle note={`${years} ${t('yearsUnit')} · ${t('assumeUnits')}`}>{text('Values behind both scenarios', 'Nilai di sebalik kedua-dua senario')}</CardTitle>
        <div className="overflow-x-auto" role="region" aria-label={text('Scenario values table', 'Jadual nilai senario')} tabIndex={0}>
          <table className="w-full min-w-[720px] text-sm" data-testid="table-skills">
            <caption className="sr-only">{t('relevanceIdx')} · {t('moderate')} / {t('fast')}</caption>
            <thead><tr className="border-b text-left text-xs text-muted-foreground">
              <th scope="col" className="px-2 py-3">{t('skill')}</th>
              <th scope="col" className="px-2 text-right">{t('initial')}</th>
              <th scope="col" className="px-2 text-right">{t('moderateHL')}</th>
              <th scope="col" className="px-2 text-right">{t('fastHL')}</th>
              <th scope="col" className="px-2 text-right">{text('Moderate relevance', 'Kerelevanan sederhana')}</th>
              <th scope="col" className="px-2 text-right">{text('Fast relevance', 'Kerelevanan pantas')}</th>
              <th scope="col" className="px-2 text-right">{t('taskExposure')}</th>
            </tr></thead>
            <tbody>{projections.map(p => {
              const s = catalog?.skills.find(x => x.id === p.skillId);
              const fast = fastMap.get(p.skillId);
              return <tr key={p.skillId} className="border-b last:border-0" data-testid={`row-half-${p.skillId}`}>
                <th scope="row" className="px-2 py-3 text-left font-medium">{skillName(p.skillId)}</th>
                <td className="num px-2 text-right">{p.currentRelevance.toFixed(0)}</td>
                <td className="num px-2 text-right">{p.halfLife.toFixed(1)}</td>
                <td className="num px-2 text-right">{fast?.halfLife.toFixed(1)}</td>
                <td className="num px-2 text-right text-primary" data-testid={`moderate-value-${p.skillId}`}>{p.futureRelevance.toFixed(1)}</td>
                <td className="num px-2 text-right text-violet" data-testid={`fast-value-${p.skillId}`}>{fast?.futureRelevance.toFixed(1)}</td>
                <td className="num px-2 text-right">{s?.taskExposure}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </Card>}
      <Card id="card-assumptions">
        <CardTitle>{t('assumptions')}</CardTitle>
        <ul className="grid list-disc gap-x-8 gap-y-2 pl-4 text-sm text-muted-foreground md:grid-cols-2">
          <li className="num text-foreground">{t('formula')}</li><li>{t('assumeUnits')}</li>
          <li>{t('assumeScenario')}</li><li>{t('assumeExposure')}</li>
        </ul>
      </Card>
    </Page>
  );
}
