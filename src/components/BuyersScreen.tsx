import React from 'react';
import { BuyerInquiry, Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface BuyersScreenProps {
  buyers: BuyerInquiry[];
  lang: Language;
}

export const BuyersScreen: React.FC<BuyersScreenProps> = ({
  buyers,
  lang
}) => {
  const t = getTranslation(lang);

  const handleHearBuyerMessage = (buyer: BuyerInquiry) => {
    playTapTone('tap');
    const speech = speechFor(
      lang,
      `Buyer message from ${buyer.name}. Wants ${buyer.quantity} pieces of ${buyer.productName} for ₹${buyer.offeredPrice} each. Full inquiry: ${buyer.fullMessage}`,
      `${buyer.name} அவர்களின் செய்தி. ${buyer.productName} ${buyer.quantity} வேண்டும், ஒன்றுக்கு ₹${buyer.offeredPrice}. முழு செய்தி: ${buyer.fullMessage}`
    );
    speakText(speech, lang);
  };

  const handleCall = (buyer: BuyerInquiry) => {
    playTapTone('tap');
    window.location.href = `tel:${buyer.phone}`;
  };

  const handleWhatsApp = (buyer: BuyerInquiry) => {
    playTapTone('tap');
    const text = encodeURIComponent(`Namaste ${buyer.name}, thank you for your inquiry for ${buyer.quantity} ${buyer.productName}. We are happy to discuss your order.`);
    window.open(`https://api.whatsapp.com/send?phone=${buyer.phone.replace(/\D/g, '')}&text=${text}`, '_blank');
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-4">
      {/* Title & Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
            {t.buyers}
          </h2>
          <p className="text-xs sm:text-sm text-[#57423a]">
            {bi(`${buyers.length} வாங்குபவர் கோரிக்கைகள்`, `${buyers.length} buyer inquiries received`, lang)}
          </p>
        </div>
        <span className="bg-[#ffdbcd] text-[#9f3e07] text-xs font-bold px-3 py-1 rounded-full border border-[#dec0b5]">
          {t.demoBuyerBadge}
        </span>
      </div>

      {/* Buyer Cards */}
      <div className="flex flex-col gap-4">
        {buyers.map((buyer) => (
          <div
            key={buyer.id}
            className="bg-[#ffffff] rounded-2xl p-5 shadow-sm border border-[#e8e5df] flex flex-col gap-3.5"
          >
            {/* Header: Buyer Name & Location & Demo Badge */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#d6e0f6] flex items-center justify-center text-[#555f71] font-bold text-lg">
                  {buyer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-['Public_Sans'] font-bold text-lg text-[#1a1c1b]">
                    {buyer.name}
                  </h3>
                  <span className="text-xs text-[#555f71]">
                    {buyer.role} • {buyer.location}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold text-[#128752] bg-[#91f8b8]/30 px-2 py-0.5 rounded-md">
                {buyer.timeAgo}
              </span>
            </div>

            {/* Product Request Summary */}
            <div className="bg-[#f9f9f6] p-3.5 rounded-xl border border-[#e8e5df] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={buyer.productImage}
                  alt={buyer.productName}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="font-bold text-sm text-[#1a1c1b]">
                    {t.wants} {buyer.quantity} {buyer.productName}
                  </p>
                  <p className="text-xs text-[#57423a]">
                    Offered: <strong className="text-[#128752]">₹{buyer.offeredPrice} {t.each}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#555f71] block">{bi('மொத்த மதிப்பு', 'Total Value', lang)}</span>
                <span className="font-extrabold text-base text-[#9f3e07]">
                  ₹{(buyer.quantity * buyer.offeredPrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons: Hear / Call / WhatsApp */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => handleHearBuyerMessage(buyer)}
                className="flex-1 min-h-[48px] bg-[#d6e0f6] text-[#555f71] hover:bg-[#bdc7dc] rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 btn-press"
              >
                <span className="material-symbols-outlined text-lg fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                  volume_up
                </span>
                <span>{t.hear}</span>
              </button>

              <button
                onClick={() => handleCall(buyer)}
                className="flex-1 min-h-[48px] bg-[#f4f4f1] border border-[#dec0b5] text-[#1a1c1b] hover:bg-[#e2e3e0] rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 btn-press"
              >
                <span className="material-symbols-outlined text-lg">call</span>
                <span>{t.call}</span>
              </button>

              <button
                onClick={() => handleWhatsApp(buyer)}
                className="flex-1 min-h-[48px] bg-[#128752] hover:bg-[#006c3f] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 btn-press"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
