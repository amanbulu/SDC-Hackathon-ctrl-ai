import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useGetSkillCatalog, useEvaluateProfile, type ModelCatalog, type EvaluationResult } from '@workspace/api-client-react';
import { tr, type Lang } from '@/lib/i18n';
import { useCv } from '@/lib/cv-context';
import { useQueryClient } from '@tanstack/react-query';

type Catalog = ModelCatalog;
export type EvalResult = EvaluationResult;
export type Skill = Catalog['skills'][number];
export type Career = Catalog['careers'][number];
export type Goal = Catalog['goals'][number];
export type Match = EvalResult['rankings'][number];
export type Scenario = 'moderate' | 'fast';
export type Status = 'idle' | 'loading' | 'error' | 'ready';

const KEY = 'skillhalflife.settings.v1';
export const FOCUS_GOALS = [4, 5, 8, 9, 10];

interface Settings {
  lang: Lang;
  scenario: Scenario;
  years: number;
  sdgWeights: Record<string, number>;
  simulated: Record<string, number>;
}

const DEFAULTS: Settings = { lang: 'en', scenario: 'moderate', years: 5, sdgWeights: {}, simulated: {} };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function cleanMap(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      if (typeof x === 'number' && Number.isFinite(x)) out[k] = clamp(Math.round(x), 0, 100);
    }
  }
  return out;
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      lang: p.lang === 'ms' ? 'ms' : 'en',
      scenario: p.scenario === 'fast' ? 'fast' : 'moderate',
      years: typeof p.years === 'number' && Number.isFinite(p.years) ? clamp(Math.round(p.years), 0, 20) : 5,
      sdgWeights: cleanMap(p.sdgWeights),
      simulated: cleanMap(p.simulated),
    };
  } catch {
    return DEFAULTS;
  }
}

function defaultWeight(id: number) {
  return FOCUS_GOALS.includes(id) ? 50 : 0;
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
  catalog: Catalog | undefined;
  activeProfile: Catalog['profile'] | undefined;
  catalogLoading: boolean;
  catalogError: boolean;
  refetchCatalog: () => void;
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  years: number;
  setYears: (n: number) => void;
  weights: Record<string, number>;
  setWeight: (id: number, v: number) => void;
  setAllWeights: (w: Record<string, number>) => void;
  simulated: Record<string, number>;
  setSim: (id: string, v: number) => void;
  clearSim: (id?: string) => void;
  result: EvalResult | null;
  base: EvalResult | null;
  status: Status;
  retry: () => void;
  resetAll: () => void;
  careerId: string | null;
  setCareerId: (id: string) => void;
  skillName: (id: string) => string;
  careerName: (id: string) => string;
  skillMap: Map<string, Skill>;
  careerMap: Map<string, Career>;
}

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('AppProvider missing');
  return c;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { draft, confirmed, matchingProfile, version: cvVersion, removeCv } = useCv();
  const queryClient = useQueryClient();
  const previousCvVersion = useRef(cvVersion);
  const [settings, setSettings] = useState<Settings>(load);
  const [careerSel, setCareerSel] = useState<string | null>(null);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [base, setBase] = useState<EvalResult | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [tick, setTick] = useState(0);
  const [resultProfileKey, setResultProfileKey] = useState('');
  const profileKey = JSON.stringify([matchingProfile ?? null, cvVersion]);

  const q = useGetSkillCatalog();
  const catalog = q.data;
  const evalMut = useEvaluateProfile();
  const mutateRef = useRef(evalMut.mutateAsync);
  mutateRef.current = evalMut.mutateAsync;
  const genRef = useRef(0);
  const refetchRef = useRef(q.refetch);
  refetchRef.current = q.refetch;

  useEffect(() => {
    try {
      // Real-CV simulations are tab-scoped, never copied into persistent settings.
      localStorage.setItem(KEY, JSON.stringify(confirmed ? { ...settings, simulated: {} } : settings));
    } catch {
      /* storage unavailable */
    }
    document.documentElement.lang = settings.lang === 'ms' ? 'ms' : 'en';
  }, [settings, confirmed]);

  useEffect(() => {
    if (previousCvVersion.current === cvVersion) return;
    previousCvVersion.current = cvVersion;
    setSettings(s => ({ ...s, simulated: {} }));
    setCareerSel(null);
    queryClient.getMutationCache().clear();
    queryClient.removeQueries({ queryKey: ['skillhalflife-scenario-comparison'] });
  }, [cvVersion, queryClient]);

  const weights = useMemo(() => {
    const w: Record<string, number> = {};
    for (const g of catalog?.goals ?? []) {
      const k = String(g.id);
      w[k] = settings.sdgWeights[k] ?? defaultWeight(g.id);
    }
    return w;
  }, [catalog, settings.sdgWeights]);

  const wKey = JSON.stringify(weights);
  const sKey = JSON.stringify(settings.simulated);
  const { scenario, years } = settings;

  useEffect(() => {
    if (!catalog) return;
    const gen = ++genRef.current;
    setStatus('loading');
    const w = JSON.parse(wKey) as Record<string, number>;
    const sim = JSON.parse(sKey) as Record<string, number>;
    const timer = setTimeout(() => {
      const call = (simulatedSkills: Record<string, number>) =>
        mutateRef.current({ data: { scenario, years, simulatedSkills, sdgWeights: w, profile: matchingProfile } });
      const hasSim = Object.keys(sim).length > 0;
      Promise.all([call(sim), hasSim ? call({}) : Promise.resolve(null)])
        .then(([r, b]) => {
          if (gen !== genRef.current) return;
          setResult(r);
          setBase(b);
          setResultProfileKey(profileKey);
          setStatus('ready');
        })
        .catch(() => {
          if (gen !== genRef.current) return;
          setStatus('error');
        });
    }, 180);
    return () => { clearTimeout(timer); genRef.current++; };
  }, [catalog, scenario, years, wKey, sKey, tick, profileKey]);

  const lang = settings.lang;
  const t = useCallback((k: string) => tr(lang, k), [lang]);
  const skillMap = useMemo(() => new Map((catalog?.skills ?? []).map((s) => [s.id, s])), [catalog]);
  const careerMap = useMemo(() => new Map((catalog?.careers ?? []).map((c) => [c.id, c])), [catalog]);
  const activeProfile: Catalog['profile'] | undefined = confirmed && catalog ? {
    name: confirmed.displayName || (lang === 'ms' ? 'Profil CV saya' : 'My CV profile'),
    location: '',
    education: confirmed.sections.education || (lang === 'ms' ? 'Belum disahkan' : 'Not confirmed'),
    experience: confirmed.sections.experience || (lang === 'ms' ? 'Belum disahkan' : 'Not confirmed'),
    interests: confirmed.interests,
    skills: Object.fromEntries(catalog.skills.map(s => [s.id, confirmed.levels[s.id] ?? 0])),
  } : draft ? undefined : catalog?.profile;
  const currentResult = resultProfileKey === profileKey ? result : null;

  const value: Ctx = {
    lang,
    setLang: (l) => setSettings((s) => ({ ...s, lang: l })),
    t,
    catalog,
    activeProfile,
    catalogLoading: q.isLoading,
    catalogError: q.isError,
    refetchCatalog: () => void refetchRef.current(),
    scenario,
    setScenario: (s) => setSettings((p) => ({ ...p, scenario: s })),
    years,
    setYears: (n) => setSettings((p) => ({ ...p, years: clamp(Math.round(n), 0, 20) })),
    weights,
    setWeight: (id, v) =>
      setSettings((p) => ({ ...p, sdgWeights: { ...p.sdgWeights, [String(id)]: clamp(Math.round(v), 0, 100) } })),
    setAllWeights: (w) => setSettings((p) => ({ ...p, sdgWeights: cleanMap(w) })),
    simulated: settings.simulated,
    setSim: (id, v) =>
      setSettings((p) => ({ ...p, simulated: { ...p.simulated, [id]: clamp(Math.round(v), 0, 100) } })),
    clearSim: (id) =>
      setSettings((p) => {
        if (!id) return { ...p, simulated: {} };
        const n = { ...p.simulated };
        delete n[id];
        return { ...p, simulated: n };
      }),
    result: currentResult,
    base: resultProfileKey === profileKey ? base : null,
    status: !currentResult && status === 'ready' ? 'loading' : status,
    retry: () => setTick((x) => x + 1),
    resetAll: () => {
      setSettings({ ...DEFAULTS });
      setCareerSel(null);
      removeCv();
    },
    careerId:
      careerSel && careerMap.has(careerSel) ? careerSel : (currentResult?.rankings[0]?.careerId ?? null),
    setCareerId: setCareerSel,
    skillName: (id) => {
      const s = skillMap.get(id);
      return s ? (lang === 'ms' ? s.nameMs : s.name) : id;
    },
    careerName: (id) => {
      const c = careerMap.get(id);
      return c ? (lang === 'ms' ? c.nameMs : c.name) : id;
    },
    skillMap,
    careerMap,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
