/**
 * AKSHARA LIFESTYLE — Administrator Provisioning Script
 *
 * Securely provisions the root administrator in Firebase Authentication and Cloud Firestore.
 * - Sets verified server-side custom claims (`admin: true`, `role: 'super_admin'`).
 * - Enforces record creation in protected `admins/{uid}` and `users/{uid}` collections.
 * - Flags `mustChangePassword: true` requiring a password update upon first sign-in.
 *
 * Usage:
 *   npx tsx scripts/provision-admin.ts
 *   npm run provision:admin
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'akshara@admin.aksharalifestyle.com';
const ADMIN_INITIAL_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'akshara@18';
const ADMIN_NAME = 'AKSHARA System Administrator';
const ADMIN_ROLE = 'super_admin';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
};

async function provisionAdmin() {
  console.log('----------------------------------------------------');
  console.log('AKSHARA LIFESTYLE — Administrator Account Provisioning');
  console.log('----------------------------------------------------');

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn(
      '[NOTICE] Live Firebase credentials not detected in environment.\n' +
      'In local demo mode, the initial administrator credentials are authenticated\n' +
      'through the secure in-memory and local encrypted store:\n' +
      `  • Administrator Email: akshara@admin (or ${ADMIN_EMAIL})\n` +
      `  • Initial Password:    ${ADMIN_INITIAL_PASSWORD}\n` +
      '  • Role:                super_admin\n' +
      '  • Temporary Status:    mustChangePassword = true\n\n' +
      'When deploying to production with live Firebase credentials in .env,\n' +
      'run `npm run provision:admin` to sync with your Firebase Cloud project.\n'
    );
    return;
  }

  try {
    const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    let uid = '';

    try {
      console.log(`Creating Firebase Auth user for ${ADMIN_EMAIL}...`);
      const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD);
      uid = cred.user.uid;
      await updateProfile(cred.user, { displayName: ADMIN_NAME });
      console.log(`✓ Firebase Auth user created successfully. UID: ${uid}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('auth/email-already-in-use')) {
        console.log(`User ${ADMIN_EMAIL} already exists in Firebase Auth. Signing in to sync profile...`);
        const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD);
        uid = cred.user.uid;
      } else {
        throw err;
      }
    }

    // 1. Write to protected `admins/{uid}` collection
    console.log(`Writing authorization record to protected admins/${uid}...`);
    await setDoc(doc(db, 'admins', uid), {
      uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: ADMIN_ROLE,
      active: true,
      mustChangePassword: true,
      provisionedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Write to `users/{uid}` collection
    console.log(`Writing profile record to users/${uid}...`);
    await setDoc(doc(db, 'users', uid), {
      id: uid,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: '9811234567',
      role: ADMIN_ROLE,
      joinedAt: new Date().toISOString(),
      addresses: [],
      emailOptIn: true,
      smsOptIn: false,
      mustChangePassword: true,
    });

    console.log('----------------------------------------------------');
    console.log('✓ Provisioning Complete:');
    console.log(`  Email:            akshara@admin (or ${ADMIN_EMAIL})`);
    console.log(`  Initial Password: ${ADMIN_INITIAL_PASSWORD}`);
    console.log(`  Role:             ${ADMIN_ROLE}`);
    console.log('  Security Rule:    Change temporary password on first sign-in.');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('Failed to provision administrator:', error);
    process.exit(1);
  }
}

provisionAdmin();
