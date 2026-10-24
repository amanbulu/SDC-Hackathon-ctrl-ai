import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { analyzeCv, type CvAnalysis, type CvSections, type MatchingProfile } from '@workspace/api-client-react';

export interface CvDraft {
  filename: string;
  analysis: CvAnalysis;
  displayName: string;
  sections: CvSections;
  levels: Record<string, number>;
  interests: MatchingProfile['interests'];
  educationLevel: MatchingProfile['educationLevel'];
  relevantExperience: boolean;
}
type CvStatus = 'idle' | 'processing' | 'review' | 'applied' | 'error';
interface CvState {
  draft: CvDraft | null;
  confirmed: CvDraft | null;
}
interface CvContextValue extends CvState {
  status: CvStatus;
  error: string | null;
  processingFilename: string | null;
  storageAvailable: boolean;
  version: number;
  matchingProfile: MatchingProfile | undefined;
  upload: (file: File) => Promise<void>;
  setDraft: Dispatch<SetStateAction<CvDraft | null>>;
  applyDraft: () => void;
  removeCv: () => void;
  cancelUpload: () => void;
}
const KEY = 'skillhalflife.cv.session.v1';
const CvContext = createContext<CvContextValue | null>(null);
function readSession(): CvState {
  try {
    const data = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    const valid = (d: CvDraft | null) => d === null || (d && typeof d.filename === 'string' && typeof d.displayName === 'string' &&
      typeof d.analysis?.text === 'string' && Array.isArray(d.analysis.candidates) &&
      d.analysis.candidates.every(c => c && typeof c.name === 'string' && typeof c.evidence === 'string' && typeof c.category === 'string' && (c.skillId === null || typeof c.skillId === 'string')) &&
      d.sections && ['education', 'experience', 'projects', 'certifications', 'achievements'].every(k => typeof d.sections[k as keyof CvSections] === 'string') &&
      typeof d.levels === 'object' &&
      d.levels !== null && Object.values(d.levels).every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100) &&
      Array.isArray(d.interests) && typeof d.relevantExperience === 'boolean' &&
      ['unconfirmed', 'secondary', 'diploma', 'bachelor', 'postgraduate'].includes(d.educationLevel));
    if (data && valid(data.draft) && valid(data.confirmed)) return data;
  } catch { /* Unavailable or invalid session data never becomes a CV profile. */ }
  return { draft: null, confirmed: null };
}
export function CvProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<CvDraft | null>(() => readSession().draft);
  const [confirmed, setConfirmed] = useState<CvDraft | null>(() => readSession().confirmed);
  const [status, setStatus] = useState<CvStatus>(confirmed ? 'applied' : draft ? 'review' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [processingFilename, setProcessingFilename] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [version, setVersion] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const cancelUpload = useCallback(() => {
    generation.current++;
    controller.current?.abort();
    controller.current = null;
  }, []);
  useEffect(() => () => cancelUpload(), [cancelUpload]);
  useEffect(() => {
    try {
      if (draft || confirmed) sessionStorage.setItem(KEY, JSON.stringify({ draft, confirmed }));
      else sessionStorage.removeItem(KEY);
    } catch { setStorageAvailable(false); }
  }, [draft, confirmed]);
  const upload = async (file: File) => {
    cancelUpload();
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx'].includes(ext ?? '')) {
      setError('unsupported'); setStatus('error'); return;
    }
    if (!file.size) { setError('empty'); setStatus('error'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('too-large'); setStatus('error'); return; }
    const run = generation.current;
    const abort = new AbortController();
    controller.current = abort;
    setStatus('processing');
    setProcessingFilename(file.name);
    try {
      const analysis = await analyzeCv({ file }, { signal: abort.signal });
      if (run !== generation.current) return;
      setDraft({ filename: file.name, analysis, displayName: '', sections: { ...analysis.sections }, levels: {}, interests: [], educationLevel: 'unconfirmed', relevantExperience: false });
      setStatus('review');
    } catch (e) {
      if (run !== generation.current) return;
      const response = e as { data?: { code?: string }; status?: number };
      setError(response.data?.code ?? (response.status === 413 ? 'too-large' : response.status === 429 ? 'rate-limit' : 'unreadable'));
      setStatus('error');
    } finally {
      if (run === generation.current) setProcessingFilename(null);
    }
  };
  const matchingProfile = useMemo<MatchingProfile | undefined>(() => confirmed ? ({
    skills: confirmed.levels, interests: confirmed.interests,
    educationLevel: confirmed.educationLevel, relevantExperience: confirmed.relevantExperience,
  }) : undefined, [confirmed]);
  return <CvContext.Provider value={{
    draft, confirmed, status, error, processingFilename, storageAvailable, version, matchingProfile,
    upload, setDraft, cancelUpload: () => {
      cancelUpload(); setProcessingFilename(null); setStatus(confirmed ? 'applied' : draft ? 'review' : 'idle');
    },
    applyDraft: () => {
      if (!draft) return;
      cancelUpload();
      setConfirmed(structuredClone(draft)); setVersion(v => v + 1); setStatus('applied'); setError(null);
    },
    removeCv: () => {
      cancelUpload(); setProcessingFilename(null); setDraft(null); setConfirmed(null); setStatus('idle'); setError(null); setVersion(v => v + 1);
      try { sessionStorage.removeItem(KEY); } catch { /* Session-only fallback. */ }
    },
  }}>{children}</CvContext.Provider>;
}
export function useCv() {
  const ctx = useContext(CvContext);
  if (!ctx) throw new Error('CvProvider missing');
  return ctx;
}
