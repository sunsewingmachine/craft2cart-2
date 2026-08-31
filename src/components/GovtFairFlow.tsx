import React, { useState } from 'react';
import { ProductProfile, Language } from '../types';
import { GOVT_FAIRS } from '../data/channels';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface GovtFairFlowProps {
  product: ProductProfile;
  lang: Language;
  onBack: () => void;
  onFinish: () => void;
}

export const GovtFairFlow: React.FC<GovtFairFlowProps> = ({
  product,
  lang,
  onBack,
  onFinish
}) => {
  // Steps: 'overview' -> 'step1_details' -> 'step2_final' -> 'success'
  const [currentStep, setCurrentStep] = useState<'overview' | 'step1_details' | 'step2_final' | 'success'>('overview');
  const [agreedToRules, setAgreedToRules] = useState(false);

  const fair = GOVT_FAIRS[0]; // Shilp Samagam
  const t = getTranslation(lang);

  const handleHear = (text: string) => {
    playTapTone('tap');
    speakText(text, lang);
  };

  if (currentStep === 'overview') {
    return (
      <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-5">
        {/* Top Bar inside flow */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e2e3e0] text-[#57423a]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-bold text-sm text-[#9f3e07]">{bi('அரசு வாய்ப்புகள்', 'Government Opportunities', lang)}</span>
          <div className="w-10"></div>
        </div>

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-3 relative mt-2">
          <div className="w-20 h-20 rounded-full bg-[#ffdbcd] flex items-center justify-center text-[#9f3e07] mb-1 shadow-sm">
            <span className="material-symbols-outlined text-4xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance
            </span>
          </div>
          <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
            {fair.easyName}<br />
            <span className="text-[#9f3e07]">({fair.officialName})</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#57423a] max-w-sm">
            {fair.subtitle}
          </p>

          <button
            onClick={() => handleHear(speechFor(lang, 'Government craft fairs. Your product details are ready. You may be eligible based on your answers — final eligibility is decided by the organisers.', 'அரசு கைவினை கண்காட்சிகள். உங்கள் தயாரிப்பு விவரங்கள் தயாராக உள்ளன. உங்கள் பதில்களின் படி தகுதி இருக்கலாம் — இறுதி தகுதியை அமைப்பாளர்கள் முடிவு செய்வார்கள்.'))}
            aria-label="Read screen aloud"
            className="absolute top-0 right-0 w-12 h-12 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center shadow-sm hover:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              volume_up
            </span>
          </button>
        </section>

        {/* Why this fits section */}
        <section>
          <h3 className="font-['Public_Sans'] font-bold text-sm text-[#57423a] mb-3 px-1 uppercase tracking-wider">
            {bi('இது ஏன் உங்களுக்கு பொருந்துகிறது', 'Why this fits you', lang)}
          </h3>
          <div className="bg-[#ffffff] rounded-2xl p-5 shadow-sm border border-[#e8e5df] flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#128752] text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-['Public_Sans'] text-base text-[#1a1c1b] font-medium">{bi('கைவினை: கைவினைஞர் அறிவிப்பு', 'Handmade: Declared by artisan', lang)}</span>
            </div>
            <div className="w-full h-[1px] bg-[#e8e5df]"></div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#128752] text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-['Public_Sans'] text-sm sm:text-base text-[#1a1c1b] font-medium">
                {lang === 'en' ? 'Looks potentially eligible from your answers ✅' : 'உங்கள் பதில்களின் படி தகுதி இருக்கலாம் ✅'}<br />
                <span className="text-xs text-[#57423a]">{bi('இறுதி தகுதியை அமைப்பாளர் முடிவு செய்வார்', 'Final eligibility is decided by the organiser', lang)}</span>
              </span>
            </div>
            <div className="w-full h-[1px] bg-[#e8e5df]"></div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#128752] text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-['Public_Sans'] text-sm sm:text-base text-[#1a1c1b] font-medium">
                {bi('கடை & பயண மானியம்', 'Stall & Travel Subsidy', lang)}<br />
                <span className="text-xs text-[#57423a]">{bi('கடை ஒதுக்கீட்டின் போது அமைப்பாளரிடம் சரிபார்க்கவும்', 'Verify with organiser upon stall allocation', lang)}</span>
              </span>
            </div>
          </div>
        </section>

        {/* What to do section */}
        <section>
          <h3 className="font-['Public_Sans'] font-bold text-sm text-[#57423a] mb-3 px-1 uppercase tracking-wider">
            {bi('என்ன செய்ய வேண்டும்', 'What to do', lang)}
          </h3>
          <div className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#e8e5df] overflow-hidden flex flex-col">
            <div className="p-4 flex items-center gap-3 border-b border-[#e8e5df]">
              <div className="w-8 h-8 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <span className="font-['Public_Sans'] text-base text-[#1a1c1b] flex-1">{bi('விவரங்களைச் சரிபார்', 'Check details', lang)}</span>
              <span className="material-symbols-outlined text-[#57423a]">chevron_right</span>
            </div>

            <div className="p-4 flex items-center gap-3 border-b border-[#e8e5df]">
              <div className="w-8 h-8 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <span className="font-['Public_Sans'] text-base text-[#1a1c1b] flex-1">{bi('தகவல்களைத் தயார் செய்', 'Prepare information', lang)}</span>
              <span className="material-symbols-outlined text-[#57423a]">chevron_right</span>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <span className="font-['Public_Sans'] text-base text-[#1a1c1b] flex-1">{bi('கடைக்கு விண்ணப்பி', 'Apply for stall', lang)}</span>
              <span className="material-symbols-outlined text-[#57423a]">chevron_right</span>
            </div>
          </div>
        </section>

        {/* Action Area: Do It Myself vs Get Help */}
        <section className="mt-2 flex flex-col gap-2.5">
          <button
            onClick={() => {
              playTapTone('tap');
              setCurrentStep('step1_details');
            }}
            className="w-full min-h-[64px] bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] rounded-2xl font-['Public_Sans'] font-bold text-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <span>🙋 {bi('நானே விண்ணப்பிக்கிறேன்', 'APPLY MYSELF', lang)}</span>
          </button>

          <button
            onClick={() => {
              playTapTone('tap');
              const msg = `*Craft2Cart Fair Stall Application Pack*\n\n*Product:* ${product.name}\n*Price:* ₹${product.price}\n*Fair:* ${fair.officialName}\n*Ministry:* ${fair.ministry}\n\nPlease help the artisan with the fair application process.`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            className="w-full min-h-[48px] bg-[#ffffff] border border-[#dec0b5] hover:bg-[#f4f4f1] text-[#57423a] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xs"
          >
            <span>👤 {bi('உதவி வேண்டும்', 'GET HELP VIA WHATSAPP', lang)}</span>
          </button>
        </section>
      </main>
    );
  }

  if (currentStep === 'step1_details') {
    return (
      <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-5">
        {/* Header & Hear Button */}
        <div className="flex items-start justify-between w-full">
          <div>
            <span className="text-xs font-bold text-[#9f3e07] uppercase">{bi('படி 1 / 2', 'Step 1 of 2', lang)}</span>
            <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
              {bi('உங்கள் தகவல்', 'Your Information', lang)}
            </h2>
            <p className="font-['Public_Sans'] text-sm text-[#57423a] mt-1">
              {bi('தொடர்வதற்கு முன் உங்கள் விவரங்களைச் சரிபார்க்கவும்.', 'Check your details before we continue.', lang)}
            </p>
          </div>
          <button
            onClick={() => handleHear(speechFor(lang, `Check your artisan details before continuing. Exhibiting ${product.name}.`, `தொடர்வதற்கு முன் உங்கள் விவரங்களைச் சரிபார்க்கவும். ${product.name} காட்சிக்கு தேர்வு.`))}
            aria-label="Listen to instructions"
            className="w-12 h-12 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center shadow-sm active:scale-95 transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              volume_up
            </span>
          </button>
        </div>

        {/* Section 1: Your Details */}
        <section className="bg-[#ffffff] rounded-2xl p-5 shadow-sm border border-[#e8e5df] flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#128752]"></div>
          <div className="flex items-center gap-3 border-b border-[#e8e5df] pb-3">
            <span className="material-symbols-outlined text-[#128752] text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <h3 className="font-['Public_Sans'] font-bold text-lg text-[#1a1c1b]">{bi('உங்கள் விவரங்கள்', 'Your Details', lang)}</h3>
          </div>
          <div className="flex flex-col gap-3 pt-1">
            <div>
              <label className="font-['Public_Sans'] text-xs font-bold text-[#57423a] mb-1 block">{bi('கைவினைஞர் பெயர்', 'Artisan Name', lang)}</label>
              <div className="h-[52px] bg-[#f4f4f1] rounded-xl px-4 flex items-center border border-[#e8e5df] text-[#1a1c1b] font-bold">
                Lakshmi
              </div>
            </div>
            <div>
              <label className="font-['Public_Sans'] text-xs font-bold text-[#57423a] mb-1 block">{bi('இடம்', 'Location', lang)}</label>
              <div className="h-[52px] bg-[#f4f4f1] rounded-xl px-4 flex items-center border border-[#e8e5df] text-[#1a1c1b] font-bold">
                Madurai, Tamil Nadu
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Product to Show */}
        <section className="bg-[#ffffff] rounded-2xl p-5 shadow-sm border border-[#e8e5df] flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#9f3e07]"></div>
          <div className="flex items-center gap-3 border-b border-[#e8e5df] pb-3">
            <span className="material-symbols-outlined text-[#9f3e07] text-2xl">inventory_2</span>
            <h3 className="font-['Public_Sans'] font-bold text-lg text-[#1a1c1b]">{bi('காட்சிப்படுத்தும் பொருள்', 'Product to Show', lang)}</h3>
          </div>
          <div className="flex items-center gap-4 pt-1">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm border border-[#e8e5df]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-['Public_Sans'] font-bold text-base text-[#1a1c1b]">{product.name}</span>
              <span className="text-xs text-[#57423a]">{bi('கடை காட்சிக்கு தேர்வு', 'Selected for stall exhibition', lang)}</span>
              <span className="text-sm font-bold text-[#128752] mt-0.5">₹{product.price}</span>
            </div>
          </div>
        </section>

        {/* Bottom Action */}
        <div className="mt-2">
          <button
            onClick={() => {
              playTapTone('tap');
              setCurrentStep('step2_final');
            }}
            className="w-full min-h-[64px] bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] font-['Public_Sans'] font-bold text-lg rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{t.continueBtn}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </main>
    );
  }

  if (currentStep === 'step2_final') {
    return (
      <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-5">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className="text-xs font-bold text-[#9f3e07] uppercase">{bi('இறுதிப் படி', 'Final Step', lang)}</span>
            <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
              {bi('உறுதிசெய்து அனுப்பு', 'Confirm & Submit', lang)}
            </h2>
            <p className="font-['Public_Sans'] text-sm text-[#57423a] mt-1">
              {bi('அனுப்பும் முன் விண்ணப்ப விவரங்களைச் சரிபார்க்கவும்.', 'Review your application details before sending.', lang)}
            </p>
          </div>
          <button
            onClick={() => handleHear(speechFor(lang, `Final step. Stall application for ${fair.officialName}. Product: ${product.name}. Tap Send Application.`, `இறுதிப் படி. ${fair.officialName} கண்காட்சிக்கான விண்ணப்பம். பொருள்: ${product.name}. விண்ணப்பத்தை அனுப்பவும்.`))}
            aria-label="Read screen aloud"
            className="w-12 h-12 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center flex-shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              volume_up
            </span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm border border-[#e8e5df] flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-[#ffdbcd] text-[#9f3e07] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                storefront
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#57423a] block">{bi('கடை:', 'Stall for:', lang)}</span>
              <span className="font-['Public_Sans'] text-lg font-bold text-[#1a1c1b] block">Shilp Samagam Fair</span>
              <span className="text-xs text-[#128752]">{bi('அரசு நிதியுதவி', 'Government Sponsored', lang)}</span>
            </div>
          </div>

          <div className="h-px bg-[#e8e5df] w-full"></div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                inventory_2
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#57423a] block">{bi('காட்சிப் பொருள்:', 'Exhibition Product:', lang)}</span>
              <span className="font-['Public_Sans'] text-lg font-bold text-[#1a1c1b] block">{product.name}</span>
              <span className="text-xs text-[#57423a]">{bi(`${product.quantity} தயார்`, `${product.quantity} pieces ready`, lang)}</span>
            </div>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex flex-col gap-3 mt-2">
          <h3 className="font-['Public_Sans'] font-bold text-lg text-center text-[#1a1c1b]">
            {bi('அனுப்ப தயாரா?', 'Ready to send?', lang)}
          </h3>
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-[#ffffff] border border-[#e8e5df] cursor-pointer hover:bg-[#f4f4f1] transition-colors">
            <input
              type="checkbox"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              className="w-6 h-6 rounded border-[#dec0b5] text-[#9f3e07] focus:ring-[#9f3e07] cursor-pointer"
            />
            <span className="font-['Public_Sans'] text-sm text-[#1a1c1b] select-none font-medium">
              {bi('அரசு கண்காட்சி விதிமுறைகள் மற்றும் கடை தேவைகளுக்கு ஒப்புக்கொள்கிறேன்.', 'I agree to the government fair guidelines and stall requirements.', lang)}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="mt-2">
          <button
            disabled={!agreedToRules}
            onClick={() => {
              playTapTone('success');
              setCurrentStep('success');
            }}
            className={`w-full min-h-[64px] font-['Public_Sans'] font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${
              agreedToRules
                ? 'bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff]'
                : 'bg-[#e2e3e0] text-[#78716c] cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
            <span>{t.sendApplication}</span>
          </button>
        </div>
      </main>
    );
  }

  // Success Screen
  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-center p-6 text-center py-8">
      {/* Success Icon */}
      <div className="flex items-center justify-center w-28 h-28 rounded-full bg-[#91f8b8] mb-6 shadow-md animate-bounce">
        <span className="material-symbols-outlined text-[64px] text-[#00522f]" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>

      <h1 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b] mb-3 leading-snug">
        {t.applicationSentTitle}
      </h1>

      <p className="font-['Public_Sans'] text-base sm:text-lg text-[#555f71] mb-8">
        {t.applicationSentSub}
      </p>

      <div className="w-full">
        <button
          onClick={() => {
            playTapTone('tap');
            onFinish();
          }}
          className="w-full min-h-[64px] bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] font-['Public_Sans'] font-bold text-lg rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">home</span>
          <span>{t.backToHome}</span>
        </button>
      </div>
    </main>
  );
};
