import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import yauzl from 'yauzl';

export const MAX_CV_BYTES = 5 * 1024 * 1024;
export class CvError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; }
}
export function validateCvFile(name: string, mime: string, data: Uint8Array): 'pdf' | 'docx' {
  if (!data.length) throw new CvError('empty');
  if (data.length > MAX_CV_BYTES) throw new CvError('too-large');
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext !== 'pdf' && ext !== 'docx') throw new CvError('unsupported');
  const allowed = ext === 'pdf'
    ? ['application/pdf', 'application/octet-stream', '']
    : ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream', ''];
  if (!allowed.includes(mime)) throw new CvError('unsupported');
  const header = Buffer.from(data.subarray(0, 5));
  if (ext === 'pdf' ? header.toString() !== '%PDF-' : header[0] !== 0x50 || header[1] !== 0x4b || header[2] !== 3 || header[3] !== 4) {
    throw new CvError('unreadable');
  }
  return ext;
}
async function checkDocxArchive(buffer: Buffer): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (error, zip) => {
      if (error || !zip) { reject(new CvError('unreadable')); return; }
      let total = 0;
      let count = 0;
      let document = false;
      let contentTypes = false;
      const fail = (code: string) => { zip.close(); reject(new CvError(code)); };
      zip.on('error', () => fail('unreadable'));
      zip.on('entry', (entry: yauzl.Entry) => {
        total += entry.uncompressedSize;
        count++;
        if (count > 2048 || total > 20 * 1024 * 1024 || entry.uncompressedSize > 10 * 1024 * 1024) { fail('limits'); return; }
        if ((entry.generalPurposeBitFlag & 1) !== 0) { fail('encrypted'); return; }
        if (/vbaProject|(?:^|\/)embeddings\/|(?:^|\/)activeX\/|\.(?:exe|com|bat|ps1|vbs)$/i.test(entry.fileName)) { fail('unsupported'); return; }
        if (entry.fileName === 'word/document.xml') document = true;
        if (entry.fileName === '[Content_Types].xml') contentTypes = true;
        zip.readEntry();
      });
      zip.on('end', () => document && contentTypes ? resolve() : reject(new CvError('unreadable')));
      zip.readEntry();
    });
  });
}
export async function extractCv(data: Uint8Array, kind: 'pdf' | 'docx'): Promise<string> {
  let text: string;
  try {
    if (kind === 'pdf') {
      const parser = new PDFParse({ data: new Uint8Array(data), verbosity: 0, isEvalSupported: false, stopAtErrors: true });
      try {
        const info = await parser.getInfo();
        if (info.total > 40) throw new CvError('limits');
        const result = await parser.getText({ first: 40, pageJoiner: '\n' });
        text = result.text;
      } finally { await parser.destroy(); }
    } else {
      const buffer = Buffer.from(data);
      await checkDocxArchive(buffer);
      text = (await mammoth.extractRawText({ buffer })).value;
    }
  } catch (error) {
    if (error instanceof CvError) throw error;
    if (error instanceof Error && /password|encrypt/i.test(error.name)) throw new CvError('encrypted');
    throw new CvError('unreadable');
  }
  text = text.replace(/\u0000/g, '').trim();
  if (text.length > 100_000) throw new CvError('limits');
  if (text.replace(/[^a-zA-Z0-9\u00C0-\uFFFF]/g, '').length < 15) throw new CvError('no-text');
  return text;
}
