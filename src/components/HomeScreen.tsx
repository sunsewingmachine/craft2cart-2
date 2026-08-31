import React from 'react';
import { Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface HomeScreenProps {
  lang: Language;
  onStartSell: () => void;
  onViewProducts: () => void;
  onViewBuyers: () => void;
  onViewOrders?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  lang,
  onStartSell,
  onViewProducts,
  onViewBuyers
}) => {
  const t = getTranslation(lang);

  const handleHearWelcome = () => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        "Hello Lakshmi. What would you like to do today? Tap 'Sell a Product' to take a photo and start selling everywhere.",
        "வணக்கம் லட்சுமி. இன்று நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்? பொருளை விற்க 'பொருளை விற்க' பொத்தானை அழுத்தவும்."
      ),
      lang
    );
  };

  return (
    <main className="w-full max-w-xl mx-auto flex flex-col gap-5 py-4">
      {/* Welcome Section with Audio Assist */}
      <section className="bg-[#ffffff] p-5 sm:p-6 rounded-2xl border border-[#e8e5df] shadow-sm flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b] tracking-tight">
              {t.greeting}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffdbcd]/50 text-[#9f3e07]">
              {bi('சிறந்த கைவினைஞர்', 'Master Artisan', lang)}
            </span>
          </div>
          <p className="font-['Public_Sans'] text-sm sm:text-base text-[#57423a] mt-1">
            {t.homeQuestion}
          </p>
        </div>

        {/* Audio Assistance Button */}
        <button
          onClick={handleHearWelcome}
          aria-label="Read screen aloud"
          title="Listen to instructions"
          className="w-12 h-12 rounded-full bg-[#f2f0eb] text-[#9f3e07] flex items-center justify-center border border-[#e8e5df] hover:bg-[#ffdbcd]/30 active:scale-95 transition-all shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
            volume_up
          </span>
        </button>
      </section>

      {/* Primary Hero Action: SELL A PRODUCT */}
      <section>
        <button
          onClick={() => {
            playTapTone('tap');
            onStartSell();
          }}
          className="w-full bg-gradient-to-br from-[#9f3e07] to-[#7f2e03] text-[#ffffff] rounded-2xl py-6 px-6 flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer border border-[#803104]"
        >
          <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[32px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_camera
            </span>
          </div>
          <span className="font-['Public_Sans'] font-extrabold text-2xl sm:text-3xl tracking-wide uppercase">
            {t.sellAProduct}
          </span>
          <span className="text-xs sm:text-sm text-[#ffdbcd] font-medium tracking-normal text-center">
            {bi('புகைப்படம் + குரல் → எங்கும் விற்க தயார்', 'Photo + Voice → Ready to sell everywhere', lang)}
          </span>
        </button>
      </section>

      {/* Secondary Actions Grid */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* My Products */}
        <button
          onClick={() => {
            playTapTone('tap');
            onViewProducts();
          }}
          className="bg-[#ffffff] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 border border-[#e8e5df] shadow-sm hover:border-[#9f3e07]/40 active:scale-[0.98] transition-all min-h-[115px] cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-[#ffdbcd]/40 flex items-center justify-center text-[#9f3e07]">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>
          <span className="font-['Public_Sans'] font-bold text-sm sm:text-base text-[#1a1c1b] text-center">
            {t.myProducts}
          </span>
        </button>

        {/* Buyers */}
        <button
          onClick={() => {
            playTapTone('tap');
            onViewBuyers();
          }}
          className="bg-[#ffffff] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 border border-[#e8e5df] shadow-sm hover:border-[#9f3e07]/40 active:scale-[0.98] transition-all min-h-[115px] relative cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-[#d6e0f6]/60 flex items-center justify-center text-[#2563eb]">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              groups
            </span>
          </div>
          <span className="font-['Public_Sans'] font-bold text-sm sm:text-base text-[#1a1c1b] text-center">
            {t.buyers}
          </span>
          <span className="absolute top-3 right-3 bg-[#128752] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
            {bi('2 புதியவை', '2 New', lang)}
          </span>
        </button>
      </section>

      {/* Recent Activity Notification Card */}
      <section
        onClick={() => {
          playTapTone('tap');
          onViewBuyers();
        }}
        className="bg-[#ffffff] rounded-2xl p-4 border border-[#e8e5df] shadow-sm flex items-center gap-3.5 cursor-pointer hover:bg-[#faf9f5] transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-[#ffdbcd]/50 flex items-center justify-center shrink-0 text-[#9f3e07]">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            notifications_active
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-['Public_Sans'] text-sm sm:text-base font-semibold text-[#1a1c1b] truncate">
            {t.newOrdersNotice}
          </p>
          <p className="text-xs text-[#78716c] truncate">
            {bi('அமித் வர்மா 50 சணல் பைகள் கேட்கிறார்', 'Amit Verma (FabIndia) wants 50 Jute Bags', lang)}
          </p>
        </div>
        <span className="material-symbols-outlined text-[#78716c] shrink-0 text-xl">
          arrow_forward
        </span>
      </section>

      {/* Craft2Cart Value Banner */}
      <section className="bg-[#f5f4ef] rounded-2xl p-3.5 sm:p-4 border border-[#e8e5df] flex items-center gap-3 text-xs sm:text-sm text-[#57423a]">
        <span className="material-symbols-outlined text-[#9f3e07] text-2xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
          verified
        </span>
        <span className="leading-relaxed">
          <strong className="text-[#1a1c1b]">{bi('படிவங்கள் தேவையில்லை:', 'Zero forms to fill:', lang)}</strong>{' '}
          {bi(
            'இயல்பாகப் பேசுங்கள் — வாட்ஸ்அப், ONDC, அமேசான் மற்றும் அரசு கண்காட்சிகளுக்கான பட்டியல்களை Craft2Cart தானாக தயார் செய்யும்.',
            'Speak naturally and Craft2Cart prepares your listings for WhatsApp, ONDC, Amazon, and Government Fairs automatically.',
            lang
          )}
        </span>
      </section>
    </main>
  );
};

