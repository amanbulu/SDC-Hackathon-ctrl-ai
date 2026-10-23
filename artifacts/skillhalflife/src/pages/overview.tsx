import { useMemo } from 'react';
import { Link } from 'wouter';
import { Bar, Card, CardTitle, Page, Pill, ScenarioControls } from '@/components/bits';
import { GapList, MatchCard } from '@/components/match-card';
import { useApp } from '@/lib/store';
import { useCv } from '@/lib/cv-context';
import { useActiveProfile } from '@/components/cv-profile';
import { cs } from '@/lib/cv-strings';
import { translateFree, translateInterest } from '@/lib/i18n';

export default function Overview() {
  const { t, lang, catalog, result, skillName, skillMap, years, scenario, careerName } = useApp();
  const p = useActiveProfile();
  const cv = useCv();
  const cvc = cv.confirmed;
  const secs = cvc ? (['education', 'experience', 'projects', 'certifications', 'achievements'] as const) : [];

  const trends = useMemo(() => {
    if (!result) return [];
    return [...result.projections]
      .map((x) => ({ ...x, delta: x.futureRelevance - x.currentRelevance }))
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 6);
  }, [result]);

  const top = result?.rankings[0];
  const steps = top && result ? (result.roadmap[top.careerId] ?? []).slice(0, 4) : [];
  const skills = p ? Object.entries(result?.profileSkills ?? p.skills).sort((a, b) => b[1] - a[1]) : [];

  return (
    <Page title={t('nav.overview')} lead={t('tagline')}>
      {p && result && (
        <>
          <div className="grid gap-5 lg:grid-cols-5">
            <Card id="card-profile" className="lg:col-span-2">
              <CardTitle note={<Pill tone="muted">{cvc ? cs(lang, 'cvProfile') : t('synthetic')}</Pill>}>{cvc ? cs(lang, 'cvProfile') : t('profile')}</CardTitle>
              <p className="text-2xl font-bold" data-testid="text-student-name" style={{ fontFamily: 'var(--app-font-display)' }}>
                {cvc ? cvc.displayName || cs(lang, 'cvProfile') : p.name}
              </p>
              {cvc ? (
                <div className="mt-3 space-y-2 text-sm" data-testid="text-cv-own-sections">
                  <p className="text-xs text-muted-foreground">{cs(lang, 'cvOwn')}</p>
                  {secs.map((k) => (
                    <div key={k}>
                      <p className="font-semibold">{cs(lang, k)}</p>
                      <p className="line-clamp-3 whitespace-pre-line text-muted-foreground">{cvc.sections[k] || cs(lang, 'noneEntered')}</p>
                    </div>
                  ))}
                </div>
              ) : (
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-muted-foreground">{t('location')}</dt>
                <dd>{p.location}</dd>
                <dt className="text-muted-foreground">{t('education')}</dt>
                <dd>{translateFree(lang, p.education)}</dd>
                <dt className="text-muted-foreground">{t('experience')}</dt>
                <dd>{translateFree(lang, p.experience)}</dd>
              </dl>
              )}
              <p className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('interests')}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.interests.map((i) => (
                  <Pill key={i} tone="violet">
                    {translateInterest(lang, i)}
                  </Pill>
                ))}
              </div>
              <Link href="/my-cv" data-testid="link-overview-my-cv" className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary">
                {t('nav.my-cv')}
              </Link>
              <div className="mt-5 rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">{t('avgRelevance')}</p>
                <p className="num text-3xl font-bold text-primary" data-testid="text-avg-relevance">
                  {result.averageRelevance.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(scenario)} / {years} {t('yearsUnit')}
                </p>
              </div>
            </Card>
            <Card id="card-skills" className="lg:col-span-3">
              <CardTitle note={t('proficiency') + ' 0-100'}>{t('currentSkills')}</CardTitle>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {skills.map(([id, v]) => (
                  <li key={id} data-testid={`row-skill-${id}`}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold">{skillName(id)}</span>
                      <span className="num">{Math.round(v)}</span>
                    </div>
                    <Bar value={v} label={skillName(id)} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-bold">{t('topMatches')}</h2>
            <div className="grid gap-5 lg:grid-cols-3 md:grid-cols-2">
              {result.rankings.slice(0, 3).map((m, i) => (
                <MatchCard key={m.careerId} m={m} rank={i + 1} />
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card id="card-trends">
              <CardTitle note={t('trendsNote')}>{t('trends')}</CardTitle>
              <ul className="grid gap-3">
                {trends.map((x) => (
                  <li key={x.skillId} data-testid={`row-trend-${x.skillId}`}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold">{skillName(x.skillId)}</span>
                      <span className="num text-muted-foreground">
                        {x.currentRelevance.toFixed(0)} <span aria-hidden>→</span> {x.futureRelevance.toFixed(0)}
                        <span className="ml-2 text-amber">{x.delta < 0 ? t('trendDown') : t('trendFlat')} {Math.abs(x.delta).toFixed(1)}</span>
                      </span>
                    </div>
                    <div className="relative">
                      <Bar value={x.currentRelevance} tone="violet" label={`${skillName(x.skillId)} ${t('present')}`} />
                      <div className="mt-1">
                        <Bar value={x.futureRelevance} tone="blue" label={`${skillName(x.skillId)} ${t('future')}`} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">{t('assumeExposure')}</p>
            </Card>

            <div className="grid gap-5">
              <Card id="card-gaps">
                <CardTitle note={top ? careerName(top.careerId) : undefined}>{t('gaps')}</CardTitle>
                {top && <GapList careerId={top.careerId} onlyGaps limit={5} />}
              </Card>
              <Card id="card-actions">
                <CardTitle note={t('actionsNote')}>{t('actions')}</CardTitle>
                <ol className="grid gap-2">
                  {steps.map((id, i) => (
                    <li key={id} className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                      <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-semibold">{skillName(id)}</span>
                      <span className="num text-xs text-muted-foreground">
                        {skillMap.get(id)?.hours ?? 0} {t('hours')}
                      </span>
                    </li>
                  ))}
                </ol>
                <Link href="/pathway" data-testid="link-full-pathway" className="mt-3 inline-block text-sm font-semibold text-primary">
                  {t('viewPathway')}
                </Link>
              </Card>
            </div>
          </div>

          <ScenarioControls />
        </>
      )}
    </Page>
  );
}
