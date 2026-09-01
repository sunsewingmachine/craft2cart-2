import React, { useEffect, useRef, useState } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import { Language } from '../../types';
import { bi } from '../../data/translations';
import { playTapTone, speakText } from '../../utils/audio';
import {
  AuthError,
  AuthErrorCode,
  confirmPhoneCode,
  resetPhoneVerifier,
  signInWithGoogle,
  startPhoneSignIn,
  toIndianE164
} from '../../services/authService';

// The sign-in wall. Two doors, both asked for: Google for anyone with a phone
// that is already signed in, and phone + OTP for artisans with no email.
//
// Type sizes here are deliberately large (base text 18-20px, 64px controls) to
// match the rest of the app, which is built for low-vision users on cheap
// phones held at arm's length.

const RECAPTCHA_CONTAINER_ID = 'divLoginRecaptchaContainer';

interface LoginScreenProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onSkip: () => void;
}

type Mode = 'choose' | 'phone-number' | 'phone-code';

export const LoginScreen: React.FC<LoginScreenProps> = ({ lang, onLanguageChange, onSkip }) => {
  const [mode, setMode] = useState<Mode>('choose');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Firebase's own wording, shown on demand. Several different setup problems
  // collapse into the same friendly sentence, so keeping the raw text one tap
  // away is the difference between fixing it and guessing at it.
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  // The verifier owns a DOM widget; leaving it behind breaks the next attempt.
  useEffect(() => () => resetPhoneVerifier(), []);

  const describeError = (code: AuthErrorCode): string => {
    switch (code) {
      case 'provider-disabled':
        return bi(
          'இந்த உள்நுழைவு முறை இன்னும் இயக்கப்படவில்லை.',
          'This sign-in method is not switched on yet in Firebase.',
          lang
        );
      case 'sms-region-blocked':
        return bi(
          'இந்தப் பகுதிக்கு SMS இன்னும் அனுமதிக்கப்படவில்லை. Google மூலம் உள்நுழையவும்.',
          'SMS is not allowed for this region yet. Please sign in with Google instead.',
          lang
        );
      case 'stale-verification':
        return bi(
          'சரிபார்ப்பு காலாவதியானது. மீண்டும் "குறியீட்டை அனுப்பு" அழுத்தவும்.',
          'That verification expired. Please press "Send code" once more.',
          lang
        );
      case 'popup-blocked':
        return bi(
          'உங்கள் உலாவி பாப்-அப்பைத் தடுத்தது. அனுமதித்து மீண்டும் முயற்சிக்கவும்.',
          'Your browser blocked the popup. Allow it and try again.',
          lang
        );
      case 'popup-closed':
        return bi('உள்நுழைவு சாளரம் மூடப்பட்டது.', 'The sign-in window was closed.', lang);
      case 'invalid-phone':
        return bi('சரியான 10 இலக்க எண்ணை உள்ளிடவும்.', 'Enter a valid 10-digit mobile number.', lang);
      case 'invalid-code':
        return bi('குறியீடு தவறு. மீண்டும் சரிபார்க்கவும்.', 'That code is wrong. Please check it.', lang);
      case 'expired-code':
        return bi('குறியீட்டின் கால அவகாசம் முடிந்தது. புதிதாக அனுப்பவும்.', 'The code expired. Send a new one.', lang);
      case 'too-many-requests':
        return bi(
          'அதிக முயற்சிகள். சிறிது நேரம் கழித்து முயற்சிக்கவும்.',
          'Too many attempts. Please wait a little and try again.',
          lang
        );
      case 'network':
        return bi('இணைய இணைப்பைச் சரிபார்க்கவும்.', 'Check your internet connection.', lang);
      case 'not-configured':
        return bi('உள்நுழைவு இன்னும் அமைக்கப்படவில்லை.', 'Login is not set up yet.', lang);
      default:
        return bi('ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.', 'Something went wrong. Please try again.', lang);
    }
  };

  const handleFailure = (err: unknown) => {
    const message = err instanceof AuthError ? describeError(err.code) : describeError('unknown');
    setError(message);
    setErrorDetail(
      err instanceof AuthError
        ? `${err.code}: ${err.message}`
        : err instanceof Error
          ? err.message
          : String(err)
    );
    setShowDetail(false);
    playTapTone('tap');
  };

  const handleGoogle = async () => {
    playTapTone('tap');
    setError(null);
    setErrorDetail(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      // App swaps this screen out on the auth state change; nothing to do here.
    } catch (err) {
      handleFailure(err);
    } finally {
      setBusy(false);
    }
  };

  const handleSendCode = async () => {
    playTapTone('tap');
    setError(null);
    setErrorDetail(null);
    setBusy(true);
    try {
      confirmationRef.current = await startPhoneSignIn(toIndianE164(phone), RECAPTCHA_CONTAINER_ID);
      setMode('phone-code');
      speakText(
        bi('உங்கள் தொலைபேசிக்கு குறியீடு அனுப்பப்பட்டது.', 'A code has been sent to your phone.', lang),
        lang
      );
    } catch (err) {
      handleFailure(err);
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmCode = async () => {
    playTapTone('tap');
    setError(null);
    setErrorDetail(null);
    if (!confirmationRef.current) {
      setMode('phone-number');
      return;
    }
    setBusy(true);
    try {
      await confirmPhoneCode(confirmationRef.current, code);
    } catch (err) {
      handleFailure(err);
    } finally {
      setBusy(false);
    }
  };

  const phoneDigits = phone.replace(/\D/g, '');
  const canSendCode = phoneDigits.length >= 10 && !busy;
  const canConfirm = code.replace(/\D/g, '').length >= 6 && !busy;

  return (
    <div
      className="min-h-[100svh] w-full bg-[#f9f9f6] text-[#1a1c1b] flex flex-col items-center font-['Public_Sans']"
      style={{
        paddingTop: 'calc(var(--safe-top) + 2rem)',
        paddingBottom: 'calc(var(--safe-bottom) + 2rem)',
        paddingLeft: 'max(1.25rem, var(--safe-left))',
        paddingRight: 'max(1.25rem, var(--safe-right))'
      }}
    >
      <div className="w-full max-w-md flex-1 flex flex-col">
        {/* Language switch first: an artisan who cannot read the page cannot log in. */}
        <div className="w-full flex justify-center gap-2 mb-8">
          {(['en', 'ta', 'both'] as Language[]).map((option) => (
            <button
              key={option}
              onClick={() => {
                playTapTone('tap');
                onLanguageChange(option);
              }}
              className={`px-4 py-2.5 rounded-full text-base font-bold border-2 btn-press transition-colors ${
                lang === option
                  ? 'bg-[#1a1c1b] text-white border-[#1a1c1b]'
                  : 'bg-white text-[#57423a] border-[#e8e5df] hover:bg-[#f4f4f1]'
              }`}
            >
              {option === 'en' ? 'EN' : option === 'ta' ? 'தமிழ்' : 'த·EN'}
            </button>
          ))}
        </div>

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#128752] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>
          <h1 className="font-['Source_Serif_4',serif] text-4xl font-bold mb-2">Craft2Cart</h1>
          <p className="text-lg text-[#57423a]">
            {bi('ஒருமுறை பேசுங்கள். எங்கும் விற்கலாம்.', 'Speak once. Sell everywhere.', lang)}
          </p>
        </div>

        {mode === 'choose' && (
          <div className="flex flex-col gap-4">
            <p className="text-center text-lg font-bold text-[#1a1c1b] mb-1">
              {bi('உள்நுழையவும்', 'Sign in to continue', lang)}
            </p>

            <button
              onClick={handleGoogle}
              disabled={busy}
              className="w-full h-[68px] bg-white border-2 border-[#e8e5df] hover:bg-[#f4f4f1] rounded-xl font-bold text-lg flex items-center justify-center gap-3 soft-shadow btn-press disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-2xl text-[#128752]">account_circle</span>
              <span>{bi('Google மூலம் உள்நுழைக', 'Continue with Google', lang)}</span>
            </button>

            <button
              onClick={() => {
                playTapTone('tap');
                setError(null);
    setErrorDetail(null);
                setMode('phone-number');
              }}
              disabled={busy}
              className="w-full h-[68px] bg-[#128752] hover:bg-[#006c3f] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 soft-shadow btn-press disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                smartphone
              </span>
              <span>{bi('மொபைல் எண் மூலம்', 'Use my mobile number', lang)}</span>
            </button>
          </div>
        )}

        {mode === 'phone-number' && (
          <div className="flex flex-col gap-4">
            <label htmlFor="inputLoginPhoneNumber" className="text-lg font-bold">
              {bi('உங்கள் மொபைல் எண்', 'Your mobile number', lang)}
            </label>
            <div className="flex items-center gap-2">
              <span className="h-[68px] px-4 flex items-center bg-[#e8e8e5] rounded-xl text-lg font-bold text-[#57423a]">
                +91
              </span>
              <input
                id="inputLoginPhoneNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98421 77340"
                className="flex-1 min-w-0 h-[68px] bg-white border-2 border-[#e8e5df] focus:border-[#128752] rounded-xl px-4 text-xl font-bold tracking-wide focus:outline-none"
              />
            </div>
            <p className="text-base text-[#57423a]">
              {bi(
                'குறியீட்டுடன் ஒரு SMS அனுப்புவோம்.',
                'We will send you an SMS with a code.',
                lang
              )}
            </p>

            <button
              onClick={handleSendCode}
              disabled={!canSendCode}
              className="w-full h-[68px] bg-[#128752] hover:bg-[#006c3f] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 soft-shadow btn-press disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">send</span>
              <span>{busy ? bi('அனுப்புகிறோம்...', 'Sending...', lang) : bi('குறியீட்டை அனுப்பு', 'Send code', lang)}</span>
            </button>

            <button
              onClick={() => {
                playTapTone('tap');
                setError(null);
    setErrorDetail(null);
                setMode('choose');
              }}
              className="w-full h-[60px] text-[#57423a] font-bold text-lg btn-press"
            >
              {bi('திரும்பு', 'Back', lang)}
            </button>
          </div>
        )}

        {mode === 'phone-code' && (
          <div className="flex flex-col gap-4">
            <label htmlFor="inputLoginOtpCode" className="text-lg font-bold">
              {bi('SMS-ல் வந்த 6 இலக்க குறியீடு', 'The 6-digit code from your SMS', lang)}
            </label>
            <input
              id="inputLoginOtpCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              className="w-full h-[76px] bg-white border-2 border-[#e8e5df] focus:border-[#128752] rounded-xl px-4 text-3xl font-bold text-center tracking-[0.4em] focus:outline-none"
            />

            <button
              onClick={handleConfirmCode}
              disabled={!canConfirm}
              className="w-full h-[68px] bg-[#128752] hover:bg-[#006c3f] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 soft-shadow btn-press disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">check</span>
              <span>{busy ? bi('சரிபார்க்கிறோம்...', 'Checking...', lang) : bi('உள்நுழை', 'Sign in', lang)}</span>
            </button>

            <button
              onClick={() => {
                playTapTone('tap');
                setError(null);
    setErrorDetail(null);
                setCode('');
                resetPhoneVerifier();
                setMode('phone-number');
              }}
              className="w-full h-[60px] text-[#57423a] font-bold text-lg btn-press"
            >
              {bi('எண்ணை மாற்று', 'Change number', lang)}
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 w-full bg-[#ffdbcd] border-2 border-[#9f3e07] rounded-xl p-4 flex items-start gap-3"
          >
            <span className="material-symbols-outlined text-2xl text-[#9f3e07]">error</span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-[#57423a]">{error}</p>
              {errorDetail && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDetail((open) => !open)}
                    className="mt-1 text-sm font-bold text-[#9f3e07] underline underline-offset-2"
                  >
                    {showDetail
                      ? bi('விவரங்களை மறை', 'Hide details', lang)
                      : bi('விவரங்களைக் காட்டு', 'Show details', lang)}
                  </button>
                  {showDetail && (
                    <p className="mt-1 text-xs font-mono text-[#57423a] break-words whitespace-pre-wrap">
                      {errorDetail}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Firebase anchors its invisible reCAPTCHA here. */}
        <div id={RECAPTCHA_CONTAINER_ID} />

        <div className="mt-auto pt-8 text-center">
          <button
            onClick={() => {
              playTapTone('tap');
              onSkip();
            }}
            className="text-base font-bold text-[#57423a] underline underline-offset-4 btn-press"
          >
            {bi('உள்நுழையாமல் பார்வையிடு', 'Look around without signing in', lang)}
          </button>
          <p className="mt-2 text-sm text-[#57423a]">
            {bi(
              'உங்கள் பொருட்கள் இந்த மொபைலில் மட்டும் சேமிக்கப்படும்.',
              'Your products stay on this device only.',
              lang
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
