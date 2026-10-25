# SkillHalfLife — SDC Hackathon Submission

An interactive career-intelligence and reskilling dashboard for Malaysian students. Demonstration data and model assumptions are illustrative, not verified forecasts.

## Team Information

| Field                  | Details                                     |
| ---------------------- | ------------------------------------------- |
| **Team Name**          | ctrl + ai                                   |
| **Team Domain**        | Domain 1                                    |
| **SDG Track (1–17)**   | SDG 4 - Quality education                   |
| **Team Leader**        | Ahmad Irfan bin Ishak                       |
| **University**         | Universiti Teknologi Malaysia               |
| **Number of Members**  | 5                                           |

## Links

| Resource          | Link                                           |
| ----------------- | ---------------------------------------------- |
| GitHub Repository | https://github.com/amanbulu/SDC-Hackathon-ctrl-ai-|
| Live Demo         | https://skill-half-life-workforce-dashboard.replit.app/|
| RunPod Endpoint   | not applicable      |
| Slide Deck        | https://drive.google.com/file/d/1qfiSooVVCujrO2eu5U-XykhyN0xnEIVu/view?usp=sharing  |
| Demo Video        | https://youtu.be/ZWytbfstnlQ   |

---

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
| Database | PostgreSQL/Drizzle scaffold present |
| AI / Compute | Replit AI assisted development |
| Hosting / Dev | Replit project configuration  |

## Project Structure

Key files and folders in this repository:

```text
.
├── artifacts/
│   ├── skillhalflife/               # React dashboard
│   │   ├── src/                     # Pages, components, hooks and state
│   │   ├── public/                  # Static assets
│   │   └── vite.config.ts           # Frontend build configuration
│   ├── api-server/                  # Express API and CV processing
│   │   ├── src/
│   │   │   ├── routes/              # API endpoints
│   │   │   └── lib/                 # CV parsing, analysis and tests
│   │   └── build.mjs                # API build script
│   └── mockup-sandbox/              # Component preview sandbox
├── lib/
│   ├── skill-model/
│   │   └── src/
│   │       ├── index.ts             # Skill catalog and evaluation model
│   │       └── model.test.ts        # Model unit tests
│   ├── api-spec/                    # OpenAPI contract and code generation
│   ├── api-client-react/            # Generated React API client
│   ├── api-zod/                     # Generated validation schemas
│   └── db/                          # Unused PostgreSQL/Drizzle scaffold
├── docs/
├── submission/
│   ├── SDC2026_ctrl + ai_Preliminary.pdf      # Preliminary submission
│   ├── SDC2026_ctrl + ai_TechDeclaration.pdf  # Technology declaration
│   └── SDC2026_ctrl+ai_Replit_POU.jpg         # Replit proof-of-use image
├── scripts/                         # Utility and verification scripts
├── .gitignore
├── .replit                          # Existing Replit run configuration
├── package.json                     # Workspace scripts and dependencies
├── pnpm-workspace.yaml              # Workspace configuration
├── pnpm-lock.yaml                   # Dependency lockfile
├── tsconfig.json                    # TypeScript project configuration
├── tsconfig.base.json               # Shared TypeScript compiler options
├── TESTING.md                       # Manual checks and known limitations
├── CV_WORKFLOW.md                   # CV workflow and verification guidance
├── replit.md                        # Project context and operating notes
├── LICENSE
└── README.md
```

RunPod and the Python files under `docs/organiser-template/` are retained only as organiser reference examples. The application itself runs from the TypeScript workspaces under `artifacts/` and `lib/`.


## How to Run

This project uses Node.js 24 and pnpm workspaces, not the Python example in the organiser template. In the original Replit project, the dashboard and API have separate managed workflows. Keep the existing .replit configuration; do not replace it with the Python example.

1. Install dependencies with pnpm install in a Node.js 24 environment.
2. In the Replit project, run the API Server workflow (port 8080) and the SkillHalfLife web workflow (port 25589, BASE_PATH=/). Replit artifact configuration routes /api to the API.
3. For a production build, run pnpm run build. Check environment-specific routing when importing this repository into a new project.
4. Run model and CV tests with pnpm --filter @workspace/skill-model test and pnpm --filter @workspace/api-server test. See TESTING.md for manual checks.

No RunPod credentials are required for the current application. Never commit a real .env file, CVs or personal data.

## How We Use Replit (Required)

- Development: Collaboratively use Replit for cloud-based development environment to build, test, and debug our website.
- Hosting: Deployment and hosting of our website, making it accessible through a public URL.
- Proof of use: [`submission/SDC2026_ctrl+ai_Replit_POU.pdf`](https://github.com/amanbulu/SDC-Hackathon-ctrl-ai/blob/main/submission/SDC2026_ctrl%2Bai_Replit_POU.jpg)

## RunPod

The team did not use RunPod for this program.

## Challenges & Learnings

What challenges did you face, and how did you overcome them?
One challenge was making complex ideas—such as skill half-life, career matching, and reskilling—easy for students to understand. We addressed this by organising the dashboard into focused sections and providing English and Bahasa Malaysia support. Handling CV information also required care. We implemented PDF/DOCX validation and a review step so users can check extracted information before applying it to their profile. We also kept CV processing within the application server rather than sending documents to an external AI service.

What did your team learn?
We learned that building a useful application involves more than generating code. Although Replit AI helped us develop the website, we still needed to understand the application’s behaviour, review its limitations, and ensure that its explanations matched what the system actually does. We also learned the importance of responsible data handling, clear communication, and transparent assumptions. For a career-planning tool, helping users understand the limits of a result is just as important as displaying the result itself.


## Future Improvements

- [ ] Add verified data sources if available; keep illustrative assumptions labelled.
- [ ] Consider new integrations only if they serve a real product need.

## Team

| Name        | Role                | GitHub                                   |
| ----------- | ------------------- | ---------------------------------------- |
| Ahmad Irfan | Team Lead / Frontend | [@IpanTzy](https://github.com/IpanTzy) |
| Adib Ashman | Backend / AI Engineer | [@amanbulu](https://github.com/amanbulu) |
| Muhammad Firdaus | Content / SDG Specialist | [@muhammadfirdaus10](https://github.com/muhammadfirdaus10) |
| Adam Iqbal Khan | Technical Writer / Pitcher | [@adamkhaniqbal](https://github.com/adamkhaniqbal) |
| Naim Norman Khairi | Backend / Data | [@naimnk174-star](https://github.com/naimnk174-star) |

---

## Submission Checklist

- [/] Team name, domain (Domain 1 / Domain 2) and SDG track filled in
- [/] Slide deck link added
- [/] Demo video link added
- [/] Replit used, with proof of use in `submission/`
- [  ] RunPod used, with proof of use in `submission/`
- [/] Preliminary submission completed
- [/] Technology declaration completed
- [/] Submission files renamed with your team name
- [/] "How to Run" steps verified
- [/] No API keys or secrets committed to the repository

## License

This repository contains the Apache License 2.0 file carried over from the GitHub repository initialization; confirm that this license is appropriate for every contribution before final submission.
