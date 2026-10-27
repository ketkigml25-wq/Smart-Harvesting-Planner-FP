import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, AlertTriangle, TrendingDown, TrendingUp, Clock, ArrowRight, MapPin } from 'lucide-react';
import { FarmerProfile, PaymentRecord, Language } from '../types';

interface DashboardSummaryProps {
  profile: FarmerProfile;
  daysRemaining: number;
  expectedDateString: string;
  todaySignal: 'green' | 'amber' | 'red';
  todayAdvice: string;
  currentMandiRate: number;
  mspRate: number;
  payments: PaymentRecord[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  profile,
  daysRemaining,
  expectedDateString,
  todaySignal,
  todayAdvice,
  currentMandiRate,
  mspRate,
  payments,
  onNavigateTab
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as Language;

  const pendingPayments = payments.filter(p => !p.isReceived);
  const totalPendingGross = pendingPayments.reduce((sum, p) => sum + p.grossAmount, 0);
  const totalHandlingCost = pendingPayments.reduce((sum, p) => sum + (p.labourCost + p.transportCost), 0);
  const netPending = totalPendingGross - totalHandlingCost;

  const isBelowMsp = currentMandiRate < mspRate;
  const priceDiff = Math.abs(currentMandiRate - mspRate);

  return (
    <div className="hidden md:block mb-8">
      {/* Location Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-[13px] text-slate-500">
        <div className="flex items-center gap-1.5 font-semibold text-gov-navy dark:text-slate-300">
          <MapPin size={15} className="text-gov-gold shrink-0" />
          <span>
            {currentLang === 'hi'
              ? `खेत स्थान: ${profile.village}, तहसील ${profile.taluka}, जिला ${profile.district} (महाराष्ट्र)`
              : `Farm: ${profile.village}, Taluka ${profile.taluka}, District ${profile.district} (Maharashtra)`}
          </span>
        </div>
        <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
          {currentLang === 'hi' ? 'हिंगणघाट APMC बेंचमार्क (डेमो डेटा)' : 'Hinganghat APMC [Demo Benchmark Data]'}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Days to Harvest */}
        <div 
          onClick={() => onNavigateTab('harvest')}
          className="gov-card p-4 hover:border-gov-green/50 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider">
              {t('harvest.daysRemaining')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400 flex items-center justify-center">
              <Calendar size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[32px] font-bold text-gov-navy dark:text-white leading-none">
              {daysRemaining}
            </span>
            <span className="text-[14px] text-slate-500 dark:text-slate-400 font-medium">
              {t('crop.days')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            {expectedDateString}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-gov-green dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>{currentLang === 'hi' ? 'सलाह देखें' : 'View Advisory'}</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Card 2: Today's Signal */}
        <div 
          onClick={() => onNavigateTab('harvest')}
          className={`gov-card p-4 cursor-pointer group transition-all ${
            todaySignal === 'red'
              ? 'border-red-200 dark:border-red-900 bg-red-50/20'
              : todaySignal === 'amber'
              ? 'border-amber-200 dark:border-amber-900 bg-amber-50/20'
              : 'border-green-200 dark:border-green-900 bg-green-50/20'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider">
              {t('harvest.todayAdvice')}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              todaySignal === 'red'
                ? 'bg-red-100 text-red-600'
                : todaySignal === 'amber'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
            }`}>
              <AlertTriangle size={17} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full shrink-0 ${
              todaySignal === 'red' ? 'bg-red-500' : todaySignal === 'amber' ? 'bg-amber-500' : 'bg-green-500'
            }`} />
            <span className={`text-[15px] font-bold leading-tight line-clamp-1 ${
              todaySignal === 'red'
                ? 'text-red-700 dark:text-red-400'
                : todaySignal === 'amber'
                ? 'text-amber-800 dark:text-amber-300'
                : 'text-green-700 dark:text-emerald-400'
            }`}>
              {todaySignal === 'red' 
                ? (currentLang === 'hi' ? 'कटाई रोकें' : 'Do Not Harvest') 
                : todaySignal === 'amber' 
                ? (currentLang === 'hi' ? 'प्रतीक्षा करें' : 'Wait & Watch') 
                : (currentLang === 'hi' ? 'कटाई सुरक्षित' : 'Safe to Harvest')}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-snug">
            {todayAdvice}
          </p>
        </div>

        {/* Card 3: Mandi vs MSP */}
        <div 
          onClick={() => onNavigateTab('sell')}
          className="gov-card p-4 hover:border-gov-green/50 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider">
              {currentLang === 'hi' ? 'मंडी दर vs MSP' : 'Mandi vs MSP'}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isBelowMsp ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            }`}>
              {isBelowMsp ? <TrendingDown size={17} /> : <TrendingUp size={17} />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[26px] font-bold text-gov-navy dark:text-white leading-none">
              ₹{currentMandiRate.toLocaleString('en-IN')}
            </span>
            <span className="text-[12px] text-slate-500">/{currentLang === 'hi' ? 'क्विंटल' : 'Qtl'}</span>
          </div>
          <div className="mt-2 text-[11px] flex items-center gap-1 font-medium">
            {isBelowMsp ? (
              <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded font-semibold">
                {currentLang === 'hi' ? `MSP से ₹${priceDiff} कम` : `₹${priceDiff} below MSP`}
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/60 px-1.5 py-0.5 rounded font-semibold">
                {currentLang === 'hi' ? `MSP से ₹${priceDiff} अधिक` : `₹${priceDiff} above MSP`}
              </span>
            )}
            <span className="text-slate-400">(MSP ₹{mspRate})</span>
          </div>
        </div>

        {/* Card 4: Pending Net Payments */}
        <div 
          onClick={() => onNavigateTab('sell')}
          className="gov-card p-4 hover:border-gov-green/50 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider">
              {currentLang === 'hi' ? 'बकाया शुद्ध राशि' : 'Pending Net Payout'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Clock size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[26px] font-bold text-amber-700 dark:text-amber-400 leading-none">
              ₹{netPending.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            {currentLang === 'hi' 
              ? `${pendingPayments.length} सौदे बाकी (खर्च घटाकर)` 
              : `${pendingPayments.length} orders pending clearance`}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-gov-gold group-hover:translate-x-1 transition-transform">
            <span>{currentLang === 'hi' ? 'लेजर देखें' : 'View Ledger'}</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
};
