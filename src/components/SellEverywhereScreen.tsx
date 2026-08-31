import React, { useState } from 'react';
import { ProductProfile, Language, SellingChannel } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { SELLING_CHANNELS } from '../data/channels';
import { speakText, playTapTone } from '../utils/audio';

interface SellEverywhereScreenProps {
  product: ProductProfile;
  lang: Language;
  onOpenChannel: (channelId: SellingChannel['id']) => void;
  onOpenGovtFair: () => void;
  onOpenWhatsApp: () => void;
  onEditProduct?: () => void;
}

export const SellEverywhereScreen: React.FC<SellEverywhereScreenProps> = ({
  product,
  lang,
  onOpenChannel,
  onOpenGovtFair,
  onOpenWhatsApp,
  onEditProduct
}) => {
  const t = getTranslation(lang);
  const [allExported, setAllExported] = useState(false);

  const handleHearInstructions = () => {
    playTapTone('tap');
    speakText(speechFor(lang, `Great job! Your ${product.name} product pack is prepared. You can explore direct selling on WhatsApp, government fairs, local emporiums, or prepare onboarding packs for Amazon, ONDC, Flipkart, IndiaHandmade, and Bharat TULIP.`, `அருமை! உங்கள் தயாரிப்பு விவரங்கள் தயாராகிவிட்டன. வாட்ஸ்அப், அரசு கண்காட்சிகள் மற்றும் பூம்புகார் மூலம் நேரடியாக விற்கலாம்; அமேசான், ஓஎன்டிசி, பிளிப்கார்ட் மற்றும் பாரத் டியூலிப்பிற்கு உதவியாளர் பேக் பெறலாம்.`), lang);
  };

  const handleSellEverywhereClick = () => {
    playTapTone('success');
    setAllExported(true);
    speakText(
      speechFor(
        lang,
        'All channel packs prepared and ready for distribution!',
        'அனைத்து விற்பனை வழிகளுக்கான தயாரிப்பு விவரங்களும் தயாராகிவிட்டன!'
      ),
      lang
    );
  };

  const handleCardClick = (channel: SellingChannel) => {
    playTapTone('tap');
    if (channel.id === 'whatsapp') {
      onOpenWhatsApp();
    } else if (channel.id === 'fairs') {
      onOpenGovtFair();
    } else {
      onOpenChannel(channel.id);
    }
  };

  const localStatusLabel = (status: SellingChannel['status'], fallback: string) => {
    if (status === 'OPEN_NOW') return bi('இப்போது திறந்துள்ளது', 'OPEN NOW', lang);
    if (status === 'NEEDS_SETUP') return bi('அமைப்பு தேவை', 'NEEDS SETUP', lang);
    if (status === 'LATER') return bi('பின்னர்', 'LATER', lang);
    return fallback;
  };

  const getStatusBadge = (status: SellingChannel['status'], statusLabel: string) => {
    switch (status) {
      case 'OPEN_NOW':
        return (
          <span className="inline-flex items-center gap-1 bg-[#91f8b8]/40 text-[#00522f] border border-[#128752]/30 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
            {statusLabel}
          </span>
        );
      case 'NEEDS_SETUP':
        return (
          <span className="inline-flex items-center gap-1 bg-[#ffdbcd] text-[#9f3e07] border border-[#dec0b5] px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
            {statusLabel}
          </span>
        );
      case 'LATER':
        return (
          <span className="inline-flex items-center gap-1 bg-[#d6e0f6] text-[#004a77] border border-[#a8c7fa] px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
            {statusLabel}
          </span>
        );
    }
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-4">
      {/* Header Section with Audio Assist */}
      <section className="flex flex-col gap-2 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-['Source_Serif_4',serif] text-xl xs:text-2xl sm:text-3xl font-bold text-[#9f3e07] flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[#128752]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span>{t.readyToSell}</span>
            </h2>
            <p className="font-['Public_Sans'] font-bold text-xs sm:text-sm text-[#555f71] mt-1 tracking-wider uppercase">
              {t.oneProductMany}
            </p>
          </div>

          <button
            onClick={handleHearInstructions}
            aria-label="Read screen instructions aloud"
            className="w-12 h-12 tap-target bg-[#d6e0f6] text-[#555f71] rounded-full flex items-center justify-center soft-shadow btn-press hover:bg-[#bdc7dc] shrink-0"
          >
            <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              volume_up
            </span>
          </button>
        </div>

        {/* Product Pack Banner */}
        <div className="bg-[#ffffff] border border-[#e8e5df] rounded-2xl p-4 flex items-center justify-between gap-3 soft-shadow mt-1">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#e8e5df] shrink-0 bg-[#eeeeeb]"
            />
            <div className="flex-1 min-w-0">
              <p className="font-['Public_Sans'] text-sm sm:text-base text-[#1a1c1b] font-bold leading-snug line-clamp-2">
                {product.name} • ₹{product.price}
              </p>
              <p className="text-xs text-[#57423a] leading-snug line-clamp-2 mt-0.5">
                🧵 {product.material} • {bi('எண்ணிக்கை', 'Qty', lang)}: {product.quantity}
              </p>
            </div>
          </div>

          {onEditProduct && (
            <button
              onClick={() => {
                playTapTone('tap');
                onEditProduct();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#f4f4f1] hover:bg-[#ffdbcd]/60 text-[#9f3e07] text-xs font-bold flex items-center gap-1 border border-[#dec0b5] shrink-0 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span className="hidden sm:inline">{bi('திருத்து', 'Edit', lang)}</span>
            </button>
          )}
        </div>
      </section>

      {/* Success Notification if all prepared */}
      {allExported && (
        <div className="bg-[#91f8b8]/40 border-2 border-[#128752] rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-[#128752] text-3xl">task_alt</span>
          <div>
            <p className="font-bold text-[#002110] text-sm sm:text-base">{bi('அனைத்து விற்பனை பேக்குகளும் தயார்!', 'All selling channel packs prepared!', lang)}</p>
            <p className="text-xs text-[#00522f]">{bi('சரிபார்க்கப்பட்ட அனைத்து வழிகளுக்கும் உதவியாளர் பேக்குகள் தயார்.', 'Artisan packs & helper formats ready for all verified channels.', lang)}</p>
          </div>
        </div>
      )}

      {/* Channels List */}
      <section className="flex flex-col gap-3 mt-2">
        {SELLING_CHANNELS.map((channel) => (
          <button
            key={channel.id}
            type="button"
            onClick={() => handleCardClick(channel)}
            className="w-full text-left bg-[#ffffff] rounded-2xl p-3 sm:p-4 border border-[#e8e5df] soft-shadow min-h-[76px] cursor-pointer hover:border-[#9f3e07]/60 active:scale-[0.98] transition-all
                       grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:gap-x-3.5"
          >
            {/* Icon */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#f4f4f1] border border-[#e8e5df] flex items-center justify-center text-[#9f3e07] shrink-0">
              <span className="material-symbols-outlined text-2xl">{channel.icon}</span>
            </div>

            {/* Easy Name + Subtitle. Wraps to two lines instead of truncating,
                so names like "ONDC (Seller App)" stay readable on 360px phones. */}
            <div className="flex flex-col min-w-0">
              <span className="font-['Public_Sans'] font-bold text-[15px] xs:text-base sm:text-lg text-[#1a1c1b] leading-snug line-clamp-2">
                {channel.easyName}
              </span>
              <span className="text-xs text-[#57423a] leading-snug line-clamp-2 mt-0.5">
                {lang === 'en'
                  ? channel.englishSubtitle
                  : lang === 'ta'
                  ? channel.tamilSubtitle.split('·')[0].trim()
                  : channel.tamilSubtitle}
              </span>
            </div>

            {/* Right cluster: badge sits inline only where there is room for it. */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex">
                {getStatusBadge(channel.status, localStatusLabel(channel.status, channel.statusLabel))}
              </span>
              <span className="material-symbols-outlined text-[#57423a] text-lg">
                chevron_right
              </span>
            </div>

            {/* Below sm the badge drops to its own row rather than squeezing
                the channel name into an ellipsis. */}
            <div className="col-start-2 col-span-2 flex flex-wrap items-center gap-2 sm:hidden">
              {getStatusBadge(channel.status, localStatusLabel(channel.status, channel.statusLabel))}
            </div>
          </button>
        ))}
      </section>

      {/* Hero Action Button */}
      <section className="mt-4 mb-4">
        <button
          onClick={handleSellEverywhereClick}
          className="w-full min-h-[64px] px-4 py-3 bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] rounded-2xl font-['Public_Sans'] font-bold text-base xs:text-lg sm:text-xl flex items-center justify-center gap-3 text-center leading-snug soft-shadow btn-press shadow-md"
        >
          <span className="min-w-0">{t.sellEverywhere}</span>
          <span className="material-symbols-outlined text-2xl shrink-0">rocket_launch</span>
        </button>
      </section>
    </main>
  );
};
