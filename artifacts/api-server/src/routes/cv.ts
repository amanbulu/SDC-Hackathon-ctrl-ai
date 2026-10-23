import { Router, type IRouter } from 'express';
import multer from 'multer';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { Worker } from 'node:worker_threads';
import { AnalyzeCvResponse } from '@workspace/api-zod';
import { analyzeText } from '../lib/cv-analysis';
import { CvError, MAX_CV_BYTES, validateCvFile } from '../lib/cv-parser';

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_CV_BYTES, files: 1, fields: 0, parts: 1 } }).single('file');
let active = 0;
function inWorker(data: Uint8Array, kind: 'pdf' | 'docx', signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./cv-worker.mjs', import.meta.url), {
      workerData: { data, kind }, resourceLimits: { maxOldGenerationSizeMb: 128, stackSizeMb: 4 },
      // Parser libraries must not print document diagnostics to process logs.
      stdout: true, stderr: true,
    });
    worker.stdout.resume(); worker.stderr.resume();
    const cleanup = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); void worker.terminate(); };
    const abort = () => { cleanup(); reject(new CvError('cancelled')); };
    const timer = setTimeout(() => { cleanup(); reject(new CvError('timeout')); }, 15_000);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) { abort(); return; }
    worker.once('message', (message: { ok: boolean; text?: string; code?: string }) => {
      cleanup();
      if (message.ok && typeof message.text === 'string') resolve(message.text);
      else reject(new CvError(message.code ?? 'unreadable'));
    });
    worker.once('error', () => { cleanup(); reject(new CvError('unreadable')); });
    worker.once('exit', code => { if (code !== 0) { cleanup(); reject(new CvError('unreadable')); } });
  });
}
router.post('/skillhalflife/cv/analyze',
  (_req, res, next) => { res.set('Cache-Control', 'no-store, private'); next(); },
  rateLimit({
    // Conservative peer-level bound: do not trust user-supplied forwarded headers.
    // The worker concurrency bound remains global even across multiple peers.
    keyGenerator: req => ipKeyGenerator(req.socket.remoteAddress ?? 'unknown'),
    windowMs: 10 * 60_000, limit: 40, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { code: 'rate-limit', error: 'Too many upload attempts. Please try again later.' },
  }),
  (req, res) => {
    if (active >= 2) { res.status(503).json({ code: 'busy', error: 'Document processing is busy. Please retry shortly.' }); return; }
    active++;
    const abort = new AbortController();
    let released = false;
    const release = () => { if (!released) { released = true; active--; } };
    req.setTimeout(20_000, () => req.destroy());
    res.once('close', () => { abort.abort(); release(); });
    upload(req, res, async error => {
      try {
        if (error) {
          const oversized = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE';
          res.status(oversized ? 413 : 400).json({ code: oversized ? 'too-large' : 'unsupported', error: 'Upload one PDF or DOCX document up to 5 MB.' });
          return;
        }
        if (!req.file) { res.status(400).json({ code: 'empty', error: 'Select a PDF or DOCX document.' }); return; }
        const kind = validateCvFile(req.file.originalname, req.file.mimetype, req.file.buffer);
        const text = await inWorker(req.file.buffer, kind, abort.signal);
        if (!abort.signal.aborted) res.json(AnalyzeCvResponse.parse(analyzeText(text)));
      } catch (error) {
        if (!abort.signal.aborted && !res.headersSent) {
          const code = error instanceof CvError ? error.code : 'unreadable';
          res.status(code === 'too-large' || code === 'limits' ? 413 : 400).json({
            code, error: 'This document could not be processed. Use a readable, unencrypted text PDF or DOCX within the limits.',
          });
        }
      } finally {
        // No disk storage; drop references immediately, including after cancellation.
        if (req.file) req.file.buffer.fill(0);
        delete req.file;
        release();
      }
    });
  });
export default router;
