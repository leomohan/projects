import { EMPTY_DOSSIER, SEED_DB } from "./sample-data.js";

const DB_KEY = "candidate-dossier-db-v1";
const SESSION_KEY = "candidate-dossier-session-v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readDb() {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DB));
    return clone(SEED_DB);
  }

  try {
    return JSON.parse(existing);
  } catch {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DB));
    return clone(SEED_DB);
  }
}

function writeDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function readSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function writeSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export const storage = {
  getMode() {
    return "local-demo";
  },

  getSession() {
    return readSession();
  },

  signOut() {
    writeSession(null);
  },

  signIn({ email, password, role }) {
    const db = readDb();
    const user = db.users.find(
      (entry) =>
        entry.email.toLowerCase() === email.trim().toLowerCase() &&
        entry.role === role &&
        (entry.password === password || password.trim().length > 0)
    );

    if (!user) {
      throw new Error("No demo account matches that email and role.");
    }

    const session = { userId: user.id, role: user.role };
    writeSession(session);
    return clone(user);
  },

  getCurrentUser() {
    const session = readSession();
    if (!session) {
      return null;
    }

    const db = readDb();
    return clone(db.users.find((user) => user.id === session.userId) ?? null);
  },

  getCandidateDossier(userId) {
    const db = readDb();
    const user = db.users.find((entry) => entry.id === userId);
    if (!user?.candidateId) {
      return clone({ ...EMPTY_DOSSIER, updatedAt: new Date().toISOString() });
    }

    const dossier = db.dossiers.find((entry) => entry.id === user.candidateId);
    return clone(dossier ?? { ...EMPTY_DOSSIER, id: user.candidateId, userId, updatedAt: new Date().toISOString() });
  },

  saveCandidateDossier(userId, nextDossier) {
    const db = readDb();
    const user = db.users.find((entry) => entry.id === userId);
    if (!user?.candidateId) {
      throw new Error("Candidate account is missing a dossier id.");
    }

    const payload = clone({
      ...nextDossier,
      id: user.candidateId,
      userId,
      updatedAt: new Date().toISOString()
    });

    const index = db.dossiers.findIndex((entry) => entry.id === user.candidateId);
    if (index === -1) {
      db.dossiers.push(payload);
    } else {
      db.dossiers[index] = payload;
    }

    writeDb(db);
    return payload;
  },

  listCandidates() {
    const db = readDb();
    return clone(
      db.dossiers.map((dossier) => ({
        ...dossier,
        user: db.users.find((user) => user.id === dossier.userId) ?? null
      }))
    );
  },

  resetDemoData() {
    writeDb(clone(SEED_DB));
    writeSession(null);
  }
};
