import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

// The one place Firebase is configured and constructed. Everything else in the
// app imports the accessors below, so swapping projects — or running with no
// Firebase at all — is an env change, never a code change.
//
// When the env vars are missing the accessors return null and the app runs in
// demo mode: no login wall, products kept in localStorage. That keeps the sell
// flow demonstrable on a laptop with no network and no Firebase project.

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const isFirebaseConfigured: boolean = Boolean(
  config.apiKey && config.projectId && config.appId && config.authDomain
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function getApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) app = initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const instance = getApp();
  if (!instance) return null;
  if (!authInstance) authInstance = getAuth(instance);
  return authInstance;
}

export function getDb(): Firestore | null {
  const instance = getApp();
  if (!instance) return null;
  if (!dbInstance) dbInstance = getFirestore(instance);
  return dbInstance;
}

export function getBucket(): FirebaseStorage | null {
  const instance = getApp();
  if (!instance || !config.storageBucket) return null;
  if (!storageInstance) storageInstance = getStorage(instance);
  return storageInstance;
}
