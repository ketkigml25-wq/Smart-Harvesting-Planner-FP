import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Phone, KeyRound, ArrowRight, Store, ShieldCheck, 
  Leaf, Sprout, ArrowLeft, Clock, RefreshCw, CheckCircle2, 
  MapPin, User, Info, Check, UserCheck 
} from 'lucide-react';
import { BRAND_NAME } from '../constants';
import { Language, FarmerProfile, BuyerProfile, UserRole } from '../types';
import { storage, SEED_FARMERS, SEED_BUYERS } from '../services/mockData';

interface LoginScreenProps {
  initialRole?: UserRole;
  onLoginSuccess: (role: UserRole, userId: string) => void;
  onNavigateHome: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  initialRole = 'farmer',
  onLoginSuccess,
  onNavigateHome
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'hi') as Language;

  const [role, setRole] = useState<UserRole>(initialRole);
  const [step, setStep] = useState<'phone' | 'otp' | 'profile_setup'>('phone');

  // Input states
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Resend OTP countdown
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // First-time Profile Setup state (Hinganghat, Wardha focused)
  const existingProfile = storage.getProfile();
  const [profileName, setProfileName] = useState(existingProfile.name || (currentLang === 'hi' ? 'राजेश देशमुख' : 'Rajesh Deshmukh'));
  const [profileVillage, setProfileVillage] = useState(existingProfile.village || (currentLang === 'hi' ? 'हिंगणघाट' : 'Hinganghat'));
  const [profileTaluka, setProfileTaluka] = useState(existingProfile.taluka || (currentLang === 'hi' ? 'हिंगणघाट' : 'Hinganghat'));
  const [profileDistrict, setProfileDistrict] = useState(existingProfile.district || (currentLang === 'hi' ? 'वर्धा' : 'Wardha'));

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
      if (initialRole === 'buyer') {
        setPhone(SEED_BUYERS[0].phone);
      } else {
        setPhone(SEED_FARMERS[0].phone);
      }
    }
  }, [initialRole]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('kisansaathi_lang', lang);
  };

  // Quick switch between the 4 test accounts
  const handleQuickSelectAccount = (accountType: 'farmer-1' | 'farmer-2' | 'buyer-1' | 'buyer-2') => {
    if (accountType === 'farmer-1') {
      setRole('farmer');
      setPhone(SEED_FARMERS[0].phone);
      setProfileName(SEED_FARMERS[0].name);
      setProfileVillage(SEED_FARMERS[0].village);
      setProfileTaluka(SEED_FARMERS[0].taluka);
      setProfileDistrict(SEED_FARMERS[0].district);
    } else if (accountType === 'farmer-2') {
      setRole('farmer');
      setPhone(SEED_FARMERS[1].phone);
      setProfileName(SEED_FARMERS[1].name);
      setProfileVillage(SEED_FARMERS[1].village);
      setProfileTaluka(SEED_FARMERS[1].taluka);
      setProfileDistrict(SEED_FARMERS[1].district);
    } else if (accountType === 'buyer-1') {
      setRole('buyer');
      setPhone(SEED_BUYERS[0].phone);
    } else if (accountType === 'buyer-2') {
      setRole('buyer');
      setPhone(SEED_BUYERS[1].phone);
    }
    setError('');
  };

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError(t('loginEnhanced.invalidPhone'));
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
    }, 300);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234') {
      setError(t('loginEnhanced.invalidOtp'));
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (role === 'buyer') {
        const matchedBuyer = SEED_BUYERS.find(b => b.phone.includes(phone.slice(-10))) || SEED_BUYERS[0];
        storage.setBuyerProfile(matchedBuyer);
        storage.setAuth({
          isAuthenticated: true,
          role: 'buyer',
          userId: matchedBuyer.id,
          phone: matchedBuyer.phone,
          name: matchedBuyer.name
        });
        onLoginSuccess('buyer', matchedBuyer.id);
      } else {
        const matchedFarmer = SEED_FARMERS.find(f => f.phone.includes(phone.slice(-10)));
        if (matchedFarmer) {
          storage.setProfile(matchedFarmer);
          storage.setProfileSetupCompleted(true);
          storage.setAuth({
            isAuthenticated: true,
            role: 'farmer',
            userId: matchedFarmer.id,
            phone: matchedFarmer.phone,
            name: matchedFarmer.name
          });
          onLoginSuccess('farmer', matchedFarmer.id);
        } else {
          // If brand new phone, prompt profile setup
          const setupDone = storage.isProfileSetupCompleted();
          if (!setupDone) {
            setStep('profile_setup');
          } else {
            const current = storage.getProfile();
            storage.setAuth({
              isAuthenticated: true,
              role: 'farmer',
              userId: current.id,
              phone,
              name: current.name
            });
            onLoginSuccess('farmer', current.id);
          }
        }
      }
    }, 350);
  };

  // Step 3: Complete Farmer Profile Setup
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const current = storage.getProfile();
      const updated: FarmerProfile = {
        ...current,
        id: `farmer-${Date.now()}`,
        name: profileName,
        phone: phone,
        village: profileVillage,
        taluka: profileTaluka,
        district: profileDistrict,
        state: 'महाराष्ट्र (Maharashtra)'
      };
      storage.setProfile(updated);
      storage.setProfileSetupCompleted(true);
      storage.setAuth({
        isAuthenticated: true,
        role: 'farmer',
        userId: updated.id,
        phone,
        name: profileName
      });
      onLoginSuccess('farmer', updated.id);
    }, 350);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full">
      <div className="w-full space-y-6">
        
        {/* Top Link: View Public Portal Overview */}
        <div className="flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            type="button"
            className="inline-flex items-center gap-1.5 text-[13px] sm:text-[14px] font-semibold text-gov-green dark:text-emerald-400 hover:text-gov-green-light hover:underline transition-colors py-1 px-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Info size={16} className="text-gov-gold shrink-0" />
            <span>
              {currentLang === 'hi' ? 'पोर्टल मुख्य पृष्ठ देखें →' : 'View Public Landing Page →'}
            </span>
          </button>
          
          <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
            {role === 'farmer' 
              ? (currentLang === 'hi' ? 'किसान लॉगिन (Farmer)' : 'Farmer Login') 
              : (currentLang === 'hi' ? 'खरीदार लॉगिन (Buyer)' : 'Buyer Login')}
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-gov-green to-gov-green-dark border-2 border-gov-gold flex items-center justify-center text-white shadow-lg">
            <Leaf size={32} className="transform -rotate-12" strokeWidth={2.2} />
          </div>
          <h1 className="font-sans font-bold text-[30px] sm:text-[36px] tracking-[0.08em] uppercase text-gov-navy dark:text-white leading-tight">
            {BRAND_NAME}
          </h1>
          {currentLang === 'hi' && (
            <div className="font-serif text-[18px] sm:text-[20px] font-semibold text-gov-green dark:text-emerald-400">
              किसान साथी • हिंगणघाट (वर्धा)
            </div>
          )}
          <p className="text-[14px] text-slate-600 dark:text-slate-300 font-medium">
            {role === 'buyer' 
              ? (currentLang === 'hi' ? 'थोक खरीदार व व्यापारी प्रवेश पोर्टल' : 'Wholesale Buyer & Trader Procurement Portal') 
              : t('subTitle')}
          </p>
        </div>

        {/* Role Switcher (Farmer | Buyer) */}
        {step !== 'profile_setup' && (
          <div className="gov-card p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRole('farmer');
                  setPhone(SEED_FARMERS[0].phone);
                  setError('');
                }}
                className={`py-2.5 px-3 rounded-lg font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${
                  role === 'farmer'
                    ? 'bg-gov-green text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Sprout size={18} />
                <span>{t('loginEnhanced.roleFarmer')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('buyer');
                  setPhone(SEED_BUYERS[0].phone);
                  setError('');
                }}
                className={`py-2.5 px-3 rounded-lg font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${
                  role === 'buyer'
                    ? 'bg-gov-navy text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Store size={18} />
                <span>{t('loginEnhanced.roleBuyer')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Multi-Account Quick Test Switcher */}
        {step === 'phone' && (
          <div className="gov-card p-3 border border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center justify-between text-[12px] font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <UserCheck size={14} className="text-gov-green" />
                <span>{currentLang === 'hi' ? 'डेमो टेस्ट खाते (Select Test Account):' : 'Demo Test Accounts (Quick Select):'}</span>
              </span>
              <span className="text-gov-gold">Hinganghat, Wardha</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <button
                type="button"
                onClick={() => handleQuickSelectAccount('farmer-1')}
                className={`p-2 text-left rounded-lg border transition-all ${
                  role === 'farmer' && phone === SEED_FARMERS[0].phone
                    ? 'bg-gov-green text-white border-gov-green font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold">{currentLang === 'hi' ? 'किसान A: राजेश देशमुख' : 'Farmer A: Rajesh Deshmukh'}</div>
                <div className="text-[10px] opacity-80">{currentLang === 'hi' ? 'हिंगणघाट • सोयाबीन (50 Q)' : 'Hinganghat • Soybean (50 Q)'}</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectAccount('farmer-2')}
                className={`p-2 text-left rounded-lg border transition-all ${
                  role === 'farmer' && phone === SEED_FARMERS[1].phone
                    ? 'bg-gov-green text-white border-gov-green font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold">{currentLang === 'hi' ? 'किसान B: रमेश बोरकर' : 'Farmer B: Ramesh Borkar'}</div>
                <div className="text-[10px] opacity-80">{currentLang === 'hi' ? 'वडनेर • कपास (35 Q)' : 'Wadner • Cotton (35 Q)'}</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectAccount('buyer-1')}
                className={`p-2 text-left rounded-lg border transition-all ${
                  role === 'buyer' && phone === SEED_BUYERS[0].phone
                    ? 'bg-gov-navy text-white border-gov-navy font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold">{currentLang === 'hi' ? 'खरीदार A: राजेश पटेल' : 'Buyer A: Rajesh Patel'}</div>
                <div className="text-[10px] opacity-80">{currentLang === 'hi' ? 'विदर्भ एग्रो • हिंगणघाट APMC' : 'Vidarbha Agro • Hinganghat APMC'}</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectAccount('buyer-2')}
                className={`p-2 text-left rounded-lg border transition-all ${
                  role === 'buyer' && phone === SEED_BUYERS[1].phone
                    ? 'bg-gov-navy text-white border-gov-navy font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold">{currentLang === 'hi' ? 'खरीदार B: संजय चौधरी' : 'Buyer B: Sanjay Choudhary'}</div>
                <div className="text-[10px] opacity-80">{currentLang === 'hi' ? 'महावीर ग्रेंस • वर्धा' : 'Mahavir Grains • Wardha'}</div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: ENTER PHONE NUMBER */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="gov-card p-6 border-t-4 border-t-gov-green space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-serif text-[22px] font-bold text-gov-navy dark:text-white">
                {role === 'buyer' 
                  ? (currentLang === 'hi' ? 'व्यापारी / खरीदार प्रवेश' : 'Trader / Buyer Sign In') 
                  : t('loginEnhanced.step1Title')}
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-slate-400">
                {role === 'buyer' 
                  ? (currentLang === 'hi' ? 'हिंगणघाट व विदर्भ फसल खरीद हेतु पंजीकृत मोबाइल नंबर दर्ज करें' : 'Enter registered mobile number for Hinganghat procurement') 
                  : t('loginEnhanced.step1Subtitle')}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-[14px] font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Phone size={17} className="text-gov-green" />
                <span>{t('loginEnhanced.phoneLabel')}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[16px]">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-14 pr-4 py-3.5 text-[18px] font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  required
                />
              </div>
            </div>

            {role === 'buyer' && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[13px] text-blue-900 dark:text-blue-200">
                {currentLang === 'hi' 
                  ? '🔒 खरीदार खाता: किसानों के व्यक्तिगत भूमि दस्तावेज व बैंक विवरण पूर्णतः सुरक्षित रहेंगे।'
                  : '🔒 Buyer Account: Verified trading license active. Farmer land records and privacy strictly protected.'}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full touch-target text-white font-bold text-[18px] rounded-xl shadow-md flex items-center justify-center gap-2 transition-all ${
                role === 'buyer' 
                  ? 'bg-gov-navy hover:bg-gov-navy-light active:bg-slate-900' 
                  : 'bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark'
              }`}
            >
              {isLoading ? (
                <span className="inline-block animate-spin mr-2">⟳</span>
              ) : (
                <>
                  <span>{t('loginEnhanced.sendOtp')}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="pt-1 flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>
                {currentLang === 'hi' 
                  ? 'हिंगणघाट APMC दिशा-निर्देशों का अनुपालन • डेटा गोपनीयता सुरक्षित' 
                  : 'APMC Compliance • Data Privacy Strictly Protected'}
              </span>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="gov-card p-6 border-t-4 border-t-gov-gold space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-[22px] font-bold text-gov-navy dark:text-white">
                  {t('loginEnhanced.step2Title')}
                </h2>
                <p className="text-[14px] text-slate-500 dark:text-slate-400">
                  +91 {phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                }}
                className="text-[13px] font-bold text-gov-green dark:text-emerald-400 hover:underline"
              >
                {t('loginEnhanced.changePhone')}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-[14px] font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <KeyRound size={17} className="text-gov-gold" />
                  <span>{t('loginEnhanced.otpLabel')}</span>
                </label>
                <span className="text-[12px] font-bold text-gov-green dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {currentLang === 'hi' ? 'डेमो OTP: 1234' : 'Demo OTP: 1234'}
                </span>
              </div>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-full px-4 py-3.5 text-[24px] tracking-[0.5em] text-center font-bold font-serif bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green focus:bg-white dark:focus:bg-slate-900 transition-colors"
                required
              />
            </div>

            <div className="flex items-center justify-between text-[13px] text-slate-500 dark:text-slate-400 pt-1">
              {!canResend ? (
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock size={15} className="text-slate-400" />
                  <span>{t('loginEnhanced.resendIn')} {resendTimer} {t('loginEnhanced.seconds')}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setResendTimer(30);
                    setCanResend(false);
                    setOtp('1234');
                  }}
                  className="inline-flex items-center gap-1 font-bold text-gov-green dark:text-emerald-400 hover:underline"
                >
                  <RefreshCw size={14} />
                  <span>{t('loginEnhanced.resendNow')}</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full touch-target text-white font-bold text-[18px] rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-2 ${
                role === 'buyer' 
                  ? 'bg-gov-navy hover:bg-gov-navy-light active:bg-slate-900' 
                  : 'bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark'
              }`}
            >
              {isLoading ? (
                <span className="inline-block animate-spin mr-2">⟳</span>
              ) : (
                <>
                  <span>{currentLang === 'hi' ? 'सत्यापित करें व लॉगिन करें' : 'Verify & Sign In'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: FIRST-TIME FARMER PROFILE SETUP */}
        {step === 'profile_setup' && (
          <form onSubmit={handleSaveProfile} className="gov-card p-6 border-t-4 border-t-emerald-600 space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[12px] font-bold mb-2">
                <CheckCircle2 size={14} />
                <span>{currentLang === 'hi' ? 'एकबारीय प्रोफाइल पंजीकरण' : 'One-Time Profile Setup'}</span>
              </div>
              <h2 className="font-serif text-[22px] font-bold text-gov-navy dark:text-white">
                {t('profileSetup.title')}
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-slate-400">
                {currentLang === 'hi'
                  ? 'हिंगणघाट व वर्धा क्षेत्र में सटीक कृषि सलाह हेतु विवरण भरें'
                  : 'Enter farm details for hyper-local Hinganghat & Wardha harvest advisories'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User size={16} className="text-gov-green" />
                <span>{t('profileSetup.nameLabel')}</span>
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder={currentLang === 'hi' ? 'उदा. राजेश देशमुख' : 'e.g. Rajesh Deshmukh'}
                className="w-full px-4 py-3 text-[16px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin size={16} className="text-gov-gold" />
                  <span>{t('profileSetup.villageLabel')}</span>
                </label>
                <input
                  type="text"
                  value={profileVillage}
                  onChange={(e) => setProfileVillage(e.target.value)}
                  placeholder={currentLang === 'hi' ? 'उदा. हिंगणघाट या वडनेर' : 'e.g. Hinganghat or Wadner'}
                  className="w-full px-4 py-3 text-[16px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300">
                  {t('profileSetup.talukaLabel')}
                </label>
                <input
                  type="text"
                  value={profileTaluka}
                  onChange={(e) => setProfileTaluka(e.target.value)}
                  placeholder={currentLang === 'hi' ? 'हिंगणघाट' : 'Hinganghat'}
                  className="w-full px-4 py-3 text-[16px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300">
                {t('profileSetup.districtLabel')}
              </label>
              <input
                type="text"
                value={profileDistrict}
                onChange={(e) => setProfileDistrict(e.target.value)}
                placeholder={currentLang === 'hi' ? 'वर्धा' : 'Wardha'}
                className="w-full px-4 py-3 text-[16px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-gov-green"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full touch-target bg-gov-green hover:bg-gov-green-light active:bg-gov-green-dark text-white font-bold text-[18px] rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-3"
            >
              {isLoading ? (
                <span className="inline-block animate-spin mr-2">⟳</span>
              ) : (
                <>
                  <span>{currentLang === 'hi' ? 'पंजीकरण पूरा करें व आगे बढ़ें' : 'Complete Setup & Open Dashboard'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
