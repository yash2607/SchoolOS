import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

/**
 * Returns the Firebase Admin app instance, initializing it once if env vars are present.
 * Returns null when FIREBASE_PROJECT_ID is not configured (dev / CI mode).
 */
export function getFirebaseApp(): admin.app.App | null {
  if (app) return app;

  const projectId = process.env['FIREBASE_PROJECT_ID'];
  const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n');
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];

  if (!projectId || !privateKey || !clientEmail) {
    return null;
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
  });

  return app;
}
