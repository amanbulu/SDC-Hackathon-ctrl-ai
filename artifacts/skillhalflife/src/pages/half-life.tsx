import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Btn, Card, CardTitle, Page, ScenarioControls } from '@/components/bits';
import { useApp } from '@/lib/store';

export const PALETTE = [
  '#2a4fc8', '#7c4dcc', '#0f8aa6', '#c27a1a', '#b83a85', '#3f6fd8', '#6a3fb0', '#1e7a5f',
  '#a0561f', '#5b6ee0', '#8a3fb0', '#2f7f9f',
];

export default function HalfLife() {
  const { t, result, catalog, skillName, years, scenario } = useApp();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const projections = result?.projections ?? [];

  const data = useMemo(() => {
    const rows = new Map<number, Record<string, number>>();
    for (const p of projections)
      for (const pt of p.points) {
        const r = rows.get(pt.year) ?? { year: pt.year };
        r[p.skillId] = pt.relevance;
        rows.set(pt.year, r);
      }
    return [...rows.values()].sort((a, b) => a.year - b.year);
  }, [projections]);

  const visible = projections.filter((p) => !hidden.has(p.skillId));
  const toggle = (id: string) =>
    setHidden((h) => {
      const n = new Set(h);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <Page title={t('halfLifeTitle')} lead={t('halfLifeLead')}>
      <ScenarioControls />
      <Card id="card-chart">
        <CardTitle note={t('formula')}>{t('relevanceIdx')}</CardTitle>
        <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label={t('showSkills')}>
          {projections.map((p, i) => {
            const on = !hidden.has(p.skillId);
            return (
              <button
                key={p.skillId}
                type="button"
                data-testid={`chip-skill-${p.skillId}`}
                aria-pressed={on}
                onClick={() => toggle(p.skillId)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 ${
                  on ? 'border-transparent bg-muted' : 'border-border bg-card text-muted-foreground'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: on ? PALETTE[i % PALETTE.length] : 'transparent', border: `2px solid ${PALETTE[i % PALETTE.length]}` }}
                />
                {skillName(p.skillId)}
              </button>
            );
          })}
          <Btn testid="button-show-all" onClick={() => setHidden(new Set())}>{t('showAll')}</Btn>
          <Btn testid="button-clear-all" onClick={() => setHidden(new Set(projections.map((p) => p.skillId)))}>{t('clearAll')}</Btn>
        </div>
        <div className="h-[380px] w-full" role="img" aria-label={t('relevanceIdx')}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 4 }}>
              <CartesianGrid stroke="hsl(222 30% 89%)" strokeDasharray="3 3" />
              <XAxis dataKey="year" type="number" domain={[0, 'dataMax']} tick={{ fontSize: 12 }} label={{ value: `${t('year')} (${t('yearsUnit')})`, position: 'insideBottom', offset: -14, fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} label={{ value: t('relevance'), angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <Tooltip
                formatter={(v: number, k: string) => [v.toFixed(1), skillName(k)]}
                labelFormatter={(l) => `${t('year')} ${l}`}
                contentStyle={{ borderRadius: 10, fontSize: 12 }}
              />
              <ReferenceLine x={years} stroke="#7c4dcc" strokeDasharray="4 4" />
              {visible.map((p) => (
                <Line
                  key={p.skillId}
                  dataKey={p.skillId}
                  stroke={PALETTE[projections.indexOf(p) % PALETTE.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card id="card-assumptions">
          <CardTitle>{t('assumptions')}</CardTitle>
          <ul className="list-disc space-y-2 pl-4 text-sm">
            <li className="num">{t('formula')}</li>
            <li>{t('assumeUnits')}</li>
            <li>{t('assumeIllustrative')}</li>
            <li>{t('assumeScenario')}</li>
            <li>{t('assumeExposure')}</li>
          </ul>
        </Card>
        <Card id="card-table" className="min-w-0 lg:col-span-2">
          <div className="overflow-x-auto lg:-mr-2">
            <table className="w-full min-w-[640px] text-sm" data-testid="table-skills">
              <caption className="sr-only">{t('halfLifeTitle')} ({t(scenario)})</caption>
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-2">{t('skill')}</th>
                  <th className="num px-2 text-right">{t('initial')}</th>
                  <th className="px-2 text-right">{t('halfLife')}</th>
                  <th className="px-2 text-right">{t('moderateHL')} / {t('fastHL')}</th>
                  <th className="px-2 text-right">{t('futRel')}</th>
                  <th className="px-2 text-right">{t('taskExposure')}</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((p) => {
                  const s = catalog?.skills.find((x) => x.id === p.skillId);
                  return (
                    <tr key={p.skillId} className="border-b last:border-0" data-testid={`row-half-${p.skillId}`}>
                      <td className="py-2 pr-2 font-semibold">{skillName(p.skillId)}</td>
                      <td className="num px-2 text-right">{s?.initialRelevance.toFixed(0)}</td>
                      <td className="num px-2 text-right text-primary">{p.halfLife.toFixed(1)}</td>
                      <td className="num px-2 text-right text-muted-foreground">{s?.moderateHalfLife} / {s?.fastHalfLife}</td>
                      <td className="num px-2 text-right">{p.futureRelevance.toFixed(1)}</td>
                      <td className="num px-2 text-right text-muted-foreground">{s?.taskExposure}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Page>
  );
}
