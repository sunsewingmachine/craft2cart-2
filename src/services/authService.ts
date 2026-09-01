import {
  ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  User,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';

// Client-facing auth layer. Screens call these functions and never touch the
// Firebase SDK directly, so the sign-in provider can change in one file.
//
// Two ways in, both requested for the artisan audience: Google (one tap, works
// on any device) and phone + OTP (many artisans have no email address).
// Phone sign-in needs an invisible reCAPTCHA anchored to a real DOM node. A
// fresh verifier is built for every send and torn down afterwards, because its
// token is single use — see startPhoneSignIn.

export interface ArtisanAccount {
  uid: string;
  displayName: string | null;
  phoneNumber: string | null;
  email: string | null;
  photoURL: string | null;
}

export type AuthErrorCode =
  | 'not-configured'
  | 'popup-blocked'
  | 'popup-closed'
  | 'provider-disabled'
  | 'sms-region-blocked'
  | 'stale-verification'
  | 'invalid-phone'
  | 'invalid-code'
  | 'too-many-requests'
  | 'expired-code'
  | 'network'
  | 'unknown';

export class AuthError extends Error {
  constructor(public code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const toAccount = (user: User): ArtisanAccount => ({
  uid: user.uid,
  displayName: user.displayName,
  phoneNumber: user.phoneNumber,
  email: user.email,
  photoURL: user.photoURL
});

/** Map Firebase's error strings onto the small set the UI knows how to explain. */
function classify(err: unknown): AuthError {
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
  const message = err instanceof Error ? err.message : String(err);

  if (code.includes('popup-blocked')) return new AuthError('popup-blocked', message);
  if (code.includes('popup-closed') || code.includes('cancelled-popup')) {
    return new AuthError('popup-closed', message);
  }
  // Firebase reports a blocked SMS region as operation-not-allowed too, so the
  // message has to be read before the code — otherwise a region problem is
  // reported as "the provider is switched off", which sends you to the wrong
  // console page. Seen live: "OPERATION_NOT_ALLOWED : SMS unable to be sent
  // until this region enabled by the app developer."
  if (/SMS unable to be sent|region enabled by the app developer|UNSUPPORTED_REGION/i.test(message)) {
    return new AuthError('sms-region-blocked', message);
  }
  if (code.includes('operation-not-allowed') || code.includes('admin-restricted')) {
    return new AuthError('provider-disabled', message);
  }
  // A spent or mismatched reCAPTCHA token. Recoverable: the next attempt builds
  // a fresh verifier, so the user only has to press send again.
  if (code.includes('invalid-app-credential') || /INVALID_APP_CREDENTIAL/i.test(message)) {
    return new AuthError('stale-verification', message);
  }
  if (code.includes('invalid-phone-number') || code.includes('missing-phone-number')) {
    return new AuthError('invalid-phone', message);
  }
  if (code.includes('invalid-verification-code')) return new AuthError('invalid-code', message);
  if (code.includes('code-expired') || code.includes('session-expired')) {
    return new AuthError('expired-code', message);
  }
  if (code.includes('too-many-requests') || code.includes('quota-exceeded')) {
    return new AuthError('too-many-requests', message);
  }
  if (code.includes('network-request-failed')) return new AuthError('network', message);
  return new AuthError('unknown', message);
}

export const isAuthAvailable = (): boolean => isFirebaseConfigured;

/**
 * Subscribe to sign-in state. Fires once immediately with the restored session
 * (or null), so the caller can drop its loading state on the first callback.
 */
export function watchAccount(onChange: (account: ArtisanAccount | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    onChange(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => onChange(user ? toAccount(user) : null));
}

export async function signInWithGoogle(): Promise<ArtisanAccount> {
  const auth = getFirebaseAuth();
  if (!auth) throw new AuthError('not-configured', 'Firebase is not configured.');

  const provider = new GoogleAuthProvider();
  // Always let the artisan pick an account; a silently reused one is confusing
  // on a shared phone.
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    return toAccount(result.user);
  } catch (err) {
    throw classify(err);
  }
}

let recaptcha: RecaptchaVerifier | null = null;

/** Tear down the reCAPTCHA widget so a later attempt can build a fresh one. */
export function resetPhoneVerifier(): void {
  try {
    recaptcha?.clear();
  } catch {
    /* already gone */
  }
  recaptcha = null;
}

/**
 * Send an OTP. `containerId` is the id of an empty div that Firebase anchors
 * its invisible reCAPTCHA to. Returns a handle used to confirm the code.
 *
 * A reCAPTCHA token is SINGLE USE. Reusing one verifier across attempts replays
 * a token Firebase has already consumed, and the server answers 400
 * INVALID_APP_CREDENTIAL — which reads like a configuration fault but is really
 * a stale token. So every send builds a fresh verifier and disposes of it
 * afterwards, whether it succeeded or not.
 */
export async function startPhoneSignIn(
  phoneE164: string,
  containerId: string
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  if (!auth) throw new AuthError('not-configured', 'Firebase is not configured.');

  if (!/^\+\d{10,15}$/.test(phoneE164)) {
    throw new AuthError('invalid-phone', 'Phone number must be in +country-code format.');
  }

  resetPhoneVerifier();

  try {
    recaptcha = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
    await recaptcha.render();
    return await signInWithPhoneNumber(auth, phoneE164, recaptcha);
  } catch (err) {
    throw classify(err);
  } finally {
    // The token is spent either way; the next send starts from a clean widget.
    resetPhoneVerifier();
  }
}

export async function confirmPhoneCode(
  confirmation: ConfirmationResult,
  code: string
): Promise<ArtisanAccount> {
  try {
    const result = await confirmation.confirm(code.trim());
    return toAccount(result.user);
  } catch (err) {
    throw classify(err);
  }
}

export async function signOutArtisan(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  resetPhoneVerifier();
  await signOut(auth);
}

/**
 * Turn a typed Indian number into E.164, so the artisan can type it the way it
 * is written on a visiting card.
 *
 * People write the same mobile number several ways: 9842470497, 098424 70497
 * (0 is India's trunk prefix for dialling out of your own area), 0091..., 91...
 * or +91.... Only the last one is E.164, and Firebase rejects everything else
 * with a bare "invalid phone number", so the habits are stripped here rather
 * than being pushed back at the person typing.
 */
export function toIndianE164(raw: string): string {
  let digits = raw.replace(/\D/g, '');

  if (!raw.trim().startsWith('+')) {
    if (digits.startsWith('00')) digits = digits.slice(2); // international prefix
    else digits = digits.replace(/^0+/, ''); // STD trunk prefix
  }

  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}
