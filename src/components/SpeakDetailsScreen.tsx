import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface SpeakDetailsScreenProps {
  lang: Language;
  detectedName: string;
  detectedMaterial?: string;
  photoUrl?: string;
  onComplete: (data: {
    material: string;
    isHandmade: boolean;
    quantity: number;
    price: number;
    costMaterial: number;
    costLabor: number;
  }) => void;
  onBack?: () => void;
}

export const SpeakDetailsScreen: React.FC<SpeakDetailsScreenProps> = ({
  lang,
  onComplete
}) => {
  const t = getTranslation(lang);

  // 4 simple questions
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0 to 3
  const [material, setMaterial] = useState('Natural Golden Jute');
  const [isHandmade, setIsHandmade] = useState(true);
  const [quantity, setQuantity] = useState(50);
  const [price, setPrice] = useState(600);
  const [costMaterial, setCostMaterial] = useState(200);
  const [costLabor, setCostLabor] = useState(300);

  const [isListening, setIsListening] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualText, setManualText] = useState('');

  const questions = [
    {
      id: 'material',
      title: t.q1,
      subtitle: bi('பயன்படுத்திய மூலப்பொருள்', 'Tell me what material is used.', lang),
      speechPrompt: speechFor(lang, 'What is your product made of? Tap the microphone and speak.', 'இது எதனால் செய்யப்பட்டது?'),
      quickOptions: ['Natural Golden Jute', 'Terracotta Clay', '100% Pure Cotton', 'Brass Metal']
    },
    {
      id: 'handmade',
      title: t.q2,
      subtitle: bi('கையால் செய்யப்பட்டதா?', 'Is this 100% handmade by you?', lang),
      speechPrompt: speechFor(lang, 'Did you make it by hand? Tap yes or no.', 'இது கைவேலையா?'),
      quickOptions: []
    },
    {
      id: 'quantity',
      title: t.q3,
      subtitle: bi('எத்தனை விற்க தயாராக உள்ளது?', 'How many pieces do you have ready or can make?', lang),
      speechPrompt: speechFor(lang, 'How many can you sell? Tap the microphone and say the number.', 'எத்தனை விற்க முடியும்?'),
      quickOptions: ['25 pieces', '50 pieces', '100 pieces']
    },
    {
      id: 'price',
      title: t.q4,
      subtitle: bi('விற்பனை விலை', 'Tell me your final selling price in Rupees.', lang),
      speechPrompt: speechFor(lang, 'How much does it cost? Tap the microphone and say the price in Rupees.', 'இதன் விலை என்ன?'),
      quickOptions: ['₹500', '₹600', '₹850', '₹1200']
    }
  ];

  const currentQ = questions[currentStepIndex];

  const handleHearQuestion = () => {
    playTapTone('tap');
    speakText(currentQ.speechPrompt, lang);
  };

  const handleMicPress = () => {
    playTapTone('mic');
    setIsListening(true);

    const win = window as any;
    if (typeof window !== 'undefined' && (win.SpeechRecognition || win.webkitSpeechRecognition)) {
      try {
        const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionClass();
        recognition.lang = lang === 'en' ? 'en-IN' : 'ta-IN';
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            applyAnswer(transcript);
          }
          setIsListening(false);
        };
        recognition.onerror = () => {
          setIsListening(false);
          fallbackAnswer();
        };
        recognition.start();
      } catch (e) {
        fallbackAnswer();
      }
    } else {
      fallbackAnswer();
    }
  };

  const fallbackAnswer = () => {
    setTimeout(() => {
      if (currentStepIndex === 0) applyAnswer('Natural Golden Jute');
      else if (currentStepIndex === 1) applyAnswer('Yes');
      else if (currentStepIndex === 2) applyAnswer('50 pieces');
      else if (currentStepIndex === 3) applyAnswer('600');
      setIsListening(false);
    }, 1200);
  };

  const applyAnswer = (val: string) => {
    playTapTone('success');
    if (currentStepIndex === 0) {
      setMaterial(val);
    } else if (currentStepIndex === 1) {
      setIsHandmade(val.toLowerCase().includes('yes') || val.includes('ஆம்'));
    } else if (currentStepIndex === 2) {
      const num = parseInt(val.replace(/\D/g, '')) || 50;
      setQuantity(num);
    } else if (currentStepIndex === 3) {
      const num = parseInt(val.replace(/\D/g, '')) || 600;
      setPrice(num);
      // Finished all 4 questions! Pass the freshly parsed price directly —
      // the `price` state variable still holds the old value in this render.
      onComplete({
        material,
        isHandmade,
        quantity,
        price: num,
        costMaterial,
        costLabor
      });
      return;
    }

    if (currentStepIndex < 3) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-center py-2">
      {/* Progress Step Indicator */}
      <div className="w-full text-center mb-6">
        <p className="font-['Public_Sans'] text-xs sm:text-sm font-bold text-[#555f71] uppercase tracking-widest mb-2">
          {bi(`படி ${currentStepIndex + 1} / 4`, `Step ${currentStepIndex + 1} of 4`, lang)}
        </p>
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === currentStepIndex
                  ? 'w-10 bg-[#9f3e07]'
                  : step < currentStepIndex
                  ? 'w-8 bg-[#128752]'
                  : 'w-8 bg-[#e2e3e0]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Interactive Question Card */}
      <div className="bg-[#ffffff] rounded-3xl p-6 sm:p-8 w-full shadow-md border border-[#e8e5df] flex flex-col items-center text-center relative mb-6">
        {/* Audio Help FAB */}
        <button
          onClick={handleHearQuestion}
          aria-label="Hear instructions"
          className="absolute -top-4 -right-4 bg-[#555f71] hover:bg-[#3d4759] text-white h-14 w-14 rounded-full soft-shadow flex items-center justify-center btn-press transition-all z-10"
        >
          <span className="material-symbols-outlined text-3xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
            volume_up
          </span>
        </button>

        {/* Question Title */}
        <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b] mb-2 mt-1">
          {currentQ.title}
        </h2>
        <p className="font-['Public_Sans'] text-base text-[#57423a] mb-6">
          {currentQ.subtitle}
        </p>

        {/* Question 2: Handmade YES/NO Special Controls */}
        {currentStepIndex === 1 ? (
          <div className="w-full flex gap-4 my-6">
            <button
              onClick={() => applyAnswer('Yes')}
              className="flex-1 min-h-[80px] bg-[#128752] text-white rounded-2xl font-bold text-2xl flex flex-col items-center justify-center gap-1 soft-shadow btn-press hover:bg-[#006c3f]"
            >
              <span className="material-symbols-outlined text-3xl">check_circle</span>
              <span>{t.yes}</span>
            </button>
            <button
              onClick={() => applyAnswer('No')}
              className="flex-1 min-h-[80px] bg-[#eeeeeb] text-[#57423a] border-2 border-[#dec0b5] rounded-2xl font-bold text-2xl flex flex-col items-center justify-center gap-1 btn-press hover:bg-[#e2e3e0]"
            >
              <span className="material-symbols-outlined text-3xl">cancel</span>
              <span>{t.no}</span>
            </button>
          </div>
        ) : currentStepIndex === 3 ? (
          /* Question 4: Price calculation helper */
          <div className="w-full flex flex-col items-center gap-4 my-2">
            <div className="bg-[#f4f4f1] rounded-2xl p-4 w-full text-left text-xs sm:text-sm border border-[#e8e5df]">
              <div className="flex justify-between py-1 border-b border-[#e8e5df]">
                <span className="text-[#57423a]">{bi('மூலப்பொருள் செலவு:', 'Material Cost:', lang)}</span>
                <span className="font-bold text-[#1a1c1b]">₹{costMaterial}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e8e5df]">
                <span className="text-[#57423a]">{bi('உழைப்பு & நேரம்:', 'Artisan Work & Time:', lang)}</span>
                <span className="font-bold text-[#1a1c1b]">₹{costLabor}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-[#9f3e07]">
                <span>{bi('அடிப்படை விலை:', 'Starting Base Price:', lang)}</span>
                <span>₹{costMaterial + costLabor}</span>
              </div>
            </div>

            {/* Huge Mic Button */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 bg-[#c05621] opacity-20 rounded-full mic-pulse pointer-events-none w-48 h-48 -m-12"></div>
              <button
                onClick={handleMicPress}
                className={`w-32 h-32 rounded-full soft-shadow flex flex-col items-center justify-center btn-press relative z-10 transition-transform ${
                  isListening
                    ? 'bg-[#c05621] text-white scale-105 animate-pulse'
                    : 'bg-[#9f3e07] text-white hover:scale-105'
                }`}
              >
                <span className="material-symbols-outlined text-[54px] mb-1 fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mic
                </span>
                <span className="font-['Public_Sans'] font-bold text-sm uppercase tracking-wide">
                  {isListening ? bi('கேட்கிறது...', 'Listening...', lang) : t.speak}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Default Questions 1 & 3: Huge Mic Button */
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 bg-[#c05621] opacity-20 rounded-full mic-pulse pointer-events-none w-48 h-48 -m-12"></div>
            <button
              onClick={handleMicPress}
              className={`w-32 h-32 rounded-full soft-shadow flex flex-col items-center justify-center btn-press relative z-10 transition-transform ${
                isListening
                  ? 'bg-[#c05621] text-white scale-105 animate-pulse'
                  : 'bg-[#9f3e07] text-white hover:scale-105'
              }`}
            >
              <span className="material-symbols-outlined text-[54px] mb-1 fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                mic
              </span>
              <span className="font-['Public_Sans'] font-bold text-sm uppercase tracking-wide">
                {isListening ? bi('கேட்கிறது...', 'Listening...', lang) : t.speak}
              </span>
            </button>
          </div>
        )}

        {/* Quick Answer Chips */}
        {currentQ.quickOptions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {currentQ.quickOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => applyAnswer(opt)}
                className="bg-[#f4f4f1] hover:bg-[#d6e0f6] border border-[#dec0b5] text-[#1a1c1b] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <p className="font-['Public_Sans'] text-xs text-[#555f71] mt-4">
          {bi('மைக்ரோஃபோனை அழுத்தி இயல்பாக பதிலளிக்கவும்.', 'Tap the microphone and answer naturally.', lang)}
        </p>
      </div>

      {/* Manual Input Fallback Modal / Section */}
      {isManualInput ? (
        <div className="w-full bg-[#ffffff] rounded-2xl p-4 border border-[#9f3e07] shadow-sm flex flex-col gap-3">
          <input
            type="text"
            placeholder={bi('உங்கள் பதிலை உள்ளிடவும்...', 'Type your answer...', lang)}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="w-full bg-[#f4f4f1] rounded-xl px-4 py-3 text-base text-[#1a1c1b] font-medium focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (manualText.trim()) {
                  applyAnswer(manualText);
                  setManualText('');
                  setIsManualInput(false);
                }
              }}
              className="flex-1 bg-[#9f3e07] text-white py-3 rounded-xl font-bold"
            >
              {bi('பதிலைச் சேமி', 'Save Answer', lang)}
            </button>
            <button
              onClick={() => setIsManualInput(false)}
              className="px-4 py-3 bg-[#e2e3e0] text-[#57423a] rounded-xl font-bold"
            >
              {bi('ரத்து', 'Cancel', lang)}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsManualInput(true)}
          className="w-full border-2 border-[#555f71] text-[#555f71] font-['Public_Sans'] font-bold text-base rounded-2xl py-3.5 px-6 flex items-center justify-center btn-press hover:bg-[#e2e3e0] transition-colors min-h-[56px]"
        >
          {bi('பதிலை எழுத்தில் உள்ளிடவும்', 'Enter text manually instead', lang)}
        </button>
      )}
    </main>
  );
};
