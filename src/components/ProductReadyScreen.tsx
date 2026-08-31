import React from 'react';
import { ProductProfile, Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface ProductReadyScreenProps {
  product: ProductProfile;
  lang: Language;
  onSellEverywhere: () => void;
  onEdit: () => void;
}

export const ProductReadyScreen: React.FC<ProductReadyScreenProps> = ({
  product,
  lang,
  onSellEverywhere,
  onEdit
}) => {
  const t = getTranslation(lang);

  const handleHearProductReady = () => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        `Your product is ready! ${product.name} priced at ₹${product.price}. Tap the orange button 'Sell Everywhere' to prepare listings for WhatsApp, ONDC, Amazon, and government craft fairs.`,
        `உங்கள் பொருள் தயாராகிவிட்டது! ${product.name}, விலை ₹${product.price}. எங்கும் விற்க 'எங்கும் விற்கவும்' பொத்தானை அழுத்தவும்.`
      ),
      lang
    );
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-4">
      {/* Header Section */}
      <header className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#128752] flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <div>
            <h1 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#128752]">
              {t.productReadyTitle}
            </h1>
            <p className="text-xs text-[#57423a]">{bi('முதன்மை விவரம் சேமிக்கப்பட்டது ✓', 'Master profile saved ✓', lang)}</p>
          </div>
        </div>

        {/* Hear Button */}
        <button
          onClick={handleHearProductReady}
          aria-label="Listen to product details"
          className="w-12 h-12 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center shadow-sm sink-on-active transition-all hover:bg-[#bdc7dc] flex-shrink-0"
        >
          <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
            volume_up
          </span>
        </button>
      </header>

      {/* Product Preview Card */}
      <article className="w-full bg-[#ffffff] rounded-3xl soft-shadow overflow-hidden mb-6 border border-[#e8e5df] flex flex-col">
        {/* Product Image */}
        <div className="w-full aspect-square relative bg-[#eeeeeb]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-[#006c3f] text-white px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
            <span className="material-symbols-outlined text-sm">check</span>
            <span>{bi('விவரம் உறுதி', 'Profile Confirmed', lang)}</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6 flex flex-col gap-3">
          <div className="flex justify-between items-start w-full">
            <div>
              <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b] mb-1">
                {product.name}
              </h2>
              <p className="font-['Public_Sans'] font-extrabold text-2xl text-[#128752]">
                ₹{product.price}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#555f71] bg-[#eeeeeb] px-2.5 py-1 rounded-full">
                {bi('எண்ணிக்கை', 'Qty', lang)}: {product.quantity}
              </span>
            </div>
          </div>

          <p className="font-['Public_Sans'] text-sm sm:text-base text-[#57423a] leading-relaxed">
            {product.description || t.productReadyDesc}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="bg-[#f4f4f1] border border-[#e8e5df] text-[#57423a] text-xs font-semibold px-2.5 py-1 rounded-md">
              🧵 {product.material}
            </span>
            <span className="bg-[#f4f4f1] border border-[#e8e5df] text-[#57423a] text-xs font-semibold px-2.5 py-1 rounded-md">
              ✋ {bi('100% கைவினை', '100% Handmade', lang)}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-4 mt-3">
            <button
              onClick={() => {
                playTapTone('tap');
                onEdit();
              }}
              className="flex-1 min-h-[52px] rounded-xl border-2 border-[#555f71] text-[#555f71] font-bold text-sm flex items-center justify-center gap-2 sink-on-active transition-all hover:bg-[#d6e0f6]/30"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              <span>{t.editDetails}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Sticky Bottom Hero Button Container */}
      <div className="fixed bottom-0 left-0 right-0 w-full flex justify-center px-4 sm:px-6 pb-24 md:pb-6 bg-gradient-to-t from-[#f9f9f6] via-[#f9f9f6] to-transparent pt-8 z-30 pointer-events-none">
        <div className="w-full max-w-[600px] pointer-events-auto">
          <button
            onClick={() => {
              playTapTone('success');
              onSellEverywhere();
            }}
            className="w-full min-h-[64px] bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] rounded-2xl font-['Public_Sans'] font-bold text-xl sm:text-2xl tracking-wide soft-shadow sink-on-active transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
            <span>{t.sellEverywhere}</span>
          </button>
        </div>
      </div>
    </main>
  );
};
