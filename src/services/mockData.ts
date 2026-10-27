import { 
  CropInfo, WeatherDay, MandiRatePoint, BuyerOffer, PaymentRecord, 
  VillageFarmer, FarmerProfile, BuyerProfile, FarmerListing, AuthSession 
} from '../types';
import { HINGANGHAT_WARDHA_CROPS } from './cropCalendarService';
import { FALLBACK_HINGANGHAT_WEATHER } from './weatherService';
import { HINGANGHAT_APMC_DATA } from './mandiService';

export const INITIAL_CROPS: CropInfo[] = HINGANGHAT_WARDHA_CROPS;
export const INITIAL_WEATHER_7_DAYS: WeatherDay[] = FALLBACK_HINGANGHAT_WEATHER.days;
export const INITIAL_MANDI_HISTORY: MandiRatePoint[] = HINGANGHAT_APMC_DATA.history;

// Multi-User Seed Accounts (Demo Data)
export const SEED_FARMERS: FarmerProfile[] = [
  {
    id: 'farmer-1',
    name: 'Rajesh Deshmukh',
    phone: '9876543210',
    village: 'Hinganghat',
    taluka: 'Hinganghat',
    district: 'Wardha',
    state: 'Maharashtra',
    selectedCropId: 'soybean',
    sowingDate: '2026-07-24',
    grainMoisturePercent: 11.5,
    remindersSms: true,
    remindersWhatsApp: true,
    mspChecklist: {
      landRecord712: true,
      aadhaarLinked: true,
      bankPassbook: true,
      mobileActive: true
    }
  },
  {
    id: 'farmer-2',
    name: 'Ramesh Borkar',
    phone: '9822114433',
    village: 'Wadner',
    taluka: 'Hinganghat',
    district: 'Wardha',
    state: 'Maharashtra',
    selectedCropId: 'cotton',
    sowingDate: '2026-06-28',
    grainMoisturePercent: 8.5,
    remindersSms: true,
    remindersWhatsApp: true,
    mspChecklist: {
      landRecord712: true,
      aadhaarLinked: true,
      bankPassbook: true,
      mobileActive: false
    }
  }
];

export const SEED_BUYERS: BuyerProfile[] = [
  {
    id: 'buyer-1',
    name: 'Rajesh Patel',
    businessName: 'Vidarbha Agro Traders',
    phone: '9823012345',
    city: 'Hinganghat APMC',
    district: 'Wardha',
    apmcLicenseNo: 'APMC-HGT-2022-841',
    gstin: '27AABCV1234F1Z8'
  },
  {
    id: 'buyer-2',
    name: 'Sanjay Choudhary',
    businessName: 'Mahaveer Grains & Oil Mills',
    phone: '9890123456',
    city: 'Kalamna / Wardha',
    district: 'Wardha',
    apmcLicenseNo: 'APMC-WRD-2021-390',
    gstin: '27AAECM5678K1Z2'
  }
];

export const INITIAL_FARMER_LISTINGS: FarmerListing[] = [
  {
    id: 'fl-1',
    farmerId: 'farmer-1',
    farmerName: 'Rajesh Deshmukh',
    phoneMasked: '98765*****',
    phoneFull: '+919876543210',
    village: 'Hinganghat',
    taluka: 'Hinganghat',
    district: 'Wardha',
    cropId: 'soybean',
    variety: 'JS-335 (Bold)',
    originalQuantity: 50,
    quantityQuintals: 50,
    askingPricePerQuintal: 4720,
    listedDate: '14 Oct 2026',
    status: 'active'
  },
  {
    id: 'fl-2',
    farmerId: 'farmer-2',
    farmerName: 'Ramesh Borkar',
    phoneMasked: '98221*****',
    phoneFull: '+919822114433',
    village: 'Wadner',
    taluka: 'Hinganghat',
    district: 'Wardha',
    cropId: 'cotton',
    variety: 'Bt Cotton (Bollgard II)',
    originalQuantity: 35,
    quantityQuintals: 35,
    askingPricePerQuintal: 7250,
    listedDate: '13 Oct 2026',
    status: 'active'
  },
  {
    id: 'fl-3',
    farmerId: 'farmer-3',
    farmerName: 'Savita Deshmukh',
    phoneMasked: '98221*****',
    phoneFull: '+919822114436',
    village: 'Samudrapur',
    taluka: 'Samudrapur',
    district: 'Wardha',
    cropId: 'soybean',
    variety: 'JS-9305',
    originalQuantity: 60,
    quantityQuintals: 60,
    askingPricePerQuintal: 4750,
    listedDate: '14 Oct 2026',
    status: 'active'
  }
];

export const INITIAL_BUYER_OFFERS: BuyerOffer[] = [
  {
    id: 'off-1',
    listingId: 'fl-1',
    farmerId: 'farmer-1',
    buyerId: 'buyer-1',
    buyerName: 'Rajesh Patel',
    buyerBusiness: 'Vidarbha Agro Traders',
    phone: '+919823012345',
    city: 'Hinganghat APMC, Wardha',
    cropName: 'Soybean (JS-335)',
    quantityQuintals: 30,
    offerPricePerQuintal: 4710,
    status: 'pending',
    dateReceived: '14 Oct, 09:30 AM'
  },
  {
    id: 'off-2',
    listingId: 'fl-2',
    farmerId: 'farmer-2',
    buyerId: 'buyer-2',
    buyerName: 'Sanjay Choudhary',
    buyerBusiness: 'Mahaveer Grains',
    phone: '+919890123456',
    city: 'Kalamna / Wardha',
    cropName: 'Cotton (Medium Staple)',
    quantityQuintals: 20,
    offerPricePerQuintal: 7220,
    status: 'pending',
    dateReceived: '14 Oct, 11:15 AM'
  }
];

export const INITIAL_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'pay-1',
    farmerId: 'farmer-1',
    buyerId: 'buyer-1',
    buyerName: 'Vidarbha Agro Traders (Hinganghat APMC)',
    offerId: 'off-prev-1',
    cropName: 'Soybean (JS-335)',
    quantityQuintals: 40,
    ratePerQuintal: 4700,
    grossAmount: 188000,
    dueDate: '2026-10-22',
    isReceived: false, // Strictly unpaid / pending
    labourCost: 3000,
    transportCost: 2000,
    createdAt: '10 Oct 2026'
  },
  {
    id: 'pay-2',
    farmerId: 'farmer-1',
    buyerId: 'buyer-2',
    buyerName: 'Krishna Trading Co (Wardha)',
    offerId: 'off-prev-2',
    cropName: 'Soybean (JS-335)',
    quantityQuintals: 20,
    ratePerQuintal: 4700,
    grossAmount: 94000,
    dueDate: '2026-10-10',
    isReceived: true, // Completed past settlement
    labourCost: 1500,
    transportCost: 1000,
    createdAt: '03 Oct 2026'
  }
];

export const INITIAL_VILLAGE_FARMERS: VillageFarmer[] = [
  { id: 'vf-1', name: 'Ramesh Borkar', phone: '+919822114433', village: 'Wadner, Hinganghat', cropName: 'Soybean', quantityQuintals: 35, qualityGrade: 'Grade A', payoutSharePercentage: 23.3 },
  { id: 'vf-2', name: 'Suresh Waghmare', phone: '+919822114434', village: 'Hinganghat', cropName: 'Soybean', quantityQuintals: 25, qualityGrade: 'Grade A', payoutSharePercentage: 16.7 },
  { id: 'vf-3', name: 'Rajesh Deshmukh', phone: '+919876543210', village: 'Hinganghat', cropName: 'Soybean', quantityQuintals: 30, qualityGrade: 'Grade A', payoutSharePercentage: 20.0, isCurrentUser: true },
  { id: 'vf-4', name: 'Vilas Patil', phone: '+919822114435', village: 'Wadner', cropName: 'Soybean', quantityQuintals: 15, qualityGrade: 'Grade B', payoutSharePercentage: 10.0 },
  { id: 'vf-5', name: 'Savita Deshmukh', phone: '+919822114436', village: 'Samudrapur', cropName: 'Soybean', quantityQuintals: 20, qualityGrade: 'Grade A', payoutSharePercentage: 13.3 },
  { id: 'vf-6', name: 'Ashok Thakre', phone: '+919822114437', village: 'Hinganghat', cropName: 'Soybean', quantityQuintals: 10, qualityGrade: 'Grade B', payoutSharePercentage: 6.7 },
  { id: 'vf-7', name: 'Gajanan Kamble', phone: '+919822114438', village: 'Wadner', cropName: 'Soybean', quantityQuintals: 10, qualityGrade: 'Grade B', payoutSharePercentage: 6.7 },
  { id: 'vf-8', name: 'Pradeep Nikam', phone: '+919822114439', village: 'Hinganghat', cropName: 'Soybean', quantityQuintals: 5, qualityGrade: 'Grade A', payoutSharePercentage: 3.3 }
];

const STORAGE_PREFIX = 'kisansaathi_';

export const storage = {
  // Active Profile
  getProfile: (): FarmerProfile => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}profile`);
      return data ? JSON.parse(data) : SEED_FARMERS[0];
    } catch {
      return SEED_FARMERS[0];
    }
  },
  setProfile: (profile: FarmerProfile): void => {
    localStorage.setItem(`${STORAGE_PREFIX}profile`, JSON.stringify(profile));
  },

  // Active Buyer Profile
  getBuyerProfile: (): BuyerProfile => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}buyer_profile`);
      return data ? JSON.parse(data) : SEED_BUYERS[0];
    } catch {
      return SEED_BUYERS[0];
    }
  },
  setBuyerProfile: (buyer: BuyerProfile): void => {
    localStorage.setItem(`${STORAGE_PREFIX}buyer_profile`, JSON.stringify(buyer));
  },

  // Offers
  getOffers: (): BuyerOffer[] => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}offers`);
      return data ? JSON.parse(data) : INITIAL_BUYER_OFFERS;
    } catch {
      return INITIAL_BUYER_OFFERS;
    }
  },
  setOffers: (offers: BuyerOffer[]): void => {
    localStorage.setItem(`${STORAGE_PREFIX}offers`, JSON.stringify(offers));
  },

  // Payments Ledger
  getPayments: (): PaymentRecord[] => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}payments`);
      return data ? JSON.parse(data) : INITIAL_PAYMENT_RECORDS;
    } catch {
      return INITIAL_PAYMENT_RECORDS;
    }
  },
  setPayments: (payments: PaymentRecord[]): void => {
    localStorage.setItem(`${STORAGE_PREFIX}payments`, JSON.stringify(payments));
  },

  // Village Pool
  getVillageFarmers: (): VillageFarmer[] => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}village_farmers`);
      return data ? JSON.parse(data) : INITIAL_VILLAGE_FARMERS;
    } catch {
      return INITIAL_VILLAGE_FARMERS;
    }
  },
  setVillageFarmers: (farmers: VillageFarmer[]): void => {
    localStorage.setItem(`${STORAGE_PREFIX}village_farmers`, JSON.stringify(farmers));
  },

  // Listings
  getListings: (): FarmerListing[] => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}listings`);
      return data ? JSON.parse(data) : INITIAL_FARMER_LISTINGS;
    } catch {
      return INITIAL_FARMER_LISTINGS;
    }
  },
  setListings: (listings: FarmerListing[]): void => {
    localStorage.setItem(`${STORAGE_PREFIX}listings`, JSON.stringify(listings));
  },

  // Auth Session
  getAuth: (): AuthSession | null => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}auth`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setAuth: (auth: AuthSession): void => {
    localStorage.setItem(`${STORAGE_PREFIX}auth`, JSON.stringify(auth));
  },
  clearAuth: (): void => {
    localStorage.removeItem(`${STORAGE_PREFIX}auth`);
  },

  // Profile setup flag
  isProfileSetupCompleted: (): boolean => {
    return localStorage.getItem(`${STORAGE_PREFIX}profile_setup_done`) === 'true';
  },
  setProfileSetupCompleted: (done: boolean): void => {
    localStorage.setItem(`${STORAGE_PREFIX}profile_setup_done`, done ? 'true' : 'false');
  },

  // Full reset
  resetAll: (): void => {
    localStorage.removeItem(`${STORAGE_PREFIX}profile`);
    localStorage.removeItem(`${STORAGE_PREFIX}buyer_profile`);
    localStorage.removeItem(`${STORAGE_PREFIX}offers`);
    localStorage.removeItem(`${STORAGE_PREFIX}payments`);
    localStorage.removeItem(`${STORAGE_PREFIX}village_farmers`);
    localStorage.removeItem(`${STORAGE_PREFIX}listings`);
    localStorage.removeItem(`${STORAGE_PREFIX}auth`);
    localStorage.removeItem(`${STORAGE_PREFIX}profile_setup_done`);
    localStorage.removeItem('kisansaathi_weather_cache');
  }
};
