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
| Skill Half-Life | Compare solid Moderate and dashed Fast curves; select skills and change horizon | Both scenarios use the same horizon and settings. Table shows both projected values; selecting the global scenario does not remove either comparison curve. Career fit is not falsely reduced. |
| Comparison independence | Switch global scenario on Half-Life, then visit Radar/Overview | Global scenario persists; comparison evaluations do not overwrite selected-scenario results. |
| Chart empty/zero horizon | Clear skill selection, then restore a skill and set horizon to 0 | Useful empty message appears when cleared. Both scenario values at year 0 equal initial relevance and render without invalid axes. |
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
- Calculation unit tests and browser interaction verification serve different purposes; use the current delivery summary for the checks actually run.

## Dashboard refinement verification

Completed a browser-driven career-planning journey at 1280×900 and 390×844:

- All eight navigation routes and active states; no page-level horizontal overflow.
- Moderate/Fast Programming relevance: 37.8/15.9 at five years, 15.9/2.8 at ten years, 90/90 at year zero.
- Independent global scenario, skill selection/clear/show-all, and full radar values.
- All five career cards and numerical gaps; selected AI Engineer roadmap and prerequisites.
- All 17 SDG controls; goals 5/10/16 reverse Data/Cloud adjusted ordering without changing fit.
- Hypothetical learning improves AI alignment and closes gaps; individual and all-skill resets restore baseline.
- EN/BM and settings persist reload; global reset restores defaults.
- Keyboard focus visibility; mobile controls exercised with click and keyboard.
- A deliberately intercepted 503 recovered through automatic query retry.

The nine model unit tests, workspace TypeScript checks and frontend production build passed. Model and API-spec fingerprints were unchanged. Build retains a large-bundle warning. Native touch gestures/physical phones and sustained-failure manual retry were not separately tested; some narrow career-gap headings wrap.
