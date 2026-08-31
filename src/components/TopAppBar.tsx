import React from 'react';
import { Language } from '../types';
import { stopSpeech, playTapTone } from '../utils/audio';
import { getTranslation } from '../data/translations';

interface TopAppBarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenProfile: () => void;
  onBack?: () => void;
  title?: string;
  isSpeaking: boolean;
  activeTab: string;
  onTabChange?: (tab: string) => void;
  userAvatar?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentLang,
  onLanguageChange,
  onOpenProfile,
  onBack,
  title = 'Craft2Cart',
  isSpeaking,
  activeTab,
  onTabChange,
  userAvatar
}) => {
  const t = getTranslation(currentLang);

  const navItems = [
    { id: 'home', label: t.home, icon: 'home' },
    { id: 'products', label: t.products, icon: 'storefront' },
    { id: 'sell', label: t.sell, icon: 'add_a_photo', isHero: true },
    { id: 'buyers', label: t.buyers, icon: 'groups' },
    { id: 'help', label: t.help, icon: 'help_outline' }
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full z-50 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e8e5df] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div
        className="flex justify-between items-center gap-2 h-[var(--app-header-h)] max-w-6xl mx-auto"
        style={{
          paddingLeft: 'max(0.75rem, var(--safe-left))',
          paddingRight: 'max(0.75rem, var(--safe-right))'
        }}
      >
        {/* Left Side: Back button or Avatar + Brand. min-w-0 lets the brand
            shrink instead of shoving the language pill off-screen. */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onBack ? (
            <button
              onClick={() => {
                playTapTone('tap');
                onBack();
              }}
              aria-label="Go back"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f0eb] text-[#57423a] hover:bg-[#e2e3e0] active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : (
            <button
              onClick={() => {
                playTapTone('tap');
                onOpenProfile();
              }}
              aria-label="Open artisan profile"
              className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#9f3e07] hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
            >
              <img
                src={
                  userAvatar ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzKgpC4CtIGoMo5VS_StSml8Si-yUbDc2UOpfg7dzVCu3tiXJrzS55jylFC8kulxLcPj6VYrrFzFcOQ5qteY8rGTVfnq_KLmMl54w1h0glSBNwmjPuV3PwsaKN9Opc4DrgzES7yeQnJtbPt8C7H-MPlKgXWt1x8nfwFJkKhZpeSVx__CTiG1HiaKbkDL9DRO-2v3T9LOx8Ad7RoGsJtPsWVniGnPhGOhzo26tbIEIX4pHZEmFY9D-4'
                }
                alt="Artisan Profile"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#128752] rounded-full border border-white" />
            </button>
          )}

          <div
            className="flex flex-col cursor-pointer select-none min-w-0"
            onClick={() => onTabChange && onTabChange('home')}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-['Public_Sans'] font-extrabold text-lg xs:text-xl sm:text-2xl text-[#9f3e07] tracking-tight leading-tight truncate">
                {title}
              </h1>
            </div>
            {activeTab === 'home' && (
              <span className="text-[11px] text-[#78716c] font-medium hidden sm:inline leading-none">
                Speak once. Sell everywhere.
              </span>
            )}
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Integrated seamlessly) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center gap-1.5 bg-[#f5f4ef] p-1 rounded-2xl border border-[#e8e5df]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#ffffff] text-[#9f3e07] shadow-sm'
                      : 'text-[#57423a] hover:text-[#9f3e07] hover:bg-[#ffffff]/50'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="uppercase tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Side: Language switcher + Audio speaking alert + Profile icon */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Speaking Audio Indicator */}
          {isSpeaking && (
            <button
              onClick={stopSpeech}
              title="Stop speaking"
              className="flex items-center gap-1 bg-[#d6e0f6] text-[#006c3f] px-2.5 py-1 rounded-full text-xs font-bold animate-pulse hover:bg-[#bdc7dc] transition-all"
            >
              <span className="material-symbols-outlined text-sm fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                volume_up
              </span>
              <span className="hidden sm:inline">Playing</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="flex items-center bg-[#f2f0eb] rounded-full p-0.5 sm:p-1 border border-[#e8e5df] shadow-inner shrink-0">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold leading-none whitespace-nowrap transition-all ${
                currentLang === 'en'
                  ? 'bg-[#9f3e07] text-white shadow-sm'
                  : 'text-[#57423a] hover:text-[#9f3e07]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold leading-none whitespace-nowrap transition-all ${
                currentLang === 'ta'
                  ? 'bg-[#9f3e07] text-white shadow-sm'
                  : 'text-[#57423a] hover:text-[#9f3e07]'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange('both')}
              title="Tamil and English together"
              className={`px-2 sm:px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold leading-none whitespace-nowrap transition-all ${
                currentLang === 'both'
                  ? 'bg-[#9f3e07] text-white shadow-sm'
                  : 'text-[#57423a] hover:text-[#9f3e07]'
              }`}
            >
              த·EN
            </button>
          </div>

          {/* Profile Quick Button */}
          <button
            onClick={() => {
              playTapTone('tap');
              onOpenProfile();
            }}
            aria-label="View profile"
            className={`w-10 h-10 shrink-0 rounded-full items-center justify-center text-[#57423a] hover:bg-[#f2f0eb] active:scale-95 transition-all ${
              onBack ? 'flex' : 'hidden sm:flex'
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
};

