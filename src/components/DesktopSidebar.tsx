import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, Calendar, ShoppingCart, Users, Store, 
  PhoneCall, RefreshCw, UserCheck, Leaf, TrendingUp, PackageCheck, ShieldCheck 
} from 'lucide-react';
import { FarmerProfile, BuyerProfile, UserRole, Language } from '../types';
import { BRAND_NAME } from '../constants';

interface DesktopSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: UserRole;
  farmerProfile?: FarmerProfile;
  buyerProfile?: BuyerProfile;
  onResetData: () => void;
  onSwitchAccount?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  role,
  farmerProfile,
  buyerProfile,
  onResetData,
  onSwitchAccount
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as Language;

  // Role-specific isolated navigation items
  const farmerNavItems = [
    { 
      id: 'my_crop', 
      label: t('nav.myCrop'), 
      icon: Sprout, 
      desc: currentLang === 'hi' ? 'फसल व बुवाई विवरण' : 'Crop & Sowing Profile' 
    },
    { 
      id: 'harvest', 
      label: t('nav.harvest'), 
      icon: Calendar, 
      desc: currentLang === 'hi' ? 'मौसम व कटाई सिग्नल' : 'Weather & Advisory' 
    },
    { 
      id: 'sell', 
      label: t('nav.sell'), 
      icon: ShoppingCart, 
      desc: currentLang === 'hi' ? 'मंडी भाव व खरीदार' : 'Mandi Rates & Offers' 
    },
    { 
      id: 'group', 
      label: t('nav.group'), 
      icon: Users, 
      desc: currentLang === 'hi' ? 'सामूहिक बिक्री लॉट' : 'Village Group Pool' 
    }
  ];

  const buyerNavItems = [
    { 
      id: 'buyer_browse', 
      label: currentLang === 'hi' ? 'मार्केटप्लेस (लॉट)' : 'Browse Lots', 
      icon: Store, 
      desc: currentLang === 'hi' ? 'किसान फसल सूचियां' : 'Farmgate Crop Lots' 
    },
    { 
      id: 'buyer_offers', 
      label: currentLang === 'hi' ? 'मेरे प्रस्ताव व ऑर्डर' : 'My Bids & Orders', 
      icon: PackageCheck, 
      desc: currentLang === 'hi' ? 'सौदा स्थिति व रिकॉर्ड' : 'Track Active Offers' 
    },
    { 
      id: 'buyer_mandi', 
      label: currentLang === 'hi' ? 'मंडी भाव व विश्लेषण' : 'Mandi Intelligence', 
      icon: TrendingUp, 
      desc: currentLang === 'hi' ? 'APMC मॉडल भाव vs MSP' : 'APMC vs MSP Rates' 
    },
    { 
      id: 'buyer_clusters', 
      label: currentLang === 'hi' ? 'ग्राम सामूहिक कंसाइनमेंट' : 'Village Clusters', 
      icon: Users, 
      desc: currentLang === 'hi' ? '200Q थोक उठाव' : 'Bulk Direct Sourcing' 
    }
  ];

  const navItems = role === 'buyer' ? buyerNavItems : farmerNavItems;

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 min-h-[calc(100vh-60px)] p-4 justify-between">
      <div className="space-y-4">
        {/* Brand & Role Title */}
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="w-8 h-8 rounded-full bg-gov-green text-white flex items-center justify-center shadow-sm">
            <Leaf size={16} className="transform -rotate-12" />
          </div>
          <div>
            <div className="font-serif font-bold text-[17px] text-gov-navy dark:text-white leading-tight">
              {BRAND_NAME}
            </div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">
              {role === 'buyer' 
                ? (currentLang === 'hi' ? 'व्यापारी खरीद पोर्टल' : 'Buyer Portal (Wardha)') 
                : (currentLang === 'hi' ? 'किसान पोर्टल (वर्धा)' : 'Farmer Portal (Wardha)')}
            </div>
          </div>
        </div>

        {/* Profile Badge */}
        {role === 'farmer' && farmerProfile && (
          <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-slate-800 dark:to-slate-800/60 rounded-xl border border-emerald-200/60 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gov-green text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                {farmerProfile.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[15px] text-gov-navy dark:text-slate-100 truncate">
                    {farmerProfile.name}
                  </span>
                  <UserCheck size={15} className="text-gov-green shrink-0" />
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400 truncate">
                  {farmerProfile.village}, {farmerProfile.district}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                    {farmerProfile.selectedCropId === 'cotton' 
                      ? (currentLang === 'hi' ? 'कपास (Bt Cotton)' : 'Cotton (Bt Cotton)') 
                      : (currentLang === 'hi' ? 'सोयाबीन (JS-335)' : 'Soybean (JS-335)')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {role === 'buyer' && buyerProfile && (
          <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 rounded-xl border border-blue-200/60 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-700 text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                {buyerProfile.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[15px] text-gov-navy dark:text-slate-100 truncate">
                    {buyerProfile.name}
                  </span>
                  <ShieldCheck size={15} className="text-blue-600 shrink-0" />
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400 truncate font-semibold">
                  {buyerProfile.businessName}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                    {buyerProfile.city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="space-y-1.5" aria-label="Desktop Sidebar Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                data-tab={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all group ${
                  isActive
                    ? role === 'buyer'
                      ? 'bg-gov-navy text-white shadow-sm font-semibold'
                      : 'bg-gov-green text-white shadow-sm font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-gov-navy dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700'
                }`}>
                  <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] leading-tight truncate">
                    {item.label}
                  </div>
                  <div className={`text-[11px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {item.desc}
                  </div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-6 bg-gov-gold rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: Helpline & Demo Switcher */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        {onSwitchAccount && (
          <button
            onClick={onSwitchAccount}
            data-testid="switch-account-sidebar-btn"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-[12px] font-bold text-gov-green dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <span>{t('common.switchAccount')}</span>
          </button>
        )}

        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 rounded-xl">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 mb-0.5">
            <PhoneCall size={15} className="shrink-0" />
            <span className="text-[12px] font-bold">
              {currentLang === 'hi' ? 'किसान कॉल सेंटर' : 'Kisan Helpline'}
            </span>
          </div>
          <p className="text-[13px] font-bold text-amber-900 dark:text-amber-200">
            1800-180-1551
          </p>
          <p className="text-[10px] text-amber-700 dark:text-amber-400">
            {currentLang === 'hi' ? 'टोल-फ्री • 6 AM - 10 PM' : 'Toll-Free • 06:00 AM - 10:00 PM'}
          </p>
        </div>

        <button
          onClick={onResetData}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-[12px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
          title="Restore demo benchmark data"
        >
          <RefreshCw size={13} />
          <span>{t('common.resetDemo')}</span>
        </button>
      </div>
    </aside>
  );
};
