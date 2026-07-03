# Candidate Dossier

Candidate Dossier is a React MVP for structured, evidence-backed recruitment profiles. It replaces free-form CV uploads with a dossier that captures chronological education and work data, supporting documents, reference details, and recruiter-friendly summaries.

## MVP architecture

### Product flows

1. Candidates sign in to a guided dossier workspace.
2. Candidates complete structured profile sections across a multi-step form.
3. The validation engine checks chronology, missing evidence, and employment gaps.
4. Recruiters search candidates, inspect structured summaries, and export a dossier PDF.

### Frontend

- React 18 loaded directly in the browser via ES modules
- Responsive single-page experience with candidate and recruiter workspaces
- Multi-step dossier editing, validation panels, recruiter filters, and printable/exportable summaries

### Application layer

- `src/app.js` manages auth, routing between candidate/recruiter views, and shared state
- `src/storage.js` provides a local demo datastore that mirrors the Firebase document shape
- `src/validation.js` enforces chronology checks, employment-gap detection, and completeness scoring
- `src/pdf.js` converts structured dossiers into a recruiter-friendly PDF

### Firebase-ready design

The MVP runs fully in `localStorage`, but the data model is intentionally shaped for Firebase Spark:

- Authentication: Firebase Auth email/password or Google sign-in
- Database: Firestore collections for `users`, `candidates`, and recruiter metadata
- Storage: Firebase Storage for evidence files and attachment URLs

Switching to Firebase means replacing the adapter functions in `src/storage.js` with Firestore/Auth/Storage calls while keeping the UI and validation logic intact.

## Folder structure

```text
/Users/user/Documents/Playground
  index.html
  styles.css
  README.md
  src/
    main.js
    app.js
    components.js
    lib/
      react.js
    pdf.js
    sample-data.js
    storage.js
    validation.js
```

## Firestore schema

### `users/{userId}`

```json
{
  "role": "candidate",
  "email": "candidate@example.com",
  "displayName": "Ariana Shah",
  "candidateId": "cand-001"
}
```

### `candidates/{candidateId}`

```json
{
  "status": "ready",
  "personal": {
    "fullName": "Ariana Shah",
    "headline": "Senior Operations Analyst",
    "email": "ariana@example.com",
    "phone": "+971-555-0101",
    "location": "Dubai, UAE",
    "birthDate": "1994-02-12",
    "nationality": "Indian",
    "familyBackground": "Optional narrative"
  },
  "education": [],
  "work": [],
  "certifications": [],
  "achievements": [],
  "training": [],
  "references": [],
  "attachments": [],
  "updatedAt": "2026-03-10T00:00:00.000Z"
}
```

### `recruiterFilters/{userId}`

```json
{
  "query": "operations",
  "status": "ready",
  "minCompleteness": 70
}
```

## Run locally

Serve the directory with any static file server:

```bash
cd /Users/user/Documents/Playground
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Demo accounts

- Candidate: `candidate@dossier.dev`
- Recruiter: `recruiter@dossier.dev`
- Any password is accepted in local demo mode

## Next Firebase steps

1. Add a Firebase project and web config.
2. Replace the local adapter in `src/storage.js` with Firebase Auth, Firestore, and Storage calls.
3. Persist uploaded files to Firebase Storage and store download URLs in `attachments`.
4. Enforce recruiter authorization with Firestore security rules.
