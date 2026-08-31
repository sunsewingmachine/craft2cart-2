import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Language } from '../types';
import { bi } from '../data/translations';

interface IntroSplashProps {
  lang: Language;
  onDone: () => void;
}

/** How long the mark stays up before the crossfade starts. */
const HOLD_MS = 1150;
/** Must match the .splash-leaving animation duration in index.css. */
const FADE_MS = 420;

/**
 * Brief branded intro shown while the app is entered.
 *
 * Kept deliberately undisruptive:
 *  - the app underneath is already mounted and interactive, so this only ever
 *    costs the user the moment they spend looking at it;
 *  - a tap anywhere skips straight to the fade;
 *  - it is skipped outright when the OS asks for reduced motion.
 */
export const IntroSplash: React.FC<IntroSplashProps> = ({ lang, onDone }) => {
  const [leaving, setLeaving] = useState(false);
  // Guards the single exit path shared by the timer, the tap and the key
  // handler, so the splash can never be dismissed twice or left on screen.
  const dismissedRef = useRef(false);
  const fadeTimerRef = useRef<number | undefined>(undefined);

  // App passes an inline arrow for onDone, so its identity changes on every
  // parent render. Reading it through a ref keeps `dismiss` stable, which
  // stops the hold timer from being cleared and restarted (and the splash from
  // overstaying) every time something unrelated re-renders the app.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setLeaving(true);
    fadeTimerRef.current = window.setTimeout(() => onDoneRef.current(), FADE_MS);
  }, []);

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      dismissedRef.current = true;
      onDoneRef.current();
      return;
    }

    const holdTimer = window.setTimeout(dismiss, HOLD_MS);
    const onKeyDown = () => dismiss();
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(fadeTimerRef.current);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dismiss]);

  return (
    <div
      onPointerDown={dismiss}
      // Decorative: the real app content behind it is what screen readers
      // should be announcing, not this.
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#f9f9f6] ${
        leaving ? 'splash-leaving' : ''
      }`}
      style={{
        paddingLeft: 'max(1.5rem, var(--safe-left))',
        paddingRight: 'max(1.5rem, var(--safe-right))'
      }}
    >
      {/* Brand mark with a single sheen pass */}
      <div className="splash-mark relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#9f3e07] to-[#7f2e03] flex items-center justify-center shadow-lg border border-[#803104] overflow-hidden">
        <span
          className="material-symbols-outlined text-[40px] text-white"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          storefront
        </span>
        <span className="splash-sheen absolute inset-y-0 -inset-x-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="splash-title font-['Public_Sans'] font-extrabold text-3xl sm:text-4xl text-[#9f3e07] tracking-tight">
          Craft2Cart
        </h1>
        <p className="splash-tagline text-xs sm:text-sm font-medium text-[#57423a]">
          {bi('ஒரு முறை பேசுங்கள். எங்கும் விற்கலாம்.', 'Speak once. Sell everywhere.', lang)}
        </p>
      </div>
    </div>
  );
};
