import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Store, PackageCheck, Send, CheckCircle2, 
  MapPin, IndianRupee, Sprout, TrendingUp, 
  ShieldCheck, AlertCircle, Clock, X, Phone, 
  MessageSquare, Search, Filter, Truck, Check, 
  ArrowRight, UserCheck, AlertTriangle 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid 
} from 'recharts';
import { FarmerListing, BuyerOffer, BuyerProfile, Language } from '../types';
import { 
  HINGANGHAT_APMC_DATA, 
  COTTON_HINGANGHAT_DATA, 
  COTTON_LONG_HINGANGHAT_DATA 
} from '../services/mandiService';
import { cropCalendarService } from '../services/cropCalendarService';
import { SEED_FARMERS } from '../services/mockData';

export type BuyerSubTab = 'buyer_browse' | 'buyer_offers' | 'buyer_mandi' | 'buyer_clusters' | 'buyer_profile';

interface BuyerPortalScreenProps {
  buyerProfile: BuyerProfile;
  listings: FarmerListing[];
  offers: BuyerOffer[];
  onSubmitOffer: (newOffer: BuyerOffer) => void;
  activeSubTab?: BuyerSubTab;
  onSubTabChange?: (tab: BuyerSubTab) => void;
}

export const BuyerPortalScreen: React.FC<BuyerPortalScreenProps> = ({
  buyerProfile,
  listings,
  offers,
  onSubmitOffer,
  activeSubTab = 'buyer_browse',
  onSubTabChange
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as Language;

  const [localSubTab, setLocalSubTab] = useState<BuyerSubTab>(activeSubTab);
  const currentTab = onSubTabChange ? (activeSubTab || localSubTab) : localSubTab;

  const handleTabSwitch = (tab: BuyerSubTab) => {
    setLocalSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  // Filters for Browse Lots tab
  const [cropFilter, setCropFilter] = useState<'all' | 'soybean' | 'cotton'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Offer Modal State
  const [selectedListing, setSelectedListing] = useState<FarmerListing | null>(null);
  const [offerRate, setOfferRate] = useState<string>('');
  const [offerQty, setOfferQty] = useState<string>('');
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);
  const [offerErrorMsg, setOfferErrorMsg] = useState<string | null>(null);

  // Bulk consignment procurement inquiry feedback
  const [clusterInquirySent, setClusterInquirySent] = useState(false);

  // Filter offers sent by this buyer
  const myOffers = useMemo(() => {
    return offers.filter(o => o.buyerId === buyerProfile.id || o.phone === buyerProfile.phone);
  }, [offers, buyerProfile.id, buyerProfile.phone]);

  // Filter listings based on crop and search
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (cropFilter !== 'all' && item.cropId !== cropFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesFarmer = item.farmerName.toLowerCase().includes(query);
        const matchesVillage = item.village.toLowerCase().includes(query);
        const matchesVariety = item.variety.toLowerCase().includes(query);
        if (!matchesFarmer && !matchesVillage && !matchesVariety) {
          return false;
        }
      }
      return true;
    });
  }, [listings, cropFilter, searchQuery]);

  const handleOpenOfferModal = (listing: FarmerListing) => {
    setSelectedListing(listing);
    setOfferRate(String(listing.askingPricePerQuintal));
    setOfferQty(String(Math.min(listing.quantityQuintals, 25)));
    setOfferSuccessMsg(null);
    setOfferErrorMsg(null);
  };

  const handleSendOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    const rate = parseFloat(offerRate);
    const qty = parseFloat(offerQty);

    if (!rate || rate <= 0 || !qty || qty <= 0) {
      setOfferErrorMsg(currentLang === 'hi' ? 'कृपया मान्य मात्रा (क्विंटल) व दर (₹) दर्ज करें।' : 'Please enter valid quantity (Qtl) and rate (₹).');
      return;
    }
    if (qty > selectedListing.quantityQuintals) {
      setOfferErrorMsg(
        currentLang === 'hi' 
          ? `उपलब्ध स्टॉक से अधिक मात्रा संभव नहीं (अधिकतम ${selectedListing.quantityQuintals} क्विंटल)`
          : `Requested quantity exceeds available stock (Maximum ${selectedListing.quantityQuintals} Quintal)`
      );
      return;
    }

    const cropInfo = cropCalendarService.getCropById(selectedListing.cropId);
    const cropDisplayName = cropInfo.name[currentLang] || cropInfo.name.en;

    const newOffer: BuyerOffer = {
      id: `off-${Date.now()}`,
      listingId: selectedListing.id,
      farmerId: selectedListing.farmerId,
      buyerId: buyerProfile.id,
      buyerName: buyerProfile.name.split(' (')[0],
      buyerBusiness: buyerProfile.businessName,
      phone: buyerProfile.phone,
      city: buyerProfile.city,
      cropName: `${cropDisplayName} (${selectedListing.variety})`,
      quantityQuintals: qty,
      offerPricePerQuintal: rate,
      status: 'pending',
      dateReceived: currentLang === 'hi' ? 'अभी-अभी' : 'Just now'
    };

    onSubmitOffer(newOffer);
    setOfferSuccessMsg(
      currentLang === 'hi'
        ? `${qty} क्विंटल के लिए ₹${rate}/क्विंटल का खरीद प्रस्ताव किसान को सफलतापूर्वक भेजा गया!`
        : `Purchase offer for ${qty} Qtl @ ₹${rate}/Qtl sent successfully to farmer!`
    );

    setTimeout(() => {
      setSelectedListing(null);
      setOfferSuccessMsg(null);
      setOfferErrorMsg(null);
    }, 2000);
  };

  // Helper to find raw contact phone of farmer
  const getFarmerPhone = (farmerId: string) => {
    const f = SEED_FARMERS.find(farmer => farmer.id === farmerId);
    return f ? f.phone : '9876543210';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Verified Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 text-[12px] font-bold mb-2">
            <Store size={14} />
            <span>{t('buyer.verifiedBadge')}</span>
          </div>
          <h2 className="gov-section-title">{t('buyer.title')}</h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400">
            {t('buyer.subtitle')}
          </p>
        </div>

        {/* Buyer Verified Identity Card */}
        <div className="flex items-center gap-3 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl shrink-0">
          <ShieldCheck size={24} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="text-[13px]">
            <span className="font-bold text-gov-navy dark:text-slate-100 block">
              {buyerProfile.businessName}
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              {t('buyer.license')}: {buyerProfile.apmcLicenseNo || 'APMC-HGT-2022'} • {buyerProfile.city}
            </span>
          </div>
        </div>
      </div>

      {/* Demo Benchmark Data Notice */}
      <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between gap-2.5 text-[12px] text-amber-950 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-gov-gold shrink-0" />
          <span>
            <strong>[DEMO BENCHMARK DATA]:</strong> {t('buyer.demoNotice')}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-[11px] shrink-0">
          APMC Hinganghat
        </span>
      </div>

      {/* 2. Sub-Tab Switcher (Browse Lots | My Bids & Orders | APMC Mandi | Village Clusters | Profile) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 sm:gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => handleTabSwitch('buyer_browse')}
          className={`py-2.5 px-3 sm:px-4 font-bold text-[14px] sm:text-[15px] border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            currentTab === 'buyer_browse'
              ? 'border-gov-navy text-gov-navy dark:text-white dark:border-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Store size={17} />
          <span>{t('buyer.tabs.browse')} ({listings.filter(l => l.quantityQuintals > 0).length})</span>
        </button>

        <button
          onClick={() => handleTabSwitch('buyer_offers')}
          className={`py-2.5 px-3 sm:px-4 font-bold text-[14px] sm:text-[15px] border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            currentTab === 'buyer_offers'
              ? 'border-gov-navy text-gov-navy dark:text-white dark:border-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PackageCheck size={17} />
          <span>{t('buyer.tabs.bids')} ({myOffers.length})</span>
        </button>

        <button
          onClick={() => handleTabSwitch('buyer_mandi')}
          className={`py-2.5 px-3 sm:px-4 font-bold text-[14px] sm:text-[15px] border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            currentTab === 'buyer_mandi'
              ? 'border-gov-navy text-gov-navy dark:text-white dark:border-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp size={17} />
          <span>{t('buyer.tabs.mandi')}</span>
        </button>

        <button
          onClick={() => handleTabSwitch('buyer_clusters')}
          className={`py-2.5 px-3 sm:px-4 font-bold text-[14px] sm:text-[15px] border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            currentTab === 'buyer_clusters'
              ? 'border-gov-navy text-gov-navy dark:text-white dark:border-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Truck size={17} />
          <span>{t('buyer.tabs.clusters')}</span>
        </button>

        <button
          onClick={() => handleTabSwitch('buyer_profile')}
          className={`py-2.5 px-3 sm:px-4 font-bold text-[14px] sm:text-[15px] border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            currentTab === 'buyer_profile'
              ? 'border-gov-navy text-gov-navy dark:text-white dark:border-blue-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck size={17} />
          <span>{t('buyer.tabs.profile')}</span>
        </button>
      </div>

      {/* 3. SUB-TAB 1: BROWSE FARMGATE LOTS */}
      {currentTab === 'buyer_browse' && (
        <div className="space-y-5">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Crop Type Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setCropFilter('all')}
                className={`px-3.5 py-1.5 text-[13px] font-bold rounded-lg transition-all ${
                  cropFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-gov-navy dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t('buyer.browse.filterAll')}
              </button>
              <button
                onClick={() => setCropFilter('soybean')}
                className={`px-3.5 py-1.5 text-[13px] font-bold rounded-lg transition-all ${
                  cropFilter === 'soybean'
                    ? 'bg-white dark:bg-slate-900 text-gov-green dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t('buyer.browse.filterSoybean')}
              </button>
              <button
                onClick={() => setCropFilter('cotton')}
                className={`px-3.5 py-1.5 text-[13px] font-bold rounded-lg transition-all ${
                  cropFilter === 'cotton'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t('buyer.browse.filterCotton')}
              </button>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('buyer.browse.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-1.5 text-[13px] rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-gov-green focus:outline-none"
              />
            </div>
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="gov-card p-10 text-center space-y-3">
              <Store size={40} className="mx-auto text-slate-400" />
              <p className="font-bold text-slate-600 dark:text-slate-300">{t('buyer.browse.noLots')}</p>
              <button
                onClick={() => { setCropFilter('all'); setSearchQuery(''); }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[13px] font-bold rounded-lg"
              >
                {currentLang === 'hi' ? 'सभी फिल्टर हटाएं' : 'Clear Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((item) => {
                const isAvailable = item.quantityQuintals > 0;
                const cropInfo = cropCalendarService.getCropById(item.cropId);
                const cleanCropName = item.cropId === 'soybean' 
                  ? (currentLang === 'hi' ? 'सोयाबीन' : 'Soybean')
                  : item.cropId === 'cotton'
                  ? (currentLang === 'hi' ? 'कपास' : 'Cotton')
                  : (cropInfo.name[currentLang] || cropInfo.name.en);
                const rawPhone = getFarmerPhone(item.farmerId);

                return (
                  <div 
                    key={item.id} 
                    className={`gov-card p-5 space-y-4 flex flex-col justify-between transition-all ${
                      !isAvailable ? 'opacity-60 bg-slate-50 dark:bg-slate-900' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Farmer and Location */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-[17px] text-gov-navy dark:text-white block leading-tight truncate">
                            {item.farmerName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-1">
                            <MapPin size={13} className="text-gov-gold shrink-0" />
                            <span className="truncate">{item.village}, {item.district}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full shrink-0 ${
                          isAvailable 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {isAvailable ? t('buyer.browse.verifiedLot') : t('buyer.browse.soldOut')}
                        </span>
                      </div>

                      {/* Lot Specifications Box */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 text-[13px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">{t('buyer.browse.crop')}:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-right truncate">
                            {cleanCropName} <span className="text-[12px] font-normal text-slate-500">({item.variety})</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">{t('buyer.browse.quantity')}:</span>
                          <span className="font-bold text-slate-900 dark:text-white font-serif text-[15px] text-right">
                            {item.quantityQuintals} <span className="text-[12px] font-normal text-slate-500">{t('common.quintal')}</span>
                            <span className="text-[11px] text-slate-400 font-normal ml-1">({item.originalQuantity} Q)</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                          <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">{t('buyer.browse.askingRate')}:</span>
                          <span className="font-bold text-gov-green dark:text-emerald-400 font-serif text-[17px] text-right">
                            ₹{item.askingPricePerQuintal.toLocaleString('en-IN')} <span className="text-[12px] font-normal text-slate-500">/{t('common.quintal')}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Offer Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      {/* Direct Call & WhatsApp row */}
                      <div className="grid grid-cols-2 gap-2 text-[12px]">
                        <a
                          href={`tel:${rawPhone}`}
                          className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          title={`Call ${item.farmerName}`}
                        >
                          <Phone size={14} className="text-gov-green shrink-0" />
                          <span className="truncate">{t('buyer.browse.callFarmer')}</span>
                        </a>
                        <a
                          href={`https://wa.me/91${rawPhone}?text=${encodeURIComponent(`Hello ${item.farmerName}, I am ${buyerProfile.businessName} contacting you via Kisan Saathi regarding your lot of ${cleanCropName} (${item.variety}).`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          title={`WhatsApp ${item.farmerName}`}
                        >
                          <MessageSquare size={14} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{t('buyer.browse.whatsappFarmer')}</span>
                        </a>
                      </div>

                      {/* Primary Send Offer Button */}
                      {isAvailable ? (
                        <button
                          data-testid="send-offer-btn"
                          onClick={() => handleOpenOfferModal(item)}
                          className="w-full touch-target py-2.5 px-4 bg-gov-navy hover:bg-gov-navy-light text-white font-bold text-[14px] rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={15} className="shrink-0" />
                          <span className="truncate">{t('buyer.browse.sendOffer')}</span>
                        </button>
                      ) : (
                        <div className="py-2 text-center text-[13px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          {t('buyer.browse.soldOutNotice')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. SUB-TAB 2: MY BIDS & PURCHASE ORDERS */}
      {currentTab === 'buyer_offers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-serif text-[19px] font-bold text-gov-navy dark:text-white">
                {t('buyer.myBids.title')}
              </h3>
              <p className="text-[13px] text-slate-500">
                {t('buyer.myBids.subtitle')}
              </p>
            </div>
            <span className="text-[13px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">
              {t('buyer.myBids.totalBids')}: {myOffers.length}
            </span>
          </div>

          {myOffers.length === 0 ? (
            <div className="gov-card p-10 text-center space-y-3">
              <PackageCheck size={40} className="mx-auto text-slate-400" />
              <p className="font-bold text-slate-600 dark:text-slate-300">{t('buyer.myBids.empty')}</p>
              <button
                onClick={() => handleTabSwitch('buyer_browse')}
                className="px-5 py-2.5 bg-gov-navy text-white text-[14px] font-bold rounded-xl shadow-sm hover:bg-gov-navy-light"
              >
                {t('buyer.myBids.browseAction')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myOffers.map((off) => {
                const totalVal = off.quantityQuintals * off.offerPricePerQuintal;
                const isAccepted = off.status === 'accepted';
                const isDeclined = off.status === 'declined';
                const rawPhone = getFarmerPhone(off.farmerId);

                return (
                  <div 
                    key={off.id} 
                    className={`gov-card p-5 transition-all ${
                      isAccepted
                        ? 'border-2 border-emerald-400 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm'
                        : isDeclined
                        ? 'opacity-65 bg-slate-50 dark:bg-slate-900 border-slate-200'
                        : 'border border-blue-200 dark:border-blue-900/60'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left: Crop & Offer Details */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[17px] text-gov-navy dark:text-white">
                            {off.cropName}
                          </span>
                          <span className="font-mono text-[12px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            ID: {off.id}
                          </span>
                          
                          {/* Status Badge */}
                          {isAccepted && (
                            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 rounded-full flex items-center gap-1">
                              <Check size={13} />
                              <span>{t('buyer.myBids.statusAccepted')}</span>
                            </span>
                          )}
                          {isDeclined && (
                            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full flex items-center gap-1">
                              <X size={13} />
                              <span>{t('buyer.myBids.statusDeclined')}</span>
                            </span>
                          )}
                          {off.status === 'pending' && (
                            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-full flex items-center gap-1">
                              <Clock size={13} />
                              <span>{t('buyer.myBids.statusPending')}</span>
                            </span>
                          )}
                        </div>

                        {/* Financial and Quantity Metrics */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-600 dark:text-slate-300">
                          <span>{t('buyer.myBids.quantity')}: <strong>{off.quantityQuintals} {t('common.quintal')}</strong></span>
                          <span>•</span>
                          <span>{t('buyer.myBids.offeredRate')}: <strong>₹{off.offerPricePerQuintal.toLocaleString('en-IN')}/{t('common.quintal')}</strong></span>
                          <span>•</span>
                          <span>{t('buyer.myBids.totalValue')}: <strong className="text-gov-green dark:text-emerald-400 font-serif text-[15px]">₹{totalVal.toLocaleString('en-IN')}</strong></span>
                          <span>•</span>
                          <span className="text-slate-400">{off.dateReceived}</span>
                        </div>
                      </div>

                      {/* Right: Actions / Gate Pickup Instructions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                        <a
                          href={`tel:${rawPhone}`}
                          className="py-2 px-3 text-[12px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone size={13} className="text-gov-green" />
                          <span>{t('buyer.browse.callFarmer')}</span>
                        </a>

                        <a
                          href={`https://wa.me/91${rawPhone}?text=${encodeURIComponent(`Hello, regarding Offer ${off.id} for ${off.quantityQuintals} Quintal of ${off.cropName}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 text-[12px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageSquare size={13} />
                          <span>{t('buyer.browse.whatsappFarmer')}</span>
                        </a>
                      </div>
                    </div>

                    {/* Gate Pickup Notice for Accepted Bids (Physical Verification at Dharmkanta) */}
                    {isAccepted && (
                      <div className="mt-3.5 p-3 bg-emerald-100/70 dark:bg-emerald-950/60 rounded-xl text-emerald-950 dark:text-emerald-200 text-[13px] border border-emerald-300 dark:border-emerald-800 flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>{t('buyer.myBids.deliveryInfo')}</strong>
                          <p className="text-[12px] opacity-90 mt-0.5">
                            {currentLang === 'hi' 
                              ? `किसान ने इस प्रस्ताव को स्वीकार कर लिया है। ${off.quantityQuintals} क्विंटल का स्टॉक आरक्षित कर दिया गया है। हिंगणघाट एपीएमसी धर्मकांटा या खेत पर पहुंचकर तौल व गुणवत्ता परीक्षण उपरांत भुगतान पूरा करें।`
                              : `Farmer has accepted this bid. Inventory of ${off.quantityQuintals} Qtl is reserved. Proceed to Hinganghat APMC gate weighing scale (Dharmkanta) or farmgate for weighing and quality testing.`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 3: APMC MANDI INTELLIGENCE & PRICE TREND GRAPH */}
      {currentTab === 'buyer_mandi' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-serif text-[19px] font-bold text-gov-navy dark:text-white">
                {t('buyer.mandiTab.title')}
              </h3>
              <p className="text-[13px] text-slate-500">
                {t('buyer.mandiTab.subtitle')}
              </p>
            </div>
            <span className="text-[12px] font-bold bg-blue-100 text-blue-900 px-3 py-1 rounded-full self-start sm:self-auto">
              Hinganghat APMC Benchmark
            </span>
          </div>

          {/* 3 Metric Cards: Soybean, Cotton Medium, Cotton Long */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Soybean Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[13px] font-bold text-slate-500 block uppercase">
                {currentLang === 'hi' ? 'सोयाबीन (JS-335)' : 'Soybean (JS-335)'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[28px] font-bold text-gov-navy dark:text-white">
                  ₹{HINGANGHAT_APMC_DATA.currentRate}
                </span>
                <span className="text-[13px] text-slate-500">/{t('common.quintal')}</span>
              </div>
              <div className="text-[12px] text-slate-600 dark:text-slate-300 space-y-1">
                <div>{t('buyer.mandiTab.mspBenchmark')}: <strong>₹{HINGANGHAT_APMC_DATA.mspRate}</strong></div>
                <div className="text-red-600 dark:text-red-400 font-semibold">
                  {currentLang === 'hi' ? 'बाजार भाव MSP से ₹212 नीचे' : '₹212 below Official MSP floor'}
                </div>
              </div>
            </div>

            {/* Cotton Medium Staple Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[13px] font-bold text-slate-500 block uppercase">
                {currentLang === 'hi' ? 'कपास मध्यम स्टेपल' : 'Cotton (Medium Staple)'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[28px] font-bold text-gov-navy dark:text-white">
                  ₹{COTTON_HINGANGHAT_DATA.currentRate}
                </span>
                <span className="text-[13px] text-slate-500">/{t('common.quintal')}</span>
              </div>
              <div className="text-[12px] text-slate-600 dark:text-slate-300 space-y-1">
                <div>{t('buyer.mandiTab.mspBenchmark')}: <strong>₹{COTTON_HINGANGHAT_DATA.mspRate}</strong></div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {currentLang === 'hi' ? 'बाजार भाव MSP से ₹129 अधिक' : '₹129 above Official MSP floor'}
                </div>
              </div>
            </div>

            {/* Cotton Long Staple Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[13px] font-bold text-slate-500 block uppercase">
                {currentLang === 'hi' ? 'कपास लंबा स्टेपल' : 'Cotton (Long Staple)'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[28px] font-bold text-gov-navy dark:text-white">
                  ₹{COTTON_LONG_HINGANGHAT_DATA.currentRate}
                </span>
                <span className="text-[13px] text-slate-500">/{t('common.quintal')}</span>
              </div>
              <div className="text-[12px] text-slate-600 dark:text-slate-300 space-y-1">
                <div>{t('buyer.mandiTab.mspBenchmark')}: <strong>₹{COTTON_LONG_HINGANGHAT_DATA.mspRate}</strong></div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {currentLang === 'hi' ? 'बाजार भाव MSP से ₹59 अधिक' : '₹59 above Official MSP floor'}
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day APMC Trend Chart vs Government MSP Floor */}
          <div className="gov-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-serif font-bold text-[17px] text-gov-navy dark:text-white">
                  {currentLang === 'hi' ? '7-दिवसीय APMC मॉडल दर बनाम शासकीय MSP (सोयाबीन)' : '7-Day APMC Modal Rate vs Official MSP Floor (Soybean)'}
                </h4>
                <p className="text-[12px] text-slate-500">
                  {currentLang === 'hi' ? 'दैनिक नीलामी मॉडल भाव और MSP बेंचमार्क रेखा' : 'Daily Hinganghat APMC auction modal rate trend against MSP benchmark line'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span>APMC Modal Rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-emerald-600" />
                  <span>Govt MSP (₹4,892)</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HINGANGHAT_APMC_DATA.trend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#888888" />
                  <YAxis domain={[4400, 5100]} tick={{ fontSize: 12 }} stroke="#888888" />
                  <Tooltip 
                    formatter={(val: any) => [`₹${val}`, 'Rate']}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <ReferenceLine 
                    y={HINGANGHAT_APMC_DATA.mspRate} 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    strokeDasharray="4 4" 
                    label={{ value: 'MSP Floor (₹4,892)', fill: '#16a34a', fontSize: 11, position: 'insideBottomRight' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2563eb' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB 4: VILLAGE AGGREGATION CONSIGNMENTS */}
      {currentTab === 'buyer_clusters' && (
        <div className="space-y-5">
          <div className="gov-card p-6 border-t-4 border-t-[#B8892B] space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 text-[12px] font-bold mb-2">
                <Truck size={14} />
                <span>{currentLang === 'hi' ? '200 क्विंटल ग्राम सामूहिक लॉट' : '200 Quintal Village Aggregated Consignment'}</span>
              </div>
              <h3 className="font-serif text-[22px] font-bold text-gov-navy dark:text-white">
                {t('buyer.clustersTab.title')}
              </h3>
              <p className="text-[14px] text-slate-500 dark:text-slate-400">
                {t('buyer.clustersTab.subtitle')}
              </p>
            </div>

            {/* Progress Bar for 200 Quintals Target */}
            <div className="space-y-2">
              <div className="flex justify-between text-[13px] font-bold">
                <span className="text-gov-navy dark:text-slate-200">
                  {t('buyer.clustersTab.pooledSoFar')}: <strong>150 Quintal</strong> (8 Farmers)
                </span>
                <span className="text-gov-gold">
                  {t('buyer.clustersTab.targetMilestone')}
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#B8892B] to-emerald-600 rounded-full transition-all duration-500" 
                  style={{ width: '75%' }} 
                />
              </div>
              <div className="flex justify-between text-[12px] text-slate-500">
                <span>75% Consignment Readiness</span>
                <span>Scheduled Bulk Gate Weighing: 24 October</span>
              </div>
            </div>

            {/* Logistics Savings Box */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5 text-[13px]">
              <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{t('buyer.clustersTab.logisticsSaving')}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[12px] leading-relaxed">
                {currentLang === 'hi' 
                  ? 'गाँव के साझा केंद्र पर 10-पहिया ट्रक सीधे भेजकर 30% भाड़ा व लोडिंग शुल्क बचाया जा सकता है। समन्वयक: विलास पाटिल (हिंगणघाट क्लस्टर)।'
                  : 'Direct single-point procurement via 10-wheeler truck avoids multiple mandi transit and handling charges. Cluster Coordinator: Vilas Patil (Hinganghat Cluster).'}
              </p>
            </div>

            {/* Action Button */}
            {clusterInquirySent ? (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-[14px] font-bold text-center border border-emerald-300 animate-in fade-in">
                ✓ {currentLang === 'hi' ? 'थोक उठाव अनुरोध क्लस्टर समन्वयक विलास पाटिल को भेज दिया गया है!' : 'Bulk procurement dispatch inquiry sent to Cluster Coordinator Vilas Patil!'}
              </div>
            ) : (
              <button
                onClick={() => setClusterInquirySent(true)}
                className="w-full touch-target py-3.5 px-6 bg-gradient-to-r from-gov-navy to-slate-900 hover:from-slate-800 hover:to-gov-navy text-white font-bold text-[16px] rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all"
              >
                <Truck size={18} />
                <span>{t('buyer.clustersTab.procureConsignment')}</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 7. SUB-TAB 5: BUYER PROFILE & APMC STATUTORY DETAILS */}
      {currentTab === 'buyer_profile' && (
        <div className="space-y-5">
          <div className="gov-card p-6 border-t-4 border-t-blue-600 space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-[22px] font-bold text-gov-navy dark:text-white">
                  {t('buyer.profileTab.title')}
                </h3>
                <p className="text-[13px] text-slate-500">
                  {t('buyer.profileTab.subtitle')}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-[12px] font-bold rounded-full flex items-center gap-1.5">
                <Check size={14} />
                <span>APMC Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-[12px] text-slate-500 block">{t('buyer.profileTab.businessName')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">{buyerProfile.businessName}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-[12px] text-slate-500 block">{t('buyer.profileTab.traderName')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">{buyerProfile.name}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-[12px] text-slate-500 block">{t('buyer.profileTab.phone')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">+91 {buyerProfile.phone}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-[12px] text-slate-500 block">{t('buyer.profileTab.location')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">{buyerProfile.city}, Wardha District</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-[12px] text-slate-500 block">{t('buyer.profileTab.licenseNo')}</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200 text-[15px]">{buyerProfile.apmcLicenseNo || 'APMC-HGT-2022-89B'}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-[12px] text-slate-500 block">{t('buyer.profileTab.gstin')}</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200 text-[15px]">27AABCV8942K1ZP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. SEND PURCHASE OFFER MODAL */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSendOfferSubmit}
            className="gov-card p-6 border-t-4 border-t-gov-navy max-w-lg w-full space-y-4 animate-in zoom-in-95 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-[19px] font-bold text-gov-navy dark:text-white">
                  {t('buyer.modal.title')}
                </h3>
                <p className="text-[13px] text-slate-500">
                  {t('buyer.modal.farmer')}: <strong>{selectedListing.farmerName}</strong> • {selectedListing.village}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {offerErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-xl text-[13px] font-semibold flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <span>{offerErrorMsg}</span>
              </div>
            )}

            {offerSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2 text-[14px] font-semibold">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{offerSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Listing summary */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[13px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('buyer.modal.crop')}:</span>
                  <span className="font-bold">
                    {cropCalendarService.getCropById(selectedListing.cropId).name[currentLang] || cropCalendarService.getCropById(selectedListing.cropId).name.en} ({selectedListing.variety})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('buyer.modal.available')}:</span>
                  <span className="font-bold font-serif">{selectedListing.quantityQuintals} {t('common.quintal')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">{t('buyer.modal.askingRate')}:</span>
                  <span className="font-bold font-serif text-gov-green">₹{selectedListing.askingPricePerQuintal.toLocaleString('en-IN')} /{t('common.quintal')}</span>
                </div>
              </div>

              {/* Input: Offer Quantity & Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    {t('buyer.modal.enterQty')}
                  </label>
                  <input
                    type="number"
                    max={selectedListing.quantityQuintals}
                    min={1}
                    value={offerQty}
                    onChange={(e) => setOfferQty(e.target.value)}
                    className="w-full px-3 py-2 text-[17px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-gov-green focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    {t('buyer.modal.enterRate')}
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={offerRate}
                    onChange={(e) => setOfferRate(e.target.value)}
                    className="w-full px-3 py-2 text-[17px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-gov-green focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Estimated Total Calculation */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex justify-between items-center text-[13px] border border-blue-200 dark:border-blue-900">
                <span className="text-blue-900 dark:text-blue-200 font-semibold">{t('buyer.modal.totalVal')}:</span>
                <span className="font-serif font-bold text-[18px] text-gov-navy dark:text-white">
                  ₹{((parseFloat(offerQty) || 0) * (parseFloat(offerRate) || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-[14px]"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                data-testid="modal-submit-offer-btn"
                className="flex-1 py-2.5 bg-gov-navy hover:bg-gov-navy-light text-white font-bold rounded-xl text-[14px] flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send size={15} />
                <span>{t('buyer.modal.submitOffer')}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
