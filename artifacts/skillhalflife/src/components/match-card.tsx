import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useApp, type Match } from '@/lib/store';
import { Bar, Card, Pill } from '@/components/bits';
import { useCv } from '@/lib/cv-context';
import { cs } from '@/lib/cv-strings';

function Contrib({ careerId }: { careerId: string }) {
  const { lang, careerMap, skillName, simulated } = useApp();
  const { confirmed } = useCv();
  if (!confirmed) return null;
  const req = Object.keys(careerMap.get(careerId)?.requirements ?? {});
  const cvRows = req.filter((id) => (confirmed.levels[id] ?? 0) > 0);
  const added = Object.entries(simulated).filter(([id, v]) => v > (confirmed.levels[id] ?? 0) && req.includes(id));
  return (
    <div data-testid={`cv-contrib-${careerId}`}>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{cs(lang, 'cvSkillsH')}</p>
      <p className="mb-1.5 text-xs text-muted-foreground">{cs(lang, 'cvSkillsNote')}</p>
      {cvRows.length === 0 ? <p className="text-sm text-muted-foreground">{cs(lang, 'noContrib')}</p> : (
        <ul className="space-y-1.5 text-sm">
          {cvRows.map((id) => {
            const ev = confirmed.analysis.candidates.filter((x) => x.skillId === id);
            return (
              <li key={id}><span className="font-semibold">{skillName(id)}</span> <span className="num">{confirmed.levels[id]}</span>
                {ev.map((x, i) => <span key={i} className="block break-words text-xs text-muted-foreground">{x.name}: {x.evidence}</span>)}
                {ev.length === 0 && <span className="block text-xs text-muted-foreground">{cs(lang, 'manualSkill')}</span>}
              </li>
            );
          })}
        </ul>
      )}
      {added.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{cs(lang, 'addedSkillsH')}</p>
          <ul className="space-y-1 text-sm">{added.map(([id, v]) => <li key={id}>{skillName(id)} <span className="num">{v}</span></li>)}</ul>
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{cs(lang, 'fitNote')}</p>
    </div>
  );
}

export function GapList({ careerId, onlyGaps = false, limit }: { careerId: string; onlyGaps?: boolean; limit?: number }) {
  const { t, result, careerMap, skillName } = useApp();
  const req = careerMap.get(careerId)?.requirements ?? {};
  let rows = Object.entries(req).map(([id, need]) => {
    const have = result?.profileSkills[id] ?? 0;
    return { id, need, have, gap: Math.max(0, need - have) };
  });
  if (onlyGaps) rows = rows.filter((r) => r.gap > 0);
  rows.sort((a, b) => b.gap - a.gap);
  if (limit) rows = rows.slice(0, limit);
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{t('noGaps')}</p>;
  return (
    <table className="w-full text-sm" data-testid={`table-gaps-${careerId}`}>
      <thead>
        <tr className="border-b text-left text-xs text-muted-foreground">
          <th className="py-1.5 font-semibold">{t('skill')}</th>
          <th className="py-1.5 text-right font-semibold">{t('currentLevel')}</th>
          <th className="py-1.5 text-right font-semibold">{t('requiredLevel')}</th>
          <th className="py-1.5 text-right font-semibold">{t('gapLabel')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b last:border-0">
            <td className="py-1.5 pr-2 font-semibold">{skillName(r.id)}</td>
            <td className="num py-1.5 text-right">{Math.round(r.have)}</td>
            <td className="num py-1.5 text-right">{r.need}</td>
            <td className={`num py-1.5 text-right font-bold ${r.gap > 0 ? 'text-amber' : 'text-primary'}`}>
              {r.gap > 0 ? `-${Math.round(r.gap)}` : t('meetsReq')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MatchCard({ m, rank, full = false }: { m: Match; rank: number; full?: boolean }) {
  const { t, lang, careerName, skillName, setCareerId } = useApp();
  const reasons = lang === 'ms' ? m.reasonsMs : m.reasons;
  return (
    <Card id={`card-match-${m.careerId}`} className="flex flex-col gap-5">
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
      <p className="num rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground" data-testid={`text-adjusted-${m.careerId}`}>
        {t('sdgBonus')}: +{m.sdgBonus.toFixed(1)} {t('points')} · {t('adjusted')}: <strong className="text-foreground">{m.adjustedScore.toFixed(1)}</strong>
      </p>
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
          <Contrib careerId={m.careerId} />
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('skillGapTitle')}</p>
            <GapList careerId={m.careerId} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
        className="mt-auto inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary"
      >
        {t('viewPathway')} <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Card>
  );
}
