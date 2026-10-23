import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCvFile, extractCv, CvError, MAX_CV_BYTES } from './cv-parser.ts';
import { analyzeText } from './cv-analysis.ts';
import { cvSampleText, makeDocx, makePdf, makeZip } from './cv-fixtures.ts';

test('file validation accepts genuine PDF/DOCX signatures and rejects mismatches, executables, empty and >5MB', () => {
  assert.equal(validateCvFile('cv.pdf', 'application/pdf', makePdf()), 'pdf');
  assert.equal(validateCvFile('CV.DOCX', 'application/octet-stream', makeDocx()), 'docx');
  for (const args of [
    ['cv.exe', 'application/pdf', makePdf()],
    ['cv.pdf', 'application/pdf', Buffer.from('MZ executable')],
    ['cv.docx', 'application/pdf', makeDocx()],
    ['cv.pdf', '', Buffer.alloc(0)],
    ['cv.pdf', 'application/pdf', Buffer.alloc(MAX_CV_BYTES + 1)],
  ] as const) assert.throws(() => validateCvFile(args[0], args[1], args[2]), CvError);
});
test('real PDF and DOCX parsing returns actual text and permits rule-based analysis', async () => {
  for (const [buffer, kind] of [[makePdf(), 'pdf'], [makeDocx(), 'docx']] as const) {
    const text = await extractCv(buffer, kind);
    assert.match(text, /Synthetic CV Test Student/);
    assert.match(text, /Bachelor of Computer Science/);
    const analysis = analyzeText(text);
    for (const name of ['Python', 'JavaScript', 'React', 'AWS', 'TensorFlow', 'SQL']) {
      assert.ok(analysis.candidates.some(c => c.name === name), name);
    }
    assert.match(analysis.sections.education, /Example University/);
    assert.match(analysis.sections.experience, /Internship/);
  }
});
test('parser rejects corrupt, blank/scanned-textless and non-Word archives', async () => {
  for (const [buffer, kind] of [
    [Buffer.from('%PDF-broken'), 'pdf'], [makePdf([]), 'pdf'], [makeDocx([]), 'docx'],
    [Buffer.from('PK corrupt'), 'docx'], [makeZip({ 'hello.txt': 'not a CV' }), 'docx'],
    [makeZip({ 'word/document.xml': '', '[Content_Types].xml': '', 'word/vbaProject.bin': 'macro' }), 'docx'],
  ] as const) await assert.rejects(extractCv(buffer, kind), CvError);
});
test('skill extraction identifies only explicit supported mentions, preserves uncertainty and section evidence', () => {
  const a = analyzeText(cvSampleText.join('\n'));
  assert.equal(a.candidates.some(c => c.name === 'Azure'), false);
  assert.equal(a.candidates.some(c => c.skillId === 'cybersecurity'), false);
  assert.ok(a.candidates.every(c => c.uncertain && a.text.includes(c.evidence)));
  assert.match(a.sections.projects, /Campus app/);
  assert.match(a.sections.certifications, /synthetic/);
  assert.match(a.sections.achievements, /Presented/);
  const b = analyzeText('A careful student interested in future opportunities.');
  assert.deepEqual(b.candidates, []);
  assert.ok(Object.values(b.sections).every(value => value === ''));
  const negated = analyzeText('Skills\nI have not used AWS. I plan to study it.');
  assert.ok(negated.candidates[0]?.uncertain);
  assert.match(negated.candidates[0]!.evidence, /not used/);
});
