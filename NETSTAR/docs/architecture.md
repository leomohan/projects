# NETSTAR Architecture

## Design goals

- Keep scoring logic shared between UI previews and API calculations
- Support a credible auditor workflow centered on evidence and human validation
- Allow Firebase-backed persistence without coupling domain logic to infrastructure
- Make it easy to add new lifecycle rules, checklist items, and reporting views

## Module layout

### `packages/shared`

Contains the NETSTAR domain model:

- lifecycle stages and weights
- question and checklist templates
- sample assessment payload
- deterministic scoring engine

### `apps/api`

Owns application services:

- assessment template endpoint
- score computation endpoint
- persistence adapter
- future PDF/report export endpoint

### `apps/web`

Provides the auditor experience:

- portfolio dashboard
- assessment workspace
- evidence tracking
- report visualization

## Data flow

1. Auditor opens an assessment template from the API.
2. Frontend renders questionnaires and checklists.
3. Auditor updates responses, evidence status, and notes.
4. Frontend can compute a local preview using the shared scoring engine.
5. API re-computes the authoritative score using the same shared package.
6. Assessment data can be stored in Firestore and linked evidence can be stored in Firebase Storage.

## Scoring approach

- Every lifecycle stage starts from weighted questionnaire and checklist performance.
- Evidence gaps reduce confidence and score contribution.
- Explicit penalty rules address high-risk operational gaps.
- Device criticality is treated as a first-class input.
- Star ratings are derived from the normalized total maturity score.

## Future extension points

- industry benchmark profiles
- trend analysis across repeated assessments
- PDF generation service
- evidence review workflow and approval states
- richer organization and multi-auditor access control
