export type EvaluationInput = {
  scenario: "moderate" | "fast";
  years: number;
  simulatedSkills: Record<string, number>;
  sdgWeights: Record<string, number>;
};
export type SkillDefinition = {
  id: string; name: string; nameMs: string; initialRelevance: number;
  moderateHalfLife: number; fastHalfLife: number; taskExposure: number;
  hours: number; prerequisites: string[]; project: string; projectMs: string;
};
export type CareerDefinition = {
  id: string; name: string; nameMs: string; interests: string[];
  educationAlignment: number; requirements: Record<string, number>;
  sdgContributions: Record<string, number>;
};
// All numbers below are synthetic modeling choices, not observations or forecasts.
export const skills: SkillDefinition[] = [
  { id:"programming", name:"Programming", nameMs:"Pengaturcaraan", initialRelevance:90, moderateHalfLife:4, fastHalfLife:2, taskExposure:70, hours:60, prerequisites:[], project:"Build a tested student task manager.", projectMs:"Bina pengurus tugasan pelajar dengan ujian." },
  { id:"cloud", name:"Cloud computing", nameMs:"Pengkomputeran awan", initialRelevance:85, moderateHalfLife:3.5, fastHalfLife:2.5, taskExposure:40, hours:50, prerequisites:["programming","networking"], project:"Deploy a monitored web service with a cost budget.", projectMs:"Lancarkan perkhidmatan web dengan pemantauan dan belanjawan kos." },
  { id:"cybersecurity", name:"Cybersecurity", nameMs:"Keselamatan siber", initialRelevance:88, moderateHalfLife:5, fastHalfLife:3.5, taskExposure:30, hours:55, prerequisites:["networking"], project:"Threat-model and secure a student application.", projectMs:"Modelkan ancaman dan lindungi aplikasi pelajar." },
  { id:"system-design", name:"System design", nameMs:"Reka bentuk sistem", initialRelevance:90, moderateHalfLife:7, fastHalfLife:5, taskExposure:25, hours:45, prerequisites:["programming","databases"], project:"Design a scalable campus booking service.", projectMs:"Reka perkhidmatan tempahan kampus yang boleh diskalakan." },
  { id:"ai-literacy", name:"AI literacy", nameMs:"Literasi AI", initialRelevance:92, moderateHalfLife:3, fastHalfLife:1.5, taskExposure:35, hours:30, prerequisites:[], project:"Evaluate an AI-assisted workflow for accuracy and bias.", projectMs:"Nilai aliran kerja berbantu AI untuk ketepatan dan bias." },
  { id:"communication", name:"Communication", nameMs:"Komunikasi", initialRelevance:95, moderateHalfLife:10, fastHalfLife:8, taskExposure:15, hours:20, prerequisites:[], project:"Present a technical proposal to a non-technical audience.", projectMs:"Bentangkan cadangan teknikal kepada khalayak bukan teknikal." },
  { id:"databases", name:"Databases & SQL", nameMs:"Pangkalan data & SQL", initialRelevance:85, moderateHalfLife:5, fastHalfLife:3.5, taskExposure:50, hours:40, prerequisites:["programming"], project:"Model and query a campus services database.", projectMs:"Modelkan dan kueri pangkalan data perkhidmatan kampus." },
  { id:"networking", name:"Networking", nameMs:"Rangkaian", initialRelevance:80, moderateHalfLife:6, fastHalfLife:4.5, taskExposure:30, hours:35, prerequisites:[], project:"Document a secure campus network and diagnose faults.", projectMs:"Dokumentasikan rangkaian kampus selamat dan diagnosis kerosakan." },
  { id:"machine-learning", name:"Machine learning", nameMs:"Pembelajaran mesin", initialRelevance:90, moderateHalfLife:2.5, fastHalfLife:1.5, taskExposure:55, hours:80, prerequisites:["programming","ai-literacy","databases"], project:"Train and evaluate a small classifier with documented limitations.", projectMs:"Latih dan nilai pengelas kecil dengan batasan yang didokumenkan." },
  { id:"data-pipelines", name:"Data pipelines", nameMs:"Saluran data", initialRelevance:86, moderateHalfLife:4, fastHalfLife:2.5, taskExposure:50, hours:60, prerequisites:["databases","cloud"], project:"Build a validated batch ingestion pipeline.", projectMs:"Bina saluran pengingesan kelompok dengan pengesahan." },
];
export const profile = {
  name:"Aina Rahman",
  location:"Kuala Lumpur, Malaysia",
  education:"Year 3 · Bachelor of Software Engineering",
  experience:"Two university projects and a 12-week web development internship",
  interests:["software","cloud","social-impact"],
  skills: { programming:75, cloud:30, cybersecurity:25, "system-design":40, "ai-literacy":45, communication:80, databases:60, networking:35, "machine-learning":0, "data-pipelines":0 } as Record<string,number>,
};
function contributions(values: number[]): Record<string,number> {
  return Object.fromEntries(values.map((v,i)=>[String(i+1),v]));
}
// Each career's contributions sum to 30. Weighted preferences add at most 30 points.
export const careers: CareerDefinition[] = [
  {id:"software",name:"Software Engineer",nameMs:"Jurutera Perisian",interests:["software","social-impact"],educationAlignment:95,requirements:{programming:80,"system-design":65,databases:65,communication:70,"ai-literacy":55},sdgContributions:contributions([1,1,1,6,3,3,1,4,4,2,1,0,0,0,0,1,2])},
  {id:"cloud",name:"Cloud Engineer",nameMs:"Jurutera Awan",interests:["cloud","infrastructure"],educationAlignment:80,requirements:{cloud:75,networking:70,programming:65,cybersecurity:50,communication:60},sdgContributions:contributions([0,0,1,1,1,1,4,4,8,1,2,3,2,0,0,0,2])},
  {id:"cybersecurity",name:"Cybersecurity Analyst",nameMs:"Penganalisis Keselamatan Siber",interests:["security","social-impact"],educationAlignment:75,requirements:{cybersecurity:80,networking:70,programming:55,communication:70,"ai-literacy":50},sdgContributions:contributions([1,0,1,2,4,0,0,4,3,5,1,0,0,0,0,7,2])},
  {id:"data",name:"Data Engineer",nameMs:"Jurutera Data",interests:["data","cloud"],educationAlignment:80,requirements:{databases:80,"data-pipelines":75,cloud:60,programming:75,communication:60},sdgContributions:contributions([2,2,2,3,2,1,1,4,2,3,1,1,1,1,1,1,2])},
  {id:"ai",name:"AI Engineer",nameMs:"Jurutera AI",interests:["ai","social-impact"],educationAlignment:70,requirements:{"machine-learning":80,"ai-literacy":80,programming:80,databases:60,communication:70},sdgContributions:contributions([1,1,3,7,2,1,1,2,6,1,0,1,1,0,0,1,2])},
];
const goalRows = [
  ["No poverty","Tiada kemiskinan","Build accessible services that reduce barriers to earning.","Bina perkhidmatan mudah diakses untuk mengurangkan halangan pendapatan."],
  ["Zero hunger","Kelaparan sifar","Support food distribution and agricultural data tools.","Sokong pengagihan makanan dan alat data pertanian."],
  ["Good health and well-being","Kesihatan baik dan kesejahteraan","Enable reliable and privacy-aware health technology.","Dayakan teknologi kesihatan yang boleh dipercayai dan menjaga privasi."],
  ["Quality education","Pendidikan berkualiti","Main goal: accessible learning platforms and lifelong reskilling.","Matlamat utama: platform pembelajaran mudah diakses dan peningkatan kemahiran sepanjang hayat."],
  ["Gender equality","Kesaksamaan gender","Design inclusive products and audit access and bias.","Reka produk inklusif dan audit akses serta bias."],
  ["Clean water and sanitation","Air bersih dan sanitasi","Support water monitoring and service information systems.","Sokong pemantauan air dan sistem maklumat perkhidmatan."],
  ["Affordable and clean energy","Tenaga mampu milik dan bersih","Improve energy-aware infrastructure and monitoring.","Tingkatkan infrastruktur cekap tenaga dan pemantauan."],
  ["Decent work and economic growth","Pekerjaan baik dan pertumbuhan ekonomi","Build productive tools and support safer digital work.","Bina alat produktif dan sokong kerja digital lebih selamat."],
  ["Industry, innovation and infrastructure","Industri, inovasi dan infrastruktur","Develop resilient digital systems and responsible innovation.","Bangunkan sistem digital berdaya tahan dan inovasi bertanggungjawab."],
  ["Reduced inequalities","Mengurangkan ketidaksamaan","Reduce digital exclusion through accessibility and fair design.","Kurangkan pengecualian digital melalui kebolehcapaian dan reka bentuk adil."],
  ["Sustainable cities and communities","Bandar dan komuniti mampan","Support accessible urban services and community systems.","Sokong perkhidmatan bandar mudah diakses dan sistem komuniti."],
  ["Responsible consumption and production","Penggunaan dan pengeluaran bertanggungjawab","Reduce resource waste through efficient systems.","Kurangkan pembaziran sumber melalui sistem cekap."],
  ["Climate action","Tindakan iklim","Enable climate information and resource-efficient computing.","Dayakan maklumat iklim dan pengkomputeran cekap sumber."],
  ["Life below water","Hidupan di bawah air","Support marine conservation information projects.","Sokong projek maklumat pemuliharaan marin."],
  ["Life on land","Hidupan di darat","Support biodiversity monitoring information projects.","Sokong projek maklumat pemantauan biodiversiti."],
  ["Peace, justice and strong institutions","Keamanan, keadilan dan institusi kukuh","Protect trustworthy services, privacy and accountable systems.","Lindungi perkhidmatan dipercayai, privasi dan sistem bertanggungjawab."],
  ["Partnerships for the goals","Perkongsian untuk matlamat","Enable interoperable collaboration across organizations.","Dayakan kerjasama saling kendali antara organisasi."],
];
export const goals = goalRows.map((row,i)=>({id:i+1,name:row[0]!,nameMs:row[1]!,mechanism:row[2]!,mechanismMs:row[3]!}));
export const catalog = {
  profile, skills, careers, goals,
  observations: skills.map(s=>({
    skillId:s.id, sourceUrl:null, observationDate:null, retrievalDate:null,
    metricDefinition:"Illustrative initial skill relevance index (0–100); not measured job demand",
    value:s.initialRelevance, synthetic:true,
  })),
};
function bounded(value: number, min:number, max:number, field:string):void {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${field} must be finite and between ${min} and ${max}`);
}
export function relevance(initialRelevance:number, elapsedYears:number, halfLifeYears:number):number {
  bounded(initialRelevance,0,100,"initialRelevance");
  bounded(elapsedYears,0,1000,"elapsedYears");
  if (!Number.isFinite(halfLifeYears) || halfLifeYears<=0) throw new Error("halfLifeYears must be finite and positive");
  return initialRelevance * 2 ** (-elapsedYears / halfLifeYears);
}
export function learningRoadmap(career:CareerDefinition, profileSkills:Record<string,number>):string[] {
  const ordered:string[]=[];
  const visited=new Set<string>();
  const requirements={...career.requirements};
  function visit(id:string, required=60):void {
    if (visited.has(id) || (profileSkills[id]??0)>=required) return;
    visited.add(id);
    const skill=skills.find(s=>s.id===id);
    if (!skill) throw new Error(`Unknown skill ${id}`);
    for (const prereq of skill.prerequisites) visit(prereq,requirements[prereq]??60);
    ordered.push(id);
  }
  for (const [id,required] of Object.entries(requirements)) visit(id,required);
  return ordered;
}
export function evaluate(input:EvaluationInput) {
  if (!input || !["moderate","fast"].includes(input.scenario)) throw new Error("Unknown scenario");
  bounded(input.years,0,20,"years");
  if (!input.simulatedSkills || !input.sdgWeights) throw new Error("Skills and SDG weights are required");
  for (const [id,value] of Object.entries(input.simulatedSkills)) {
    if (!skills.some(s=>s.id===id)) throw new Error(`Unknown skill ${id}`);
    bounded(value,0,100,"proficiency");
  }
  for (const [id,value] of Object.entries(input.sdgWeights)) {
    if (!goals.some(g=>String(g.id)===id)) throw new Error(`Unknown SDG ${id}`);
    bounded(value,0,100,"weight");
  }
  const profileSkills={...profile.skills};
  // Learning cannot erase a pre-existing skill.
  for (const [id,value] of Object.entries(input.simulatedSkills)) profileSkills[id]=Math.max(profileSkills[id]??0,value);
  const projections=skills.map(s=>{
    const halfLife=input.scenario==="fast"?s.fastHalfLife:s.moderateHalfLife;
    return {skillId:s.id,halfLife,currentRelevance:s.initialRelevance,
      futureRelevance:relevance(s.initialRelevance,input.years,halfLife),
      points:Array.from({length:41},(_,i)=>({year:i*input.years/40,relevance:relevance(s.initialRelevance,i*input.years/40,halfLife)})),
    };
  });
  const rankings=careers.map(c=>{
    const entries=Object.entries(c.requirements);
    const skillAlignment=100*entries.reduce((sum,[id,required])=>sum+Math.min(1,(profileSkills[id]??0)/required),0)/entries.length;
    const interestAlignment=100*c.interests.filter(id=>profile.interests.includes(id)).length/c.interests.length;
    const educationAlignment=c.educationAlignment;
    const fitScore=.7*skillAlignment+.2*interestAlignment+.1*educationAlignment;
    const sdgBonus=goals.reduce((sum,g)=>sum+(input.sdgWeights[String(g.id)]??0)/100*(c.sdgContributions[String(g.id)]??0),0);
    return {careerId:c.id,fitScore,adjustedScore:fitScore+sdgBonus,sdgBonus,skillAlignment,interestAlignment,educationAlignment,
      missingSkills:entries.filter(([id,required])=>(profileSkills[id]??0)<required).map(([id])=>id),
      transferableSkills:entries.filter(([id])=>(profileSkills[id]??0)>=50).map(([id])=>id),
      reasons:[`Skill alignment contributes ${(skillAlignment*.7).toFixed(1)} points (70% weight).`,`Interest overlap contributes ${(interestAlignment*.2).toFixed(1)} points (20% weight).`,`Illustrative education/experience alignment contributes ${(educationAlignment*.1).toFixed(1)} points (10% weight).`],
      reasonsMs:[`Kesepadanan kemahiran menyumbang ${(skillAlignment*.7).toFixed(1)} mata (wajaran 70%).`,`Pertindihan minat menyumbang ${(interestAlignment*.2).toFixed(1)} mata (wajaran 20%).`,`Kesepadanan pendidikan/pengalaman ilustratif menyumbang ${(educationAlignment*.1).toFixed(1)} mata (wajaran 10%).`],
    };
  }).sort((a,b)=>b.adjustedScore-a.adjustedScore || a.careerId.localeCompare(b.careerId));
  return {rankings,projections,profileSkills,
    averageRelevance:projections.reduce((sum,p)=>sum+p.futureRelevance,0)/projections.length,
    roadmap:Object.fromEntries(careers.map(c=>[c.id,learningRoadmap(c,profileSkills)])),
  };
}
