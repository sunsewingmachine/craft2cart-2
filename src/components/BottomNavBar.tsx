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
    <nav className="fixed bottom-0 left-0 right-0 w-full z-40 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#e8e5df] shadow-[0px_-4px_24px_rgba(0,0,0,0.06)] md:hidden">
      <div className="flex justify-around items-center px-3 py-1.5 max-w-[500px] mx-auto h-[68px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-95 py-1 px-3 rounded-2xl ${
                isActive
                  ? 'bg-[#ffdbcd]/40 text-[#9f3e07] font-bold'
                  : 'text-[#57423a] hover:text-[#9f3e07]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] mb-0.5 ${
                  isActive ? 'fill' : ''
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="text-[11px] leading-tight font-medium tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

