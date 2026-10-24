# My CV workflow

## Try it in the application

1. Open **My CV** in the sidebar (or scrolling mobile navigation).
2. Choose or drag in a text-based **PDF** or **DOCX**, up to **5 MiB**.
3. Wait for extraction. The rest of the navigation remains available. Before your first confirmation, personal-match pages show a review prompt rather than demo results; scenario charts and sources remain available.
4. Inspect the extracted text, uncertain technology mentions and evidence. Remove false positives. Edit your name (optional), education, work/internships, projects, certificates and achievements.
5. Set your own proficiency for the ten model categories. They start at **0**: mentions do not prove proficiency. Interests, qualification level and relevant-experience confirmation also start unconfirmed.
6. Check the review acknowledgement and click **Apply information**. Open the updated career matches. All five careers use your confirmed inputs; inspect contributions, numerical gaps and the target career's roadmap.
7. Try the Resilience Lab. Learning simulations start from your CV baseline; resetting a simulation does not restore the synthetic student's skills.
8. Refresh to check tab-session persistence. Replace the CV to create a new draft—your old confirmed profile remains active until you apply the replacement.
9. **Remove CV** deletes extracted/reviewed information and restores the explicitly labelled synthetic demo. **Reset all** also clears the CV and preferences.

After changing a simulation, wait for **Results up to date** before reading the score. Recalculations are debounced and temporarily retain the previous results while the loading status is shown.

## Synthetic examples and automated checks

Generate fake CVs for testing (no personal data):

```sh
node scripts/generate-cv-fixtures.mjs
```

Use `generated-artifacts/cv-tests/synthetic-cv.pdf` or `synthetic-cv.docx` in the upload interface. The same folder includes blank, corrupt, empty and executable samples for rejection checks. The generated folder is excluded from Git and deployment.

```sh
pnpm --filter @workspace/api-server test
pnpm --filter @workspace/skill-model test
pnpm run typecheck
```

With the app running, verify real multipart uploads, rejection codes, CV-only recalculation, isolation from demo data and roadmaps:

```sh
node scripts/verify-cv-api.mjs
# Optional explicit development API origin:
node scripts/verify-cv-api.mjs http://localhost:8080
```

The API script sends only synthetic data. Keep the server running through the existing managed workflow.

## Added libraries

- **pdf-parse**: actual PDF text extraction, with `PDFParse` v2.
- **mammoth**: DOCX raw text extraction; no generated HTML is rendered.
- **yauzl**: checks DOCX ZIP entry sizes, count, encryption and unsafe embedded content before extraction.
- **multer**: bounded in-memory multipart upload handling.
- **express-rate-limit**: conservative request limits in addition to the global worker concurrency limit.
- Type declarations for Multer/Yauzl are development-only dependencies. Existing Node worker threads provide isolation without a new service.

## What is functional

Real PDF/DOCX upload, type/MIME/signature/size checks, parsing, transparent rule-based skill candidates with source snippets, editable review, manual proficiency and qualification confirmation, profile application, all five career scores and explanations, current/required skill gaps, ordered roadmaps, simulation/reset, replacement, removal, tab-session persistence, and bilingual interface labels.

The original 70% skill + 20% interest + 10% education/experience formula and all decay/SDG/roadmap calculations are retained. The old demo behaves as before when no CV is active. Only the baseline inputs change for confirmed CV profiles. Experience narrative is displayed; its illustrative score contribution is controlled by the explicit relevant-experience confirmation, not guessed from prose.

## Limits and privacy

- **No OCR**: scanned/image-only PDFs are rejected with an explanation. Export a text PDF or DOCX first.
- **No external AI**: keyword and section rules are intentionally limited; unfamiliar skills and unusual layouts may be missed or misclassified. Review everything. No qualification, certification or achievement is externally verified.
- **No automatic proficiency assessment** or job/hiring prediction. Unconfirmed categories score as zero evidence until you set them.
- **No permanent server file storage**, accounts or cloud CV history. File buffers exist temporarily during parsing and are discarded. Parser output/errors are not logged; document responses use `no-store`.
- Extracted text and confirmed/draft profiles remain in this tab's **sessionStorage**, including across refresh. Browser tab/session restoration can retain them. Remove CV before leaving a shared device. Browser storage is not a secure vault; scripts on the same app origin can access it.
- If browser storage is unavailable or full, the UI warns that data is memory-only and a refresh may lose the latest changes.
- Maximum 40 PDF pages, 100,000 extracted characters, 15-second worker timeout, two concurrent processing workers, and bounded DOCX archive contents. The API also has a peer-level upload limit. Complex or encrypted documents may need a simpler export.
- Parser limits and worker isolation reduce risk; they are **not a malware scan**. Uploaded executable formats and detected embedded macro/executable content are rejected. Do not execute or re-serve uploaded documents.

## Verification performed

- Four parser/validation tests and eleven model tests passed.
- Real multipart API checks passed for valid PDF/DOCX, empty, corrupt, no-text, unsupported and oversized files, plus isolated CV recalculation and a closed-gap roadmap.
- Full workspace TypeScript checks and the frontend production build passed.
- Browser checks at desktop 1280×900 and mobile 390×844 passed: upload/review/manual confirmation, demo isolation, five matches, career roadmap, simulation/reset, unapplied edits, replacement, refresh, deletion, separate browser contexts, same-file retry, EN/BM, keyboard navigation and delayed-response cancellation.
- The browser tester noted one unconfirmed screenshot-versus-accessibility timing discrepancy during debounced Lab recalculation; score state and resets were correct and no persistent issue was reproduced.
