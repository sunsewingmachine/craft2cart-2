import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';
import { CatalogDraft, rejectReason } from '../services/catalogService';

interface AICheckScreenProps {
  lang: Language;
  photoUrl: string;
  detectedName: string;
  detectedMaterial: string;
  /** True while Gemini is still reading the photo. */
  isAnalyzing?: boolean;
  /** What the AI read from the photo. Null before the first answer arrives. */
  draft?: CatalogDraft | null;
  /** 'fallback' means the AI could not be reached and these are demo values. */
  aiSource?: 'ai' | 'fallback' | null;
  onConfirm: (confirmedName: string) => void;
  onRetake: () => void;
}

export const AICheckScreen: React.FC<AICheckScreenProps> = ({
  lang,
  photoUrl,
  detectedName,
  detectedMaterial,
  isAnalyzing = false,
  draft = null,
  aiSource = null,
  onConfirm,
  onRetake
}) => {
  const t = getTranslation(lang);

  // Gemini looked at the photo and found nothing sellable in it — a selfie, a
  // screenshot, an empty wall. Only an explicit verdict rejects: a fallback
  // draft (offline, no key) always says isProduct, so a flat network can never
  // accuse the artisan of photographing the wrong thing.
  const isRejected = !isAnalyzing && aiSource === 'ai' && draft?.isProduct === false;

  const [isEditing, setIsEditing] = useState(false);
  const [customName, setCustomName] = useState(detectedName);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // The name arrives from the AI a few seconds after this screen mounts, so the
  // draft in the edit box has to follow it — until the artisan starts typing,
  // at which point their own words win.
  useEffect(() => {
    if (!isEditing) setCustomName(detectedName);
  }, [detectedName, isEditing]);

  const getLocalizedQuestion = () => {
    if (lang === 'ta') {
      return `இது ${detectedName}?`;
    }
    if (lang === 'both') {
      return `இது ${detectedName}? · Is this a ${detectedName.toLowerCase()}?`;
    }
    return `Is this a ${detectedName.toLowerCase()}?`;
  };

  const handleHearQuestion = () => {
    playTapTone('tap');
    const questionText = lang === 'en' ? `Is this a ${detectedName.toLowerCase()}?` : `இது ${detectedName}?`;
    const subtext = speechFor(
      lang,
      "Tap 'Yes, that's right' if this is correct, or tap the microphone to say what it is.",
      "இது சரியென்றால் 'ஆம், அது சரி' அழுத்தவும், அல்லது பேச மைக்ரோஃபோனை அழுத்தவும்."
    );
    speakText(`${questionText}. ${subtext}`, lang);
  };

  const handleVoiceCorrection = () => {
    playTapTone('mic');
    setIsListeningMic(true);

    const win = window as any;
    if (typeof window !== 'undefined' && (win.SpeechRecognition || win.webkitSpeechRecognition)) {
      try {
        const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionClass();
        recognition.lang = lang === 'en' ? 'en-IN' : 'ta-IN';
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setCustomName(transcript);
            setIsEditing(true);
            playTapTone('success');
          }
          setIsListeningMic(false);
        };
        recognition.onerror = () => {
          setIsListeningMic(false);
        };
        recognition.start();
      } catch (e) {
        fallbackSimulatedVoice();
      }
    } else {
      fallbackSimulatedVoice();
    }
  };

  const fallbackSimulatedVoice = () => {
    setTimeout(() => {
      setCustomName('Handwoven Jute Craft Bag');
      setIsEditing(true);
      setIsListeningMic(false);
      playTapTone('success');
    }, 1500);
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2">
      {/* Image Preview Card */}
      <div className="w-full bg-[#ffffff] rounded-2xl soft-shadow p-3 overflow-hidden mb-6 border border-[#e8e5df]">
        <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#eeeeeb] relative">
          <img
            src={photoUrl}
            alt="Captured item"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => {
              playTapTone('tap');
              onRetake();
            }}
            aria-label="Retake photo"
            className="absolute top-4 right-4 w-12 h-12 bg-[#555f71] text-[#ffffff] rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform btn-press hover:bg-[#3d4759]"
          >
            <span className="material-symbols-outlined text-2xl">replay</span>
          </button>
        </div>
      </div>

      {/* Reading the photo. Shown in place of the question until Gemini answers,
          so the artisan is never asked to confirm a name that is still a guess. */}
      {isAnalyzing && (
        <div className="w-full mb-6 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full border-4 border-[#d6e0f6] border-t-[#128752] animate-spin" />
          <p className="font-['Public_Sans'] text-lg font-bold text-[#1a1c1b]">{t.aiChecking}</p>
          <p className="text-sm text-[#57423a] max-w-sm">
            {bi(
              'உங்கள் புகைப்படத்தைப் பார்த்து விவரங்களை எழுதுகிறோம்.',
              'Looking at your photo and writing the details.',
              lang
            )}
          </p>
        </div>
      )}

      {/* Photo turned away. This replaces the whole confirm flow rather than
          sitting beside it: there is nothing here to confirm or correct, and the
          only way forward is another photo. */}
      {isRejected && draft && (
        <div className="w-full flex flex-col gap-4">
          <div className="w-full bg-[#ffe9e4] border-2 border-[#c05621] rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-2xl text-[#c05621]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                report
              </span>
              <h2 className="font-['Public_Sans'] text-xl font-bold text-[#1a1c1b]">
                {bi('இது பொருளின் படம் அல்ல', 'This is not a product photo', lang)}
              </h2>
            </div>

            <p className="font-['Public_Sans'] text-base text-[#57423a] whitespace-pre-line">
              {rejectReason(draft, lang) ||
                bi(
                  'இந்த புகைப்படத்தில் விற்பனைப் பொருள் தெரியவில்லை.',
                  'No item that can be sold is visible in this photo.',
                  lang
                )}
            </p>

            <p className="font-['Public_Sans'] text-base text-[#1a1c1b]">
              {bi(
                'விற்க விரும்பும் பொருளை வெளிச்சத்தில் தெளிவாக எடுத்து மீண்டும் முயற்சிக்கவும்.',
                'Take a clear, well-lit photo of the item you want to sell and try again.',
                lang
              )}
            </p>
          </div>

          <button
            onClick={() => {
              playTapTone('tap');
              onRetake();
            }}
            className="w-full h-[64px] bg-[#c05621] hover:bg-[#9f3e07] text-[#ffffff] rounded-xl font-['Public_Sans'] font-bold text-lg flex items-center justify-center gap-2 soft-shadow btn-press"
          >
            <span className="material-symbols-outlined text-2xl">photo_camera</span>
            <span>{bi('மீண்டும் எடுக்கவும்', 'Take another photo', lang)}</span>
          </button>
        </div>
      )}

      {/* Question Area */}
      <div className={`w-full text-center mb-6 flex flex-col items-center ${isAnalyzing || isRejected ? 'hidden' : ''}`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
            {isEditing ? `${bi('பொருள்', 'Product', lang)}: ${customName}` : getLocalizedQuestion()}
          </h2>
          <button
            onClick={handleHearQuestion}
            aria-label="Listen to question"
            className="w-12 h-12 bg-[#e8e8e5] hover:bg-[#d6e0f6] text-[#555f71] rounded-full flex items-center justify-center shadow-sm btn-press flex-shrink-0"
          >
            <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              volume_up
            </span>
          </button>
        </div>
        <p className="font-['Public_Sans'] text-sm sm:text-base text-[#57423a] max-w-sm">
          {t.aiSubtext}
        </p>

        {isEditing && (
          <div className="w-full mt-3">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-white border-2 border-[#9f3e07] rounded-xl px-4 py-3 text-lg font-bold text-[#1a1c1b] focus:outline-none text-center"
            />
          </div>
        )}
      </div>

      {/* What the AI actually read. Showing material, category and a price range
          is the difference between "it guessed a name" and a real catalog draft. */}
      {!isAnalyzing && !isRejected && draft && (
        <div className="w-full bg-[#ffffff] rounded-2xl soft-shadow border border-[#e8e5df] p-4 mb-6 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-bold text-[#57423a] uppercase tracking-wider">
                {bi('பொருள்', 'Material', lang)}
              </p>
              <p className="text-base font-bold text-[#1a1c1b]">{draft.material || detectedMaterial}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#57423a] uppercase tracking-wider">
                {bi('வகை', 'Category', lang)}
              </p>
              <p className="text-base font-bold text-[#1a1c1b]">{draft.category}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#e8e5df]">
            <p className="text-[11px] font-bold text-[#57423a] uppercase tracking-wider">
              {bi('பரிந்துரைக்கப்பட்ட விலை', 'Suggested price', lang)}
            </p>
            <p className="text-xl font-bold text-[#128752]">
              ₹{draft.suggestedPriceMin} – ₹{draft.suggestedPriceMax}
            </p>
            <p className="text-sm text-[#57423a] mt-0.5">{draft.priceReason}</p>
          </div>

          {draft.photoTip && (
            <div className="flex items-start gap-2 bg-[#fff8e6] border border-[#e8dcae] rounded-xl p-3">
              <span className="material-symbols-outlined text-lg text-[#9f3e07] flex-shrink-0">lightbulb</span>
              <p className="text-sm font-semibold text-[#57423a]">{draft.photoTip}</p>
            </div>
          )}

          {aiSource === 'fallback' && (
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-lg text-[#57423a] flex-shrink-0">cloud_off</span>
              <p className="text-sm text-[#57423a]">
                {bi(
                  'இணையம் இல்லை — இவை மாதிரி விவரங்கள். நீங்கள் திருத்தலாம்.',
                  'Offline — these are sample details. You can correct them.',
                  lang
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div
        className={`w-full flex flex-col gap-3.5 mt-auto ${isAnalyzing ? 'opacity-40 pointer-events-none' : ''} ${
          isRejected ? 'hidden' : ''
        }`}
      >
        <button
          onClick={() => {
            playTapTone('success');
            onConfirm(isEditing ? customName : detectedName);
          }}
          className="w-full h-[64px] bg-[#128752] hover:bg-[#006c3f] text-[#ffffff] rounded-xl font-['Public_Sans'] font-bold text-lg flex items-center justify-center gap-2 soft-shadow btn-press"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            check
          </span>
          <span>{t.yesRight}</span>
        </button>

        <button
          onClick={() => {
            playTapTone('tap');
            setIsEditing(true);
          }}
          className="w-full h-[64px] bg-transparent border-2 border-[#9f3e07] text-[#9f3e07] hover:bg-[#ffdbcd]/30 rounded-xl font-['Public_Sans'] font-bold text-lg flex items-center justify-center gap-2 btn-press"
        >
          <span className="material-symbols-outlined text-2xl">edit</span>
          <span>{t.noFix}</span>
        </button>
      </div>

      {/* Microphone Instruction (Alternative Voice Correction) */}
      <div
        onClick={handleVoiceCorrection}
        className={`w-full mt-6 bg-[#ffffff] rounded-2xl p-4 soft-shadow flex items-center gap-4 border border-[#e8e5df] cursor-pointer hover:bg-[#f4f4f1] transition-all btn-press ${
          isListeningMic ? 'ring-2 ring-[#c05621] bg-[#ffdbcd]/20' : ''
        } ${isRejected ? 'hidden' : ''}`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          isListeningMic ? 'bg-[#c05621] text-white animate-pulse' : 'bg-[#d6e0f6] text-[#555f71]'
        }`}>
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            mic
          </span>
        </div>
        <div className="flex-1">
          <p className="font-['Public_Sans'] font-bold text-sm sm:text-base text-[#1a1c1b]">
            {isListeningMic ? t.listening : t.tapToSay}
          </p>
          <p className="text-xs text-[#57423a]">
            {isListeningMic
              ? bi('சரியான பொருளின் பெயரை இப்போது சொல்லுங்கள்', 'Say the correct product name now', lang)
              : bi('"இது ஒரு பின்னல் கூடை"', '"It\'s a woven basket"', lang)}
          </p>
        </div>
        <span className="material-symbols-outlined text-[#57423a]">
          chevron_right
        </span>
      </div>
    </main>
  );
};
