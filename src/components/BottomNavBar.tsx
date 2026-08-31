import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  lang: Language;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  lang
}) => {
  const t = getTranslation(lang);

  const tabs = [
    { id: 'home', label: t.home, icon: 'home' },
    { id: 'products', label: t.products, icon: 'storefront' },
    { id: 'sell', label: t.sell, icon: 'add_a_photo', isHero: true },
    { id: 'buyers', label: t.buyers, icon: 'groups' },
    { id: 'help', label: t.help, icon: 'help_outline' }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full z-40 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#e8e5df] shadow-[0px_-4px_24px_rgba(0,0,0,0.06)] md:hidden"
      style={{
        paddingBottom: 'var(--safe-bottom)',
        paddingLeft: 'var(--safe-left)',
        paddingRight: 'var(--safe-right)'
      }}
    >
      <div className="flex items-stretch gap-0.5 px-1 max-w-[560px] mx-auto h-[var(--app-nav-h)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              /* flex-1 + basis-0 keeps all five tabs equal width, so a long
                 Tamil label can never push its neighbours off-screen. */
              className={`flex-1 basis-0 min-w-0 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-95 px-0.5 py-1.5 my-1 rounded-2xl ${
                isActive
                  ? 'bg-[#ffdbcd]/40 text-[#9f3e07] font-bold'
                  : 'text-[#57423a] hover:text-[#9f3e07]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] leading-none shrink-0 ${
                  isActive ? 'fill' : ''
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="w-full text-[10px] xs:text-[11px] leading-tight font-medium tracking-tight text-center line-clamp-1 break-normal">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

