import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, ReferenceLine, CartesianGrid 
} from 'recharts';
import { 
  CheckSquare, Square, TrendingDown, TrendingUp, PhoneCall, 
  Check, X, PlusCircle, Info, Calculator, CheckCircle, FileText, MessageSquare 
} from 'lucide-react';
import { mandiService } from '../services/mandiService';
import { cropCalendarService } from '../services/cropCalendarService';
import { marketplaceService } from '../services/marketplaceService';
import { BuyerOffer, PaymentRecord, FarmerProfile, FarmerListing, Language } from '../types';

interface SellDirectlyScreenProps {
  profile: FarmerProfile;
  listings: FarmerListing[];
  offers: BuyerOffer[];
  payments: PaymentRecord[];
  onUpdateListings: (listings: FarmerListing[]) => void;
  onUpdateOffers: (offers: BuyerOffer[]) => void;
  onUpdatePayments: (payments: PaymentRecord[]) => void;
  onUpdateProfile: (profile: FarmerProfile) => void;
}

export const SellDirectlyScreen: React.FC<SellDirectlyScreenProps> = ({
  profile,
  listings,
  offers,
  payments,
  onUpdateListings,
  onUpdateOffers,
  onUpdatePayments,
  onUpdateProfile
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as Language;

  // New listing inputs
  const [listQuantity, setListQuantity] = useState<string>('50');
  const [listRate, setListRate] = useState<string>('4750');
  const [listSuccess, setListSuccess] = useState<boolean>(false);
  const [offerAcceptSuccess, setOfferAcceptSuccess] = useState<string | null>(null);

  // MSP Checklist status
  const checklist = profile.mspChecklist;
  const completedCount = Object.values(checklist).filter(Boolean).length;

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    const updated = {
      ...profile,
      mspChecklist: {
        ...checklist,
        [key]: !checklist[key]
      }
    };
    onUpdateProfile(updated);
  };

  // Farmer creates a new listing
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(listQuantity);
    const rate = parseFloat(listRate);
    if (!qty || qty <= 0 || !rate || rate <= 0) {
      alert(currentLang === 'hi' ? 'कृपया मान्य मात्रा (क्विंटल) व दर (₹) दर्ज करें।' : 'Please enter valid quantity (Quintals) and rate (₹).');
      return;
    }

    const cropInfo = cropCalendarService.getCropById(profile.selectedCropId);

    const newListing: FarmerListing = {
      id: `fl-${Date.now()}`,
      farmerId: profile.id,
      farmerName: profile.name.split(' (')[0],
      phoneMasked: profile.phone.slice(0, 5) + '*****',
      phoneFull: '+91' + profile.phone,
      village: profile.village,
      taluka: profile.taluka,
      district: profile.district,
      cropId: profile.selectedCropId,
      variety: cropInfo.variety,
      originalQuantity: qty,
      quantityQuintals: qty,
      askingPricePerQuintal: rate,
      listedDate: '16 Oct 2026',
      status: 'active'
    };

    const updatedListings = marketplaceService.createListing(newListing, listings);
    onUpdateListings(updatedListings);
    setListSuccess(true);
    setTimeout(() => setListSuccess(false), 4000);
  };

  // Farmer accepts an offer -> safe inventory deduction & payment ledger record creation
  const handleAcceptOffer = (offer: BuyerOffer) => {
    const result = marketplaceService.acceptOffer(offer.id, listings, offers, payments);
    if (result.error || !result.acceptedOffer) {
      alert(result.error || (currentLang === 'hi' ? 'प्रस्ताव स्वीकार करने में त्रुटि हुई।' : 'Error accepting offer.'));
      return;
    }

    onUpdateListings(result.updatedListings);
    onUpdateOffers(result.updatedOffers);
    onUpdatePayments(result.updatedPayments);

    setOfferAcceptSuccess(
      currentLang === 'hi'
        ? `${offer.buyerName} का ${offer.quantityQuintals} क्विंटल का प्रस्ताव स्वीकार कर लिया गया! स्टॉक वजा हो गया है और भुगतान लेजर में प्रविष्टि दर्ज हो गई है।`
        : `Offer from ${offer.buyerName} for ${offer.quantityQuintals} Quintal accepted! Stock decremented and payment ledger updated.`
    );
    setTimeout(() => setOfferAcceptSuccess(null), 5000);
  };

  // Farmer declines an offer
  const handleDeclineOffer = (offerId: string) => {
    const updated = marketplaceService.declineOffer(offerId, offers);
    onUpdateOffers(updated);
  };

  // Manual payment received toggle (STRICTLY MANUAL)
  const handleTogglePaymentReceived = (paymentId: string) => {
    const updated = payments.map(p => 
      p.id === paymentId ? { ...p, isReceived: !p.isReceived } : p
    );
    onUpdatePayments(updated);
  };

  // Active crop-aware mandi data
  const mandiData = mandiService.getMandiData(profile.selectedCropId);
  const todayRate = mandiData.currentRate;
  const mspRate = mandiData.mspRate;
  const isBelowMsp = todayRate < mspRate;
  const priceDiff = Math.abs(todayRate - mspRate);

  // Filter offers received for this farmer
  const farmerOffers = offers.filter(o => o.farmerId === profile.id || !o.farmerId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="gov-section-title">{t('sell.title')}</h2>
        <p className="text-[14px] text-slate-500 dark:text-slate-400">
          {t('sell.subtitle')}
        </p>
      </div>

      {/* Offer Accept Alert */}
      {offerAcceptSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-200 rounded-xl flex items-center gap-3 shadow-md animate-in slide-in-from-top-2">
          <CheckCircle size={22} className="text-emerald-600 shrink-0" />
          <span className="font-semibold text-[15px]">{offerAcceptSuccess}</span>
        </div>
      )}

      {/* 1. MSP Registration Checklist Card */}
      <div className="gov-card p-5 border-l-4 border-l-gov-gold space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-gov-gold" />
              <h3 className="font-serif text-[18px] font-bold text-gov-navy dark:text-white">
                {t('sell.mspChecklistTitle')}
              </h3>
            </div>
            <p className="text-[13px] text-amber-800 dark:text-amber-300 font-semibold mt-0.5">
              ⚠️ {t('sell.mspNotice')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
              {completedCount}/4 {t('sell.checklistProgress')}
            </span>
            <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  completedCount === 4 ? 'bg-emerald-600' : 'bg-gov-gold'
                }`}
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'landRecord712' as const, label: t('sell.checklistItems.landRecord') },
            { key: 'aadhaarLinked' as const, label: t('sell.checklistItems.aadhaar') },
            { key: 'bankPassbook' as const, label: t('sell.checklistItems.bankPassbook') },
            { key: 'mobileActive' as const, label: t('sell.checklistItems.mobile') },
          ].map((item) => {
            const isChecked = checklist[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggleChecklist(item.key)}
                className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                  isChecked
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-gov-navy dark:text-emerald-100'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isChecked ? (
                  <CheckSquare size={20} className="text-emerald-600 shrink-0" />
                ) : (
                  <Square size={20} className="text-slate-400 shrink-0" />
                )}
                <span className={`text-[14px] ${isChecked ? 'font-semibold' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5 text-[12px] text-amber-900 dark:text-amber-300">
          <Info size={16} className="text-gov-gold shrink-0 mt-0.5" />
          <span>
            {currentLang === 'hi' 
              ? 'पंजीकरण केंद्र: हिंगणघाट शेतकरी सहकारी खरेदी-विक्री संस्था (NAFED / CCI केंद्र)।' 
              : 'Registration Hub: Hinganghat Shetkari Sahakari Kharedi-Vikri Sanstha (NAFED / CCI Center).'}
          </span>
        </div>
      </div>

      {/* 2. Today's Mandi Rate & 7-Day Trend Chart */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                {t('sell.mandiRateTitle')}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                [DEMO BENCHMARK DATA]
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="font-serif text-[32px] font-bold text-gov-navy dark:text-white leading-none">
                ₹{todayRate.toLocaleString('en-IN')}
              </span>
              <span className="text-[14px] text-slate-500">/{t('common.quintal')}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {currentLang === 'hi' ? `स्रोत: ${mandiData.officialSource} • अद्यतन: ${mandiData.lastUpdated}` : `Source: ${mandiData.officialSource} • Updated: ${mandiData.lastUpdated}`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isBelowMsp ? (
              <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-full flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-[13px]">
                <TrendingDown size={17} />
                <span>{currentLang === 'hi' ? `MSP से ₹${priceDiff.toLocaleString('en-IN')} कम: सरकारी खरीद केंद्र पर बेचें` : `₹${priceDiff.toLocaleString('en-IN')} below MSP: Sell at Govt MSP Center`}</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-full flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-[13px]">
                <TrendingUp size={17} />
                <span>{currentLang === 'hi' ? `MSP से ₹${priceDiff.toLocaleString('en-IN')} अधिक: खुले बाजार में बेचें` : `₹${priceDiff.toLocaleString('en-IN')} above MSP: Sell in Open Market`}</span>
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Chart */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[12px] text-slate-500 mb-2">
            <span>{t('sell.trendLabel')} ({mandiData.commodity})</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-gov-green dark:text-emerald-400 font-semibold">
                <span className="w-3 h-0.5 bg-gov-green dark:bg-emerald-400" /> APMC Modal Rate
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                <span className="w-3 h-0.5 border-t border-dashed border-amber-600" /> MSP (₹{mspRate.toLocaleString('en-IN')})
              </span>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mandiData.history} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis 
                  domain={[
                    Math.floor(Math.min(...mandiData.history.map(h => h.price), mspRate) / 100) * 100 - 100, 
                    Math.ceil(Math.max(...mandiData.history.map(h => h.price), mspRate) / 100) * 100 + 100
                  ]} 
                  tick={{ fontSize: 12, fill: '#64748B' }} 
                />
                <Tooltip 
                  formatter={(value: any) => [`₹${value} / Quintal`, 'Modal Rate']}
                  contentStyle={{ backgroundColor: '#0F2A44', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
                <ReferenceLine 
                  y={mspRate} 
                  stroke="#B8892B" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                  label={{ value: `MSP ₹${mspRate.toLocaleString('en-IN')}`, fill: '#B8892B', fontSize: 12, position: 'insideTopLeft' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#14532D" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#14532D' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. List Crop for Direct Sale */}
      <form onSubmit={handleCreateListing} className="gov-card p-5 space-y-4">
        <h3 className="font-serif text-[18px] font-bold text-gov-navy dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <PlusCircle size={20} className="text-gov-green" />
          <span>{t('sell.listSaleTitle')}</span>
        </h3>

        {listSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2 text-[15px] font-semibold animate-in fade-in">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <span>{t('sell.listSuccess')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-slate-700 dark:text-slate-300">
              {t('sell.quantityLabel')}
            </label>
            <input
              type="number"
              value={listQuantity}
              onChange={(e) => setListQuantity(e.target.value)}
              placeholder="50"
              className="w-full px-4 py-3 text-[17px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-slate-700 dark:text-slate-300">
              {t('sell.rateLabel')}
            </label>
            <input
              type="number"
              value={listRate}
              onChange={(e) => setListRate(e.target.value)}
              placeholder="4750"
              className="w-full px-4 py-3 text-[17px] font-medium bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="touch-target w-full sm:w-auto px-8 py-3.5 bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark text-white font-bold text-[17px] rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>{t('sell.listButton')}</span>
        </button>
      </form>

      {/* 4. Buyer Offers List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[20px] font-bold text-gov-navy dark:text-white">
            {t('sell.buyerOffersTitle')}
          </h3>
          <span className="text-[13px] text-slate-500 font-semibold">
            {farmerOffers.length} {currentLang === 'hi' ? 'प्रस्ताव प्राप्त' : 'Offers Received'}
          </span>
        </div>

        {farmerOffers.length === 0 ? (
          <div className="gov-card p-8 text-center text-slate-500">
            {t('sell.noOffersYet')}
          </div>
        ) : (
          <div className="space-y-3">
            {farmerOffers.map((offer) => {
              const isAccepted = offer.status === 'accepted';
              const isDeclined = offer.status === 'declined';
              const totalVal = offer.quantityQuintals * offer.offerPricePerQuintal;

              return (
                <div 
                  key={offer.id} 
                  className={`gov-card p-4 transition-all ${
                    isAccepted
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20'
                      : isDeclined
                      ? 'opacity-60 bg-slate-50 dark:bg-slate-900'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[16px] text-gov-navy dark:text-white">
                          {offer.buyerName} ({offer.buyerBusiness})
                        </span>
                        {isAccepted && (
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded-full">
                            {t('sell.statusAccepted')}
                          </span>
                        )}
                        {isDeclined && (
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-red-100 text-red-800 rounded-full">
                            {t('sell.statusDeclined')}
                          </span>
                        )}
                        {offer.status === 'pending' && (
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full">
                            {t('sell.statusPending')}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        {offer.city} • {offer.dateReceived}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="font-serif font-bold text-[19px] text-gov-green dark:text-emerald-400">
                          ₹{offer.offerPricePerQuintal.toLocaleString('en-IN')}
                          <span className="text-[12px] font-normal text-slate-500"> /{t('common.quintal')}</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">
                          {offer.quantityQuintals} {t('common.quintal')} (Total ₹{totalVal.toLocaleString('en-IN')})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                      <a
                        href={`tel:${offer.phone}`}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1.5 text-[13px] font-semibold"
                      >
                        <PhoneCall size={15} />
                        <span>{t('sell.callBuyer')}</span>
                      </a>

                      <a
                        href={`https://wa.me/91${offer.phone}?text=${encodeURIComponent(`Hello, I am accepting your offer for ${offer.quantityQuintals} Quintals.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 rounded-lg flex items-center gap-1.5 text-[13px] font-semibold"
                      >
                        <MessageSquare size={15} />
                        <span>{t('sell.whatsappBuyer')}</span>
                      </a>

                      {offer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptOffer(offer)}
                            className="px-3.5 py-2.5 bg-gov-green hover:bg-gov-green-light text-white rounded-lg flex items-center gap-1 text-[13px] font-bold shadow-sm"
                          >
                            <Check size={15} />
                            <span>{t('sell.acceptOffer')}</span>
                          </button>
                          <button
                            onClick={() => handleDeclineOffer(offer.id)}
                            className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg"
                            title={t('sell.declineOffer')}
                          >
                            <X size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Payment and Cost Tracker (Net Settlement Ledger) */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-serif text-[18px] font-bold text-gov-navy dark:text-white flex items-center gap-2">
            <Calculator size={20} className="text-gov-gold" />
            <span>{t('sell.paymentTrackerTitle')}</span>
          </h3>
          <span className="text-[12px] font-semibold text-slate-500">
            {t('sell.whyPayment')}
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-[14px]">
            {t('sell.noPaymentsYet')}
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => {
              const netAmount = p.grossAmount - (p.labourCost + p.transportCost);

              return (
                <div 
                  key={p.id}
                  className="p-4 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/70 dark:border-slate-700 pb-2.5">
                    <div>
                      <span className="font-bold text-[16px] text-gov-navy dark:text-white">
                        {p.buyerName}
                      </span>
                      <p className="text-[12px] text-slate-500">
                        {t('sell.dueDate')}: {p.dueDate} {p.cropName ? `• ${p.cropName} (${p.quantityQuintals} Q)` : ''}
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={p.isReceived}
                        onChange={() => handleTogglePaymentReceived(p.id)}
                        className="w-4 h-4 text-gov-green rounded focus:ring-gov-gold accent-gov-green cursor-pointer"
                      />
                      <span className={`text-[13px] font-semibold ${
                        p.isReceived ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-amber-700 dark:text-amber-400'
                      }`}>
                        {p.isReceived ? (currentLang === 'hi' ? 'भुगतान प्राप्त हुआ ✓' : 'Payment Received ✓') : (currentLang === 'hi' ? 'बकाया (पैसे आना बाकी)' : 'Pending Due Payout')}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center sm:text-left">
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                        {t('sell.grossAmount')}
                      </span>
                      <span className="font-serif font-bold text-[16px] text-gov-navy dark:text-white">
                        ₹{p.grossAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                        {t('sell.labourCost')}
                      </span>
                      <span className="font-serif font-bold text-[16px] text-red-600">
                        - ₹{p.labourCost.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                        {t('sell.transportCost')}
                      </span>
                      <span className="font-serif font-bold text-[16px] text-red-600">
                        - ₹{p.transportCost.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">
                        {t('sell.netAmount')}
                      </span>
                      <span className="font-serif font-bold text-[17px] text-gov-green dark:text-emerald-300">
                        ₹{netAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
