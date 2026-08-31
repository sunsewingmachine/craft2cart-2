import React, { useState } from 'react';
import { ProductProfile, Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface WhatsAppShareScreenProps {
  product: ProductProfile;
  lang: Language;
  onBack: () => void;
}

export const WhatsAppShareScreen: React.FC<WhatsAppShareScreenProps> = ({
  product,
  lang,
  onBack
}) => {
  const t = getTranslation(lang);
  const [copied, setCopied] = useState(false);

  const shareText = `🧵 *${product.name}*\n💰 Price: ₹${product.price}\n✨ Material: ${product.material}\n✋ 100% Handmade by artisan Lakshmi\n\n💬 Reply to order directly or message on Craft2Cart!`;

  const handleHear = () => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        `WhatsApp message preview for ${product.name} priced at ₹${product.price}. Tap the button to send it directly to your customers.`,
        `வாட்ஸ்அப் முன்னோட்டம்: ${product.name}, விலை ₹${product.price}. வாடிக்கையாளர்களுக்கு அனுப்ப 'வாட்ஸ்அப்பில் அனுப்பவும்' பொத்தானை அழுத்தவும்.`
      ),
      lang
    );
  };

  const handleSendToWhatsApp = () => {
    playTapTone('success');
    setCopied(true);
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-5">
      {/* Header Section with Audio Assist */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
            {bi('வாட்ஸ்அப்பில் பகிர்', 'Share on WhatsApp', lang)}
          </h2>
          <p className="font-['Public_Sans'] text-xs sm:text-sm text-[#57423a] mt-1">
            {bi('வாடிக்கையாளர்களுக்கு அனுப்பும்போது உங்கள் பொருள் இப்படித் தெரியும்.', 'Here is how your product will look when you send it to customers.', lang)}
          </p>
        </div>
        <button
          onClick={handleHear}
          aria-label="Read screen instructions aloud"
          className="w-12 h-12 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center flex-shrink-0 soft-shadow btn-press hover:bg-[#bdc7dc]"
        >
          <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
            volume_up
          </span>
        </button>
      </div>

      {/* Message Preview Card */}
      <div className="bg-[#ffffff] rounded-2xl tactile-shadow overflow-hidden border border-[#e8e5df]">
        <div className="p-3.5 bg-[#f4f4f1] border-b border-[#e8e5df] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#9f3e07] text-xl">visibility</span>
          <span className="font-['Public_Sans'] font-bold text-xs sm:text-sm text-[#57423a] uppercase tracking-wide">
            {t.messagePreview}
          </span>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Product Image */}
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#eeeeeb]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-1.5">
            <h3 className="font-['Source_Serif_4',serif] text-xl sm:text-2xl font-bold text-[#1a1c1b]">
              {product.name}
            </h3>
            <div className="font-['Public_Sans'] text-2xl text-[#128752] font-extrabold">
              ₹{product.price}
            </div>
            <p className="font-['Public_Sans'] text-sm text-[#1a1c1b] bg-[#f9f9f6] p-3.5 rounded-xl italic border border-[#e8e5df]">
              "{product.description || 'Handmade with care. Durable and stylish artisan craft for everyday use.'}"
            </p>
          </div>

          {/* Simulated WhatsApp Order Button */}
          <div className="p-3.5 border-2 border-[#128752]/40 rounded-xl flex items-center justify-between bg-[#91f8b8]/20">
            <span className="font-['Public_Sans'] font-bold text-sm text-[#00522f]">
              {t.orderOnWhatsapp}
            </span>
            <span className="material-symbols-outlined text-[#006c3f]">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* Primary Action: Send to WhatsApp */}
      <button
        onClick={handleSendToWhatsApp}
        className="w-full min-h-[64px] bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] rounded-2xl font-['Public_Sans'] font-bold text-lg flex items-center justify-center gap-3 soft-shadow btn-press mt-1"
      >
        <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
          send
        </span>
        <span>{copied ? bi('வாட்ஸ்அப் திறக்கிறது...', 'OPENING WHATSAPP...', lang) : t.sendToWhatsapp}</span>
      </button>

      {/* Secondary Action: Back */}
      <button
        onClick={onBack}
        className="w-full min-h-[56px] border-2 border-[#9f3e07] text-[#9f3e07] rounded-2xl font-['Public_Sans'] font-bold text-base flex items-center justify-center gap-2 btn-press bg-[#ffffff] hover:bg-[#ffdbcd]/30"
      >
        <span>{bi('பொருட்களுக்குத் திரும்பு', 'Back to Products', lang)}</span>
      </button>
    </main>
  );
};
