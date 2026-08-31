import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface HelpScreenProps {
  lang: Language;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ lang }) => {
  const t = getTranslation(lang);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; desc: string; icon: string; image: string } | null>(null);

  const videoGuides = [
    {
      title: bi('சிறந்த புகைப்படம் எடுப்பது எப்படி', 'How to take great product photos', lang),
      desc: bi('இயற்கை வெளிச்சமும் எளிய பின்னணியும் உங்கள் கைவினைப் பொருட்களை அழகாகக் காட்டும்.', 'Learn how natural daylight and simple backgrounds make your crafts look attractive to buyers.', lang),
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFwmZn4jxvsq0zCaYh4nKZDiyqkaoQiUVIm3bLmF8ycmazyvWkD7aHblfNf-acLqooLgaN84x2ldUcT-9lMQNKxlQbxQZyfiBcIWTFVu8BfOHtMb3UzzwiFCENqzbQhaykywc2VwejFjwlAwiIyruBdbRl26PnTDSbYmo-qyeK9CpyHHkhOfC8jIW8227d360vUnqliPRbukmit0MZoQEzGbJG922WR_MEaEJuLBfM0_Asp3YYnaxo',
      icon: 'photo_camera'
    },
    {
      title: bi('வாட்ஸ்அப்பில் விற்பது எப்படி', 'Selling to customers on WhatsApp', lang),
      desc: bi('தயார் நிலை பொருள் அட்டைகளை அனுப்பி நேரடியாக ஆர்டர்களைப் பெறுங்கள்.', 'Send ready-made product cards and receive orders directly with zero tech complications.', lang),
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnclGWbmQPjTre4HRbhTknYSi_A4f5l2eQVAWifsh2MTcoKMxUBQ82yW1KNEe-C5NTckhEOUZWzRUSxo9XwAbo133S01R7H5Wq6hfk1FgoHt28VFdaRVEDZixwfX2JMqohCXqzVKB83uXbNs9LA-V0wu2j0L1nWYqu-3EU3nki0yNmcKDf-ep67AWX4mb5oSGpsuVyorFYP7sVPhnhhfVv3AccdUWbs_YZ_bXiNiiFAXfFozrPkdpN',
      icon: 'forum'
    },
    {
      title: bi('கண்காட்சிகளுக்கு விண்ணப்பிப்பது எப்படி', 'How to apply for local craft fairs', lang),
      desc: bi('அரசு மானியங்கள், இலவச கடை ஒதுக்கீடு மற்றும் பயணப்படி பற்றி அறியுங்கள்.', 'Understand government subsidies, free stall allocations, and travel allowances for verified artisans.', lang),
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAatR54BnNJHJXol-5c-BgUzKaU6s8wbit32NYEDGYTZ27uLCGIdyPM3P53JV_jxaQ89FUOBbooPK9Zh4UKz0qvc39dmSyTrZSGSTOeU1myFQLls1B2UzPi-vmpXD6Psr9Bps7u3OW5vnBhYKdxm0K00vPC3wR-otD8Rmk6dly4xBj59JN6xzNhplVv7WwLN8UwtUNebm38dW5xFQOEohshCtpfoijnZlMfqmqEKv_cCKswueJ6b320',
      icon: 'storefront'
    }
  ];

  const faqs = [
    {
      q: bi('விற்பனைக்கு எப்போது பணம் கிடைக்கும்?', 'When do I get paid for a sale?', lang),
      a: bi('வாட்ஸ்அப் அல்லது கண்காட்சிகளில் விற்றால், வாடிக்கையாளர்கள் UPI அல்லது பணமாக நேரடியாக செலுத்துவார்கள். ONDC மற்றும் ஆன்லைன் தளங்களில், டெலிவரி ஆன 3 நாட்களுக்குள் உங்கள் வங்கிக் கணக்கில் பணம் வரவு வைக்கப்படும்.', 'When you sell on WhatsApp or local fairs, customers pay you directly via UPI or cash. For ONDC and online platforms, payment is deposited directly into your linked bank account within 3 days of delivery.', lang)
    },
    {
      q: bi('என் புகைப்படம் நன்றாக உள்ளதா என எப்படி அறிவது?', 'How do I know if my photo is good enough?', lang),
      a: bi('பகல் நேரத்தில் ஜன்னல் அருகில் பொருளை வைத்து படம் எடுங்கள். Craft2Cart வெளிச்சத்தை தானாக சரிசெய்து சுத்தமான பட்டியல்களை உருவாக்கும்.', 'Place your handmade craft near a window during daylight. Craft2Cart automatically enhances lighting and creates clean listings.', lang)
    },
    {
      q: bi('என் பொருட்களை யார் பார்க்க முடியும்?', 'Who can see my products?', lang),
      a: bi('வாட்ஸ்அப், ONDC ஷாப்பிங் ஆப்கள், அமேசான் காரிகர், பிளிப்கார்ட் சமர்த் மற்றும் GeM அதிகாரிகள் உங்கள் பொருட்களைப் பார்க்கலாம்.', 'Your products can be seen by buyers on WhatsApp, ONDC shopping apps, Amazon Karigar, Flipkart Samarth, and state procurement officers on GeM.', lang)
    },
    {
      q: bi('என் மொழியில் பேசலாமா?', 'Can I speak in my local language?', lang),
      a: bi('ஆம்! Craft2Cart தமிழ் மற்றும் ஆங்கிலத்தில் குரல் உரையாடலை முழுமையாக ஆதரிக்கிறது. இயல்பாகப் பேசலாம்.', 'Yes! Craft2Cart fully supports voice conversations in Tamil and English. You can speak naturally.', lang)
    }
  ];

  const handleHear = () => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        'How can we help? Watch video guides, read common questions, or call our friendly artisan support team.',
        'உங்களுக்கு எவ்வாறு உதவலாம்? வீடியோ வழிகாட்டிகள் மற்றும் பொதுவான கேள்விகளைப் பார்க்கவும், அல்லது எங்கள் குழுவை அழைக்கவும்.'
      ),
      lang
    );
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-5">
      {/* Page Header & Hear Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
            {t.howCanWeHelp}
          </h2>
          <p className="text-xs sm:text-sm text-[#57423a]">{bi('எளிய வழிகாட்டிகள் & குரல் உதவி', 'Simple guides & friendly voice support', lang)}</p>
        </div>
        <button
          onClick={handleHear}
          aria-label="Listen to options"
          className="bg-[#d6e0f6] text-[#555f71] w-12 h-12 rounded-full flex items-center justify-center soft-shadow active:scale-95 transition-transform flex-shrink-0 hover:bg-[#bdc7dc]"
        >
          <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
            volume_up
          </span>
        </button>
      </div>

      {/* Visual Workflow Explainer */}
      <section className="bg-[#ffffff] rounded-2xl p-5 border border-[#e8e5df] shadow-sm">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#555f71] mb-3">
          {bi('Craft2Cart எப்படி வேலை செய்கிறது', 'How Craft2Cart Works', lang)}
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#ffdbcd] flex items-center justify-center text-[#9f3e07] mb-1.5">
              <span className="material-symbols-outlined text-2xl">photo_camera</span>
            </div>
            <span className="font-bold text-xs text-[#1a1c1b]">{bi('1. புகைப்படம்', '1. Take Photo', lang)}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#d6e0f6] flex items-center justify-center text-[#555f71] mb-1.5">
              <span className="material-symbols-outlined text-2xl">mic</span>
            </div>
            <span className="font-bold text-xs text-[#1a1c1b]">{bi('2. ஒருமுறை பேசு', '2. Speak Once', lang)}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#91f8b8] flex items-center justify-center text-[#00522f] mb-1.5">
              <span className="material-symbols-outlined text-2xl">rocket_launch</span>
            </div>
            <span className="font-bold text-xs text-[#1a1c1b]">{bi('3. எங்கும் விற்க', '3. Sell Everywhere', lang)}</span>
          </div>
        </div>
      </section>

      {/* Video Guides Section */}
      <section className="flex flex-col gap-3">
        <h3 className="font-['Public_Sans'] font-bold text-base text-[#1a1c1b]">
          {t.videoGuides}
        </h3>
        <div className="flex flex-col gap-3">
          {videoGuides.map((guide, idx) => (
            <div
              key={idx}
              onClick={() => {
                playTapTone('tap');
                setSelectedVideo(guide);
              }}
              className="bg-[#ffffff] rounded-2xl soft-shadow overflow-hidden flex flex-col border border-[#e8e5df] cursor-pointer hover:border-[#9f3e07]/50 active:scale-[0.98] transition-all"
            >
              <div className="h-40 w-full relative">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[#9f3e07] text-3xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-3.5 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#9f3e07] text-2xl">
                  {guide.icon}
                </span>
                <p className="font-['Public_Sans'] text-sm sm:text-base font-bold text-[#1a1c1b]">
                  {guide.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Questions Section */}
      <section className="flex flex-col gap-2">
        <h3 className="font-['Public_Sans'] font-bold text-base text-[#1a1c1b] mb-1">
          {t.commonQuestions}
        </h3>
        <div className="bg-[#ffffff] rounded-2xl soft-shadow overflow-hidden border border-[#e8e5df]">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-[#e8e5df] last:border-none">
              <button
                onClick={() => {
                  playTapTone('tap');
                  setActiveFaq(activeFaq === idx ? null : idx);
                }}
                className="w-full min-h-[64px] px-4 py-3 flex items-center justify-between text-left hover:bg-[#f4f4f1] transition-colors"
              >
                <span className="font-['Public_Sans'] font-semibold text-sm sm:text-base text-[#1a1c1b]">
                  {faq.q}
                </span>
                <span className="material-symbols-outlined text-[#57423a] transition-transform">
                  {activeFaq === idx ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs sm:text-sm text-[#57423a] leading-relaxed bg-[#f9f9f6]">
                  <p>{faq.a}</p>
                  <button
                    onClick={() => speakText(`${faq.q}. ${faq.a}`, lang)}
                    className="mt-2 text-xs font-bold text-[#9f3e07] flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                      volume_up
                    </span>
                    <span>{bi('பதிலைக் கேட்க', 'Listen to answer', lang)}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Direct Contact Support Box */}
      <section className="bg-[#128752] rounded-2xl p-6 soft-shadow flex flex-col items-center text-center gap-3 text-white">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-1 text-[#128752]">
          <span className="material-symbols-outlined text-3xl">support_agent</span>
        </div>
        <h3 className="font-['Source_Serif_4',serif] text-xl font-bold">
          {bi('இன்னும் உதவி வேண்டுமா?', 'Still need help?', lang)}
        </h3>
        <p className="font-['Public_Sans'] text-xs sm:text-sm text-white/90 mb-2">
          {bi('எங்கள் உதவிக் குழு தமிழ் மற்றும் ஆங்கிலத்தில் பேசும்.', 'Our friendly support team speaks Tamil and English.', lang)}
        </p>

        <button
          onClick={() => {
            playTapTone('tap');
            window.location.href = 'tel:1800123456';
          }}
          className="w-full min-h-[56px] bg-[#9f3e07] hover:bg-[#c05621] text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-xl">call</span>
          <span>{t.callSupport}</span>
        </button>

        <button
          onClick={() => {
            playTapTone('tap');
            window.open('https://api.whatsapp.com/send?text=Namaste Craft2Cart Help Team, I need assistance with my artisan shop.', '_blank');
          }}
          className="w-full min-h-[56px] bg-transparent border-2 border-white text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-xl">chat</span>
          <span>{t.messageSupport}</span>
        </button>
      </section>

      {/* Video Guide Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-lg text-[#1a1c1b]">{selectedVideo.title}</h4>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-8 h-8 rounded-full bg-[#eeeeeb] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden relative flex items-center justify-center">
              <img src={selectedVideo.image} alt={selectedVideo.title} className="w-full h-full object-cover opacity-60" />
              <div className="absolute text-center p-4 text-white">
                <div className="w-16 h-16 rounded-full bg-[#9f3e07] flex items-center justify-center mx-auto mb-2 shadow-lg animate-pulse">
                  <span className="material-symbols-outlined text-4xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </div>
                <span className="font-bold text-sm">{bi('வழிகாட்டி இயங்குகிறது...', 'Playing Audio-Visual Guide...', lang)}</span>
              </div>
            </div>
            <p className="text-sm text-[#57423a]">{selectedVideo.desc}</p>
            <button
              onClick={() => {
                speakText(selectedVideo.desc, lang);
              }}
              className="w-full bg-[#d6e0f6] text-[#555f71] py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                volume_up
              </span>
              <span>{bi('விளக்கத்தைக் கேட்க', 'Hear Explanation', lang)}</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
