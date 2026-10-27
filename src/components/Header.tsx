import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Moon, Sun, Leaf, LogOut, User } from 'lucide-react';
import { speechService } from '../utils/speech';
import { BRAND_NAME } from '../constants';
import { Language, UserRole } from '../types';

interface HeaderProps {
  onSpeakScreen?: () => void;
  activeScreenName?: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onNavigateHome?: () => void;
  profileName?: string;
  role?: UserRole;
  onSwitchAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSpeakScreen,
  isDarkMode,
  onToggleDarkMode,
  isAuthenticated,
  onLogout,
  onNavigateHome,
  profileName,
  role = 'farmer',
  onSwitchAccount
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as Language;
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsubState = speechService.subscribeState((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsubState();
    };
  }, []);

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kisansaathi_lang', lang);
    }
    speechService.stop();
  };

  const handleSpeakerClick = () => {
    if (isSpeaking) {
      speechService.stop();
    } else if (onSpeakScreen) {
      onSpeakScreen();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#14532D] via-[#114626] to-[#0A2E18] text-white shadow-md border-b-[3px] border-[#B8892B]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Logo and App Title */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
          title="Go to Home"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-sm">
              <Leaf size={16} className="transform -rotate-12" strokeWidth={2.2} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-[16px] sm:text-[21px] tracking-[0.07em] uppercase leading-tight text-white drop-shadow-sm whitespace-nowrap">
                {BRAND_NAME}
              </span>
              {isAuthenticated && (
                <span className={`hidden md:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border ${
                  role === 'buyer' 
                    ? 'bg-blue-600/40 border-blue-400/60 text-blue-200' 
                    : 'bg-[#B8892B]/40 border-[#B8892B]/70 text-amber-200'
                }`}>
                  {role === 'buyer' ? (currentLang === 'hi' ? 'व्यापारी पोर्टल' : 'Buyer Dashboard') : (currentLang === 'hi' ? 'किसान पोर्टल' : 'Farmer Portal')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-[13px] text-emerald-100/90 font-medium truncate">
              {currentLang === 'hi' && (
                <span className="font-serif font-semibold text-amber-200/90 shrink-0">
                  किसान साथी •
                </span>
              )}
              <span className="truncate">
                {role === 'buyer' 
                  ? (currentLang === 'hi' ? 'थोक कृषि खरीद व बाजार भाव (हिंगणघाट)' : 'Wholesale Agricultural Procurement Portal')
                  : t('subTitle')}
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls: Language switcher, Speaker, Dark mode, User badge */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Language Switcher (Only English & Hindi) */}
          <div className="flex bg-black/25 p-0.5 rounded-lg border border-white/15" role="group" aria-label="Language selection">
            {(['en', 'hi'] as Language[]).map((lng) => {
              const labelMap: Record<Language, { short: string; full: string }> = {
                en: { short: 'EN', full: 'English' },
                hi: { short: 'हिं', full: 'हिंदी' }
              };
              const isSelected = currentLang === lng;
              return (
                <button
                  key={lng}
                  onClick={() => handleLanguageChange(lng)}
                  className={`px-2 sm:px-3 py-1 text-[12px] sm:text-[14px] font-semibold rounded-md transition-all ${
                    isSelected
                      ? 'bg-[#B8892B] text-white shadow-sm font-bold'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                  aria-pressed={isSelected}
                  title={`Switch to ${labelMap[lng].full}`}
                >
                  <span className="sm:hidden">{labelMap[lng].short}</span>
                  <span className="hidden sm:inline">{labelMap[lng].full}</span>
                </button>
              );
            })}
          </div>

          {/* Speaker Button (Screen-Aware Dynamic Reader) */}
          <button
            onClick={handleSpeakerClick}
            className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
              isSpeaking
                ? 'bg-amber-400 text-gov-navy border-amber-300 animate-pulse shadow-md ring-2 ring-amber-300'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
            title={isSpeaking ? 'Stop voice reading' : currentLang === 'hi' ? 'स्क्रीन को आवाज से सुनें' : 'Read screen aloud'}
            aria-label={isSpeaking ? 'Stop reading' : 'Read screen aloud'}
          >
            {isSpeaking ? (
              <VolumeX size={20} strokeWidth={2.2} />
            ) : (
              <Volume2 size={20} strokeWidth={2.0} />
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all hidden sm:flex"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={19} strokeWidth={2} /> : <Moon size={19} strokeWidth={2} />}
          </button>

          {/* Authenticated Account Info & Logout */}
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 ml-1">
              {onSwitchAccount && (
                <button
                  onClick={onSwitchAccount}
                  data-testid="switch-account-header-btn"
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 text-[12px] font-semibold border border-white/20 transition-all"
                  title="Switch Demo Account"
                >
                  <User size={14} />
                  <span className="truncate max-w-[120px]">{profileName?.split(' ')[0] || 'User'}</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white border border-red-400/50 text-[13px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title={t('loginEnhanced.logout')}
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">{t('loginEnhanced.logout')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
