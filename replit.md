# SkillHalfLife

Career intelligence and reskilling simulations for Malaysian students, with a clearly labelled synthetic demo and an optional reviewed CV profile, built for the Aiversecity Future-Ready Workforce Challenge.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (managed workflow supplies port 8080)
- `pnpm --filter @workspace/skillhalflife run dev` — frontend (use its managed workflow to supply port/base path)
- `pnpm --filter @workspace/skill-model test` — calculation unit tests using Node's test runner
- `pnpm --filter @workspace/api-server test` — CV validation, genuine PDF/DOCX parsing and rule-based extraction tests
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- No external API keys or authentication required for this version.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Existing PostgreSQL/Drizzle scaffold is unused; simulations are stateless, not shared user records.
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/skillhalflife` — React dashboard.
- `lib/skill-model` — deterministic calculations, synthetic bilingual catalog, unit tests.
- `lib/api-spec/openapi.yaml` — API contract; regenerate clients after changes.
- `artifacts/api-server/src/routes/skillhalflife.ts` — validated catalog/evaluation endpoints.
- `TESTING.md` — feature-by-feature manual testing instructions and limitations.

## Architecture decisions

- No global mutable demo profile: each evaluation receives hypothetical learning and preferences, preventing visitors from overwriting one another.
- SDG preferences add ranking points, not qualification points; adjusted scores may exceed 100 and are not percentages.
- Career qualifications are not reduced by switching disruption scenarios: relevance decay is a separate model, not a hiring or job-loss forecast.

## Product

Nine sections cover the profile overview, skill half-life, skills radar, career matches, reskilling pathway, SDG steering, hypothetical learning, My CV, and data provenance. English and Bahasa Malaysia are supported.

## User preferences

- Functional application, not a static mockup; no unnecessary authentication or paid external APIs at this stage.
- All demonstration data and assumptions must be identified as synthetic/illustrative. No fabricated live statistics, salaries, growth rates, citations or verified course claims.
- Visual refinements must preserve calculation logic and working features. Avoid unnecessary animation, decorative statistics and overcrowded cards; maintain accessible contrast and mobile usability.

## Gotchas

- Use years consistently for half-life and elapsed time; validate finite numeric inputs.
- Unverified learning resources are sample suggestions, not verified courses.
- No server-side persistence or verified learning achievements in this version.

## CV privacy and matching rules

- PDF/DOCX only, maximum 5 MiB; bytes stay in server memory, never written to disk or logged. Do not add real CVs or personal data to Git.
- Local parsing only (`pdf-parse`, `mammoth`); no external AI or remote document processing. Do not change this without explicit configuration and disclosure.
- Extracted text and reviewed information use tab-scoped `sessionStorage`, not persistent local storage. Remove CV and Reset all erase that state. Browser session restore can retain tabs; the UI explains shared-device precautions.
- Keyword recognition provides uncertain evidence, not measured competence. All CV proficiency levels start at zero until the user supplies them; unknown is not proof of inability.
- Real CV profiles must never inherit synthetic skills, interests, education, name, location or experience. Demo personal results are hidden while the first CV awaits confirmation.
- Replacing a file creates a fresh review draft; the previous confirmed profile remains active until the new draft is explicitly applied.
- Preserve the 70/20/10 formula. CV qualification inputs are explicitly confirmed: unconfirmed/secondary/diploma/bachelor/postgraduate map to illustrative 0/25/50/75/85 alignment, plus 15 for relevant experience, capped at 100. These are model assumptions, not verified credentials or hiring probabilities.
- Processing is isolated in bounded workers (40 pages, 100k text characters, 15 seconds). Archive metadata limits reject oversized DOCX contents. Peer-level rate limiting is deliberately conservative and does not trust forwarded IP headers.

See `CV_WORKFLOW.md` for testing steps and current limitations.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
