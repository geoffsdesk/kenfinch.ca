import admin from 'firebase-admin';

/**
 * Server-side Firebase Admin singleton. On Firebase App Hosting this picks up
 * Application Default Credentials automatically; locally it needs
 * GOOGLE_APPLICATION_CREDENTIALS or `gcloud auth application-default login`.
 */
export function getAdminDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return admin.firestore();
}

export { admin };
