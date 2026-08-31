import React, { useState } from 'react';
import { BuyerInquiry, Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface BuyersScreenProps {
  buyers: BuyerInquiry[];
  lang: Language;
  onAddBuyer: () => void;
  onEditBuyer: (buyer: BuyerInquiry) => void;
  onDeleteBuyer: (buyerId: string) => void;
}

export const BuyersScreen: React.FC<BuyersScreenProps> = ({
  buyers,
  lang,
  onAddBuyer,
  onEditBuyer,
  onDeleteBuyer
}) => {
  const t = getTranslation(lang);
  const [buyerToDelete, setBuyerToDelete] = useState<BuyerInquiry | null>(null);
  const [deletedToast, setDeletedToast] = useState<string | null>(null);

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

  const handleConfirmDelete = () => {
    if (!buyerToDelete) return;
    playTapTone('tap');
    const name = buyerToDelete.name;
    onDeleteBuyer(buyerToDelete.id);
    setBuyerToDelete(null);

    setDeletedToast(name);
    setTimeout(() => setDeletedToast(null), 3000);

    speakText(
      speechFor(
        lang,
        `The inquiry from ${name} has been deleted.`,
        `${name} அவர்களின் கோரிக்கை நீக்கப்பட்டது.`
      ),
      lang
    );
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-4">
      {/* Toast Notification */}
      {deletedToast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)] bg-[#1a1c1b] text-white px-4 py-2.5 rounded-full shadow-lg text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in border border-white/10"
          style={{ top: 'calc(var(--app-header-h) + var(--safe-top) + 0.75rem)' }}
        >
          <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
          <span>
            {bi('நீக்கப்பட்டது', 'Deleted', lang)}: <strong>{deletedToast}</strong>
          </span>
        </div>
      )}

      {/* Title & Info. The badge sits under the heading on narrow phones so it
          never squeezes the title into a two-character column. */}
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
            {t.buyers}
          </h2>
          <p className="text-xs sm:text-sm text-[#57423a]">
            {bi(
              `${buyers.length} வாங்குபவர் கோரிக்கைகள்`,
              `${buyers.length} buyer ${buyers.length === 1 ? 'inquiry' : 'inquiries'} received`,
              lang
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {buyers.some((buyer) => buyer.isDemo) && (
            <span className="bg-[#ffdbcd] text-[#9f3e07] text-xs font-bold px-3 py-1 rounded-full border border-[#dec0b5] nowrap">
              {t.demoBuyerBadge}
            </span>
          )}
          <button
            onClick={() => {
              playTapTone('tap');
              onAddBuyer();
            }}
            className="min-h-[44px] px-3.5 bg-[#9f3e07] hover:bg-[#c05621] text-white rounded-2xl font-bold text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
            <span className="nowrap">{bi('சேர்', 'Add', lang)}</span>
          </button>
        </div>
      </div>

      {/* Empty state once every inquiry is deleted */}
      {buyers.length === 0 ? (
        <div className="bg-[#ffffff] rounded-3xl p-8 border border-[#e8e5df] text-center flex flex-col items-center gap-4 shadow-sm my-4">
          <div className="w-20 h-20 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center text-4xl">
            🤝
          </div>
          <div>
            <h3 className="font-['Source_Serif_4',serif] text-xl sm:text-2xl font-bold text-[#1a1c1b]">
              {bi('இன்னும் வாங்குபவர்கள் இல்லை', 'No buyers yet', lang)}
            </h3>
            <p className="text-xs sm:text-sm text-[#57423a] mt-1 max-w-sm mx-auto">
              {bi(
                'ஒரு வாங்குபவர் உங்களை அழைத்தால், அவர்களின் விவரங்களை இங்கே சேர்த்து வைத்துக்கொள்ளுங்கள்.',
                'When a buyer contacts you, add their details here so you never lose the order.',
                lang
              )}
            </p>
          </div>
          <button
            onClick={() => {
              playTapTone('tap');
              onAddBuyer();
            }}
            className="mt-2 min-h-[52px] px-6 bg-[#9f3e07] hover:bg-[#c05621] text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
            <span>{bi('முதல் வாங்குபவரைச் சேர்', 'Add Your First Buyer', lang)}</span>
          </button>
        </div>
      ) : (
        /* Buyer Cards */
        <div className="flex flex-col gap-4">
          {buyers.map((buyer, index) => (
            <div
              key={buyer.id}
              /* Cards trail the screen slightly; a newly added buyer arrives
                 the same way rather than popping in. */
              className="stagger-item bg-[#ffffff] rounded-2xl p-4 sm:p-5 shadow-sm border border-[#e8e5df] flex flex-col gap-3.5"
              style={{ '--stagger-index': index } as React.CSSProperties}
            >
              {/* Header: Buyer Name & Location & Time */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#d6e0f6] flex items-center justify-center text-[#555f71] font-bold text-lg">
                    {buyer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-['Public_Sans'] font-bold text-base sm:text-lg text-[#1a1c1b] leading-snug line-clamp-2">
                      {buyer.name}
                    </h3>
                    <span className="text-xs text-[#555f71] leading-snug line-clamp-2 block">
                      {buyer.role}
                      {buyer.location ? ` • ${buyer.location}` : ''}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-[#128752] bg-[#91f8b8]/30 px-2 py-0.5 rounded-md shrink-0 nowrap">
                  {buyer.timeAgo}
                </span>
              </div>

              {/* Product Request Summary. Stacks below xs so the total value
                  keeps a whole line instead of breaking the rupee amount. */}
              <div className="bg-[#f9f9f6] p-3.5 rounded-xl border border-[#e8e5df] flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={buyer.productImage}
                    alt={buyer.productName}
                    className="w-10 h-10 shrink-0 rounded-lg object-cover bg-[#eeeeeb]"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[#1a1c1b] leading-snug line-clamp-2">
                      {t.wants} {buyer.quantity} {buyer.productName}
                    </p>
                    <p className="text-xs text-[#57423a]">
                      {bi('விலை', 'Offered', lang)}:{' '}
                      <strong className="text-[#128752] nowrap">
                        ₹{buyer.offeredPrice} {t.each}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 xs:text-right">
                  <span className="text-xs text-[#555f71] block nowrap">
                    {bi('மொத்த மதிப்பு', 'Total Value', lang)}
                  </span>
                  <span className="font-extrabold text-base text-[#9f3e07] nowrap">
                    ₹{(buyer.quantity * buyer.offeredPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Contact actions. Labels stay visible at every width: they wrap
                  to a second line (bilingual mode makes them long) instead of
                  breaking mid-word the way "WhatsAp p" used to. */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleHearBuyerMessage(buyer)}
                  aria-label={`Hear message from ${buyer.name}`}
                  className="flex-1 basis-0 min-w-0 min-h-[48px] bg-[#d6e0f6] text-[#555f71] hover:bg-[#bdc7dc] rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 btn-press"
                >
                  <span className="material-symbols-outlined text-lg fill shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    volume_up
                  </span>
                  <span className="text-xs xs:text-sm leading-tight text-center line-clamp-2">{t.hear}</span>
                </button>

                <button
                  onClick={() => handleCall(buyer)}
                  aria-label={`Call ${buyer.name}`}
                  className="flex-1 basis-0 min-w-0 min-h-[48px] bg-[#f4f4f1] border border-[#dec0b5] text-[#1a1c1b] hover:bg-[#e2e3e0] rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 btn-press"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">call</span>
                  <span className="text-xs xs:text-sm leading-tight text-center line-clamp-2">{t.call}</span>
                </button>

                <button
                  onClick={() => handleWhatsApp(buyer)}
                  aria-label={`Message ${buyer.name} on WhatsApp`}
                  className="flex-1 basis-0 min-w-0 min-h-[48px] bg-[#128752] hover:bg-[#006c3f] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 btn-press"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">chat</span>
                  <span className="text-xs xs:text-sm leading-tight text-center line-clamp-2">WhatsApp</span>
                </button>
              </div>

              {/* Manage actions */}
              <div className="flex gap-2 pt-2 border-t border-[#e8e5df]">
                <button
                  onClick={() => {
                    playTapTone('tap');
                    onEditBuyer(buyer);
                  }}
                  aria-label={`Edit inquiry from ${buyer.name}`}
                  className="flex-1 basis-0 min-w-0 min-h-[44px] bg-[#f4f4f1] hover:bg-[#e8e5df] text-[#57423a] border border-[#e8e5df] rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 btn-press"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">edit</span>
                  <span className="leading-tight text-center line-clamp-2">{bi('திருத்து', 'Edit', lang)}</span>
                </button>

                <button
                  onClick={() => {
                    playTapTone('tap');
                    setBuyerToDelete(buyer);
                  }}
                  aria-label={`Delete inquiry from ${buyer.name}`}
                  className="flex-1 basis-0 min-w-0 min-h-[44px] bg-[#ffdad6]/50 hover:bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6] rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 btn-press"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">delete</span>
                  <span className="leading-tight text-center line-clamp-2">{bi('நீக்கு', 'Delete', lang)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* DELETE CONFIRMATION MODAL                                             */}
      {/* ===================================================================== */}
      {buyerToDelete && (
        <div
          className="fixed inset-0 z-50 h-[100svh] bg-black/60 backdrop-blur-sm flex justify-center items-center overflow-y-auto overscroll-contain animate-fade-in"
          style={{
            paddingTop: 'max(0.75rem, var(--safe-top))',
            paddingBottom: 'max(0.75rem, var(--safe-bottom))',
            paddingLeft: 'max(0.75rem, var(--safe-left))',
            paddingRight: 'max(0.75rem, var(--safe-right))'
          }}
        >
          <div className="bg-[#ffffff] text-[#1a1c1b] rounded-3xl w-full max-w-md shadow-2xl border border-[#e8e5df] p-5 sm:p-6 flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <button
                onClick={() => {
                  playTapTone('tap');
                  speakText(
                    speechFor(
                      lang,
                      `Do you want to delete the inquiry from ${buyerToDelete.name}?`,
                      `${buyerToDelete.name} அவர்களின் கோரிக்கையை நீக்க விரும்புகிறீர்களா?`
                    ),
                    lang
                  );
                }}
                aria-label="Hear this question"
                className="w-10 h-10 rounded-full bg-[#d6e0f6] text-[#004a77] flex items-center justify-center hover:bg-[#bdc7dc] transition-all"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  volume_up
                </span>
              </button>
            </div>

            <div>
              <h3 className="font-['Source_Serif_4',serif] text-xl sm:text-2xl font-bold text-[#ba1a1a]">
                {bi('நீக்கவா?', 'Delete Buyer?', lang)}
              </h3>
              <p className="text-xs sm:text-sm text-[#57423a] mt-1">
                {bi(
                  'இந்த வாங்குபவரின் கோரிக்கையை நீக்க விரும்புகிறீர்களா?',
                  'Are you sure you want to remove this buyer inquiry?',
                  lang
                )}
              </p>
            </div>

            <div className="bg-[#f9f9f6] rounded-2xl p-3.5 border border-[#e8e5df] flex items-center gap-3.5">
              <div className="w-14 h-14 shrink-0 rounded-full bg-[#d6e0f6] flex items-center justify-center text-[#555f71] font-bold text-xl">
                {buyerToDelete.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#1a1c1b] leading-snug line-clamp-2">
                  {buyerToDelete.name}
                </h4>
                <p className="text-xs text-[#57423a] leading-snug line-clamp-2">
                  {t.wants} {buyerToDelete.quantity} {buyerToDelete.productName}
                </p>
                <p className="font-extrabold text-sm text-[#9f3e07] mt-0.5 nowrap">
                  ₹{(buyerToDelete.quantity * buyerToDelete.offeredPrice).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#ba1a1a] bg-[#ffdad6]/40 p-2.5 rounded-xl border border-[#ffdad6] font-medium">
              ⚠ {bi('இந்த செயல் திரும்பப்பெற முடியாது.', 'This action cannot be undone.', lang)}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  playTapTone('tap');
                  setBuyerToDelete(null);
                }}
                className="flex-1 min-h-[52px] bg-[#f4f4f1] hover:bg-[#e8e5df] text-[#57423a] rounded-2xl font-bold text-sm sm:text-base border border-[#e8e5df] active:scale-95 transition-all"
              >
                {bi('வேண்டாம்', 'Cancel', lang)}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[52px] bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
                <span>{bi('நீக்கு', 'Delete', lang)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
