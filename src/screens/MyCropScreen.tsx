import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Calendar, MapPin, CheckCircle, Info, Save, Clock, IndianRupee, ShieldCheck } from 'lucide-react';
import { HINGANGHAT_WARDHA_CROPS, cropCalendarService } from '../services/cropCalendarService';
import { FarmerProfile, Language } from '../types';

interface MyCropScreenProps {
  profile: FarmerProfile;
  onUpdateProfile: (updated: FarmerProfile) => void;
}

export const MyCropScreen: React.FC<MyCropScreenProps> = ({
  profile,
  onUpdateProfile
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'hi') as Language;

  const [selectedCropId, setSelectedCropId] = useState(profile.selectedCropId);
  const [sowingDate, setSowingDate] = useState(profile.sowingDate);
  const [village, setVillage] = useState(profile.village);
  const [taluka, setTaluka] = useState(profile.taluka || 'हिंगणघाट');
  const [district, setDistrict] = useState(profile.district || 'वर्धा');
  const [showToast, setShowToast] = useState(false);

  const crops = HINGANGHAT_WARDHA_CROPS;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: FarmerProfile = {
      ...profile,
      selectedCropId,
      sowingDate,
      village,
      taluka,
      district
    };
    onUpdateProfile(updated);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="gov-section-title">{t('crop.title')}</h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400">
            {currentLang === 'hi' 
              ? 'हिंगणघाट व वर्धा जिले हेतु भारतीय कृषि अनुसंधान परिषद (ICAR) व KVK अनुशंसित फसलें'
              : 'ICAR & Krishi Vigyan Kendra recommended Kharif & Rabi crops for Hinganghat, Wardha'}
          </p>
        </div>
      </div>

      {showToast && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle size={22} className="text-emerald-600 shrink-0" />
          <span className="font-semibold text-[16px]">{t('crop.savedSuccess')}</span>
        </div>
      )}

      {/* Official MSP Reference Alert */}
      <div className="p-4 bg-amber-50/90 dark:bg-amber-950/30 border border-gov-gold/60 rounded-xl flex items-start gap-3">
        <Info size={20} className="text-gov-gold shrink-0 mt-0.5" />
        <div className="text-[13px] text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong>{t('crop.sampleMsp')}:</strong> {t('crop.sampleMspNotice')}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Crop Selection Cards */}
        <div className="space-y-3">
          <label className="block text-[16px] font-bold text-gov-navy dark:text-slate-200">
            {t('crop.cropSelect')}:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {crops.map((c) => {
              const isSelected = selectedCropId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCropId(c.id)}
                  className={`gov-card p-4 cursor-pointer relative transition-all border-2 ${
                    isSelected
                      ? 'border-gov-green bg-emerald-50/40 dark:bg-emerald-950/30 shadow-md ring-2 ring-gov-green/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-gov-green dark:text-emerald-400">
                      <CheckCircle size={20} />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-gov-green dark:text-emerald-300 flex items-center justify-center mb-3">
                    <Sprout size={22} />
                  </div>
                  <h3 className="font-serif font-bold text-[17px] text-gov-navy dark:text-white leading-tight">
                    {c.name[currentLang] || c.name.en}
                  </h3>
                  <div className="text-[12px] text-slate-500 mt-1">
                    {t('crop.variety')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{c.variety}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {t('crop.sowingWindow')}: {c.sowingWindow}
                  </div>
                  
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Clock size={13} />
                      <span>{c.durationDays} {currentLang === 'hi' ? 'दिन' : 'days'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-gov-green dark:text-amber-300">
                      <span>MSP ₹{c.mspPerQuintal}</span>
                      {c.stapleType && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 px-1 py-0.2 rounded">
                          {c.stapleType === 'Medium Staple' ? (currentLang === 'hi' ? 'मध्यम' : 'Medium') : (currentLang === 'hi' ? 'लंबा' : 'Long')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inputs: Sowing Date & Location */}
        <div className="gov-card p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Sowing Date */}
            <div className="space-y-2">
              <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar size={18} className="text-gov-green" />
                <span>{t('crop.sowingDate')}:</span>
              </label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full px-4 py-3 text-[17px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
                required
              />
              <p className="text-[12px] text-slate-500">
                {currentLang === 'hi' ? 'बुवाई की तारीख से कटाई के दिन स्वचालित रूप से गिने जाते हैं।' : 'Harvest days are automatically calculated from sowing date.'}
              </p>
            </div>

            {/* Location (Village, Taluka & District) */}
            <div className="space-y-2">
              <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MapPin size={18} className="text-gov-gold" />
                <span>{t('crop.location')}:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={currentLang === 'hi' ? 'गाँव (हिंगणघाट)' : 'Village (Hinganghat)'}
                  className="w-full px-3 py-3 text-[15px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
                  required
                />
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  placeholder={currentLang === 'hi' ? 'तहसील (हिंगणघाट)' : 'Taluka (Hinganghat)'}
                  className="w-full px-3 py-3 text-[15px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
                  required
                />
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder={currentLang === 'hi' ? 'जिला (वर्धा)' : 'District (Wardha)'}
                  className="w-full px-3 py-3 text-[15px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
                  required
                />
              </div>
              <p className="text-[12px] text-slate-500">
                {currentLang === 'hi' ? 'हिंगणघाट APMC व वर्धा स्थानीय मौसम से संबद्ध।' : 'Calibrated with Hinganghat APMC & Wardha local weather station.'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="touch-target w-full sm:w-auto px-8 py-3.5 bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark text-white font-bold text-[17px] rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Save size={18} />
              <span>{t('crop.saveButton')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
