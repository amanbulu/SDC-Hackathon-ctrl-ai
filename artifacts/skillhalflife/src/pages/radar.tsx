import { useMemo } from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardTitle, Page, ScenarioControls } from '@/components/bits';
import { useApp } from '@/lib/store';

export default function RadarPage() {
  const { t, result, skillName, years, scenario } = useApp();
  const rows = useMemo(
    () =>
      (result?.projections ?? []).map((p) => ({
        id: p.skillId,
        name: skillName(p.skillId).length > 14 ? skillName(p.skillId).slice(0, 13) + '…' : skillName(p.skillId),
        full: skillName(p.skillId),
        present: p.currentRelevance,
        future: p.futureRelevance,
      })),
    [result, skillName],
  );

  return (
    <Page title={t('radarTitle')} lead={t('radarLead')}>
      <ScenarioControls />
      <div className="grid gap-5 lg:grid-cols-5">
        <Card id="card-radar" className="lg:col-span-3">
          <CardTitle note={`${t(scenario)} / ${years} ${t('yearsUnit')}`}>{t('relevanceIdx')}</CardTitle>
          <div className="h-[340px] md:h-[420px]" role="img" aria-label={t('radarTitle')}>
            <ResponsiveContainer>
              <RadarChart data={rows} outerRadius="62%">
                <PolarGrid stroke="hsl(222 30% 85%)" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#1c2447' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} angle={90} />
                <Radar name={t('present')} dataKey="present" stroke="#7c4dcc" fill="#7c4dcc" fillOpacity={0.2} strokeWidth={2} />
                <Radar name={`${t('future')} (${years} ${t('yearsUnit')})`} dataKey="future" stroke="#2a4fc8" fill="#2a4fc8" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip formatter={(v: number) => v.toFixed(1)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card id="card-radar-table" className="lg:col-span-2">
          <CardTitle note={t('assumeIllustrative')}>{t('radarTable')}</CardTitle>
          <table className="w-full text-sm" data-testid="table-radar">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2">{t('skill')}</th>
                <th className="text-right">{t('present')}</th>
                <th className="text-right">{t('future')}</th>
                <th className="text-right">{t('change')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0" data-testid={`row-radar-${r.id}`}>
                  <td className="py-1.5 font-semibold">{r.full}</td>
                  <td className="num text-right">{r.present.toFixed(1)}</td>
                  <td className="num text-right">{r.future.toFixed(1)}</td>
                  <td className="num text-right text-muted-foreground">{r.future - r.present < -0.05 ? `${t('trendDown')} ${Math.abs(r.future - r.present).toFixed(1)}` : t('trendFlat')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Page>
  );
}
