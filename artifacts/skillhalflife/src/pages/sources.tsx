import { Card, CardTitle, Page, Pill } from '@/components/bits';
import { useApp } from '@/lib/store';

const FIELDS = ['skillId', 'sourceUrl', 'observationDate', 'retrievalDate', 'metricDefinition', 'value', 'synthetic'];

export default function Sources() {
  const { t, catalog, skillName } = useApp();
  const obs = catalog?.observations ?? [];
  const na = <span className="text-muted-foreground">{t('notAvailable')}</span>;
  return (
    <Page title={t('sourcesTitle')} lead={t('sourcesLead')} needsResult={false}>
      <Card id="card-disclosures">
        <CardTitle>{t('disclosures')}</CardTitle>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
          {['d1', 'd2', 'd3', 'd4', 'd5'].map((k) => <li key={k}>{t(k)}</li>)}
        </ul>
      </Card>
      <Card id="card-observations">
        <CardTitle>{t('observations')}</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm" data-testid="table-observations">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                {FIELDS.map((f) => <th key={f} className="px-2 py-2 font-mono">{f}</th>)}
              </tr>
            </thead>
            <tbody>
              {obs.map((o, i) => (
                <tr key={`${o.skillId}-${i}`} className="border-b last:border-0" data-testid={`row-obs-${i}`}>
                  <td className="px-2 py-2 font-semibold">{skillName(o.skillId)}</td>
                  <td className="px-2">{o.sourceUrl ?? na}</td>
                  <td className="px-2">{o.observationDate ?? na}</td>
                  <td className="px-2">{o.retrievalDate ?? na}</td>
                  <td className="px-2">{o.synthetic && o.metricDefinition.startsWith('Illustrative initial') ? t('metricSynthetic') : o.metricDefinition}</td>
                  <td className="num px-2">{o.value}</td>
                  <td className="px-2">{o.synthetic ? <Pill tone="amber">{t('yes')}</Pill> : <Pill tone="blue">{t('no')}</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card id="card-structure">
        <CardTitle>{t('futureStructure')}</CardTitle>
        <dl className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-[14rem_1fr]">
          {FIELDS.map((f) => (
            <div key={f} className="contents">
              <dt className="font-mono text-primary">{f}</dt>
              <dd>{t(`f_${f}`)}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </Page>
  );
}
