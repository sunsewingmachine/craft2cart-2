import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { speakText, playTapTone } from '../utils/audio';
import { bi, speechFor } from '../data/translations';

interface SellerProfileModalProps {
  lang: Language;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  {
    label: 'Lakshmi (Master Weaver)',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbFcB8ddjUgGcIrnZGL5EdCf2ZtC-4meSf22ZkPo8DWZiMP--s2r2jjm4onXvpeWKsrD_DUe22HiD306horcXQZlgZBxIMUPGYoJSXiyRuTJe7W-1rzFB2vRCkZnTmuH-HFMnU3GU-UIl7hIifxPOT6SPeWIseYwTqFo8Hg_t0Ul4afcRgSp-aq_Tl9WodKAK7EURWW40UttIUhXrLbimEkXcXiLjD1GCY1akZFfn5cLTxUVbDy0EI'
  },
  {
    label: 'Workshop Avatar',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzKgpC4CtIGoMo5VS_StSml8Si-yUbDc2UOpfg7dzVCu3tiXJrzS55jylFC8kulxLcPj6VYrrFzFcOQ5qteY8rGTVfnq_KLmMl54w1h0glSBNwmjPuV3PwsaKN9Opc4DrgzES7yeQnJtbPt8C7H-MPlKgXWt1x8nfwFJkKhZpeSVx__CTiG1HiaKbkDL9DRO-2v3T9LOx8Ad7RoGsJtPsWVniGnPhGOhzo26tbIEIX4pHZEmFY9D-4'
  }
];

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  lang,
  profile,
  onUpdateProfile,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Form State
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [craftSpecialty, setCraftSpecialty] = useState(profile.craftSpecialty || 'Master Weaver & Handloom Artisan');
  const [experienceYears, setExperienceYears] = useState<number>(profile.experienceYears || 20);
  const [phone, setPhone] = useState(profile.phone || '+91 98421 77340');
  const [pehchanId, setPehchanId] = useState(profile.pehchanId || 'TN-MDU-2023-8821');
  const [upiId, setUpiId] = useState(profile.upiId || 'lakshmi.artisan@upi');
  const [story, setStory] = useState(profile.story);
  const [avatar, setAvatar] = useState(profile.avatar);

  const handlePlayStory = () => {
    playTapTone('tap');
    setIsPlayingStory(true);
    speakText(
      lang === 'en' ? `My Story: ${story}` : profile.storyAudioText || `என் கதை: ${story}`,
      lang
    );
    setTimeout(() => setIsPlayingStory(false), 5000);
  };

  const handleHearProfile = () => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        `Artisan Profile of ${profile.name} from ${profile.location}. ${profile.productsSold} products sold and ${profile.fairsAttended} craft fairs attended. Tap Edit Profile to update your details.`,
        `${profile.location} இலிருந்து கைவினைஞர் ${profile.name} சுயவிவரம். ${profile.productsSold} பொருட்கள் விற்கப்பட்டன மற்றும் ${profile.fairsAttended} கண்காட்சிகளில் பங்கேற்றார். திருத்த 'சுயவிவரத்தைத் திருத்து' பொத்தானை அழுத்தவும்.`
      ),
      lang
    );
  };

  const handleShareShop = () => {
    playTapTone('success');
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${profile.name} Handicrafts — Craft2Cart`,
        text: `Visit ${profile.name}'s artisanal craft workshop on Craft2Cart.`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      speakText(speechFor(lang, 'Shop link copied to clipboard!', 'கடை இணைப்பு நகலெடுக்கப்பட்டது!'), lang);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    playTapTone('success');

    const updatedProfile: UserProfile = {
      ...profile,
      name: name.trim() || profile.name,
      location: location.trim() || profile.location,
      craftSpecialty: craftSpecialty.trim(),
      experienceYears: Number(experienceYears) || 20,
      phone: phone.trim(),
      pehchanId: pehchanId.trim(),
      upiId: upiId.trim(),
      story: story.trim() || profile.story,
      avatar,
      heroPhoto: avatar
    };

    onUpdateProfile(updatedProfile);
    setIsEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);

    speakText(
      speechFor(lang, 'Profile updated successfully!', 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!'),
      lang
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 h-[100svh] bg-black/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto overscroll-contain animate-fade-in"
      style={{
        paddingTop: 'max(0.75rem, var(--safe-top))',
        paddingBottom: 'max(0.75rem, var(--safe-bottom))',
        paddingLeft: 'max(0.75rem, var(--safe-left))',
        paddingRight: 'max(0.75rem, var(--safe-right))'
      }}
    >
      <div className="bg-[#f9f9f6] text-[#1a1c1b] rounded-3xl w-full max-w-2xl shadow-2xl border border-[#e8e5df] p-4 sm:p-8 my-auto relative flex flex-col gap-6">
        
        {/* Toast */}
        {savedToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#128752] text-white px-4 py-2 rounded-full shadow-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 animate-fade-in">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{bi('சேமிக்கப்பட்டது!', 'Profile Saved!', lang)}</span>
          </div>
        )}

        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e8e5df]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9f3e07] text-2xl">account_circle</span>
            <span className="font-['Public_Sans'] font-extrabold text-sm sm:text-base text-[#1a1c1b] uppercase tracking-wide">
              {isEditing ? bi('சுயவிவரத்தைத் திருத்து', 'Edit Profile', lang) : bi('கைவினைஞர் சுயவிவரம்', 'Artisan Profile', lang)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleHearProfile}
              title="Hear Profile in Tamil"
              aria-label="Hear Profile"
              className="w-10 h-10 rounded-full bg-[#d6e0f6] text-[#004a77] flex items-center justify-center hover:bg-[#bdc7dc] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                volume_up
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full bg-[#e2e3e0] text-[#57423a] flex items-center justify-center hover:bg-[#d5d7d4] transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE: ARTISAN PROFILE DISPLAY                                        */}
        {/* ========================================================================= */}
        {!isEditing ? (
          <div className="flex flex-col gap-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-[#ffdbcd] shadow-md bg-[#f2f0eb] shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 gap-2">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
                      {profile.name}
                    </h2>
                    <span className="material-symbols-outlined text-[#006c3f] text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                  <p className="font-['Public_Sans'] text-xs sm:text-sm font-semibold text-[#9f3e07] mt-0.5">
                    🧵 {profile.craftSpecialty || 'Master Weaver & Handloom Artisan'} ({profile.experienceYears || 20} Yrs Experience)
                  </p>
                  <p className="font-['Public_Sans'] text-xs sm:text-sm text-[#555f71] mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                    <span className="material-symbols-outlined text-base text-[#8a7268]">location_on</span>
                    <span>{profile.location}</span>
                  </p>
                </div>

                {/* Edit & Share Buttons */}
                <div className="flex flex-wrap gap-2.5 mt-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      playTapTone('tap');
                      setIsEditing(true);
                    }}
                    className="flex-1 sm:flex-none bg-[#ffffff] border-2 border-[#9f3e07] text-[#9f3e07] hover:bg-[#fff9f6] transition-all py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span>{bi('திருத்து', 'Edit Profile', lang)}</span>
                  </button>

                  <button
                    onClick={handleShareShop}
                    className="flex-1 sm:flex-none bg-[#9f3e07] hover:bg-[#c05621] text-white transition-all py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">share</span>
                    <span>{bi('கடையைப் பகிர்', 'Share Shop', lang)}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Official Credentials Banner */}
            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#d3e8d5] text-[#128752] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">badge</span>
                </span>
                <div>
                  <span className="text-[#78716c] block text-[10px] font-bold uppercase">Pehchan Artisan ID</span>
                  <span className="font-mono font-bold text-[#1a1c1b]">{profile.pehchanId || 'TN-MDU-2023-8821'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-[#ffdbcd] text-[#9f3e07] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">payments</span>
                </span>
                <div>
                  <span className="text-[#78716c] block text-[10px] font-bold uppercase">UPI ID for Direct Payouts</span>
                  <span className="font-mono font-bold text-[#1a1c1b]">{profile.upiId || 'lakshmi.artisan@upi'}</span>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#d6e0f6] text-[#004a77] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base">call</span>
                  </span>
                  <div>
                    <span className="text-[#78716c] block text-[10px] font-bold uppercase">Contact / WhatsApp</span>
                    <span className="font-bold text-[#1a1c1b]">{profile.phone}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-[#f2f0eb] p-4 sm:p-5 rounded-2xl flex flex-col items-center sm:items-start border border-[#e8e5df]">
                <span className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#9f3e07]">
                  {profile.productsSold.toLocaleString()}
                </span>
                <span className="font-['Public_Sans'] text-xs font-bold text-[#555f71] uppercase tracking-wider mt-0.5">
                  {bi('விற்ற பொருட்கள்', 'Products Sold', lang)}
                </span>
              </div>

              <div className="bg-[#f2f0eb] p-4 sm:p-5 rounded-2xl flex flex-col items-center sm:items-start border border-[#e8e5df]">
                <span className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#9f3e07]">
                  {profile.fairsAttended}
                </span>
                <span className="font-['Public_Sans'] text-xs font-bold text-[#555f71] uppercase tracking-wider mt-0.5">
                  {bi('கலந்த கண்காட்சிகள்', 'Fairs Attended', lang)}
                </span>
              </div>
            </div>

            {/* My Story Card */}
            <div className="bg-[#ffffff] p-5 sm:p-6 rounded-2xl border border-[#e8e5df] shadow-sm relative">
              <div className="absolute top-4 right-4">
                <button
                  onClick={handlePlayStory}
                  aria-label="Play story audio"
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm border border-[#e8e5df] ${
                    isPlayingStory ? 'bg-[#9f3e07] text-white animate-pulse' : 'bg-[#eeeeeb] text-[#9f3e07] hover:bg-[#ffdbcd]'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
              <h3 className="font-['Public_Sans'] text-xs font-bold text-[#8a7268] uppercase tracking-widest mb-2">
                {bi('என் கதை', 'My Story', lang)}
              </h3>
              <p className="font-['Source_Serif_4',serif] text-base sm:text-lg text-[#57423a] italic leading-relaxed pr-12">
                "{profile.story}"
              </p>
            </div>

            {/* Achievements Section */}
            <div className="flex flex-col gap-2.5">
              <h3 className="font-['Public_Sans'] text-xs font-bold text-[#555f71] uppercase tracking-widest px-1">
                {bi('சாதனைகள் & பதக்கங்கள்', 'Achievements & Badges', lang)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {profile.achievements.map((ach, idx) => (
                  <div key={idx} className="bg-[#ffffff] border border-[#e8e5df] p-3 rounded-xl flex items-center gap-3 shadow-2xs">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: ach.badgeBg }}
                    >
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {ach.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#1a1c1b]">{ach.title}</h4>
                      <p className="text-[11px] text-[#555f71]">{ach.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* EDIT MODE: EDIT ARTISAN PROFILE FORM                                      */
          /* ========================================================================= */
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 animate-fade-in">
            
            {/* Avatar Selection */}
            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-2.5">
              <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                👤 {bi('சுயவிவர புகைப்படம்', 'Profile Photo', lang)}
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={avatar}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#9f3e07]"
                />
                <div className="flex gap-2">
                  {AVATAR_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        playTapTone('tap');
                        setAvatar(opt.url);
                      }}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                        avatar === opt.url ? 'border-[#9f3e07] ring-2 ring-[#ffdbcd]' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name & Specialty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                  👤 {bi('பெயர்', 'Artisan Full Name', lang)}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lakshmi"
                  required
                  className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2 text-sm font-bold text-[#1a1c1b] outline-none"
                />
              </div>

              <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                  🧵 {bi('கைவினை வகை', 'Craft Specialty', lang)}
                </label>
                <input
                  type="text"
                  value={craftSpecialty}
                  onChange={(e) => setCraftSpecialty(e.target.value)}
                  placeholder="e.g. Master Weaver & Handloom"
                  className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#1a1c1b] outline-none"
                />
              </div>
            </div>

            {/* Location & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                  📍 {bi('இடம்', 'Village & District', lang)}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Madurai, Tamil Nadu"
                  required
                  className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#1a1c1b] outline-none"
                />
              </div>

              <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                  ⏳ {bi('அனுபவம்', 'Years of Experience', lang)}
                </label>
                <input
                  type="number"
                  min="1"
                  max="80"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#1a1c1b] outline-none"
                />
              </div>
            </div>

            {/* Phone, Pehchan ID, UPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#ffffff] p-3.5 rounded-2xl border border-[#e8e5df] flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#57423a] uppercase tracking-wider">
                  📱 Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98421 77340"
                  className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1a1c1b] outline-none"
                />
              </div>

              <div className="bg-[#ffffff] p-3.5 rounded-2xl border border-[#e8e5df] flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#57423a] uppercase tracking-wider">
                  🏛️ Pehchan ID
                </label>
                <input
                  type="text"
                  value={pehchanId}
                  onChange={(e) => setPehchanId(e.target.value)}
                  placeholder="TN-MDU-2023-8821"
                  className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1a1c1b] outline-none font-mono"
                />
              </div>

              <div className="bg-[#ffffff] p-3.5 rounded-2xl border border-[#e8e5df] flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#57423a] uppercase tracking-wider">
                  💳 UPI ID for Direct Pay
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="lakshmi.artisan@upi"
                  className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#1a1c1b] outline-none font-mono"
                />
              </div>
            </div>

            {/* Story */}
            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                📖 {bi('என் கதை & பாரம்பரியம்', 'Artisan Story & Legacy', lang)}
              </label>
              <textarea
                rows={3}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Share how you learned your craft, family heritage, or your artisan dream..."
                className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-normal text-[#1a1c1b] outline-none leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#e8e5df]">
              <button
                type="button"
                onClick={() => {
                  playTapTone('tap');
                  setIsEditing(false);
                }}
                className="flex-1 min-h-[50px] bg-[#f4f4f1] hover:bg-[#e8e5df] text-[#57423a] rounded-2xl font-bold text-sm border border-[#e8e5df] active:scale-95 transition-all"
              >
                {bi('ரத்து', 'Cancel', lang)}
              </button>

              <button
                type="submit"
                className="flex-1 min-h-[50px] bg-[#9f3e07] hover:bg-[#c05621] text-white rounded-2xl font-['Public_Sans'] font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              >
                <span className="material-symbols-outlined text-lg">check</span>
                <span>{bi('சேமி', 'Save Profile', lang)}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
