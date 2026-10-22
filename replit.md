# SkillHalfLife

Illustrative career intelligence and reskilling simulations for a synthetic Malaysian software engineering student, built for the Aiversecity Future-Ready Workforce Challenge.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/skillhalflife run dev` — frontend (use its managed workflow to supply port/base path)
- `pnpm --filter @workspace/skill-model test` — calculation unit tests using Node's test runner
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

Eight sections cover the profile overview, skill half-life, skills radar, career matches, reskilling pathway, SDG steering, hypothetical learning, and data provenance. English and Bahasa Malaysia are supported.

## User preferences

- Functional application, not a static mockup; no unnecessary authentication or paid external APIs at this stage.
- All demonstration data and assumptions must be identified as synthetic/illustrative. No fabricated live statistics, salaries, growth rates, citations or verified course claims.

## Gotchas

- Use years consistently for half-life and elapsed time; validate finite numeric inputs.
- Unverified learning resources are sample suggestions, not verified courses.
- No server-side persistence or verified learning achievements in this version.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
