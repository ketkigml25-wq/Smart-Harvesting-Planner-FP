export type Language = 'en' | 'hi';

export type UserRole = 'farmer' | 'buyer';

export interface CropInfo {
  id: string;
  name: {
    en: string;
    hi: string;
  };
  season: 'Kharif' | 'Rabi' | 'Zaid';
  durationDays: number;
  variety: string;
  sowingWindow: string;
  harvestWindow: string;
  optimalMoistureMax: number;
  mspPerQuintal: number;
  stapleType?: 'Medium Staple' | 'Long Staple';
  marketingSeason: string;
  mspOfficialSource: string;
}

export interface WeatherDay {
  dayName: {
    en: string;
    hi: string;
  };
  date: string;
  rainChance: number;
  precipitationMm?: number;
  tempMax: number;
  tempMin: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'storm';
  signal: 'green' | 'amber' | 'red';
  signalAdvice: {
    en: string;
    hi: string;
  };
}

export interface WeatherDataPayload {
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  dataSource: string;
  lastUpdated: string;
  isLive: boolean;
  days: WeatherDay[];
}

export interface MandiRatePoint {
  day: string;
  price: number;
  msp: number;
  market: string;
  commodity: string;
  variety: string;
  arrivalTons?: number;
}

export interface MandiDataPayload {
  marketName: string;
  district: string;
  state: string;
  commodity: string;
  variety: string;
  currentRate: number;
  mspRate: number;
  marketingSeason: string;
  officialSource: string;
  lastUpdated: string;
  history: MandiRatePoint[];
}

export interface BuyerProfile {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  city: string;
  district: string;
  apmcLicenseNo?: string;
  gstin?: string;
}

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  selectedCropId: string;
  sowingDate: string;
  grainMoisturePercent: number;
  remindersSms: boolean;
  remindersWhatsApp: boolean;
  mspChecklist: {
    landRecord712: boolean;
    aadhaarLinked: boolean;
    bankPassbook: boolean;
    mobileActive: boolean;
  };
}

export interface FarmerListing {
  id: string;
  farmerId: string;
  farmerName: string;
  phoneMasked: string;
  phoneFull: string;
  village: string;
  taluka: string;
  district: string;
  cropId: string;
  variety: string;
  originalQuantity: number;
  quantityQuintals: number; // Available inventory
  askingPricePerQuintal: number;
  listedDate: string;
  status: 'active' | 'sold_out' | 'paused';
}

export interface BuyerOffer {
  id: string;
  listingId: string;
  farmerId: string;
  buyerId: string;
  buyerName: string;
  buyerBusiness: string;
  phone: string;
  city: string;
  cropName: string;
  quantityQuintals: number;
  offerPricePerQuintal: number;
  status: 'pending' | 'accepted' | 'declined';
  dateReceived: string;
}

export interface PaymentRecord {
  id: string;
  farmerId: string;
  buyerId?: string;
  buyerName: string;
  offerId?: string;
  cropName?: string;
  quantityQuintals?: number;
  ratePerQuintal?: number;
  grossAmount: number;
  dueDate: string;
  isReceived: boolean; // Must remain false until explicitly marked
  labourCost: number;
  transportCost: number;
  createdAt: string;
}

export interface VillageFarmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  cropName: string;
  quantityQuintals: number;
  qualityGrade: 'Grade A' | 'Grade B';
  payoutSharePercentage: number;
  isCurrentUser?: boolean;
}

export interface AuthSession {
  isAuthenticated: boolean;
  role: UserRole;
  userId: string;
  phone: string;
  name: string;
}


