import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useApp, type Match } from '@/lib/store';
import { Bar, Card, Pill } from '@/components/bits';

export function MatchCard({ m, rank, full = false }: { m: Match; rank: number; full?: boolean }) {
  const { t, lang, careerName, skillName, setCareerId } = useApp();
  const reasons = lang === 'ms' ? m.reasonsMs : m.reasons;
  return (
    <Card id={`card-match-${m.careerId}`} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="num text-xs font-semibold text-muted-foreground">
            {t('rank')} {rank}
          </p>
          <h3 className="text-xl font-bold leading-tight">{careerName(m.careerId)}</h3>
        </div>
        <div className="text-right">
          <p className="num text-3xl font-bold text-primary" data-testid={`text-fit-${m.careerId}`}>
            {m.fitScore.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">{t('fit')}</p>
        </div>
      </div>
      <div className="grid gap-2 text-xs">
        {(
          [
            ['skillAlign', m.skillAlignment, 'weight70', 'blue'],
            ['interestAlign', m.interestAlignment, 'weight20', 'violet'],
            ['educationAlign', m.educationAlignment, 'weight10', 'amber'],
          ] as const
        ).map(([k, v, w, tone]) => (
          <div key={k}>
            <div className="mb-1 flex justify-between">
              <span className="font-semibold">
                {t(k)} <span className="font-normal text-muted-foreground">({t(w)})</span>
              </span>
              <span className="num">{v.toFixed(1)}</span>
            </div>
            <Bar value={v} tone={tone} label={t(k)} />
          </div>
        ))}
      </div>
      {full && (
        <>
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('reasons')}</p>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('missing')}</p>
              <div className="flex flex-wrap gap-1.5">
                {m.missingSkills.length === 0 && <span className="text-sm text-muted-foreground">{t('none')}</span>}
                {m.missingSkills.map((s) => (
                  <Pill key={s} tone="amber">
                    {skillName(s)}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('transferable')}</p>
              <div className="flex flex-wrap gap-1.5">
                {m.transferableSkills.length === 0 && <span className="text-sm text-muted-foreground">{t('none')}</span>}
                {m.transferableSkills.map((s) => (
                  <Pill key={s} tone="blue">
                    {skillName(s)}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      <Link
        href="/pathway"
        data-testid={`link-pathway-${m.careerId}`}
        onClick={() => setCareerId(m.careerId)}
        className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
      >
        {t('viewPathway')} <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Card>
  );
}
