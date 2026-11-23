import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
  type NextOrObserver,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { getDocument, setDocument, COLLECTIONS } from './firestore';
import type { User, UserRole } from '../../types/commerce';

// Ensure standard local persistence
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase Auth] Persistence setup error:', err);
  });
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface AuthResponse {
  ok: boolean;
  user?: User;
  firebaseUser?: FirebaseUser;
  error?: string;
}

/**
 * Register a new user with Email and Password in Firebase Auth,
 * creating an associated user profile document in Firestore `users/{uid}`.
 */
export async function registerWithEmail(
  payload: { name: string; email: string; phone: string; password: string },
): Promise<AuthResponse> {
  if (!isFirebaseConfigured() || !auth) {
    return { ok: false, error: 'Firebase Auth is not configured.' };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, payload.email.trim(), payload.password);
    const fbUser = cred.user;

    // Update display name in Firebase Auth
    await updateFirebaseProfile(fbUser, { displayName: payload.name.trim() });

    // Store secure profile in Firestore
    const userDoc: User = {
      id: fbUser.uid,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      role: 'customer',
      joinedAt: new Date().toISOString(),
      addresses: [],
      emailOptIn: true,
      smsOptIn: true,
    };

    await setDocument(COLLECTIONS.USERS, fbUser.uid, userDoc);

    return { ok: true, user: userDoc, firebaseUser: fbUser };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed.';
    return { ok: false, error: formatFirebaseAuthError(message) };
  }
}

/**
 * Sign in existing user with Email and Password.
 */
export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  if (!isFirebaseConfigured() || !auth) {
    return { ok: false, error: 'Firebase Auth is not configured.' };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = cred.user;

    // Fetch user profile from Firestore
    let profile = await getDocument<User>(COLLECTIONS.USERS, fbUser.uid);

    if (!profile) {
      // First-time or self-healing profile record
      profile = {
        id: fbUser.uid,
        name: fbUser.displayName || email.split('@')[0],
        email: fbUser.email || email.trim().toLowerCase(),
        phone: fbUser.phoneNumber || '',
        role: 'customer',
        joinedAt: new Date().toISOString(),
        addresses: [],
        emailOptIn: true,
        smsOptIn: true,
      };
      await setDocument(COLLECTIONS.USERS, fbUser.uid, profile);
    }

    return { ok: true, user: profile, firebaseUser: fbUser };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sign in failed.';
    return { ok: false, error: formatFirebaseAuthError(message) };
  }
}

/**
 * Google Sign-in readiness for modern browser authentication.
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  if (!isFirebaseConfigured() || !auth) {
    return { ok: false, error: 'Firebase Auth is not configured.' };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    let profile = await getDocument<User>(COLLECTIONS.USERS, fbUser.uid);
    if (!profile) {
      profile = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Akshara Patron',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        role: 'customer',
        joinedAt: new Date().toISOString(),
        addresses: [],
        emailOptIn: true,
        smsOptIn: true,
      };
      await setDocument(COLLECTIONS.USERS, fbUser.uid, profile);
    }

    return { ok: true, user: profile, firebaseUser: fbUser };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Google sign-in failed.';
    return { ok: false, error: formatFirebaseAuthError(message) };
  }
}

/**
 * Sign out the current authenticated user.
 */
export async function signOutUser(): Promise<{ ok: boolean; error?: string }> {
  if (!auth) return { ok: true };
  try {
    await signOut(auth);
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, error: error instanceof Error ? error.message : 'Sign out failed.' };
  }
}

/**
 * Send password reset email link.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { ok: false, error: 'Firebase Auth is not configured.' };
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { ok: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send password reset email.';
    return { ok: false, error: formatFirebaseAuthError(message) };
  }
}

/**
 * Confirm password reset with the action code received in email.
 */
export async function resetPasswordWithCode(
  oobCode: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !auth) {
    return { ok: false, error: 'Firebase Auth is not configured.' };
  }

  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, error: error instanceof Error ? error.message : 'Password reset failed.' };
  }
}

/**
 * Listen to auth state transitions.
 */
export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback as NextOrObserver<FirebaseUser | null>);
}

/**
 * Check if a given user role grants administrative access.
 */
export function hasAdminRole(role?: UserRole): boolean {
  if (!role) return false;
  return ['super_admin', 'admin', 'product_manager', 'order_manager', 'merchandiser', 'operations'].includes(
    role,
  );
}

/**
 * Helper to humanize Firebase error codes into luxury-appropriate client messages.
 */
function formatFirebaseAuthError(rawError: string): string {
  if (rawError.includes('auth/user-not-found') || rawError.includes('auth/wrong-password') || rawError.includes('auth/invalid-credential')) {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (rawError.includes('auth/email-already-in-use')) {
    return 'An account is already registered with this email address.';
  }
  if (rawError.includes('auth/weak-password')) {
    return 'Password is too weak. Please choose at least 6 characters with letters and numbers.';
  }
  if (rawError.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (rawError.includes('auth/network-request-failed')) {
    return 'Network connection issue. Please check your internet connection.';
  }
  if (rawError.includes('auth/popup-closed-by-user')) {
    return 'Sign-in window was closed before completion.';
  }
  return rawError;
}
