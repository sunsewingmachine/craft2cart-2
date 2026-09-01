import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Language } from '../../types';
import { playTapTone } from '../../utils/audio';

// The language chooser as a dialog, plus the round icon that opens it. Kept as
// its own component because the choice appears in more than one place (the sign-in
// wall today, any full-screen flow later) and the option list must not drift.
// Rows are a normal control height — tappable on a phone, but not so large that
// a three-item list fills the screen.
//
// The dialog is portalled to <body>. It has to be: the top bar carries
// backdrop-blur, and a backdrop-filter (like transform and filter) makes that
// element the containing block for its fixed descendants — so a dialog rendered
// inside the header anchors to the 64px header strip instead of the viewport and
// spills off the top of the screen.

export const LANGUAGE_OPTIONS: { id: Language; short: string; label: string }[] = [
  { id: 'en', short: 'EN', label: 'English' },
  { id: 'ta', short: 'தமிழ்', label: 'தமிழ் (Tamil)' },
  { id: 'both', short: 'த·EN', label: 'தமிழ் · English' }
];

export const languageShort = (lang: Language): string =>
  LANGUAGE_OPTIONS.find((option) => option.id === lang)?.short ?? 'EN';

interface LanguageIconButtonProps {
  lang: Language;
  onClick: () => void;
}

/**
 * A quiet globe, no label. It has to be findable without competing with the
 * sign-in buttons, and the chosen language is already visible in the page text.
 */
export const LanguageIconButton: React.FC<LanguageIconButtonProps> = ({ lang, onClick }) => (
  <button
    type="button"
    onClick={() => {
      playTapTone('tap');
      onClick();
    }}
    aria-haspopup="dialog"
    aria-label={`Change language (${languageShort(lang)})`}
    title={`Change language (${languageShort(lang)})`}
    className="w-11 h-11 rounded-full flex items-center justify-center bg-[#f2f0eb] hover:bg-[#e8e5df] text-[#8a7d76] btn-press"
  >
    <span className="material-symbols-outlined text-xl">language</span>
  </button>
);

interface LanguageDialogProps {
  lang: Language;
  onSelect: (lang: Language) => void;
  onClose: () => void;
}

export const LanguageDialog: React.FC<LanguageDialogProps> = ({ lang, onSelect, onClose }) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-5 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose language"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-[#f2f0eb] border border-[#e8e5df] shadow-xl p-4 flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-3 mb-1">
          <h2 className="font-['Public_Sans'] text-base font-medium text-[#1a1c1b]">Language</h2>
          <button
            type="button"
            onClick={() => {
              playTapTone('tap');
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 shrink-0 rounded-full bg-[#e8e5df] hover:bg-[#dcd9d2] text-[#57423a] flex items-center justify-center btn-press"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {LANGUAGE_OPTIONS.map((option) => {
          const isActive = option.id === lang;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                playTapTone('tap');
                onSelect(option.id);
                onClose();
              }}
              className={`w-full h-[48px] px-3 rounded-xl flex items-center justify-between gap-2 text-sm font-medium btn-press transition-colors ${
                isActive
                  ? 'bg-[#128752] text-white'
                  : 'bg-[#e8e5df] hover:bg-[#dcd9d2] text-[#1a1c1b]'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-14 shrink-0 text-center rounded-full py-0.5 text-xs ${
                    isActive ? 'bg-white/20' : 'bg-[#f2f0eb]'
                  }`}
                >
                  {option.short}
                </span>
                <span className="truncate">{option.label}</span>
              </span>
              {isActive && (
                <span
                  className="material-symbols-outlined text-lg shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );
};
