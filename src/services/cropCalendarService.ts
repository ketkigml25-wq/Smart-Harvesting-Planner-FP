import { CropInfo } from '../types';

export const HINGANGHAT_WARDHA_CROPS: CropInfo[] = [
  {
    id: 'soybean',
    name: {
      en: 'Soybean (JS-335)',
      hi: 'सोयाबीन (JS-335)'
    },
    season: 'Kharif',
    durationDays: 97,
    variety: 'JS-335 / JS-9305 / NRC-37',
    sowingWindow: '20 June - 15 July (20 जून - 15 जुलाई)',
    harvestWindow: '25 Sept - 30 Oct (25 सितंबर - 30 अक्टूबर)',
    optimalMoistureMax: 12,
    mspPerQuintal: 4892,
    marketingSeason: 'Kharif Marketing Season (KMS) 2024-25 [Official Benchmark]',
    mspOfficialSource: 'CACP & Ministry of Agriculture & Farmers Welfare, Govt. of India (Gazette June 2024)'
  },
  {
    id: 'cotton',
    name: {
      en: 'Cotton (Medium Staple - Bt)',
      hi: 'कपास - मध्यम रेशा (Medium Staple)'
    },
    season: 'Kharif',
    durationDays: 160,
    variety: 'Bollgard II / Ajeet-155 / Ankur-651',
    sowingWindow: '15 June - 15 July (15 जून - 15 जुलाई)',
    harvestWindow: '15 Oct - 30 Dec (15 अक्टूबर - 30 दिसंबर)',
    optimalMoistureMax: 8,
    mspPerQuintal: 7121,
    stapleType: 'Medium Staple',
    marketingSeason: 'Kharif Marketing Season (KMS) 2024-25 [Official Benchmark]',
    mspOfficialSource: 'CACP & Ministry of Agriculture & Farmers Welfare, Govt. of India (Gazette June 2024)'
  },
  {
    id: 'cotton_long',
    name: {
      en: 'Cotton (Long Staple - H-4 / Bunny)',
      hi: 'कपास - लंबा रेशा (Long Staple)'
    },
    season: 'Kharif',
    durationDays: 165,
    variety: 'Bunny Bt / DCH-32 / Mahyco-Super',
    sowingWindow: '15 June - 15 July (15 जून - 15 जुलाई)',
    harvestWindow: '15 Oct - 30 Dec (15 अक्टूबर - 30 दिसंबर)',
    optimalMoistureMax: 8,
    mspPerQuintal: 7521,
    stapleType: 'Long Staple',
    marketingSeason: 'Kharif Marketing Season (KMS) 2024-25 [Official Benchmark]',
    mspOfficialSource: 'CACP & Ministry of Agriculture & Farmers Welfare, Govt. of India (Gazette June 2024)'
  },
  {
    id: 'tur',
    name: {
      en: 'Pigeon Pea / Tur (BDN-711)',
      hi: 'तुअर / अरहर (BDN-711)'
    },
    season: 'Kharif',
    durationDays: 170,
    variety: 'BDN-711 / BSMR-736 / Asha',
    sowingWindow: '20 June - 10 July (20 जून - 10 जुलाई)',
    harvestWindow: '15 Dec - 25 Jan (15 दिसंबर - 25 जनवरी)',
    optimalMoistureMax: 12,
    mspPerQuintal: 7550,
    marketingSeason: 'Kharif Marketing Season (KMS) 2024-25 [Official Benchmark]',
    mspOfficialSource: 'CACP & Ministry of Agriculture & Farmers Welfare, Govt. of India'
  },
  {
    id: 'gram',
    name: {
      en: 'Chickpea / Gram (Vijay)',
      hi: 'चना / हरभरा (विजय)'
    },
    season: 'Rabi',
    durationDays: 105,
    variety: 'Vijay / Digvijay / JG-11',
    sowingWindow: '10 Oct - 15 Nov (10 अक्टूबर - 15 नवंबर)',
    harvestWindow: '1 Feb - 15 March (1 फरवरी - 15 मार्च)',
    optimalMoistureMax: 10,
    mspPerQuintal: 5440,
    marketingSeason: 'Rabi Marketing Season (RMS) 2024-25 (₹5,440) / RMS 2025-26 (₹5,650) [Official Benchmark]',
    mspOfficialSource: 'CACP & Ministry of Agriculture & Farmers Welfare, Govt. of India'
  },
  {
    id: 'wheat',
    name: {
      en: 'Wheat (Lokwan / GW-322)',
      hi: 'गेहूं (शरबती / लोकवन)'
    },
    season: 'Rabi',
    durationDays: 118,
    variety: 'Lokwan / GW-322 / HD-2967',
    sowingWindow: '1 Nov - 25 Nov (1 नवंबर - 25 नवंबर)',
    harvestWindow: '20 Feb - 25 March (20 फरवरी - 25 मार्च)',
    optimalMoistureMax: 12,
    mspPerQuintal: 2425,
    marketingSeason: 'Rabi Marketing Season (RMS) 2025-26 [Official Benchmark]',
    mspOfficialSource: 'CCEA & Ministry of Agriculture & Farmers Welfare, Govt. of India'
  }
];

export const cropCalendarService = {
  getCrops: (): CropInfo[] => {
    return HINGANGHAT_WARDHA_CROPS;
  },

  getCropById: (id: string): CropInfo => {
    const found = HINGANGHAT_WARDHA_CROPS.find(c => c.id === id);
    return found || HINGANGHAT_WARDHA_CROPS[0];
  },

  calculateMaturity: (cropId: string, sowingDateString?: string) => {
    const crop = cropCalendarService.getCropById(cropId);
    
    // Defensive parsing for invalid or empty sowing dates
    let sowing = sowingDateString ? new Date(sowingDateString) : new Date();
    if (isNaN(sowing.getTime())) {
      sowing = new Date();
    }
    
    const today = new Date();
    // Normalize to date-only to eliminate timezone shifts
    sowing.setHours(0, 0, 0, 0);
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const expectedHarvestDate = new Date(sowing.getTime() + crop.durationDays * 86400000);
    const msRemaining = expectedHarvestDate.getTime() - todayNormalized.getTime();
    const rawDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
    
    const daysRemaining = Math.max(0, Math.min(crop.durationDays, rawDaysRemaining));
    const elapsedDays = Math.max(0, Math.min(crop.durationDays, crop.durationDays - daysRemaining));
    const progressRatio = crop.durationDays > 0 ? Math.min(1, Math.max(0, elapsedDays / crop.durationDays)) : 0;

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    let dateHi = '';
    let dateEn = '';

    try {
      dateHi = expectedHarvestDate.toLocaleDateString('hi-IN', options);
      dateEn = expectedHarvestDate.toLocaleDateString('en-IN', options);
    } catch {
      dateHi = `${expectedHarvestDate.getDate()}/${expectedHarvestDate.getMonth() + 1}/${expectedHarvestDate.getFullYear()}`;
      dateEn = dateHi;
    }

    return {
      crop,
      totalDays: crop.durationDays,
      elapsedDays,
      daysRemaining,
      progressRatio,
      expectedHarvestDate,
      expectedDateStrings: {
        en: dateEn,
        hi: dateHi
      }
    };
  }
};
