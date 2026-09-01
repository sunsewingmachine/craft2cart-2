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
import { LanguageDialog, LanguageIconButton } from '../language/LanguageDialog';

// The sign-in wall. Two doors, both asked for: Google for anyone with a phone
// that is already signed in, and phone + OTP for artisans with no email.
//
// Trying the app comes first: "Go without Login" leads, and the two real doors
// follow. Controls are 56px with 16px labels — comfortable on a cheap phone,
// and the whole screen still fits a 375px viewport without scrolling.

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
  const [langOpen, setLangOpen] = useState(false);
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

  // Judge the number after normalising, not as typed — a leading 0 or 91 is a
  // dialling habit, so "098424 70497" is a complete number and must enable Send.
  const canSendCode = toIndianE164(phone).length >= 13 && !busy;
  const canConfirm = code.replace(/\D/g, '').length >= 6 && !busy;

  return (
    <div
      className="min-h-[100svh] w-full bg-[#f9f9f6] text-[#1a1c1b] flex flex-col items-center font-['Public_Sans']"
      style={{
        paddingTop: 'calc(var(--safe-top) + 1rem)',
        paddingBottom: 'calc(var(--safe-bottom) + 1rem)',
        paddingLeft: 'max(1.25rem, var(--safe-left))',
        paddingRight: 'max(1.25rem, var(--safe-right))'
      }}
    >
      <div className="w-full max-w-sm flex-1 flex flex-col">
        {/* Language sits top right, out of the way of the sign-in choice, but
            still reachable first: an artisan who cannot read the page cannot
            log in. The full list opens in a dialog. */}
        <div className="w-full flex justify-end mb-3">
          <LanguageIconButton lang={lang} onClick={() => setLangOpen(true)} />
        </div>

        {langOpen && (
          <LanguageDialog lang={lang} onSelect={onLanguageChange} onClose={() => setLangOpen(false)} />
        )}

        {/* Brand */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#128752] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>
          <h1 className="font-['Source_Serif_4',serif] text-3xl font-bold mb-1">Craft2Cart</h1>
          <p className="text-sm text-[#57423a]">
            {bi('ஒருமுறை பேசுங்கள். எங்கும் விற்கலாம்.', 'Speak once. Sell everywhere.', lang)}
          </p>
        </div>

        {mode === 'choose' && (
          <div className="flex flex-col gap-2.5">
            {/* Trying the app comes first. An artisan who is asked to sign in
                before seeing anything usually closes the app instead. */}
            <button
              onClick={() => {
                playTapTone('tap');
                onSkip();
              }}
              disabled={busy}
              className="w-full h-[56px] bg-[#57423a] hover:bg-[#43332c] text-white rounded-xl font-medium text-base flex items-center justify-center gap-2.5 soft-shadow btn-press disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                explore
              </span>
              <span>{bi('உள்நுழையாமல் செல்க', 'Go without Login', lang)}</span>
            </button>

            <p className="text-center text-sm text-[#57423a] -mt-0.5">
              {bi(
                'உங்கள் பொருட்கள் இந்த மொபைலில் மட்டும் சேமிக்கப்படும்.',
                'Your products stay on this device only.',
                lang
              )}
            </p>

            <div className="flex items-center gap-3 my-0.5">
              <span className="flex-1 h-px bg-[#e8e5df]" />
              <span className="text-sm font-medium text-[#57423a]">{bi('அல்லது', 'or', lang)}</span>
              <span className="flex-1 h-px bg-[#e8e5df]" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={busy}
              className="w-full h-[56px] bg-[#1a73e8] hover:bg-[#1765cc] text-white rounded-xl font-medium text-base flex items-center justify-center gap-2.5 soft-shadow btn-press disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-xl">account_circle</span>
              <span>{bi('Google மூலம் உள்நுழைக', 'Login with Google', lang)}</span>
            </button>

            <button
              onClick={() => {
                playTapTone('tap');
                setError(null);
    setErrorDetail(null);
                setMode('phone-number');
              }}
              disabled={busy}
              className="w-full h-[56px] bg-[#128752] hover:bg-[#006c3f] text-white rounded-xl font-medium text-base flex items-center justify-center gap-2.5 soft-shadow btn-press disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                smartphone
              </span>
              <span>{bi('மொபைல் மூலம் உள்நுழைக', 'Login with Mobile', lang)}</span>
            </button>
          </div>
        )}

        {mode === 'phone-number' && (
          <div className="flex flex-col gap-2.5">
            <label htmlFor="inputLoginPhoneNumber" className="text-base font-medium">
              {bi('உங்கள் மொபைல் எண்', 'Your mobile number', lang)}
            </label>
            {/* +91 rides inside the field rather than in a box beside it, so the
                number reads as one thing. It is a label, not a value: the input
                still holds only what the artisan types, and toIndianE164 adds
                the country code. */}
            <div className="relative">
              <span className="absolute left-4 top-0 h-[56px] flex items-center pointer-events-none text-lg font-medium text-[#57423a]">
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
                className="w-full h-[56px] bg-white border-2 border-[#e8e5df] focus:border-[#128752] rounded-xl pl-[4.25rem] pr-4 text-lg font-medium tracking-wide focus:outline-none"
              />
            </div>
            <p className="text-sm text-[#57423a]">
              {bi(
                'குறியீட்டுடன் ஒரு SMS அனுப்புவோம்.',
                'We will send you an SMS with a code.',
                lang
              )}
            </p>

            <button
              onClick={handleSendCode}
              disabled={!canSendCode}
              className="w-full h-[56px] bg-[#128752] hover:bg-[#006c3f] text-white rounded-xl font-medium text-base flex items-center justify-center gap-2 soft-shadow btn-press disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xl">send</span>
              <span>{busy ? bi('அனுப்புகிறோம்...', 'Sending...', lang) : bi('குறியீட்டை அனுப்பு', 'Send code', lang)}</span>
            </button>

            <button
              onClick={() => {
                playTapTone('tap');
                setError(null);
    setErrorDetail(null);
                setMode('choose');
              }}
              className="w-full h-[52px] text-[#57423a] font-medium text-base btn-press"
            >
              {bi('திரும்பு', 'Back', lang)}
            </button>
          </div>
        )}

        {mode === 'phone-code' && (
          <div className="flex flex-col gap-2.5">
            <label htmlFor="inputLoginOtpCode" className="text-base font-medium">
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
              className="w-full h-[64px] bg-white border-2 border-[#e8e5df] focus:border-[#128752] rounded-xl px-4 text-2xl font-medium text-center tracking-[0.4em] focus:outline-none"
            />

            <button
              onClick={handleConfirmCode}
              disabled={!canConfirm}
              className="w-full h-[56px] bg-[#128752] hover:bg-[#006c3f] text-white rounded-xl font-medium text-base flex items-center justify-center gap-2 soft-shadow btn-press disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xl">check</span>
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
              className="w-full h-[52px] text-[#57423a] font-medium text-base btn-press"
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
              <p className="text-base font-medium text-[#57423a]">{error}</p>
              {errorDetail && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDetail((open) => !open)}
                    className="mt-1 text-sm font-medium text-[#9f3e07] underline underline-offset-2"
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

      </div>
    </div>
  );
};
