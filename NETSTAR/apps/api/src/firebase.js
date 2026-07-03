import admin from "firebase-admin";

let memoryStore = new Map();

function hasFirebaseConfig() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

export function initFirebase() {
  if (!hasFirebaseConfig() || admin.apps.length) return;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

export function getRepository() {
  if (!hasFirebaseConfig()) {
    return {
      mode: "memory",
      async saveAssessment(assessment) {
        memoryStore.set(assessment.id, assessment);
        return assessment;
      },
      async listAssessments() {
        return Array.from(memoryStore.values());
      }
    };
  }

  initFirebase();
  const db = admin.firestore();

  return {
    mode: "firebase",
    async saveAssessment(assessment) {
      await db.collection("assessments").doc(assessment.id).set(assessment, { merge: true });
      return assessment;
    },
    async listAssessments() {
      const snapshot = await db.collection("assessments").get();
      return snapshot.docs.map((doc) => doc.data());
    }
  };
}
