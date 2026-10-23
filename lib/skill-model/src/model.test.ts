import { test } from "node:test";
import assert from "node:assert/strict";
import { relevance, evaluate, catalog, learningRoadmap } from "./index.ts";

const defaults={scenario:"moderate" as const,years:5,simulatedSkills:{},sdgWeights:{}};
test("confirmed CV uses no synthetic skills, interests or education and keeps the 70/20/10 formula", () => {
  const profile = { skills: { programming: 80 }, interests: ["software"], educationLevel: "bachelor" as const, relevantExperience: true };
  const result = evaluate({ ...defaults, profile });
  assert.equal(result.profileSkills.programming, 80);
  assert.equal(result.profileSkills.communication, 0);
  assert.equal(result.profileSkills.databases, 0);
  for (const m of result.rankings) {
    assert.equal(m.fitScore, .7*m.skillAlignment + .2*m.interestAlignment + .1*m.educationAlignment);
    assert.equal(m.educationAlignment, 90);
  }
  assert.equal(result.rankings.find(m => m.careerId === "software")!.interestAlignment, 50);
  assert.equal(result.rankings.find(m => m.careerId === "cybersecurity")!.interestAlignment, 0);
  const unknown = evaluate({ ...defaults, profile: { skills: {}, interests: [], educationLevel: "unconfirmed", relevantExperience: false } });
  assert.ok(unknown.rankings.every(m => m.fitScore === 0));
  const learned = evaluate({ ...defaults, profile, simulatedSkills: { databases: 80, "system-design": 70, communication: 80, "ai-literacy": 60 } });
  const before = result.rankings.find(m => m.careerId === "software")!;
  const after = learned.rankings.find(m => m.careerId === "software")!;
  assert.ok(after.fitScore > before.fitScore);
  assert.ok(after.missingSkills.length < before.missingSkills.length);
  assert.deepEqual(learned.roadmap.software, []);
});
test("confirmed CV rejects unknown skills, out-of-range proficiency and invalid interest/qualification values", () => {
  const profile = { skills: {}, interests: [], educationLevel: "unconfirmed" as const, relevantExperience: false };
  assert.throws(() => evaluate({ ...defaults, profile: { ...profile, skills: { invented: 80 } } }));
  assert.throws(() => evaluate({ ...defaults, profile: { ...profile, skills: { programming: 101 } } }));
  assert.throws(() => evaluate({ ...defaults, profile: { ...profile, interests: ["fiction"] } }));
});
test("relevance is unchanged initially, halves after one half-life, quarters after two",()=>{
  assert.equal(relevance(80,0,4),80);
  assert.equal(relevance(80,4,4),40);
  assert.equal(relevance(80,8,4),20);
});
test("relevance validates finite values, ranges and positive half-lives",()=>{
  for (const values of [[-1,2,3],[101,2,3],[80,-1,3],[80,1,0],[80,1,-2],[80,1,Infinity],[NaN,1,3]]) {
    assert.throws(()=>relevance(values[0]!,values[1]!,values[2]!));
  }
});
test("fast scenario lowers each projected relevance but never changes task exposure or career qualification",()=>{
  const a=evaluate(defaults),b=evaluate({...defaults,scenario:"fast"});
  a.projections.forEach((p,i)=>assert.ok(b.projections[i]!.futureRelevance<p.futureRelevance));
  assert.deepEqual(a.rankings,b.rankings);
  assert.equal(catalog.skills[0]!.taskExposure,70);
});
test("career match is precisely 70/20/10 and bounded; ties have deterministic ordering",()=>{
  const result=evaluate(defaults);
  for (const m of result.rankings) {
    assert.equal(m.fitScore,.7*m.skillAlignment+.2*m.interestAlignment+.1*m.educationAlignment);
    assert.ok(m.fitScore>=0 && m.fitScore<=100);
  }
  assert.deepEqual(result,evaluate(defaults));
});
test("learning missing skills increases fit and reduces gaps without changing baseline",()=>{
  const before=evaluate(defaults);
  const after=evaluate({...defaults,simulatedSkills:{"machine-learning":90,"ai-literacy":90,programming:90}});
  const a=before.rankings.find(c=>c.careerId==="ai")!,b=after.rankings.find(c=>c.careerId==="ai")!;
  assert.ok(b.fitScore>a.fitScore);
  assert.ok(b.missingSkills.length<a.missingSkills.length);
  assert.equal(catalog.profile.skills["machine-learning"],0);
  assert.equal(evaluate({...defaults,simulatedSkills:{programming:0}}).profileSkills.programming,75);
});
test("all 17 goals supported; each changes scores; focused weights can reorder ranks without changing fit",()=>{
  assert.equal(catalog.goals.length,17);
  const base=evaluate(defaults);
  for (const goal of catalog.goals) {
    const changed=evaluate({...defaults,sdgWeights:{[goal.id]:100}});
    assert.ok(changed.rankings.some(m=>m.sdgBonus>0));
    for (const m of changed.rankings) assert.equal(m.fitScore,base.rankings.find(b=>b.careerId===m.careerId)!.fitScore);
  }
  const impact=evaluate({...defaults,sdgWeights:{"5":100,"10":100,"16":100}});
  assert.notDeepEqual(impact.rankings.map(r=>r.careerId),base.rankings.map(r=>r.careerId));
  for (const c of catalog.careers) assert.equal(Object.values(c.sdgContributions).reduce((a,b)=>a+b,0),30);
});
test("roadmap respects prerequisites, includes preparatory gaps, has no duplicates, empty when fully skilled",()=>{
  for (const c of catalog.careers) {
    const road=learningRoadmap(c,{});
    assert.equal(new Set(road).size,road.length);
    road.forEach((id,i)=>catalog.skills.find(s=>s.id===id)!.prerequisites.forEach(p=>assert.ok(road.indexOf(p)<i)));
    assert.deepEqual(learningRoadmap(c,Object.fromEntries(catalog.skills.map(s=>[s.id,100]))),[]);
  }
});
test("evaluation rejects unknown ids, NaN, out-of-range inputs and invalid scenarios",()=>{
  for (const bad of [{years:-1},{years:21},{years:NaN},{scenario:"invalid"},{simulatedSkills:{fake:50}},{simulatedSkills:{cloud:101}},{sdgWeights:{"18":1}},{sdgWeights:{"4":-1}}]) {
    assert.throws(()=>evaluate({...defaults,...bad} as typeof defaults));
  }
});
test("zero horizon and maximum horizon produce finite, consistent chart data",()=>{
  for (const years of [0,20]) {
    const result=evaluate({...defaults,years});
    for (const p of result.projections) {
      assert.equal(p.points.length,41);
      assert.equal(p.points.at(-1)!.year,years);
      assert.equal(p.points.at(-1)!.relevance,p.futureRelevance);
      assert.ok(p.points.every(pt=>Number.isFinite(pt.relevance)));
    }
  }
});
