import { WeatherDataPayload, WeatherDay } from '../types';

// Coordinates for Hinganghat, Wardha district, Maharashtra
export const HINGANGHAT_COORDINATES = {
  latitude: 20.5506,
  longitude: 78.8378,
  district: 'Wardha',
  taluka: 'Hinganghat'
};

const CACHE_KEY = 'kisansaathi_weather_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getHarvestAdviceForSignal(signal: 'green' | 'amber' | 'red', rainProb: number, precipMm: number) {
  if (signal === 'red') {
    return {
      en: `High rain risk (${rainProb}%, ${precipMm} mm)! Postpone harvesting today and protect crops.`,
      hi: `बारिश की अधिक संभावना (${rainProb}%, ${precipMm} mm)! आज कटाई स्थगित करें और फसल सुरक्षित रखें।`
    };
  } else if (signal === 'amber') {
    return {
      en: `Moderate rain risk (${rainProb}%, ${precipMm} mm). Check grain moisture before harvesting.`,
      hi: `हल्की बारिश या बादल (${rainProb}%, ${precipMm} mm)। फलियों में नमी जांचने के बाद ही निर्णय लें।`
    };
  } else {
    return {
      en: `Clear and dry weather (${rainProb}% rain chance). Safe and optimal for harvesting.`,
      hi: `मौसम अनुकूल और सूखा है (${rainProb}% बारिश)। कटाई व धूप में सुखाने के लिए उत्तम समय।`
    };
  }
}

export const FALLBACK_HINGANGHAT_WEATHER: WeatherDataPayload = {
  location: 'Hinganghat, Wardha District, Maharashtra',
  coordinates: HINGANGHAT_COORDINATES,
  dataSource: 'Open-Meteo Meteorological Archive [DEMO BENCHMARK DATA]',
  lastUpdated: 'Demo Reference Archive (October)',
  isLive: false,
  days: [
    {
      dayName: { en: 'Today (Fri)', hi: 'आज (शुक्र)' },
      date: '16 Oct',
      rainChance: 10,
      precipitationMm: 0.0,
      tempMax: 33,
      tempMin: 22,
      condition: 'sunny',
      signal: 'green',
      signalAdvice: getHarvestAdviceForSignal('green', 10, 0.0)
    },
    {
      dayName: { en: 'Tomorrow (Sat)', hi: 'कल (शनि)' },
      date: '17 Oct',
      rainChance: 15,
      precipitationMm: 0.1,
      tempMax: 34,
      tempMin: 22,
      condition: 'sunny',
      signal: 'green',
      signalAdvice: getHarvestAdviceForSignal('green', 15, 0.1)
    },
    {
      dayName: { en: 'Sun', hi: 'रवि' },
      date: '18 Oct',
      rainChance: 35,
      precipitationMm: 2.5,
      tempMax: 31,
      tempMin: 21,
      condition: 'cloudy',
      signal: 'amber',
      signalAdvice: getHarvestAdviceForSignal('amber', 35, 2.5)
    },
    {
      dayName: { en: 'Mon', hi: 'सोम' },
      date: '19 Oct',
      rainChance: 20,
      precipitationMm: 0.5,
      tempMax: 32,
      tempMin: 22,
      condition: 'cloudy',
      signal: 'green',
      signalAdvice: getHarvestAdviceForSignal('green', 20, 0.5)
    },
    {
      dayName: { en: 'Tue', hi: 'मंगल' },
      date: '20 Oct',
      rainChance: 10,
      precipitationMm: 0.0,
      tempMax: 33,
      tempMin: 23,
      condition: 'sunny',
      signal: 'green',
      signalAdvice: getHarvestAdviceForSignal('green', 10, 0.0)
    },
    {
      dayName: { en: 'Wed', hi: 'बुध' },
      date: '21 Oct',
      rainChance: 5,
      precipitationMm: 0.0,
      tempMax: 34,
      tempMin: 23,
      condition: 'sunny',
      signal: 'green',
      signalAdvice: getHarvestAdviceForSignal('green', 5, 0.0)
    },
    {
      dayName: { en: 'Thu', hi: 'गुरु' },
      date: '22 Oct',
      rainChance: 5,
      precipitationMm: 0.0,
      tempMax: 33,
      tempMin: 22,
      condition: 'sunny',
      signal: 'green',
      signalAdvice: getHarvestAdviceForSignal('green', 5, 0.0)
    }
  ]
};

export const weatherService = {
  getWeather: async (): Promise<WeatherDataPayload> => {
    // Check cached weather
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          return data;
        }
      }
    } catch (e) {
      // ignore
    }

    // Try fetching from Open-Meteo free API without secrets
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${HINGANGHAT_COORDINATES.latitude}&longitude=${HINGANGHAT_COORDINATES.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode&timezone=Asia%2FKolkata`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const daily = json.daily;
        if (daily && daily.time && daily.time.length >= 7) {
          const days: WeatherDay[] = daily.time.slice(0, 7).map((tStr: string, idx: number) => {
            const dateObj = new Date(tStr);
            const rainProb = Math.round(daily.precipitation_probability_max[idx] || 0);
            const precipMm = Math.round((daily.precipitation_sum[idx] || 0) * 10) / 10;
            const tMax = Math.round(daily.temperature_2m_max[idx] || 31);
            const tMin = Math.round(daily.temperature_2m_min[idx] || 22);

            let condition: 'sunny' | 'cloudy' | 'rainy' = 'sunny';
            let signal: 'green' | 'amber' | 'red' = 'green';

            if (rainProb >= 60 || precipMm >= 10) {
              condition = 'rainy';
              signal = 'red';
            } else if (rainProb >= 30 || precipMm >= 2) {
              condition = 'cloudy';
              signal = 'amber';
            }

            const dayHiList = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
            const dayEnList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dIdx = dateObj.getDay();

            const isToday = idx === 0;
            const isTomorrow = idx === 1;

            const nameHi = isToday ? `आज (${dayHiList[dIdx]})` : isTomorrow ? `कल (${dayHiList[dIdx]})` : dayHiList[dIdx];
            const nameEn = isToday ? `Today (${dayEnList[dIdx]})` : isTomorrow ? `Tomorrow (${dayEnList[dIdx]})` : dayEnList[dIdx];

            return {
              dayName: { en: nameEn, hi: nameHi },
              date: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
              rainChance: rainProb,
              precipitationMm: precipMm,
              tempMax: tMax,
              tempMin: tMin,
              condition,
              signal,
              signalAdvice: getHarvestAdviceForSignal(signal, rainProb, precipMm)
            };
          });

          const livePayload: WeatherDataPayload = {
            location: 'Hinganghat, Wardha District, Maharashtra',
            coordinates: HINGANGHAT_COORDINATES,
            dataSource: 'Open-Meteo Live API (High-Resolution Central Vidarbha Grid)',
            lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' (Live Weather)',
            isLive: true,
            days
          };

          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              data: livePayload
            }));
          } catch (e) {
            // ignore
          }

          return livePayload;
        }
      }
    } catch (e) {
      console.warn('Using robust fallback Hinganghat weather:', e);
    }

    return FALLBACK_HINGANGHAT_WEATHER;
  }
};
