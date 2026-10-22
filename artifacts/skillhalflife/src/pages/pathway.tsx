import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Card, Page, Pill, SegButton } from '@/components/bits';
import { useApp } from '@/lib/store';

export default function Pathway() {
  const { t, lang, result, careerId, setCareerId, careerName, skillName, skillMap, careerMap, simulated } = useApp();
  const [planned, setPlanned] = useState<Set<string>>(new Set());
  const steps = result && careerId ? (result.roadmap[careerId] ?? []) : [];
  const total = steps.reduce((a, id) => a + (skillMap.get(id)?.hours ?? 0), 0);
  const toggle = (id: string) =>
    setPlanned((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <Page title={t('pathwayTitle')} lead={t('pathwayLead')}>
      <Card id="card-career-select">
        <p className="mb-2 text-sm font-semibold">{t('forCareer')}</p>
        <div className="flex flex-wrap gap-2">
          {result?.rankings.map((m) => (
            <SegButton key={m.careerId} testid={`button-career-${m.careerId}`} active={m.careerId === careerId} onClick={() => setCareerId(m.careerId)}>
              {careerName(m.careerId)}
            </SegButton>
          ))}
        </div>
        <p className="num mt-3 text-sm text-muted-foreground" data-testid="text-total-hours">
          {t('totalHours')}: <strong className="text-foreground">{total}</strong> {t('hours')} ({t('hoursEst')})
        </p>
      </Card>

      {steps.length === 0 ? (
        <Card id="card-empty"><p className="text-sm text-muted-foreground">{t('emptyPathway')}</p></Card>
      ) : (
        <ol className="relative grid gap-5 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-0.5 before:bg-border">
          {steps.map((id, i) => {
            const s = skillMap.get(id);
            if (!s) return null;
            const have = result?.profileSkills[id] ?? 0;
            const on = planned.has(id);
            return (
              <li key={id} className="relative flex gap-4" data-testid={`step-${id}`}>
                <span className={`num z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${on ? 'border-violet bg-violet text-white' : 'border-primary bg-card text-primary'}`}>
                  {i + 1}
                </span>
                <Card className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{skillName(id)}</h3>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Pill tone="blue"><span className="num">{s.hours}</span> {t('hours')}</Pill>
                        <Pill tone="muted">{t('haveLevel')}: <span className="num">{Math.round(have)}</span></Pill>
                        {id in simulated && <Pill tone="violet">{t('hypothetical')}</Pill>}
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid={`button-plan-${id}`}
                      aria-pressed={on}
                      onClick={() => toggle(id)}
                      className={`inline-flex items-center gap-1.5 min-h-[44px] rounded-lg border px-4 py-1.5 text-sm font-semibold ${on ? 'border-violet bg-violet/10 text-violet' : 'border-input hover:border-primary'}`}
                    >
                      {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {on ? t('unplan') : t('planned')}
                    </button>
                  </div>
                  {(() => {
                    const target = careerId ? (careerMap.get(careerId)?.requirements[id] ?? 60) : 60;
                    return (
                      <div className="mt-4 rounded-lg bg-muted/60 p-3 text-sm">
                        <p className="num font-semibold">
                          {t('currentLevel')} {Math.round(have)} <span aria-hidden>→</span> {t('targetLevel')} {target}
                          <span className="ml-2 text-amber">
                            {have >= target ? t('meetsReq') : `${t('gapLabel')} ${Math.round(target - have)}`}
                          </span>
                        </p>
                        <p className="mt-1 text-muted-foreground">{t('objective')}: {t('objectiveLead')} {target}/100.</p>
                      </div>
                    );
                  })()}
                  <dl className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('prereqs')}</dt>
                      <dd>{s.prerequisites.length ? s.prerequisites.map(skillName).join(', ') : t('noPrereqs')}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('project')}</dt>
                      <dd>{lang === 'ms' ? s.projectMs : s.project}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('resource')}</dt>
                      <dd className="text-muted-foreground">
                        <Pill tone="amber">{t('sample')}</Pill>
                        <span className="mt-1 block">{skillName(id)}: {t('selfStudy')}</span>
                        <span className="mt-1 block text-xs">{t('resourcePlaceholder')}</span>
                      </dd>
                    </div>
                  </dl>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </Page>
  );
}
