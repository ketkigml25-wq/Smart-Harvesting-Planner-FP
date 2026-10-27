import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Calendar, ShoppingCart, Users, Store, PackageCheck, TrendingUp } from 'lucide-react';
import { UserRole, Language } from '../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, role }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as Language;

  const farmerNavItems = [
    { id: 'my_crop', label: t('nav.myCrop'), icon: Sprout },
    { id: 'harvest', label: t('nav.harvest'), icon: Calendar },
    { id: 'sell', label: t('nav.sell'), icon: ShoppingCart },
    { id: 'group', label: t('nav.group'), icon: Users }
  ];

  const buyerNavItems = [
    { id: 'buyer_browse', label: currentLang === 'hi' ? 'फसल लॉट' : 'Browse Lots', icon: Store },
    { id: 'buyer_offers', label: currentLang === 'hi' ? 'मेरे प्रस्ताव' : 'My Bids', icon: PackageCheck },
    { id: 'buyer_mandi', label: currentLang === 'hi' ? 'मंडी भाव' : 'Mandi Rates', icon: TrendingUp },
    { id: 'buyer_clusters', label: currentLang === 'hi' ? 'ग्राम समूह' : 'Clusters', icon: Users }
  ];

  const navItems = role === 'buyer' ? buyerNavItems : farmerNavItems;

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe"
    >
      <div className="flex items-center justify-around px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[58px] transition-all relative touch-manipulation ${
                isActive
                  ? role === 'buyer' ? 'text-gov-navy dark:text-blue-400 font-bold' : 'text-gov-green dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-gov-navy dark:hover:text-slate-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute top-0 w-10 h-[3px] bg-[#B8892B] rounded-full" />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.3 : 1.8}
                className={`transition-transform ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}
              />
              <span className={`text-[11px] mt-1 leading-tight text-center truncate max-w-[76px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
