import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = process.argv[2] ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:8080');
const root = new URL('../generated-artifacts/cv-tests/', import.meta.url);
for (const [name, type, status, code] of [
  ['synthetic-cv.pdf', 'application/pdf', 200],
  ['synthetic-cv.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 200],
  ['blank-cv.pdf', 'application/pdf', 400, 'no-text'],
  ['corrupt-cv.pdf', 'application/pdf', 400, 'unreadable'],
  ['empty-cv.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 400, 'empty'],
  ['unsupported.exe', 'application/octet-stream', 400, 'unsupported'],
]) {
  const data = new FormData();
  data.set('file', new Blob([await readFile(new URL(name, root))], { type }), name);
  const response = await fetch(`${base}/api/skillhalflife/cv/analyze`, { method: 'POST', body: data });
  assert.equal(response.status, status, name);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const result = await response.json();
  if (status === 200) {
    assert.ok(result.candidates.some(c => c.name === 'Python'));
    assert.match(result.sections.education, /Bachelor/);
  } else assert.equal(result.code, code);
  console.log(`PASS ${name}: ${status}`);
}
const big = new FormData();
big.set('file', new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'application/pdf' }), 'oversized.pdf');
assert.equal((await fetch(`${base}/api/skillhalflife/cv/analyze`, { method: 'POST', body: big })).status, 413);
console.log('PASS oversized file: 413');

const input = { scenario: 'moderate', years: 5, simulatedSkills: {}, sdgWeights: {}, profile: {
  skills: { programming: 80 }, interests: ['software'], educationLevel: 'bachelor', relevantExperience: true,
} };
const evaluate = async data => {
  const r = await fetch(`${base}/api/skillhalflife/evaluate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  assert.equal(r.status, 200);
  return r.json();
};
const confirmed = await evaluate(input);
assert.equal(confirmed.profileSkills.communication, 0);
assert.equal(confirmed.rankings.find(c => c.careerId === 'software').fitScore, 33);
const learned = await evaluate({ ...input, simulatedSkills: { communication: 80, databases: 80, 'system-design': 80, 'ai-literacy': 80 } });
assert.ok(learned.rankings.find(c => c.careerId === 'software').fitScore > 33);
assert.deepEqual(learned.roadmap.software, []);
const demo = await evaluate({ scenario: 'moderate', years: 5, simulatedSkills: {}, sdgWeights: {} });
assert.equal(demo.profileSkills.communication, 80);
console.log('PASS CV recalculation, isolated demo, skill gaps and roadmap');
