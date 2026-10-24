# SkillHalfLife — SDC Hackathon Submission

> Submission document templates are available in the [organiser’s Google Drive folder](https://drive.google.com/drive/folders/1xw7c2aN8N-at8hPEULzkcU76e_FFb0Ef). The PDF files under submission/ are unfilled copies from the organiser template, not completed submissions.

An interactive career-intelligence and reskilling dashboard for Malaysian students. Demonstration data and model assumptions are synthetic/illustrative, not verified forecasts.

## Team Information

| Field | Details |
| --- | --- |
| Team Name | ctrl + ai |
| Team Domain | Domain 1 |
| SDG Track | SDG 4 - Quality Education |
| Team Leader | Ahmad Irfan Bin Ishak |
| University | Universiti Teknologi Malaysia |
| Number of Members | 5 |

## Links

| Resource | Link |
| --- | --- |
| GitHub Repository | https://github.com/amanbulu/SDC-Hackathon-ctrl-ai- |
| Live Demo / Replit project | To be added after team verifies the URL |
| RunPod Endpoint | Not applicable to this team’s submission |
| Slide Deck | https://drive.google.com/file/d/1qfiSooVVCujrO2eu5U-XykhyN0xnEIVu/view?usp=sharing |
| Demo Video | To be added |

## Overview

### Problem

Students planning careers face changing skill requirements and often lack a clear way to compare career paths and learning priorities. The model here is illustrative; it does not claim to predict hiring outcomes.

### Solution

SkillHalfLife explores hypothetical skill-relevance decay, career matching and reskilling pathways using a transparent, deterministic model. It offers an optional local PDF/DOCX CV extraction workflow for a profile the user reviews before applying. CV parsing is rule-based; there is no remote AI inference or RunPod integration in this version.

### Key Features

- Bilingual English/Bahasa Malaysia dashboard covering overview, half-life, radar, careers, pathways, SDGs, simulations, CV and data sources.
- Explicitly synthetic career/skill catalog and transparent model assumptions; interests and learning choices affect hypothetical results.
- CV text extraction on the application server with review/confirmation; no server-side CV storage in this version.

### Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, TypeScript |
| Backend | Express 5, TypeScript |
| Model | Deterministic TypeScript skill model with tests |
| Database | PostgreSQL/Drizzle scaffold present but not used for saved profiles |
| AI / Compute | Replit AI assisted development; no RunPod inference in current application |
| Hosting / Dev | Replit project configuration (deployment URL pending verification) |

## Project Structure

- artifacts/skillhalflife — React app
- artifacts/api-server — API and CV parsing
- lib/skill-model — deterministic catalog, evaluations and unit tests
- lib/api-spec and generated clients — API contract
- submission/ — four unfilled organiser PDF templates; complete and rename only those applicable to the team’s submission. The RunPod proof form is included solely as an unfilled copy of the template.
- docs/organiser-template/ — original Python/RunPod example and template README for reference only; not this app runtime
- TESTING.md and CV_WORKFLOW.md — verification guidance and limitations

## How to Run

This project uses Node.js 24 and pnpm workspaces, not the Python example in the organiser template. In the original Replit project, the dashboard and API have separate managed workflows. Keep the existing .replit configuration; do not replace it with the Python example.

1. Install dependencies with pnpm install in a Node.js 24 environment.
2. In the Replit project, run the API Server workflow (port 8080) and the SkillHalfLife web workflow (port 25589, BASE_PATH=/). Replit artifact configuration routes /api to the API.
3. For a production build, run pnpm run build. Check environment-specific routing when importing this repository into a new project.
4. Run model and CV tests with pnpm --filter @workspace/skill-model test and pnpm --filter @workspace/api-server test. See TESTING.md for manual checks.

No RunPod credentials are required for the current application. Never commit a real .env file, CVs or personal data.

## How We Use Replit (Required)

- Development: the code and original project history were exported from a Replit project. The team should describe its actual collaboration and Replit AI use accurately.
- Hosting: confirm the public deployment URL before adding it to Links.
- Proof of use: complete and rename submission/SDC2026_TeamName_Replit_POU.pdf with real evidence before submission.

## RunPod (Not applicable to this team)

The team says RunPod is not required for its submission. This application does not use RunPod. The original organiser template includes a RunPod section, example handler and proof form; they are kept only as unfilled reference materials, not as evidence of integration.

## Challenges & Learnings

To be completed by the team with its actual experience.

## Future Improvements

- [ ] Add verified data sources if available; keep illustrative assumptions labelled.
- [ ] Consider new integrations only if they serve a real product need.

## Team

To be completed by the team with real names, roles and GitHub accounts.

## Submission Checklist

- [ ] Fill team name, domain, SDG track, team members and university.
- [ ] Add verified live demo, slide deck and demo video links.
- [ ] Complete and rename the applicable PDF templates under submission/ using the real team name; the RunPod proof form is not applicable.
- [ ] Provide genuine Replit proof of use.
- [ ] Check final submission instructions for any changes to the team’s stated RunPod exemption.
- [ ] Complete preliminary submission and technology declaration truthfully.
- [ ] Verify run steps on the actual deployed environment and confirm no secrets are committed.

## License

This repository contains the Apache License 2.0 file carried over from the GitHub repository initialization; confirm that this license is appropriate for every contribution before final submission.

## Import history

The original Replit commits were imported into a new GitHub branch with their commit hashes and timestamps intact. They were not necessarily pushed to GitHub on their original commit dates.
