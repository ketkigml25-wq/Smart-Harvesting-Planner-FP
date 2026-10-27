import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Leaf, 
  ArrowRight, 
  ShieldCheck, 
  Sprout, 
  Store, 
  CheckSquare, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  TrendingUp, 
  Droplets, 
  PhoneCall,
  CheckCircle2,
  Clock,
  LogIn,
  UserPlus
} from 'lucide-react';
import { BRAND_NAME } from '../constants';
import { Language } from '../types';
import { TricolorBar } from '../components/TricolorBar';
import { speechService } from '../utils/speech';

interface LandingPageProps {
  onNavigateToLogin: (role?: 'farmer' | 'buyer') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  isDarkMode,
  onToggleDarkMode
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'hi') as Language;

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  React.useEffect(() => {
    const unsubState = speechService.subscribeState((speaking) => setIsSpeaking(speaking));
    const unsubVoice = speechService.subscribeVoiceMissing((lang, msg) => {
      setVoiceNotice(msg);
      setTimeout(() => setVoiceNotice(null), 6000);
    });
    return () => {
      unsubState();
      unsubVoice();
    };
  }, []);

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('kisansaathi_lang', lang);
    speechService.stop();
    setVoiceNotice(null);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  const handleVoiceReadout = () => {
    if (isSpeaking) {
      speechService.stop();
      return;
    }
    const readoutText = currentLang === 'hi'
      ? `${BRAND_NAME} में आपका स्वागत है। सही समय पर कटाई करें। सीधे बेचें। उचित मूल्य पाएं। यह पोर्टल हिंगणघाट व वर्धा जिले के किसानों के लिए मौसम आधारित कटाई सलाह, पारदर्शी APMC मंडी भाव और व्यापारियों को सीधी बिक्री की सुविधा प्रदान करता है। लॉगिन करने के लिए किसान लॉगिन या व्यापारी लॉगिन बटन दबाएं।`
      : `Welcome to ${BRAND_NAME}. Know when to harvest. Sell directly. Get a fair price. Weather-driven harvest advisory and direct selling platform for farmers in Hinganghat, Wardha district. Click Farmer Login or Buyer Login to continue.`;
    speechService.speak(readoutText, currentLang);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-slate-950 text-gov-navy dark:text-slate-100 transition-colors">
      {/* 1. Thin Tricolor Bar at the very top */}
      <TricolorBar />

      {/* Voice Missing Notice */}
      {voiceNotice && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-[13px] font-semibold flex items-center justify-between border-b border-amber-600 shadow-sm animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertTriangle size={18} className="shrink-0 text-amber-900" />
            <span>{voiceNotice}</span>
          </div>
          <button 
            onClick={() => setVoiceNotice(null)}
            className="text-amber-950 font-bold hover:underline ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Public Top Bar */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#14532D] via-[#114626] to-[#0A2E18] text-white shadow-md border-b-[3px] border-[#B8892B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Logo & Brand Wordmark */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-sm">
                <Leaf size={18} className="transform -rotate-12" strokeWidth={2.2} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-[16px] sm:text-[23px] tracking-[0.07em] uppercase leading-tight text-white drop-shadow-sm whitespace-nowrap">
                  {BRAND_NAME}
                </span>
                <span className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-bold bg-[#B8892B]/30 border border-[#B8892B]/60 rounded-full text-amber-200 uppercase tracking-wider">
                  Public Portal
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-[13px] text-emerald-100/90 font-medium truncate">
                {currentLang === 'hi' && (
                  <span className="font-serif font-semibold text-amber-200/90 shrink-0">
                    किसान साथी •
                  </span>
                )}
                <span className="truncate">{t('landing.topBar.tagline')}</span>
              </div>
            </div>
          </div>

          {/* Right Controls: Language switcher, Voice reader, Dark mode, Login & Register buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <div className="flex bg-black/25 p-0.5 rounded-lg border border-white/15" role="group" aria-label="Language selection">
              {(['en', 'hi'] as Language[]).map((lng) => {
                const labelMap: Record<Language, string> = {
                  en: 'EN',
                  hi: 'हिं'
                };
                const isSelected = currentLang === lng;
                return (
                  <button
                    key={lng}
                    onClick={() => handleLanguageChange(lng)}
                    className={`px-2 sm:px-3 py-1 text-[11px] sm:text-[13px] font-semibold rounded-md transition-all ${
                      isSelected
                        ? 'bg-[#B8892B] text-white shadow-sm font-bold'
                        : 'text-emerald-100 hover:text-white hover:bg-white/10'
                    }`}
                    aria-pressed={isSelected}
                    title={`Switch to ${lng === 'en' ? 'English' : 'हिंदी'}`}
                  >
                    <span className="sm:hidden">{labelMap[lng]}</span>
                    <span className="hidden sm:inline">{lng === 'en' ? 'English' : 'हिंदी'}</span>
                  </button>
                );
              })}
            </div>

            {/* Speaker Button */}
            <button
              onClick={handleVoiceReadout}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                isSpeaking
                  ? 'bg-amber-400 text-gov-navy border-amber-300 animate-pulse ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
              title={isSpeaking ? 'Stop voice readout' : 'Read screen aloud'}
              aria-label="Read aloud"
            >
              {isSpeaking ? <VolumeX size={17} strokeWidth={2.2} /> : <Volume2 size={17} strokeWidth={2.0} />}
            </button>

            {/* Dark Mode Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all hidden sm:flex"
              title="Toggle dark mode"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
            </button>

            {/* Login & Register Buttons (Visible on desktop/tablet; on mobile sticky bottom CTA is used) */}
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onNavigateToLogin('farmer')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-bold text-white bg-[#B8892B] hover:bg-[#A37824] rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <LogIn size={15} />
                <span>{t('landing.topBar.login')}</span>
              </button>
              <button
                onClick={() => onNavigateToLogin('farmer')}
                className="hidden md:flex px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-bold text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all items-center gap-1.5"
              >
                <UserPlus size={15} />
                <span>{t('landing.topBar.register')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (2-Column on Desktop, 1-Column on Mobile) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-transparent to-transparent dark:from-slate-900/50 dark:to-transparent border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-[13px] sm:text-[14px] font-semibold text-emerald-900 dark:text-emerald-200">
                <ShieldCheck size={16} className="text-gov-green dark:text-emerald-400 shrink-0" />
                <span>{t('landing.hero.badge')}</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-[32px] sm:text-[44px] lg:text-[48px] font-bold text-gov-navy dark:text-white leading-[1.18] tracking-tight">
                {t('landing.hero.headline')}
              </h1>

              {/* Support Text */}
              <p className="text-[18px] sm:text-[20px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl font-sans">
                {t('landing.hero.subtext')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={() => onNavigateToLogin('farmer')}
                  className="touch-target px-7 py-3.5 bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark text-white font-bold text-[18px] rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition-all"
                >
                  <Sprout size={20} />
                  <span>{t('landing.hero.farmerLogin')}</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => onNavigateToLogin('buyer')}
                  className="touch-target px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-gov-navy dark:text-slate-100 border-2 border-slate-300 dark:border-slate-700 font-bold text-[17px] rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Store size={19} className="text-gov-gold" />
                  <span>{t('landing.hero.buyerLogin')}</span>
                </button>
              </div>

              {/* Trust Subtext */}
              <div className="flex items-center gap-2 text-[14px] text-slate-500 dark:text-slate-400 pt-1">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('landing.hero.freeNotice')}</span>
              </div>
            </div>

            {/* Right Hero Column: Live Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#B8892B]/40 shadow-xl overflow-hidden">
                {/* Preview Header */}
                <div className="bg-gradient-to-r from-gov-navy to-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-gov-gold/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-[14px] tracking-wide text-amber-200">
                      {t('landing.preview.title')}
                    </span>
                  </div>
                  <span className="text-[12px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-200">
                    Hinganghat, Wardha
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Sample Harvest Signal Box */}
                  <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                        {t('landing.preview.harvestSignal')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100 text-[12px] font-bold">
                        {t('landing.preview.signalStatus')}
                      </span>
                    </div>
                    <p className="text-[15px] font-semibold text-amber-950 dark:text-amber-100 leading-snug">
                      {t('landing.preview.signalAdvice')}
                    </p>
                  </div>

                  {/* Mandi vs MSP Comparison Card */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <div className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                        {t('landing.preview.mandiRateTitle')}
                      </div>
                      <div className="text-[20px] font-serif font-bold text-gov-navy dark:text-white mt-1">
                        {t('landing.preview.mandiRate')}
                      </div>
                      <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-0.5">
                        {currentLang === 'hi' ? 'मंडी भाव ₹212 नीचे' : '₹212 below MSP'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-[12px] text-emerald-800 dark:text-emerald-300 font-medium">
                        {t('landing.preview.mspTitle')}
                      </div>
                      <div className="text-[20px] font-serif font-bold text-gov-green dark:text-emerald-400 mt-1">
                        {t('landing.preview.mspRate')}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">
                        {currentLang === 'hi' ? 'शासकीय गारंटी भाव' : 'Official Support Price'}
                      </div>
                    </div>
                  </div>

                  {/* MSP Benefit Callout */}
                  <div className="p-2.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/30 text-[13px] font-bold text-emerald-900 dark:text-emerald-200 text-center flex items-center justify-center gap-1.5">
                    <TrendingUp size={15} />
                    <span>{t('landing.preview.mspBadge')}</span>
                  </div>

                  {/* Moisture Compliance Indicator */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[13px]">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <Droplets size={15} className="text-blue-500" />
                      {t('landing.preview.moistureTitle')}
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {t('landing.preview.moistureVal')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Live Strip (4 Stat Cards) */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 sm:py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Stat 1: Days to harvest */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-gov-gold/60 transition-all">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[13px] font-medium">
                <Clock size={16} className="text-gov-green" />
                <span>{t('landing.liveStrip.daysRemainingLabel')}</span>
              </div>
              <div className="font-serif text-[22px] sm:text-[26px] font-bold text-gov-navy dark:text-white mt-1">
                {t('landing.liveStrip.daysRemaining')}
              </div>
            </div>

            {/* Stat 2: Today Signal */}
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 hover:border-amber-400 transition-all">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-[13px] font-medium">
                <AlertTriangle size={16} className="text-amber-600" />
                <span>{t('landing.liveStrip.todaySignalLabel')}</span>
              </div>
              <div className="font-serif text-[22px] sm:text-[26px] font-bold text-amber-700 dark:text-amber-400 mt-1">
                {t('landing.liveStrip.todaySignal')}
              </div>
            </div>

            {/* Stat 3: Nagpur Mandi vs MSP */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-gov-gold/60 transition-all">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[13px] font-medium">
                <TrendingUp size={16} className="text-blue-600" />
                <span>{t('landing.liveStrip.mandiRateLabel')}</span>
              </div>
              <div className="font-serif text-[22px] sm:text-[26px] font-bold text-gov-navy dark:text-white mt-1">
                {t('landing.liveStrip.mandiRate')}
              </div>
            </div>

            {/* Stat 4: Village Group Lot */}
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 hover:border-emerald-400 transition-all">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-[13px] font-medium">
                <Users size={16} className="text-emerald-600" />
                <span>{t('landing.liveStrip.villageGroupLabel')}</span>
              </div>
              <div className="font-serif text-[22px] sm:text-[26px] font-bold text-gov-green dark:text-emerald-400 mt-1">
                {t('landing.liveStrip.villageGroup')}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. "What You Can Do" (4 Feature Cards) */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-[#B8892B]/15 border border-[#B8892B]/40 text-[#966b1a] dark:text-amber-300 text-[13px] font-bold uppercase tracking-wider">
            Features & Solutions
          </div>
          <h2 className="font-serif text-[28px] sm:text-[38px] font-bold text-gov-navy dark:text-white">
            {t('landing.features.title')}
          </h2>
          <p className="text-[16px] sm:text-[18px] text-slate-600 dark:text-slate-300">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="gov-card p-6 border-t-4 border-t-gov-green flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-gov-green dark:text-emerald-400 flex items-center justify-center">
                <Sprout size={26} strokeWidth={2.2} />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-gov-navy dark:text-white leading-snug">
                {t('landing.features.f1Title')}
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('landing.features.f1Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[13px] font-bold text-gov-green dark:text-emerald-400 flex items-center gap-1.5">
              <span>7-Day Signal Strip</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="gov-card p-6 border-t-4 border-t-gov-gold flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-gov-gold dark:text-amber-400 flex items-center justify-center">
                <Store size={26} strokeWidth={2.2} />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-gov-navy dark:text-white leading-snug">
                {t('landing.features.f2Title')}
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('landing.features.f2Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[13px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <span>Direct Wholesale Bids</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="gov-card p-6 border-t-4 border-t-blue-600 flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckSquare size={26} strokeWidth={2.2} />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-gov-navy dark:text-white leading-snug">
                {t('landing.features.f3Title')}
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('landing.features.f3Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[13px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <span>MSP 4-Point Checklist</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="gov-card p-6 border-t-4 border-t-purple-600 flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Users size={26} strokeWidth={2.2} />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-gov-navy dark:text-white leading-snug">
                {t('landing.features.f4Title')}
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('landing.features.f4Desc')}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[13px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <span>30% Freight Discount</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. "How It Works" (3 Steps) */}
      <section className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-gov-green/15 text-gov-green dark:text-emerald-400 text-[13px] font-bold uppercase tracking-wider">
              Step-by-Step
            </div>
            <h2 className="font-serif text-[28px] sm:text-[36px] font-bold text-gov-navy dark:text-white">
              {t('landing.howItWorks.title')}
            </h2>
            <p className="text-[16px] sm:text-[18px] text-slate-600 dark:text-slate-300">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-gov-green text-white font-serif font-bold text-[20px] flex items-center justify-center mb-5 shadow-md">
                {t('landing.howItWorks.step1Num')}
              </div>
              <h3 className="font-serif text-[20px] font-bold text-gov-navy dark:text-white mb-2">
                {t('landing.howItWorks.step1Title')}
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('landing.howItWorks.step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-[#B8892B] text-white font-serif font-bold text-[20px] flex items-center justify-center mb-5 shadow-md">
                {t('landing.howItWorks.step2Num')}
              </div>
              <h3 className="font-serif text-[20px] font-bold text-gov-navy dark:text-white mb-2">
                {t('landing.howItWorks.step2Title')}
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('landing.howItWorks.step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white font-serif font-bold text-[20px] flex items-center justify-center mb-5 shadow-md">
                {t('landing.howItWorks.step3Num')}
              </div>
              <h3 className="font-serif text-[20px] font-bold text-gov-navy dark:text-white mb-2">
                {t('landing.howItWorks.step3Title')}
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('landing.howItWorks.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Buyer Section (Special Focus for Bulk Buyers, Mills, FPOs) */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-[#113824] via-[#0E2F1F] to-[#081F14] text-white rounded-3xl p-8 sm:p-12 border-2 border-[#B8892B]/50 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-5">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#B8892B]/30 border border-[#B8892B]/70 text-amber-200 text-[13px] font-bold uppercase tracking-wider">
              {t('landing.buyerSection.badge')}
            </span>
            <h2 className="font-serif text-[28px] sm:text-[38px] font-bold text-white leading-tight">
              {t('landing.buyerSection.title')}
            </h2>
            <p className="text-[16px] sm:text-[18px] text-emerald-100/90 leading-relaxed">
              {t('landing.buyerSection.desc')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-[14px] text-emerald-100 font-semibold bg-white/10 px-3.5 py-2 rounded-xl">
                <CheckCircle2 size={16} className="text-amber-300 shrink-0" />
                <span>{t('landing.buyerSection.feature1')}</span>
              </div>
              <div className="flex items-center gap-2 text-[14px] text-emerald-100 font-semibold bg-white/10 px-3.5 py-2 rounded-xl">
                <CheckCircle2 size={16} className="text-amber-300 shrink-0" />
                <span>{t('landing.buyerSection.feature2')}</span>
              </div>
              <div className="flex items-center gap-2 text-[14px] text-emerald-100 font-semibold bg-white/10 px-3.5 py-2 rounded-xl">
                <CheckCircle2 size={16} className="text-amber-300 shrink-0" />
                <span>{t('landing.buyerSection.feature3')}</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => onNavigateToLogin('buyer')}
                className="touch-target px-8 py-4 bg-gradient-to-r from-[#B8892B] to-[#D4A33B] hover:from-[#A37824] hover:to-[#B8892B] text-white font-bold text-[18px] rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all"
              >
                <Store size={20} />
                <span>{t('landing.buyerSection.cta')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Help & FAQ Section (Kisan Call Centre + Accordion) */}
      <section className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Toll-free Kisan Call Centre Card */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-gov-green dark:text-emerald-400 font-bold text-[14px]">
                <PhoneCall size={18} />
                <span>{t('help.title')}</span>
              </div>
              <h3 className="font-serif text-[24px] sm:text-[28px] font-bold text-gov-navy dark:text-white">
                1800-180-1551
              </h3>
              <p className="text-[14px] text-slate-600 dark:text-slate-300">
                {t('help.timings')}
              </p>
            </div>
            <a
              href="tel:18001801551"
              className="touch-target px-6 py-3.5 bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark text-white font-bold text-[16px] rounded-xl shadow-md flex items-center justify-center gap-2 shrink-0 transition-all"
            >
              <PhoneCall size={18} />
              <span>{t('help.callNow')}</span>
            </a>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h2 className="font-serif text-[26px] sm:text-[34px] font-bold text-gov-navy dark:text-white">
                {t('landing.faq.title')}
              </h2>
              <p className="text-[15px] sm:text-[17px] text-slate-600 dark:text-slate-300">
                {t('landing.faq.subtitle')}
              </p>
            </div>

            {[
              { q: t('landing.faq.q1'), a: t('landing.faq.a1') },
              { q: t('landing.faq.q2'), a: t('landing.faq.a2') },
              { q: t('landing.faq.q3'), a: t('landing.faq.a3') },
              { q: t('landing.faq.q4'), a: t('landing.faq.a4') },
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left font-serif text-[17px] sm:text-[18px] font-bold text-gov-navy dark:text-white flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span>{item.q}</span>
                    <span className="shrink-0 text-slate-400">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/70 pt-3 animate-in fade-in duration-150">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9. Public Footer */}
      <footer className="bg-gradient-to-b from-[#0A2E18] to-[#061C0E] text-white border-t-4 border-[#B8892B] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Leaf size={18} className="text-emerald-400" />
              </div>
              <div>
                <span className="font-sans font-bold text-[22px] tracking-[0.08em] uppercase text-white">
                  {BRAND_NAME}
                </span>
                <p className="text-[13px] text-emerald-200/80 font-medium">
                  {t('subTitle')}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[14px] text-emerald-100/90 font-medium">
              <button onClick={() => onNavigateToLogin('farmer')} className="hover:text-amber-300 transition-colors">
                {t('landing.hero.farmerLogin')}
              </button>
              <span>•</span>
              <button onClick={() => onNavigateToLogin('buyer')} className="hover:text-amber-300 transition-colors">
                {t('landing.hero.buyerLogin')}
              </button>
              <span>•</span>
              <a href="tel:18001801551" className="hover:text-amber-300 transition-colors">
                Kisan Helpline: 1800-180-1551
              </a>
            </div>
          </div>

          {/* Academic Prototype Notice */}
          <div className="text-center text-[13px] text-emerald-100/70 max-w-3xl mx-auto leading-relaxed">
            <p className="font-medium text-amber-200/90 mb-1">
              {t('prototypeNotice')}
            </p>
            <p>
              Designed for research and field trials in Hinganghat, Wardha district, Maharashtra. All market prices, weather advisories, and MSP figures are benchmarked for academic demonstration.
            </p>
          </div>
        </div>
      </footer>

      {/* 10. Sticky Bottom "Login" CTA on Mobile (390px Viewport) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 z-40 shadow-2xl">
        <button
          onClick={() => onNavigateToLogin('farmer')}
          className="w-full touch-target bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark text-white font-bold text-[18px] rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all"
        >
          <Sprout size={20} />
          <span>{t('landing.stickyCta')}</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Spacing for mobile sticky bottom CTA */}
      <div className="h-16 md:hidden" />
    </div>
  );
};
