import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneCall, X, ShieldAlert, Clock } from 'lucide-react';

export const FloatingHelp: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 bg-gov-green hover:bg-gov-green-light active:scale-95 text-white p-3.5 sm:p-4 rounded-full shadow-2xl border-2 border-white/80 dark:border-slate-700 flex items-center gap-2 group transition-all"
        title="Kisan Call Centre 1800-180-1551"
        aria-label="Kisan Call Centre Assistance"
      >
        <PhoneCall size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline font-bold text-[14px] pr-1">
          1800-180-1551
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="gov-card max-w-md w-full p-6 shadow-2xl relative border-2 border-gov-gold">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-gov-green dark:text-emerald-400 flex items-center justify-center shrink-0">
                <PhoneCall size={26} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[20px] text-gov-navy dark:text-slate-100 leading-tight">
                  {t('help.title')}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  {t('help.subtitle')}
                </p>
              </div>
            </div>

            <div className="space-y-3 my-5">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/70 dark:border-emerald-800/40">
                <div className="text-[13px] text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
                  {t('help.tollFree')}
                </div>
                <div className="text-[26px] font-bold text-gov-green dark:text-emerald-400 font-serif tracking-wider">
                  1800-180-1551
                </div>
              </div>

              <div className="flex items-center gap-2 text-[14px] text-slate-600 dark:text-slate-300">
                <Clock size={16} className="text-gov-gold shrink-0" />
                <span>{t('help.timings')}</span>
              </div>

              <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                <ShieldAlert size={16} className="text-blue-600 shrink-0" />
                <span>{t('help.expertAdvice')}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href="tel:18001801551"
                className="flex-1 py-3.5 px-4 bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark text-white rounded-xl font-bold text-[16px] text-center shadow-md flex items-center justify-center gap-2 transition-all touch-target"
              >
                <PhoneCall size={18} />
                <span>{t('help.callNow')}</span>
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="py-3.5 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-[15px] transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
              {t('help.academicFooter')}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
