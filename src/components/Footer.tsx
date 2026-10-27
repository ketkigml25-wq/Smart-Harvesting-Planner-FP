import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Sprout, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 text-center">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[13px] text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400 font-semibold rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            <MapPin size={14} />
            <span>{i18n.language === 'hi' ? 'हिंगणघाट, वर्धा (APMC)' : 'Hinganghat, Wardha (APMC)'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold rounded-full border border-amber-200/60 dark:border-amber-800/60">
            <Sprout size={14} />
            <span>{i18n.language === 'hi' ? 'डेमो फसल: सोयाबीन (JS-335)' : 'Demo Crop: Soybean (JS-335)'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-full">
            <ShieldCheck size={14} />
            <span>{i18n.language === 'hi' ? 'WCAG AA सुलभता समर्थित' : 'WCAG 2.1 AA Accessibility'}</span>
          </span>
        </div>

        {/* Required Prototype Notice */}
        <p className="text-[14px] sm:text-[15px] font-medium text-slate-600 dark:text-slate-300">
          {t('prototypeNotice')}
        </p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500">
          Prototype for academic field study. Not an official government application.
        </p>
      </div>
    </footer>
  );
};
