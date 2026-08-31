import React, { useState } from 'react';
import { ProductProfile, Language } from '../types';
import { DETAILED_SELLING_CHANNELS, DetailedSellingChannel } from '../data/channels';
import { bi } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface ChannelExportModalProps {
  channelId: string;
  product: ProductProfile;
  lang: Language;
  onClose: () => void;
}

export const ChannelExportModal: React.FC<ChannelExportModalProps> = ({
  channelId,
  product,
  lang,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'choice' | 'guide' | 'help'>('choice');
  const [isLayer2Open, setIsLayer2Open] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [copied, setCopied] = useState(false);

  const channel: DetailedSellingChannel =
    DETAILED_SELLING_CHANNELS.find((c) => c.id === channelId) ||
    DETAILED_SELLING_CHANNELS[0];

  // Derive honest size & weight display
  const sizeText = product.dimensions || '';
  const weightText = product.weight || '';
  const sizeWeightDisplay = sizeText && weightText
    ? `${sizeText} · ${weightText}`
    : sizeText
    ? `${sizeText} · Weight: — · கேட்கவும் (Ask artisan)`
    : weightText
    ? `Size: — · கேட்கவும் · ${weightText}`
    : '— · கேட்கவும் · Ask artisan';

  const materialDisplay = product.material || '— · கேட்கவும் · Ask artisan';
  const stockDisplay = product.quantity ? `${product.quantity}` : '— · கேட்கவும் · Ask artisan';

  // Status badge styling
  const getStatusBadge = () => {
    switch (channel.status) {
      case 'OPEN_NOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#91f8b8]/40 text-[#00522f] border border-[#128752]/30">
            <span className="w-2 h-2 rounded-full bg-[#128752] animate-pulse"></span>
            🟢 {bi('இப்போது திறந்துள்ளது', 'OPEN NOW', lang)}
          </span>
        );
      case 'NEEDS_SETUP':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ffdbcd] text-[#9f3e07] border border-[#dec0b5]">
            <span className="w-2 h-2 rounded-full bg-[#9f3e07]"></span>
            🟡 {bi('அமைப்பு தேவை', 'NEEDS SETUP', lang)}
          </span>
        );
      case 'LATER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d6e0f6] text-[#004a77] border border-[#a8c7fa]">
            <span className="w-2 h-2 rounded-full bg-[#004a77]"></span>
            🔵 {bi('பின்னர்', 'LATER', lang)}
          </span>
        );
    }
  };

  // Requirements checklist per channel
  const getRequirementsList = () => {
    switch (channel.id) {
      case 'whatsapp':
        return [
          { text: 'Product information prepared', done: true },
          { text: 'Photo & price confirmed', done: true },
          { text: 'WhatsApp app installed on phone', done: true }
        ];
      case 'amazon':
        return [
          { text: 'Product information prepared', done: true },
          { text: 'GST registration', done: false },
          { text: 'Amazon Seller Central account', done: false },
          { text: 'Bank account & PAN card', done: false },
          { text: 'Handicraft / Karigar category approval', done: false, note: 'Verify requirement' }
        ];
      case 'ondc':
        return [
          { text: 'Product information prepared', done: true },
          { text: 'Selection of registered ONDC seller app (e.g. Mystore/SellerApp)', done: false },
          { text: 'Artisan bank details for direct payout', done: false },
          { text: 'GST or Composition / Enrolment ID', done: false, note: 'Verify with seller app' }
        ];
      case 'flipkart':
        return [
          { text: 'Product information prepared', done: true },
          { text: 'Flipkart Samarth artisan registration', done: false },
          { text: 'GSTIN & active bank account', done: false },
          { text: 'Self-declared artisan craft verification', done: false, note: 'Verify requirement' }
        ];
      case 'indiahandmade':
        return [
          { text: 'Product information prepared', done: true },
          { text: 'Pehchan Artisan ID Card / Handloom mark', done: false, note: 'Verify requirement' },
          { text: 'Bank account linked with Aadhaar', done: false },
          { text: 'Portal profile creation', done: false }
        ];
      case 'tulip':
        return [
          { text: 'Product information prepared', done: true },
          { text: 'Artisan profile submission to TULIP', done: false },
          { text: 'Craft cluster identification', done: false, note: 'Verify with TULIP' }
        ];
      case 'fairs':
        return [
          { text: 'Product information prepared', done: true },
          { text: 'Artisan identity proof (Aadhaar / Artisan card)', done: false },
          { text: 'Stall application submission for upcoming fair', done: false },
          { text: 'Travel allowance & stall subsidy confirmation', done: false, note: 'Verify with organiser' }
        ];
      case 'local':
        return [
          { text: 'Product information prepared', done: true },
          { text: 'Direct contact with local Poompuhar / DIC officer', done: false },
          { text: 'Sample inspection schedule', done: false, note: 'Call to confirm schedule' }
        ];
      case 'gem':
        return [
          { text: 'Product information prepared', done: true },
          { text: 'GeM portal seller registration', done: false },
          { text: 'Business / Artisan credentials & tax validation', done: false, note: 'Verify requirement' }
        ];
      default:
        return [
          { text: 'Product information prepared', done: true },
          { text: 'Seller account setup', done: false }
        ];
    }
  };

  // Tamil Audio Readout (Adapts to Active View)
  const handleHear = () => {
    playTapTone('tap');
    if (lang === 'en') {
      speakText(`${channel.easyName}. ${channel.description}`, 'en');
      return;
    }
    if (viewMode === 'guide') {
      speakText(channel.audioGuideTa, 'ta');
    } else if (viewMode === 'help') {
      speakText(channel.audioHelpTa, 'ta');
    } else {
      speakText(channel.audioChoiceTa, 'ta');
    }
  };

  // Layer 2 Helper Pack Text
  const getHelperFormatText = () => {
    const lines = [
      `=== CRAFT2CART PREPARED PACK FOR ${channel.easyName.toUpperCase()} ===`,
      `Product Name: ${product.name}`,
      `Artisan / Brand: Handmade by Artisan (Declared by artisan)`,
      `Category: ${product.category}`,
      `Material: ${product.material || '— (Ask artisan)'}`,
      `Dimensions: ${product.dimensions || '— (Ask artisan)'}`,
      `Weight: ${product.weight || '— (Ask artisan)'}`,
      `Price: ₹${product.price}`,
      `Stock Quantity: ${product.quantity}`,
      `Location: ${product.location}`,
      ``,
      `Key Features:`,
      `- 100% Genuine Handcrafted item`,
      `- Made from ${product.material || 'natural materials'}`,
      `- Handmade: Declared by artisan`,
      `- Direct from workshop in ${product.location}`,
      `- ${product.description}`,
      ``,
      `Description:`,
      `${product.description}`,
      ``,
      `Search Keywords: ${product.tags.join(', ')}`
    ];

    if (channel.id === 'ondc') {
      lines.push(``);
      lines.push(`NOTE FOR HELPER / OPERATOR:`);
      lines.push(`A registered ONDC seller-side participant/app handles conversion into the required network format. Craft2Cart is not claiming direct ONDC publishing.`);
    } else if (channel.id === 'amazon') {
      lines.push(``);
      lines.push(`Status: Pack ready ✓ · Seller/account requirements may still apply 🟡`);
    } else if (channel.id === 'flipkart') {
      lines.push(``);
      lines.push(`Status: Pack ready ✓ · Flipkart Samarth document verification applies 🟡`);
    } else if (channel.id === 'indiahandmade') {
      lines.push(``);
      lines.push(`Status: Pack ready ✓ · Ministry artisan card / registration requirement applies 🟡`);
    } else if (channel.id === 'tulip') {
      lines.push(``);
      lines.push(`Suggested collection: Handcrafted Eco & Heritage · Verify with TULIP 🟡`);
    } else if (channel.id === 'gem') {
      lines.push(``);
      lines.push(`Status: Government procurement channel · Registration/setup required · Verify current requirements 🔵`);
    }

    lines.push(``);
    lines.push(`Craft2Cart formatted this automatically from photo & voice conversation.`);
    lines.push(`சரிபார்த்து அனுப்பவும் · Please check before sending.`);
    return lines.join('\n');
  };

  const helperText = getHelperFormatText();

  // Send to Helper via WhatsApp
  const handleSendToHelper = () => {
    playTapTone('success');
    const msg = [
      `*Craft2Cart Product Pack*`,
      ``,
      `*Product:* ${product.name}`,
      `*Price:* ₹${product.price}`,
      `*Material:* ${product.material || 'Ask artisan'}`,
      `*Size:* ${product.dimensions || 'Not provided'}`,
      `*Weight:* ${product.weight || 'Not provided'}`,
      `*Stock:* ${product.quantity} units`,
      ``,
      `*Selling channel:* ${channel.easyName}`,
      `*Status:* ${channel.status === 'OPEN_NOW' ? 'Open now' : channel.status === 'NEEDS_SETUP' ? 'Needs setup' : 'Later stage'}`,
      ``,
      `Please help with the next selling/onboarding step.`,
      ``,
      `Craft2Cart prepared this information from the artisan's photo and voice conversation.`,
      `_Please check before submitting · சரிபார்த்து அனுப்பவும்._`
    ].join('\n');

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Share with Customer via WhatsApp
  const handleShareWithCustomer = () => {
    playTapTone('tap');
    const customerMsg = [
      `🧵 *${product.name}*`,
      `💰 *Price:* ₹${product.price}`,
      `✨ *Material:* ${product.material || 'Handcrafted'}`,
      product.dimensions ? `📏 *Size:* ${product.dimensions}` : '',
      `✋ *Handmade:* Declared by artisan`,
      ``,
      `_${product.description}_`,
      ``,
      `💬 Reply directly to order or inquire!`
    ].filter(Boolean).join('\n');

    const encoded = encodeURIComponent(customerMsg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Copy helper text
  const handleCopyHelperText = () => {
    playTapTone('success');
    navigator.clipboard.writeText(helperText);
    setCopied(true);
    speakText('Helper format copied to clipboard!', lang);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download helper text as text file
  const handleDownloadHelperText = () => {
    playTapTone('tap');
    const element = document.createElement('a');
    const file = new Blob([helperText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${product.name.toLowerCase().replace(/\s+/g, '_')}_${channel.id}_helper_pack.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Open verified official channel link
  const handleOpenOfficialChannel = () => {
    playTapTone('success');
    if (channel.officialUrl) {
      window.open(channel.officialUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#f9f9f6] text-[#1a1c1b] rounded-3xl w-full max-w-lg shadow-2xl border border-[#e8e5df] p-4 sm:p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <header className="flex justify-between items-start pb-3 border-b border-[#e8e5df]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ffdbcd]/60 flex items-center justify-center text-[#9f3e07] shrink-0 border border-[#dec0b5]">
              <span className="material-symbols-outlined text-2xl">{channel.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-['Source_Serif_4',serif] text-xl sm:text-2xl font-bold text-[#1a1c1b] uppercase tracking-wide">
                  {channel.easyName}
                </h3>
                {getStatusBadge()}
              </div>
              <p className="text-xs sm:text-sm text-[#57423a] font-medium mt-0.5">
                {lang === 'en'
                  ? channel.englishSubtitle
                  : lang === 'ta'
                  ? channel.tamilSubtitle.split('·')[0].trim()
                  : channel.tamilSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Assist Button (Reads Active View in Tamil) */}
            <button
              onClick={handleHear}
              title="Hear instructions in Tamil"
              aria-label="Hear instructions in Tamil"
              className="w-10 h-10 rounded-full bg-[#d6e0f6] text-[#004a77] flex items-center justify-center hover:bg-[#bdc7dc] active:scale-95 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                volume_up
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full bg-[#e2e3e0] text-[#57423a] flex items-center justify-center hover:bg-[#d5d7d4] active:scale-95 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* PRODUCT SUMMARY CARD (Shared Truth Across All Flows)                      */}
        {/* ========================================================================= */}
        <section className="bg-[#ffffff] rounded-2xl p-3.5 sm:p-4 border border-[#e8e5df] shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3.5">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#e8e5df] shrink-0 bg-[#eeeeeb]"
            />
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[11px] font-bold text-[#128752] bg-[#91f8b8]/30 px-2 py-0.5 rounded-md mb-1">
                {bi('பேக் தயார் ✓', 'Pack ready ✓', lang)}
              </span>
              <h4 className="font-['Source_Serif_4',serif] text-lg sm:text-xl font-bold text-[#1a1c1b] truncate">
                {product.name}
              </h4>
              <p className="font-['Public_Sans'] font-extrabold text-xl text-[#9f3e07]">
                ₹{product.price}
              </p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[#e8e5df]"></div>

          {/* 3 Simple Product Fact Rows */}
          <div className="flex flex-col gap-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#57423a] flex items-center gap-1.5 font-medium">
                <span>🧱</span> {bi('மூலப்பொருள்', 'Material', lang)}
              </span>
              <span className="font-bold text-[#1a1c1b] text-right truncate max-w-[65%]">
                {materialDisplay}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#57423a] flex items-center gap-1.5 font-medium">
                <span>📏</span> {bi('அளவு & எடை', 'Size & weight', lang)}
              </span>
              <span className="font-bold text-[#1a1c1b] text-right truncate max-w-[65%]">
                {sizeWeightDisplay}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#57423a] flex items-center gap-1.5 font-medium">
                <span>📦</span> {bi('இருப்பு', 'Stock', lang)}
              </span>
              <span className="font-bold text-[#1a1c1b] text-right">
                {stockDisplay}
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* VIEW 1: CHOICE VIEW (Universal Artisan Choice: Myself vs Help)            */}
        {/* ========================================================================= */}
        {viewMode === 'choice' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            {/* 🔵 LATER Channels: Explain Why First */}
            {channel.status === 'LATER' && (
              <div className="bg-[#d6e0f6]/40 border border-[#a8c7fa] rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#004a77]">
                  <span className="material-symbols-outlined text-lg">info</span>
                  <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                    {bi('ஏன் இப்போது இல்லை?', 'Why not now?', lang)}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-[#004a77]/90 pt-1">
                  {channel.whyLaterReasons?.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-base leading-none">•</span>
                      <span>
                        {lang === 'ta' ? reason.tamil : lang === 'en' ? reason.english : `${reason.tamil} (${reason.english})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Header: How would you like to continue? */}
            <div className="pt-1">
              <h4 className="font-['Public_Sans'] font-extrabold text-base sm:text-lg text-[#1a1c1b] leading-tight">
                {lang === 'en' ? 'How would you like to continue?' : 'எப்படி தொடர விரும்புகிறீர்கள்?'}
              </h4>
              {lang !== 'en' && lang !== 'ta' && (
                <p className="text-xs sm:text-sm text-[#57423a] font-medium">
                  How would you like to continue?
                </p>
              )}
            </div>

            {/* =============================================================== */}
            {/* CHOICE BUTTONS (Adaptive to Channel Status)                     */}
            {/* =============================================================== */}

            {/* For 🟡 NEEDS SETUP channels (Amazon, Flipkart, ONDC, IndiaHandmade, TULIP) */}
            {channel.status === 'NEEDS_SETUP' && (
              <div className="flex flex-col gap-3">
                {/* 1. DO IT MYSELF BUTTON */}
                <button
                  onClick={() => {
                    playTapTone('tap');
                    setViewMode('guide');
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-[#ffffff] hover:bg-[#fff9f6] border-2 border-[#dec0b5] hover:border-[#9f3e07] shadow-xs active:scale-[0.99] transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#ffdbcd] text-[#9f3e07] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-2xl">
                    🙋
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-['Public_Sans'] font-extrabold text-base text-[#1a1c1b] group-hover:text-[#9f3e07]">
                        {lang === 'en' ? 'DO IT MYSELF' : 'நானே செய்வேன்'}
                      </span>
                      {lang === 'both' && (
                        <span className="text-xs font-bold text-[#9f3e07] bg-[#ffdbcd] px-2 py-0.5 rounded-full">
                          DO IT MYSELF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#57423a] mt-0.5">
                      {bi('படிப்படியாக வழிகாட்டுங்கள்', 'Guide me step-by-step', lang)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#9f3e07] self-center">
                    arrow_forward
                  </span>
                </button>

                {/* 2. GET HELP BUTTON */}
                <button
                  onClick={() => {
                    playTapTone('tap');
                    setViewMode('help');
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-[#ffffff] hover:bg-[#f4f4f1] border-2 border-[#e8e5df] hover:border-[#555f71] shadow-xs active:scale-[0.99] transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#d6e0f6] text-[#004a77] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-2xl">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-['Public_Sans'] font-extrabold text-base text-[#1a1c1b]">
                        {lang === 'en' ? 'GET HELP' : 'உதவி வேண்டும்'}
                      </span>
                      {lang === 'both' && (
                        <span className="text-xs font-bold text-[#004a77] bg-[#d6e0f6] px-2 py-0.5 rounded-full">
                          GET HELP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#57423a] mt-0.5">
                      {bi('தயாரான விவரங்களை உதவியாளருக்கு அனுப்புங்கள்', 'Send prepared info to helper', lang)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#555f71] self-center">
                    arrow_forward
                  </span>
                </button>
              </div>
            )}

            {/* For 🟢 OPEN NOW channels (WhatsApp, Fairs, Local) */}
            {channel.status === 'OPEN_NOW' && channel.id === 'whatsapp' && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleShareWithCustomer}
                  className="w-full min-h-[58px] bg-[#128752] hover:bg-[#0e6b41] text-[#ffffff] rounded-2xl font-['Public_Sans'] font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-2xl">share</span>
                  <span>📲 {bi('வாடிக்கையாளருக்கு அனுப்பு', 'SHARE NOW', lang)}</span>
                </button>

                <div className="flex items-center justify-between px-1">
                  <button
                    onClick={() => {
                      playTapTone('tap');
                      setViewMode('guide');
                    }}
                    className="text-xs text-[#57423a] hover:text-[#1a1c1b] font-bold flex items-center gap-1"
                  >
                    <span>🙋 {bi('வழிகாட்டி படிகள்', 'Guide steps', lang)}</span>
                  </button>

                  <button
                    onClick={() => {
                      playTapTone('tap');
                      setViewMode('help');
                    }}
                    className="text-xs text-[#004a77] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>👤 {bi('உதவியாளர் உதவி வேண்டுமா?', 'Need helper assistance?', lang)}</span>
                  </button>
                </div>
              </div>
            )}

            {/* For 🟢 Fairs and Local Support */}
            {channel.status === 'OPEN_NOW' && channel.id !== 'whatsapp' && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    playTapTone('tap');
                    setViewMode('guide');
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-[#ffffff] hover:bg-[#fff9f6] border-2 border-[#dec0b5] hover:border-[#9f3e07] shadow-xs active:scale-[0.99] transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#ffdbcd] text-[#9f3e07] flex items-center justify-center shrink-0 text-2xl">
                    🙋
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-['Public_Sans'] font-extrabold text-base text-[#1a1c1b]">
                        {channel.id === 'fairs'
                          ? (lang === 'en' ? 'APPLY MYSELF' : 'நானே விண்ணப்பிக்கிறேன்')
                          : (lang === 'en' ? 'CONTACT MYSELF' : 'நானே தொடர்பு கொள்வேன்')}
                      </span>
                      {lang === 'both' && (
                        <span className="text-xs font-bold text-[#9f3e07] bg-[#ffdbcd] px-2 py-0.5 rounded-full">
                          {channel.id === 'fairs' ? 'APPLY MYSELF' : 'CONTACT MYSELF'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#57423a] mt-0.5">
                      {channel.id === 'fairs'
                        ? bi('விண்ணப்ப வழிகாட்டுதல்', 'Application guide', lang)
                        : bi('தொடர்பு விவரங்கள் & வழிகாட்டுதல்', 'Contact & guide', lang)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#9f3e07] self-center">arrow_forward</span>
                </button>

                <button
                  onClick={() => {
                    playTapTone('tap');
                    setViewMode('help');
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-[#ffffff] hover:bg-[#f4f4f1] border-2 border-[#e8e5df] hover:border-[#555f71] shadow-xs active:scale-[0.99] transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#d6e0f6] text-[#004a77] flex items-center justify-center shrink-0 text-2xl">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-['Public_Sans'] font-extrabold text-base text-[#1a1c1b]">
                        {lang === 'en' ? 'GET HELP' : 'உதவி வேண்டும்'}
                      </span>
                      {lang === 'both' && (
                        <span className="text-xs font-bold text-[#004a77] bg-[#d6e0f6] px-2 py-0.5 rounded-full">
                          GET HELP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#57423a] mt-0.5">
                      {bi('விவரங்களை உதவியாளருக்கு அனுப்புங்கள்', 'Send details to helper', lang)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#555f71] self-center">arrow_forward</span>
                </button>
              </div>
            )}

            {/* For 🔵 LATER channels (GeM) */}
            {channel.status === 'LATER' && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    playTapTone('tap');
                    setViewMode('guide');
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-[#ffffff] hover:bg-[#f4f4f1] border-2 border-[#d6e0f6] hover:border-[#004a77] shadow-xs active:scale-[0.99] transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#d6e0f6] text-[#004a77] flex items-center justify-center shrink-0 text-2xl">
                    📋
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-['Public_Sans'] font-extrabold text-base text-[#1a1c1b]">
                        {lang === 'en' ? 'WHAT DO I NEED?' : 'என்ன தேவை?'}
                      </span>
                      {lang === 'both' && (
                        <span className="text-xs font-bold text-[#004a77] bg-[#d6e0f6] px-2 py-0.5 rounded-full">
                          WHAT DO I NEED?
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#57423a] mt-0.5">
                      {bi('முன்நிபந்தனைகள் & தேவைகள்', 'Requirements & future checklist', lang)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#004a77] self-center">arrow_forward</span>
                </button>

                <button
                  onClick={() => {
                    playTapTone('tap');
                    setViewMode('help');
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-[#f9f9f6] border border-[#e8e5df] hover:bg-[#ffffff] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#57423a]">
                    <span>👤</span>
                    <span>{bi('புரிந்து கொள்ள உதவி', 'Get help understanding this', lang)}</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-[#57423a]">chevron_right</span>
                </button>
              </div>
            )}

            {/* Secondary Actions: Share & View Requirements */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleShareWithCustomer}
                className="flex-1 bg-[#ffffff] border border-[#dec0b5] hover:bg-[#f9f9f6] text-[#57423a] py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-base text-[#128752]">share</span>
                <span>{bi('பகிர்', 'Share', lang)}</span>
              </button>

              <button
                onClick={() => {
                  playTapTone('tap');
                  setShowRequirements(!showRequirements);
                }}
                className="flex-1 bg-[#ffffff] border border-[#dec0b5] hover:bg-[#f9f9f6] text-[#57423a] py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs"
              >
                <span>{showRequirements ? bi('தேவைகளை மறை', 'Hide requirements', lang) : bi('தேவைகளைப் பார் →', 'View requirements →', lang)}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DO IT MYSELF GUIDE (Step-by-step, Tamil-first, Numbered)         */}
        {/* ========================================================================= */}
        {viewMode === 'guide' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Guide Header */}
            <div className="flex items-center justify-between bg-[#ffffff] p-3.5 rounded-2xl border border-[#e8e5df]">
              <div>
                <h4 className="font-['Public_Sans'] font-extrabold text-base text-[#1a1c1b]">
                  {lang === 'en' ? channel.doItMyselfTitleEn : channel.doItMyselfTitleTa}
                </h4>
                {lang === 'both' && (
                  <p className="text-xs text-[#57423a] font-medium">
                    {channel.doItMyselfTitleEn}
                  </p>
                )}
              </div>
              <span className="text-xs font-bold bg-[#91f8b8]/40 text-[#00522f] px-2.5 py-1 rounded-full border border-[#128752]/20 shrink-0">
                {bi('பேக் தயார் ✓', 'Pack ready ✓', lang)}
              </span>
            </div>

            {/* Numbered Step-by-Step Cards */}
            <div className="flex flex-col gap-2.5">
              {channel.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-[#ffffff] rounded-2xl p-3.5 sm:p-4 border border-[#e8e5df] shadow-2xs flex items-start gap-3"
                >
                  {/* Step Number Badge */}
                  <div className="w-8 h-8 rounded-full bg-[#ffdbcd] text-[#9f3e07] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-[#dec0b5]">
                    {step.stepNumber}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-['Public_Sans'] font-bold text-sm text-[#1a1c1b]">
                        {lang === 'en' ? step.englishTitle : step.tamilTitle}
                      </h5>
                      {step.isVerificationWarning && (
                        <span className="text-[10px] font-bold bg-[#ffdbcd] text-[#9f3e07] px-2 py-0.5 rounded shrink-0">
                          ⚠ சரிபார்க்க வேண்டும்
                        </span>
                      )}
                    </div>
                    {lang === 'both' && (
                      <p className="text-xs text-[#57423a] font-semibold mt-0.5">
                        {step.englishTitle}
                      </p>
                    )}
                    <p className="text-xs text-[#1a1c1b]/90 mt-1 leading-relaxed">
                      {lang === 'en' ? step.englishDesc : step.tamilDesc}
                    </p>
                    {lang === 'both' && (
                      <p className="text-[11px] text-[#78716c] mt-0.5">
                        {step.englishDesc}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions for Guide */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e8e5df]">
              {/* PRIMARY: Open official route */}
              {channel.officialUrl ? (
                <button
                  onClick={handleOpenOfficialChannel}
                  className="w-full min-h-[54px] bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] rounded-2xl font-['Public_Sans'] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-xl">open_in_new</span>
                  <span>🔗 {bi('அதிகாரப்பூர்வ தளத்தில் தொடரவும்', 'Continue on official channel', lang)}</span>
                </button>
              ) : (
                <div className="w-full p-3 rounded-2xl bg-[#ffdbcd]/50 border border-[#dec0b5] text-xs font-bold text-[#9f3e07] text-center">
                  ⚠ Official route needs verification with coordinator/organiser
                </div>
              )}

              {/* Navigation: Back to choices & Switch to Get Help */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    playTapTone('tap');
                    setViewMode('choice');
                  }}
                  className="text-xs font-bold text-[#57423a] hover:text-[#1a1c1b] flex items-center gap-1 py-1 px-2"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>← {bi('திரும்பு', 'Back to Craft2Cart', lang)}</span>
                </button>

                <button
                  onClick={() => {
                    playTapTone('tap');
                    setViewMode('help');
                  }}
                  className="text-xs font-bold text-[#004a77] hover:underline flex items-center gap-1 py-1 px-2"
                >
                  <span>👤 {bi('உதவி வேண்டுமா?', 'Need help instead?', lang)}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: GET HELP FLOW (Send prepared pack to human helper via WhatsApp)   */}
        {/* ========================================================================= */}
        {viewMode === 'help' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Help Explanation Banner */}
            <div className="bg-[#d6e0f6]/40 rounded-2xl p-4 border border-[#a8c7fa] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#004a77]">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
                <span className="font-bold text-sm sm:text-base">
                  {bi('உங்கள் பொருள் விவரங்கள் ஏற்கனவே தயார் ✓', 'Your product information is already prepared ✓', lang)}
                </span>
              </div>
              <p className="text-xs text-[#004a77]/90 font-medium">
                {bi('தயாரான விவரங்கள் உதவியாளருக்கு அனுப்ப தயாராக உள்ளன. அவர்கள் அடுத்த கட்ட பதிவில் உதவுவார்கள்.', 'The prepared details are ready to send to a helper. They will assist with the next registration step.', lang)}
              </p>
            </div>

            {/* Prepared Message Preview Card */}
            <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#e8e5df] shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#57423a] border-b border-[#e8e5df] pb-2">
                <span>{bi('உதவியாளருக்கான தயார் பேக்', 'Prepared Pack for Helper', lang)}</span>
                <span className="text-[#128752] font-bold">{bi('அனுப்ப தயார்', 'Ready to send', lang)}</span>
              </div>

              <div className="text-xs text-[#1a1c1b] space-y-1 pt-1 font-sans">
                <div><strong>Product:</strong> {product.name}</div>
                <div><strong>Price:</strong> ₹{product.price}</div>
                <div><strong>Material:</strong> {materialDisplay}</div>
                <div><strong>Size:</strong> {product.dimensions || 'Not provided'}</div>
                <div><strong>Weight:</strong> {product.weight || 'Not provided'}</div>
                <div><strong>Stock:</strong> {product.quantity} units</div>
                <div><strong>Channel:</strong> {channel.easyName} ({channel.statusLabel})</div>
              </div>

              <div className="pt-2 text-[11px] text-[#57423a] border-t border-[#e8e5df]">
                Craft2Cart prepared this information from the artisan's photo and voice conversation.
              </div>
            </div>

            {/* PRIMARY BUTTON: Send to Helper */}
            <button
              onClick={handleSendToHelper}
              className="w-full min-h-[58px] bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] rounded-2xl font-['Public_Sans'] font-extrabold text-base flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">send_to_mobile</span>
                <span>📲 {lang === 'en' ? 'SEND TO HELPER' : 'உதவியாளருக்கு அனுப்பு'}</span>
              </div>
              {lang !== 'ta' && (
                <span className="text-[11px] font-semibold text-white/90 tracking-wider">
                  SEND TO HELPER (WHATSAPP)
                </span>
              )}
            </button>

            {/* Navigation & Switch to Myself */}
            <div className="flex items-center justify-between pt-1 border-t border-[#e8e5df]">
              <button
                onClick={() => {
                  playTapTone('tap');
                  setViewMode('choice');
                }}
                className="text-xs font-bold text-[#57423a] hover:text-[#1a1c1b] flex items-center gap-1 py-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>← {bi('திரும்பு', 'Back to Craft2Cart', lang)}</span>
              </button>

              <button
                onClick={() => {
                  playTapTone('tap');
                  setViewMode('guide');
                }}
                className="text-xs font-bold text-[#9f3e07] hover:underline flex items-center gap-1 py-1"
              >
                <span>🙋 {bi('நானே செய்யவா?', 'Prefer to do it yourself?', lang)}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REQUIREMENTS CHECKLIST (Toggleable Section)                               */}
        {/* ========================================================================= */}
        {showRequirements && (
          <section className="bg-[#ffffff] rounded-2xl p-4 border-2 border-[#dec0b5] shadow-sm flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h5 className="font-['Public_Sans'] font-bold text-sm text-[#1a1c1b]">
                {bi('இங்கு விற்பதற்கு முன் (தேவைகள்)', 'Before selling here (Requirements)', lang)}
              </h5>
              <button
                onClick={() => setShowRequirements(false)}
                className="text-xs text-[#57423a] font-bold hover:underline"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {getRequirementsList().map((req, idx) => (
                <div key={idx} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-[#f9f9f6] border border-[#e8e5df]">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-base shrink-0 ${req.done ? 'text-[#128752]' : 'text-[#78716c]'}`}>
                      {req.done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={req.done ? 'text-[#1a1c1b] font-medium' : 'text-[#57423a]'}>
                      {req.text}
                    </span>
                  </div>
                  {req.note && (
                    <span className="text-[10px] font-bold bg-[#ffdbcd] text-[#9f3e07] px-1.5 py-0.5 rounded shrink-0">
                      ⚠ {req.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* LAYER 2: HELPER / TECHNICAL PACK (COLLAPSED BY DEFAULT · LIGHT THEME)     */}
        {/* ========================================================================= */}
        <div className="border-t border-[#e8e5df] pt-2">
          {/* Layer 2 Toggle Button */}
          <button
            onClick={() => {
              playTapTone('tap');
              setIsLayer2Open(!isLayer2Open);
            }}
            className="w-full text-center py-2 px-3 text-xs sm:text-sm font-bold text-[#57423a] hover:text-[#9f3e07] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{isLayer2Open ? `▾ Hide ${channel.easyName} format for helper ▴` : `▸ Exact ${channel.easyName} format for helper ▾`}</span>
          </button>

          {/* Layer 2 Expanded Content */}
          {isLayer2Open && (
            <div className="mt-2 bg-[#ffffff] rounded-2xl p-4 border border-[#dec0b5] shadow-sm flex flex-col gap-3 animate-fade-in">
              {/* Helper Notice Header */}
              <div className="bg-[#f4f4f1] p-3 rounded-xl border border-[#e8e5df] text-xs text-[#57423a]">
                <p className="font-bold text-[#1a1c1b] flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-sm text-[#9f3e07]">engineering</span>
                  <span>For helper / operator</span>
                </p>
                <p>This is the information Craft2Cart prepared for entering into the selling channel.</p>
                <p className="font-bold text-[#9f3e07] mt-1">சரிபார்த்து அனுப்பவும் · Please check before sending.</p>
              </div>

              {/* Light Monospace Structured Fields (NO black terminal box!) */}
              <div className="bg-[#fafaf8] p-3.5 rounded-xl border border-[#e8e5df] font-mono text-[11px] sm:text-xs text-[#2a2c2b] overflow-x-auto max-h-56 no-scrollbar space-y-1.5 leading-relaxed">
                <div><span className="text-[#78716c]">Product Name:</span> <strong>{product.name}</strong></div>
                <div><span className="text-[#78716c]">Brand / Maker:</span> Handmade by Artisan (Declared by artisan)</div>
                <div><span className="text-[#78716c]">Category:</span> {product.category}</div>
                <div><span className="text-[#78716c]">Material:</span> {product.material || '— (Ask artisan)'}</div>
                <div><span className="text-[#78716c]">Dimensions:</span> {product.dimensions || '— (Ask artisan)'}</div>
                <div><span className="text-[#78716c]">Weight:</span> {product.weight || '— (Ask artisan)'}</div>
                <div><span className="text-[#78716c]">Price (INR):</span> ₹{product.price}</div>
                <div><span className="text-[#78716c]">Quantity:</span> {product.quantity}</div>
                <div><span className="text-[#78716c]">Main Image:</span> Confirmed product photograph</div>
                <div><span className="text-[#78716c]">Keywords:</span> {product.tags.join(', ')}</div>
                
                {/* Specific channel footer note in Layer 2 */}
                {channel.id === 'ondc' && (
                  <div className="pt-2 text-[11px] text-[#9f3e07] border-t border-[#e8e5df] font-sans">
                    <strong>A registered ONDC seller-side participant/app handles conversion into the required network format. Craft2Cart is not claiming direct ONDC publishing.</strong>
                  </div>
                )}
                {channel.id === 'amazon' && (
                  <div className="pt-2 text-[11px] text-[#57423a] border-t border-[#e8e5df] font-sans">
                    <strong>Pack ready ✓ · Seller/account requirements may still apply 🟡</strong>
                  </div>
                )}
                {channel.id === 'flipkart' && (
                  <div className="pt-2 text-[11px] text-[#57423a] border-t border-[#e8e5df] font-sans">
                    <strong>Pack ready ✓ · Flipkart Samarth document verification applies 🟡</strong>
                  </div>
                )}
                {channel.id === 'indiahandmade' && (
                  <div className="pt-2 text-[11px] text-[#57423a] border-t border-[#e8e5df] font-sans">
                    <strong>Pack ready ✓ · Ministry artisan card / registration requirement applies 🟡</strong>
                  </div>
                )}
                {channel.id === 'tulip' && (
                  <div className="pt-2 text-[11px] text-[#57423a] border-t border-[#e8e5df] font-sans">
                    <strong>Suggested collection: Handcrafted Eco & Heritage · Verify with TULIP 🟡</strong>
                  </div>
                )}
                {channel.id === 'gem' && (
                  <div className="pt-2 text-[11px] text-[#004a77] border-t border-[#e8e5df] font-sans">
                    <strong>Government procurement channel · Registration/setup required · Verify current requirements 🔵</strong>
                  </div>
                )}
              </div>

              {/* Layer 2 Actions: Copy & Download */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCopyHelperText}
                  className="flex-1 bg-[#f4f4f1] hover:bg-[#e2e3e0] text-[#57423a] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#e8e5df] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-base">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied!' : 'Copy Format'}</span>
                </button>
                <button
                  onClick={handleDownloadHelperText}
                  className="flex-1 bg-[#f4f4f1] hover:bg-[#e2e3e0] text-[#57423a] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#e8e5df] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>Download Text</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
