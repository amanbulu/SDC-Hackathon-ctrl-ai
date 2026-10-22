# SkillHalfLife testing guide

## Automated checks

- `pnpm --filter @workspace/skill-model test`
  - Exact half-life calculation, input validation, moderate/fast scenario differences, deterministic matching, hypothetical learning improvements, all 17 SDG weights, rank changes, prerequisites, and zero/20-year horizons.
- `pnpm run typecheck`
  - Checks shared clients and application TypeScript.

Use the managed API Server and SkillHalfLife workflows to run the application. No authentication or external services are required.

## Feature checks

| Feature | How to try it | Expected result |
| --- | --- | --- |
| Overview | Open Overview | Synthetic Malaysian student, skills, top matches, scenario and learning actions appear. |
| Navigation | Open each of the eight sections, then browser Back | Correct section is shown; no dead links. |
| Skill Half-Life | Switch Moderate to Fast AI Disruption; change time horizon | Relevance projections and charts change; assumptions use years. Career fit is not falsely reduced. |
| Future Skills Radar | Compare current and projected relevance; change horizon/scenario | Visualization uses the model's actual values, not hardcoded graphics. |
| Career Matches | Inspect all five careers | Fit score, reasons, transferable skills and remaining gaps are visible. Scores are not hiring probabilities. |
| Reskilling Pathway | Select a career | Ordered objectives, study hours, prerequisites and practical project suggestions appear. Resources remain labelled sample/unverified. |
| SDG Steering | Change weights, including SDGs 4, 5, 8, 9 and 10 | Preference points and adjusted rankings update while original fit remains unchanged. Small changes need not reverse close rankings. |
| Rank reversal example | Start with zero weights; set SDGs 5, 10 and 16 to 100 | Relative ranking of Data Engineer and Cloud Engineer reverses under the synthetic coefficients. |
| All SDGs | Inspect goals 1–17 | Each has a weight and a contribution explanation; all are supported by the model. |
| Career Resilience Lab | Simulate Machine learning at 90, AI literacy at 90 and Programming at 90 | AI Engineer fit rises and its skill gaps shrink; improvements are labelled hypothetical. |
| Reset simulation | Reset hypothetical learning | Baseline profile/matches return without marking simulated learning as earned. |
| Language | Switch English/Bahasa Malaysia; visit every section | Navigation, controls, explanatory text and states switch language. |
| Data Sources | Inspect provenance | Synthetic/illustrative labels; future observation structure includes source URL, observation date, retrieval date and metric definition. No invented live claims. |
| Responsive layout | Resize to a phone width | Navigation remains accessible, controls remain usable and content avoids horizontal overflow. |
| Errors | Temporarily stop API workflow and reload; restart and retry | Loading/error/retry state appears, rather than displaying invented fallback data. |
| Empty roadmap | Simulate all required skills and prerequisites at 100 | Roadmap explains there are no remaining modelled gaps. |

## API examples

`GET /api/skillhalflife/catalog` returns the synthetic catalog.

`POST /api/skillhalflife/evaluate` accepts:

```json
{
  "scenario": "moderate",
  "years": 5,
  "simulatedSkills": {},
  "sdgWeights": {}
}
```

Negative years, unknown skill/SDG identifiers, and proficiency/weights outside 0–100 should return HTTP 400.

## Deliberate first-version boundaries

- No live labour-market ingestion, salaries or externally verified forecasts.
- No verified course catalog, earned credentials, user accounts or server-saved profiles.
- Study hours, exposure, relevance and career/SDG coefficients are illustrative assumptions.
- SDG points measure preferences, not demonstrated social impact or improved qualifications.
- Automated browser interaction testing is not included in this first build.
