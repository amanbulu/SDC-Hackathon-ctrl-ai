// Rule-based candidates are review suggestions, never claims of competence.
type Rule = [string, string, string | null, RegExp];
const rules: Rule[] = [
  ["Python", "Programming language", "programming", /\bpython\b/i],
  ["JavaScript", "Programming language", "programming", /\bjavascript\b|\bJS\b/i],
  ["TypeScript", "Programming language", "programming", /\btypescript\b/i],
  ["Java", "Programming language", "programming", /\bjava\b/i],
  ["C++", "Programming language", "programming", /(?:^|\W)c\+\+(?=\W|$)/i],
  ["C#", "Programming language", "programming", /(?:^|\W)c#(?=\W|$)/i],
  ["Go", "Programming language", "programming", /\bgolang\b/],
  ["PHP", "Programming language", "programming", /\bphp\b/i],
  ["Rust", "Programming language", "programming", /\brust\b/i],
  ["Programming", "Technical skill", "programming", /\bprogramming\b|\bpengaturcaraan\b/i],
  ["React", "Framework or tool", "programming", /\breact(?:\.?js)?\b/i],
  ["Node.js", "Framework or tool", "programming", /\bnode\.?js\b/i],
  ["Django", "Framework or tool", "programming", /\bdjango\b/i],
  ["Spring", "Framework or tool", "programming", /\bspring(?:\s+boot)?\b/i],
  ["Angular", "Framework or tool", "programming", /\bangular\b/i],
  ["Vue", "Framework or tool", "programming", /\bvue(?:\.?js)?\b/i],
  ["Git", "Framework or tool", null, /\bgit\b/i],
  ["Docker", "Framework or tool", null, /\bdocker\b/i],
  ["Kubernetes", "Cloud tool", "cloud", /\bkubernetes\b|\bk8s\b/i],
  ["AWS", "Cloud", "cloud", /\baws\b|\bamazon web services\b/i],
  ["Azure", "Cloud", "cloud", /\bazure\b/i],
  ["Google Cloud", "Cloud", "cloud", /\bgoogle cloud\b|\bgcp\b/i],
  ["Cloud computing", "Cloud", "cloud", /\bcloud computing\b|\bpengkomputeran awan\b/i],
  ["Terraform", "Cloud tool", "cloud", /\bterraform\b/i],
  ["SQL", "Database", "databases", /\bsql\b/i],
  ["PostgreSQL", "Database", "databases", /\bpostgres(?:ql)?\b/i],
  ["MySQL", "Database", "databases", /\bmysql\b/i],
  ["MongoDB", "Database", "databases", /\bmongodb\b/i],
  ["Databases", "Database", "databases", /\bdatabases?\b|\bpangkalan data\b/i],
  ["Machine learning", "AI and machine learning", "machine-learning", /\bmachine learning\b|\bpembelajaran mesin\b/i],
  ["TensorFlow", "AI and machine learning", "machine-learning", /\btensorflow\b/i],
  ["PyTorch", "AI and machine learning", "machine-learning", /\bpytorch\b/i],
  ["scikit-learn", "AI and machine learning", "machine-learning", /\bscikit[- ]learn\b/i],
  ["AI literacy", "AI", "ai-literacy", /\bai literacy\b|\bliterasi ai\b/i],
  ["Artificial intelligence", "AI", "ai-literacy", /\bartificial intelligence\b|\bkecerdasan buatan\b|\bAI\b/i],
  ["Generative AI", "AI", "ai-literacy", /\bgenerative ai\b|\blarge language models?\b|\bllms?\b/i],
  ["Cybersecurity", "Cybersecurity", "cybersecurity", /\bcyber\s?security\b|\bkeselamatan siber\b/i],
  ["Penetration testing", "Cybersecurity", "cybersecurity", /\bpenetration testing\b|\bpentesting\b/i],
  ["Threat modelling", "Cybersecurity", "cybersecurity", /\bthreat model(?:ling|ing)?\b/i],
  ["Network security", "Cybersecurity", "cybersecurity", /\bnetwork security\b/i],
  ["Networking", "Networking", "networking", /\bnetworking\b|\btcp\/ip\b|\bcomputer networks?\b/i],
  ["System design", "Architecture", "system-design", /\bsystem design\b|\bsoftware architecture\b|\breka bentuk sistem\b/i],
  ["Data pipelines", "Data engineering", "data-pipelines", /\bdata pipelines?\b|\betl\b|\bapache (?:spark|airflow|kafka)\b/i],
  ["Communication", "Professional skill", "communication", /\bcommunication\b|\bkomunikasi\b|\bpublic speaking\b/i],
];
const headers: Array<[keyof Sections, RegExp]> = [
  ["education", /^(?:education|academic(?: background| qualifications)?|qualifications|pendidikan|kelayakan)\s*:?\s*$/i],
  ["experience", /^(?:(?:work|professional|employment) (?:experience|history)|experience|internships?|pengalaman(?: kerja)?)\s*:?\s*$/i],
  ["projects", /^(?:(?:selected |academic |personal )?projects|projek)\s*:?\s*$/i],
  ["certifications", /^(?:certifications?|certificates?|licenses? and certifications?|sijil|pensijilan)\s*:?\s*$/i],
  ["achievements", /^(?:achievements?|awards?(?: and achievements)?|honou?rs|pencapaian|anugerah)\s*:?\s*$/i],
];
type Sections = { education: string; experience: string; projects: string; certifications: string; achievements: string };
export function analyzeText(input: string) {
  const text = input.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim();
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
  const candidates = rules.flatMap(([name, category, skillId, expression]) => {
    const evidence = lines.find(line => expression.test(line));
    return evidence ? [{ name, category, skillId, evidence: evidence.slice(0, 240), uncertain: true }] : [];
  });
  const sections: Sections = { education: "", experience: "", projects: "", certifications: "", achievements: "" };
  let section: keyof Sections | null = null;
  for (const line of lines) {
    const header = headers.find(([, expression]) => expression.test(line));
    if (header) { section = header[0]; continue; }
    // Stop at other major headings to avoid inventing section associations.
    if (/^(?:skills|technical skills|summary|profile|contact|references|languages|interests|kemahiran|rujukan)\s*:?\s*$/i.test(line)) {
      section = null; continue;
    }
    if (section && sections[section].length < 9750) sections[section] += `${sections[section] ? "\n" : ""}${line.slice(0, 240)}`;
  }
  const warnings = [
    "Keyword matches are uncertain mentions, not verified proficiency. Review context, remove false positives and set your own levels.",
    "Section boundaries are heuristic. Blank sections mean not identified, not absent. Review the original extracted text.",
    "No name, location, qualification level, experience rating or interests were inferred. Confirm these yourself.",
  ];
  if (!candidates.length) warnings.push("No supported skill keywords were identified. Add confirmed skills manually after reviewing the text.");
  return { text, candidates, sections, warnings };
}
