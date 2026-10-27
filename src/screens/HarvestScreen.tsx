import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, CheckCircle, XCircle, Droplets, Sun, 
  CloudRain, CloudSun, Bell, MessageSquare, Info, ShieldCheck, 
  RefreshCw, MapPin, Calendar, Clock 
} from 'lucide-react';
import { weatherService, FALLBACK_HINGANGHAT_WEATHER } from '../services/weatherService';
import { cropCalendarService } from '../services/cropCalendarService';
import { FarmerProfile, Language, WeatherDay, WeatherDataPayload } from '../types';

interface HarvestScreenProps {
  profile: FarmerProfile;
  onUpdateProfile: (updated: FarmerProfile) => void;
}

export const HarvestScreen: React.FC<HarvestScreenProps> = ({
  profile,
  onUpdateProfile
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'hi') as Language;

  const [weatherData, setWeatherData] = useState<WeatherDataPayload>(FALLBACK_HINGANGHAT_WEATHER);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [moisture, setMoisture] = useState<number>(profile.grainMoisturePercent || 11.5);
  const [smsReminder, setSmsReminder] = useState<boolean>(profile.remindersSms);
  const [whatsAppReminder, setWhatsAppReminder] = useState<boolean>(profile.remindersWhatsApp);

  // Fetch real Open-Meteo weather with cache/fallback
  useEffect(() => {
    let isMounted = true;
    setIsLoadingWeather(true);
    weatherService.getWeather().then((data) => {
      if (isMounted) {
        setWeatherData(data);
        setIsLoadingWeather(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoadingWeather(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Maturity calculation for active crop & sowing date
  const maturity = cropCalendarService.calculateMaturity(profile.selectedCropId, profile.sowingDate);
  const crop = maturity.crop;
  const daysRemaining = maturity.daysRemaining;
  const expectedDateString = maturity.expectedDateStrings[currentLang] || maturity.expectedDateStrings.hi;

  // Weather day 0 (today) & day 1 (tomorrow)
  const todayWeather = weatherData.days[0] || FALLBACK_HINGANGHAT_WEATHER.days[0];
  const tomorrowWeather = weatherData.days[1] || FALLBACK_HINGANGHAT_WEATHER.days[1];

  // Evaluate integrated 24-48h forecast
  const maxRainChance = Math.max(todayWeather.rainChance, tomorrowWeather.rainChance);
  const maxPrecip = Math.max(todayWeather.precipitationMm || 0, tomorrowWeather.precipitationMm || 0);

  const todaySignal: 'green' | 'amber' | 'red' = maxRainChance >= 60 || maxPrecip >= 10 
    ? 'red' 
    : maxRainChance >= 30 || maxPrecip >= 2
    ? 'amber' 
    : 'green';

  const todayAdvice = todaySignal === 'red'
    ? (currentLang === 'hi' 
        ? 'अगले 24-48 घंटों में तेज बारिश की आशंका है। कटाई तुरंत रोकें व फसल सुरक्षित रखें।' 
        : 'Heavy rain expected in next 24-48h. Postpone harvest and protect crops.')
    : todaySignal === 'amber'
    ? (currentLang === 'hi'
        ? 'बादल छाए रहेंगे व हल्की बारिश संभव। फलियों में नमी जांचने के बाद ही कटाई करें।'
        : 'Cloudy conditions or isolated showers. Check grain moisture before harvesting.')
    : (currentLang === 'hi'
        ? 'मौसम अनुकूल और सूखा रहेगा। कटाई, मड़ाई व धूप में सुखाने के लिए उत्तम समय।'
        : 'Weather is clear and dry. Optimal conditions for harvesting and threshing.');

  const getMoistureStatus = (val: number) => {
    if (val <= crop.optimalMoistureMax) {
      return {
        signal: 'green',
        text: currentLang === 'hi'
          ? `नमी ${val}%: हिंगणघाट शासकीय खरीद केंद्र व व्यापारी बिना कटौती स्वीकार करेंगे।`
          : `Moisture ${val}%: Optimal. Accepted at Hinganghat APMC without price deductions.`,
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
      };
    } else if (val <= crop.optimalMoistureMax + 3) {
      return {
        signal: 'amber',
        text: currentLang === 'hi'
          ? `नमी ${val}%: खरीद केंद्र कटौती कर सकता है। 1-2 दिन तिरपाल पर सुखाएं।`
          : `Moisture ${val}%: Moderate moisture. High risk of price deductions. Sun-dry for 1-2 days.`,
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
      };
    } else {
      return {
        signal: 'red',
        text: currentLang === 'hi'
          ? `नमी ${val}%: खरीद केंद्र अस्वीकार कर देगा! तुरंत कटाई रोकें या सुखाएं।`
          : `Moisture ${val}%: Exceeds safe limit! APMC will reject this lot. Postpone harvest or dry immediately.`,
        bg: 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
      };
    }
  };

  const moistureStatus = getMoistureStatus(moisture);

  const handleMoistureChange = (val: number) => {
    setMoisture(val);
    onUpdateProfile({ ...profile, grainMoisturePercent: val });
  };

  const handleToggleSms = (checked: boolean) => {
    setSmsReminder(checked);
    onUpdateProfile({ ...profile, remindersSms: checked });
  };

  const handleToggleWhatsApp = (checked: boolean) => {
    setWhatsAppReminder(checked);
    onUpdateProfile({ ...profile, remindersWhatsApp: checked });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="gov-section-title">{t('harvest.title')}</h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400">
            {t('harvest.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <MapPin size={14} className="text-gov-gold shrink-0" />
          <span>{t('harvest.latLong')}</span>
        </div>
      </div>

      {/* 1. Big Signal Banner */}
      <div 
        className={`p-5 rounded-xl border-2 flex items-start gap-4 shadow-sm ${
          todaySignal === 'red'
            ? 'border-red-300 dark:border-red-800 bg-red-50/90 dark:bg-red-950/30'
            : todaySignal === 'amber'
            ? 'border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/30'
            : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/30'
        }`}
        role="alert"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
          todaySignal === 'red' ? 'bg-red-600 text-white' : todaySignal === 'amber' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <AlertTriangle size={26} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 text-[12px] font-bold rounded-full uppercase tracking-wider ${
              todaySignal === 'red' 
                ? 'bg-red-200 text-red-900' 
                : todaySignal === 'amber'
                ? 'bg-amber-200 text-amber-900'
                : 'bg-emerald-200 text-emerald-900'
            }`}>
              {todaySignal === 'red' ? t('harvest.signalRed') : todaySignal === 'amber' ? t('harvest.signalAmber') : t('harvest.signalGreen')}
            </span>
            <span className="text-[12px] text-slate-500 font-semibold">
              Hinganghat, Wardha
            </span>
          </div>
          <p className="font-serif text-[19px] sm:text-[22px] font-bold text-gov-navy dark:text-white leading-snug">
            "{todayAdvice}"
          </p>
          <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-1">
            {currentLang === 'hi' 
              ? `कल ${tomorrowWeather.rainChance}% बारिश की संभावना (${tomorrowWeather.precipitationMm || 0} मिमी)। कटी फसल को तिरपाल से ढक कर रखें।`
              : `Tomorrow ${tomorrowWeather.rainChance}% rain chance (${tomorrowWeather.precipitationMm || 0} mm). Keep harvested produce covered with tarpaulins.`}
          </p>
        </div>
      </div>

      {/* 2. Days Left Circular Progress Ring & Expected Date */}
      <div className="gov-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[13px] font-bold text-gov-green dark:text-emerald-400 uppercase tracking-wider">
            {currentLang === 'hi' ? `फसल परिपक्वता चक्र (${crop.season} मौसम • वर्धा)` : `Crop Maturity Cycle (${crop.season} Season • Wardha)`}
          </span>
          <h3 className="font-serif text-[24px] sm:text-[28px] font-bold text-gov-navy dark:text-white leading-tight">
            {crop.name[currentLang] || crop.name.en}
          </h3>
          <p className="text-[15px] text-slate-600 dark:text-slate-300">
            {t('harvest.expectedDate')}: <span className="font-bold text-gov-navy dark:text-slate-100">{expectedDateString}</span>
          </p>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            {currentLang === 'hi'
              ? `बुवाई: ${profile.sowingDate} • कुल अवधि ${crop.durationDays} दिन (${maturity.elapsedDays} दिन पूर्ण)`
              : `Sown: ${profile.sowingDate} • Total Duration ${crop.durationDays} days (${maturity.elapsedDays} days elapsed)`}
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="9"
              className="text-slate-200 dark:text-slate-800"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#B8892B"
              strokeWidth="9"
              strokeDasharray={314.16}
              strokeDashoffset={314.16 * (1 - maturity.progressRatio)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-serif text-[42px] font-bold text-gov-navy dark:text-white leading-none">
              {daysRemaining}
            </span>
            <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {t('harvest.daysRemaining')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. 7-Day Weather Strip with Rain %, Temp, and Signal Dot */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-serif text-[18px] font-bold text-gov-navy dark:text-white">
              {t('harvest.sevenDayWeather')}
            </h3>
            <p className="text-[12px] text-slate-500">
              {currentLang === 'hi' ? `स्रोत: ${weatherData.dataSource} • अद्यतन: ${weatherData.lastUpdated}` : `Source: ${weatherData.dataSource} • Updated: ${weatherData.lastUpdated}`}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-semibold">
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('harvest.signalGreen')}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> {t('harvest.signalAmber')}
            </span>
            <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" /> {t('harvest.signalRed')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {weatherData.days.map((day, idx) => {
            const signalBg = day.signal === 'green' ? 'bg-emerald-500' : day.signal === 'amber' ? 'bg-amber-500' : 'bg-red-500';
            const cardBg = day.signal === 'red' 
              ? 'border-red-300 dark:border-red-900 bg-red-50/20' 
              : 'border-slate-200 dark:border-slate-800';

            return (
              <div
                key={idx}
                className={`gov-card p-3 flex flex-col items-center text-center transition-all ${cardBg} hover:shadow-md`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${signalBg}`} />
                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                    {day.dayName[currentLang] || day.dayName.en}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mb-2">{day.date}</span>

                <div className="my-1 text-slate-600 dark:text-slate-300">
                  {day.condition === 'rainy' ? (
                    <CloudRain size={26} className="text-blue-500" />
                  ) : day.condition === 'cloudy' ? (
                    <CloudSun size={26} className="text-amber-500" />
                  ) : (
                    <Sun size={26} className="text-amber-500" />
                  )}
                </div>

                <div className="mt-2 text-[15px] font-bold text-gov-navy dark:text-white">
                  {day.tempMax}° <span className="text-[11px] font-normal text-slate-400">/ {day.tempMin}°</span>
                </div>

                <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-blue-600 dark:text-blue-400">
                  <Droplets size={12} />
                  <span>{day.rainChance}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Grain Moisture Check & Tip */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-serif text-[18px] font-bold text-gov-navy dark:text-white flex items-center gap-2">
            <Droplets size={20} className="text-blue-600" />
            <span>{t('harvest.moistureCheckTitle')}</span>
          </h3>
          <span className="text-[13px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
            {crop.name[currentLang] || crop.name.en} Max Standard: {crop.optimalMoistureMax}%
          </span>
        </div>

        <div className="space-y-3">
          <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300">
            {t('harvest.moistureInputLabel')}:
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={6}
              max={22}
              step={0.5}
              value={moisture}
              onChange={(e) => handleMoistureChange(parseFloat(e.target.value))}
              className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-gov-green"
            />
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
              <input
                type="number"
                min={5}
                max={30}
                step={0.5}
                value={moisture}
                onChange={(e) => handleMoistureChange(parseFloat(e.target.value) || 0)}
                className="w-16 bg-transparent text-[20px] font-bold font-serif text-gov-navy dark:text-white text-right focus:outline-none"
              />
              <span className="font-bold text-[18px] text-slate-500">%</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border-2 ${moistureStatus.bg} flex items-start gap-3 transition-colors`}>
          {moisture <= crop.optimalMoistureMax ? (
            <CheckCircle size={22} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : moisture <= crop.optimalMoistureMax + 3 ? (
            <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle size={22} className="text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold text-[15px] leading-snug">
              {moistureStatus.text}
            </p>
            <p className="text-[12px] mt-1 text-slate-600 dark:text-slate-300">
              {t('harvest.dryingTip')}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Reminder Toggles (SMS, WhatsApp) */}
      <div className="gov-card p-5 space-y-4">
        <h3 className="font-serif text-[18px] font-bold text-gov-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Bell size={19} className="text-gov-green" />
          <span>{t('harvest.reminderTitle')}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Bell size={18} />
              </div>
              <span className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                {t('harvest.smsReminder')}
              </span>
            </div>
            <input
              type="checkbox"
              checked={smsReminder}
              onChange={(e) => handleToggleSms(e.target.checked)}
              className="w-5 h-5 text-gov-green rounded focus:ring-gov-gold accent-gov-green cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <MessageSquare size={18} />
              </div>
              <span className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                {t('harvest.whatsAppReminder')}
              </span>
            </div>
            <input
              type="checkbox"
              checked={whatsAppReminder}
              onChange={(e) => handleToggleWhatsApp(e.target.checked)}
              className="w-5 h-5 text-gov-green rounded focus:ring-gov-gold accent-gov-green cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
