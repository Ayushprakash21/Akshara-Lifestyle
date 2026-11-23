import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  missingFields: string[];
  projectId?: string;
  authDomain?: string;
  storageBucket?: string;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || '',
};

function evaluateFirebaseConfig(): { isConfigured: boolean; missingFields: string[] } {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.appId) missing.push('VITE_FIREBASE_APP_ID');

  return {
    isConfigured: missing.length === 0,
    missingFields: missing,
  };
}

const configEvaluation = evaluateFirebaseConfig();

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (configEvaluation.isConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    firestoreInstance = getFirestore(app);
    if (firebaseConfig.storageBucket) {
      storageInstance = getStorage(app);
    }
  } catch (error) {
    console.warn(
      '[AKSHARA Firebase] Failed to initialize Firebase SDK with provided credentials. Falling back gracefully to demo persistence mode.',
      error,
    );
    app = null;
    authInstance = null;
    firestoreInstance = null;
    storageInstance = null;
  }
} else {
  if (import.meta.env.DEV) {
    console.info(
      `[AKSHARA Firebase] Running in demo mode. Missing environment variables: ${configEvaluation.missingFields.join(', ')}. Populate .env to connect live Firebase services.`,
    );
  }
}

export const firebaseApp = app;
export const auth = authInstance;
export const db = firestoreInstance;
export const storage = storageInstance;

export function isFirebaseConfigured(): boolean {
  return configEvaluation.isConfigured && app !== null;
}

export function getFirebaseStatus(): FirebaseConfigStatus {
  return {
    isConfigured: isFirebaseConfigured(),
    missingFields: configEvaluation.missingFields,
    projectId: firebaseConfig.projectId || undefined,
    authDomain: firebaseConfig.authDomain || undefined,
    storageBucket: firebaseConfig.storageBucket || undefined,
  };
}
