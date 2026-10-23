import { mkdir, writeFile } from 'node:fs/promises';
import { makePdf, makeDocx } from '../artifacts/api-server/src/lib/cv-fixtures.ts';

// Synthetic-only examples for manual/browser verification, never real CV data.
const dir = new URL('../generated-artifacts/cv-tests/', import.meta.url);
await mkdir(dir, { recursive: true });
await Promise.all([
  writeFile(new URL('synthetic-cv.pdf', dir), makePdf()),
  writeFile(new URL('synthetic-cv.docx', dir), makeDocx()),
  writeFile(new URL('blank-cv.pdf', dir), makePdf([])),
  writeFile(new URL('corrupt-cv.pdf', dir), '%PDF-corrupt'),
  writeFile(new URL('empty-cv.docx', dir), ''),
  writeFile(new URL('unsupported.exe', dir), 'MZ synthetic invalid file'),
]);
