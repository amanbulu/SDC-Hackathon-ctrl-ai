import { Card, Page } from '@/components/bits';
import { MatchCard } from '@/components/match-card';
import { useApp } from '@/lib/store';

export default function Careers() {
  const { t, result } = useApp();
  const ranked = result ? [...result.rankings].sort((a, b) => b.fitScore - a.fitScore) : [];
  return (
    <Page title={t('careersTitle')} lead={t('careersLead')}>
      <Card id="card-formula">
        <p className="text-sm leading-relaxed text-muted-foreground">{t('matchFormula')}</p>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        {ranked.map((m, i) => (
          <MatchCard key={m.careerId} m={m} rank={i + 1} full />
        ))}
      </div>
    </Page>
  );
}
