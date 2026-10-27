import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Truck, CheckCircle2, PlusCircle, ArrowUpRight, Award, ShieldAlert } from 'lucide-react';
import { VillageFarmer, Language } from '../types';

interface VillageGroupScreenProps {
  villageName: string;
  farmers: VillageFarmer[];
  onJoinLot: (qty: number) => void;
}

export const VillageGroupScreen: React.FC<VillageGroupScreenProps> = ({
  villageName,
  farmers,
  onJoinLot
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'hi') as Language;

  const [inputQty, setInputQty] = useState<string>('20');
  const [successMsg, setSuccessMsg] = useState(false);

  const totalQuantity = farmers.reduce((sum, f) => sum + f.quantityQuintals, 0);
  const targetQuantity = 200;
  const progressPercent = Math.min(100, Math.round((totalQuantity / targetQuantity) * 100));

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(inputQty);
    if (!qty || qty <= 0) return;
    onJoinLot(qty);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="gov-section-title mb-0">{t('group.title')}</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 uppercase tracking-wider">
              [DEMO BENCHMARK DATA]
            </span>
          </div>
          <p className="text-[14px] text-slate-500 dark:text-slate-400">
            {t('group.subtitle')}
          </p>
        </div>
      </div>

      <div className="gov-card p-6 border-t-4 border-t-gov-green space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-gov-green dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users size={26} />
            </div>
            <div>
              <span className="text-[12px] font-bold text-gov-green dark:text-emerald-400 uppercase tracking-wider">
                {currentLang === 'hi' ? 'स्थानीय क्लस्टर:' : 'Local Cluster:'} {villageName}
              </span>
              <h3 className="font-serif text-[22px] sm:text-[24px] font-bold text-gov-navy dark:text-white leading-tight">
                {currentLang === 'hi' ? `${farmers.length} स्थानीय किसान जुड़े` : `${farmers.length} Local Farmers Consolidated`}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[13px] font-semibold text-slate-500">
              {currentLang === 'hi' ? 'एकत्रित साठा' : 'Consolidated Pool'}
            </span>
            <div className="font-serif text-[24px] font-bold text-gov-navy dark:text-white leading-none">
              {totalQuantity} / {targetQuantity} <span className="text-[14px] font-normal text-slate-500">{currentLang === 'hi' ? 'क्विंटल' : 'Quintal'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-gov-green to-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-gov-green dark:text-emerald-400 font-bold">
              {progressPercent}% {currentLang === 'hi' ? 'लक्ष्य पूर्ण' : 'Target Reached'}
            </span>
            <span className="text-slate-500">
              {targetQuantity - totalQuantity > 0 
                ? (currentLang === 'hi' ? `${targetQuantity - totalQuantity} क्विंटल शेष` : `${targetQuantity - totalQuantity} Quintals Remaining`)
                : (currentLang === 'hi' ? 'लक्ष्य पूर्ण!' : 'Target Complete!')}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center gap-3 text-amber-900 dark:text-amber-200">
          <Truck size={20} className="text-gov-gold shrink-0" />
          <p className="text-[13px] font-semibold leading-snug">
            {t('group.targetNotice')}
          </p>
        </div>
      </div>

      <form onSubmit={handleJoin} className="gov-card p-5 space-y-4">
        <h3 className="font-serif text-[18px] font-bold text-gov-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <PlusCircle size={20} className="text-gov-green" />
          <span>{t('group.joinLotTitle')}</span>
        </h3>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2 text-[15px] font-semibold animate-in fade-in">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span>{t('group.pledgeSuccess')}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t('group.enterQty')}
            </label>
            <input
              type="number"
              min={1}
              value={inputQty}
              onChange={(e) => setInputQty(e.target.value)}
              placeholder={currentLang === 'hi' ? 'क्विंटल' : 'Quintals'}
              className="w-full px-4 py-3 text-[18px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
              required
            />
          </div>
          <div className="sm:self-end">
            <button
              type="submit"
              className="touch-target w-full sm:w-auto px-8 py-3.5 bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark text-white font-bold text-[17px] rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{t('group.joinButton')}</span>
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="gov-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-[18px] font-bold text-gov-navy dark:text-white">
              {t('group.ledgerTitle')}
            </h3>
            <p className="text-[12px] text-slate-500">
              {currentLang === 'hi' 
                ? 'प्रत्येक किसान का हिस्सा व पारदर्शी डिजिटल आवंटन' 
                : 'Transparent digital allocation and payout share for each farmer'}
            </p>
          </div>
          <span className="text-[13px] font-bold text-gov-green dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            {currentLang === 'hi' ? `कुल ${farmers.length} किसान` : `Total ${farmers.length} Farmers`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] sm:text-[15px] gov-table">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[12px] sm:text-[13px] uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">{t('group.colFarmer')}</th>
                <th className="py-2.5 px-3">{t('group.colQty')}</th>
                <th className="py-2.5 px-3">{t('group.colGrade')}</th>
                <th className="py-2.5 px-3 text-right">{t('group.colShare')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {farmers.map((farmer) => {
                const isUser = farmer.isCurrentUser;
                return (
                  <tr 
                    key={farmer.id}
                    className={`transition-colors ${
                      isUser ? 'bg-amber-50/60 dark:bg-amber-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-gov-navy dark:text-slate-100 font-medium">
                          {farmer.name}
                        </span>
                        {isUser && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-gov-gold text-white rounded-full">
                            {t('group.youBadge')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block sm:inline">
                        {farmer.village}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-serif font-bold text-gov-navy dark:text-slate-200">
                      {farmer.quantityQuintals} <span className="text-[12px] font-normal text-slate-400">Q</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <Award size={11} />
                        {farmer.qualityGrade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-serif font-bold text-gov-navy dark:text-slate-100">
                      {farmer.payoutSharePercentage.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
