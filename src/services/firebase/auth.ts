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
  updatePassword,
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
  mustChangePassword?: boolean;
}

/**
 * Normalizes administrative emails.
 * Firebase Auth requires standard RFC 5322 domain format with a TLD.
 * When an administrator inputs 'akshara@admin' or '@admin', this maps transparently to
 * the production Firebase admin domain while keeping the input clean.
 */
export function normalizeAdminEmail(rawEmail: string): string {
  const trimmed = rawEmail.trim().toLowerCase();
  if (trimmed === 'akshara@admin') {
    return 'akshara@admin.aksharalifestyle.com';
  }
  if (trimmed.endsWith('@admin')) {
    return `${trimmed}.aksharalifestyle.com`;
  }
  return trimmed;
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
 * Supports canonicalized administrative emails.
 */
export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  if (!isFirebaseConfigured() || !auth) {
    return { ok: false, error: 'Firebase Auth is not configured.' };
  }

  const effectiveEmail = normalizeAdminEmail(email);

  try {
    const cred = await signInWithEmailAndPassword(auth, effectiveEmail, password);
    const fbUser = cred.user;

    // Fetch user profile from Firestore
    let profile = await getDocument<User>(COLLECTIONS.USERS, fbUser.uid);

    // Verify if account is in protected admins collection or has custom claim
    const adminCheck = await verifyAdminStatus(fbUser);
    const isVerifiedAdmin = adminCheck.isAdmin;

    if (!profile) {
      profile = {
        id: fbUser.uid,
        name: fbUser.displayName || (isVerifiedAdmin ? 'AKSHARA Administrator' : email.split('@')[0]),
        email: fbUser.email || effectiveEmail,
        phone: fbUser.phoneNumber || '',
        role: adminCheck.role ?? 'customer',
        joinedAt: new Date().toISOString(),
        addresses: [],
        emailOptIn: true,
        smsOptIn: true,
        mustChangePassword: adminCheck.mustChangePassword,
      };
      await setDocument(COLLECTIONS.USERS, fbUser.uid, profile);
    } else if (isVerifiedAdmin && profile.role !== adminCheck.role && adminCheck.role) {
      profile.role = adminCheck.role;
      profile.mustChangePassword = adminCheck.mustChangePassword;
    }

    return {
      ok: true,
      user: profile,
      firebaseUser: fbUser,
      mustChangePassword: profile.mustChangePassword,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sign in failed.';
    return { ok: false, error: formatFirebaseAuthError(message) };
  }
}

/**
 * Verify administrative clearance for an authenticated Firebase user.
 * Checked through:
 * 1. Verified Firebase Auth Custom Claims (server-side signed ID token).
 * 2. Protected Cloud Firestore `admins/{uid}` collection.
 * 3. User document role.
 */
export async function verifyAdminStatus(firebaseUser: FirebaseUser): Promise<{
  isAdmin: boolean;
  role?: UserRole;
  mustChangePassword?: boolean;
}> {
  try {
    // 1. Check verified custom claims on signed Firebase ID token (cannot be spoofed by client)
    const tokenResult = await firebaseUser.getIdTokenResult(true);
    const claimRole = tokenResult.claims.role as string | undefined;
    const claimAdmin = Boolean(tokenResult.claims.admin);

    if (claimAdmin || claimRole === 'super_admin' || claimRole === 'admin') {
      return {
        isAdmin: true,
        role: (claimRole as UserRole) || 'super_admin',
        mustChangePassword: Boolean(tokenResult.claims.mustChangePassword),
      };
    }

    // 2. Check dedicated server-side admins collection in Firestore
    const adminDoc = await getDocument<{ role: UserRole; active: boolean; mustChangePassword?: boolean }>(
      COLLECTIONS.ADMINS,
      firebaseUser.uid,
    );
    if (adminDoc && adminDoc.active !== false) {
      return {
        isAdmin: true,
        role: adminDoc.role || 'admin',
        mustChangePassword: Boolean(adminDoc.mustChangePassword),
      };
    }

    // 3. Fallback check user document role
    const userDoc = await getDocument<User>(COLLECTIONS.USERS, firebaseUser.uid);
    if (userDoc && hasAdminRole(userDoc.role)) {
      return {
        isAdmin: true,
        role: userDoc.role,
        mustChangePassword: Boolean(userDoc.mustChangePassword),
      };
    }

    return { isAdmin: false };
  } catch (err) {
    console.warn('[Firebase Auth] verifyAdminStatus check error:', err);
    return { isAdmin: false };
  }
}

/**
 * Updates current authenticated user password in Firebase Auth.
 * Used for mandatory temporary password replacement.
 */
export async function updateCurrentUserPassword(newPassword: string): Promise<{ ok: boolean; error?: string }> {
  if (!isFirebaseConfigured() || !auth || !auth.currentUser) {
    return { ok: false, error: 'Firebase Auth session is not available.' };
  }
  if (newPassword.length < 8) {
    return { ok: false, error: 'New password must be at least 8 characters long.' };
  }

  try {
    await updatePassword(auth.currentUser, newPassword);
    // Mark mustChangePassword = false in user doc and admins collection
    await setDocument(COLLECTIONS.USERS, auth.currentUser.uid, { mustChangePassword: false }, true);
    await setDocument(COLLECTIONS.ADMINS, auth.currentUser.uid, { mustChangePassword: false }, true);
    return { ok: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update password.';
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
