# NETSTAR Auditor Companion

NETSTAR Auditor Companion is a modular MVP for evidence-based enterprise network maturity assessments. It helps auditors structure questionnaires, device and procurement checklists, evidence collection, scoring, and reporting without pretending to automate human validation.

## What is included

- React frontend for auditor dashboard, assessment workspace, and reporting
- Node.js API for templates, scoring, and assessment persistence
- Shared scoring engine used by both frontend and backend
- Firebase Firestore and Storage integration hooks with in-memory fallback
- Sample data and documentation for architecture and setup

## Project structure

```text
NETSTAR/
  apps/
    api/        Express API
    web/        React + Vite frontend
  packages/
    shared/     NETSTAR domain model and scoring engine
  docs/
    architecture.md
```

## MVP capabilities

- Create and review a network maturity assessment scope
- Capture stakeholder and network team questionnaire responses
- Track device and procurement checklist items
- Attach evidence references and validation notes
- Apply lifecycle weighting, checklist penalties, and evidence readiness adjustments
- Generate dashboard and report views with lifecycle and star scoring

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the API:

   ```bash
   npm run dev:api
   ```

3. Start the web app in another terminal:

   ```bash
   npm run dev:web
   ```

## Environment variables

The API can run in demo mode without Firebase credentials. To enable Firebase:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
FIREBASE_CLIENT_EMAIL=service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=4000
```

Without these values, the API stores demo assessments in memory.

## Notes

- The scoring engine is intentionally evidence-aware rather than scan-driven.
- Auditor validation remains mandatory for all resilience and maturity claims.
- This repository was created as an MVP scaffold and was not dependency-installed in this environment.
