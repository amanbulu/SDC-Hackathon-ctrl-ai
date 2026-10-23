import { parentPort, workerData } from 'node:worker_threads';
import { extractCv, CvError } from './cv-parser';

// Never forward parser exceptions (which may include document fragments).
try {
  const text = await extractCv(workerData.data, workerData.kind);
  parentPort?.postMessage({ ok: true, text });
} catch (error) {
  parentPort?.postMessage({ ok: false, code: error instanceof CvError ? error.code : 'unreadable' });
}
