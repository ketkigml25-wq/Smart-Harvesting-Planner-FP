import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2 } from 'lucide-react';
import { TricolorBar } from './components/TricolorBar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DashboardSummary } from './components/DashboardSummary';
import { FloatingHelp } from './components/FloatingHelp';
import { Footer } from './components/Footer';

// Screens
import { LandingPage } from './screens/LandingPage';
import { LoginScreen } from './screens/LoginScreen';
import { MyCropScreen } from './screens/MyCropScreen';
import { HarvestScreen } from './screens/HarvestScreen';
import { SellDirectlyScreen } from './screens/SellDirectlyScreen';
import { VillageGroupScreen } from './screens/VillageGroupScreen';
import { BuyerPortalScreen } from './screens/BuyerPortalScreen';

// Services & Types
import { 
  storage, 
  SEED_FARMERS,
  SEED_BUYERS,
  INITIAL_FARMER_PROFILE, 
  INITIAL_BUYER_OFFERS, 
  INITIAL_PAYMENT_RECORDS, 
  INITIAL_VILLAGE_FARMERS, 
  INITIAL_FARMER_LISTINGS 
} from './services/mockData';
import { speechService } from './utils/speech';
import { getScreenSpeechText } from './utils/speechContent';
import { cropCalendarService } from './services/cropCalendarService';
import { mandiService } from './services/mandiService';
import { weatherService, FALLBACK_HINGANGHAT_WEATHER } from './services/weatherService';
import { marketplaceService } from './services/marketplaceService';
import { 
  FarmerProfile, 
  BuyerProfile, 
  BuyerOffer, 
  PaymentRecord, 
  VillageFarmer, 
  FarmerListing, 
  Language, 
  UserRole,
  AuthSession,
  WeatherDataPayload 
} from './types';

type Route = 'landing' | 'login' | 'dashboard';

const getInitialRoute = (): Route => {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();

  if (hash === '#login' || path === '/login') {
    return 'login';
  }
  if (hash === '#dashboard' || hash === '#main' || path === '/dashboard') {
    const auth = storage.getAuth();
    if (auth && auth.isAuthenticated) {
      return 'dashboard';
    }
    return 'login';
  }
  // Default route '/' is the PUBLIC LANDING PAGE!
  return 'landing';
};

export default function App() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'hi') as Language;

  // Route state: default '/' is landing
  const [currentRoute, setCurrentRoute] = useState<Route>(getInitialRoute);
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('farmer');

  // Authenticated User Session
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => storage.getAuth());

  // Active Tab:
  // For farmer: 'harvest' | 'my_crop' | 'sell' | 'group'
  // For buyer: 'buyer_browse' | 'buyer_offers' | 'buyer_mandi'
  const [activeTab, setActiveTab] = useState<string>(() => {
    const auth = storage.getAuth();
    return auth?.role === 'buyer' ? 'buyer_browse' : 'harvest';
  });

  // Modal for quick account switching
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  // Speech synthesizer active state and text
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  useEffect(() => {
    const unsub = speechService.subscribeState((speaking, text) => {
      setIsSpeaking(speaking);
      if (text) setSpokenText(text);
    });
    return unsub;
  }, []);

  // Sync with browser URL
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (hash === '#login' || path === '/login') {
        setCurrentRoute('login');
      } else if (hash === '#dashboard' || hash === '#main' || path === '/dashboard') {
        const auth = storage.getAuth();
        if (auth && auth.isAuthenticated) {
          setCurrentRoute('dashboard');
        } else {
          setCurrentRoute('login');
        }
      } else {
        // Default '/' is landing
        setCurrentRoute('landing');
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const navigateTo = (route: Route, role?: UserRole) => {
    speechService.stop();
    if (role) {
      setLoginInitialRole(role);
    }
    setCurrentRoute(route);

    if (route === 'landing') {
      window.history.pushState(null, '', '/');
      window.location.hash = '';
    } else if (route === 'login') {
      window.history.pushState(null, '', '/login');
      window.location.hash = '#login';
    } else if (route === 'dashboard') {
      window.history.pushState(null, '', '/dashboard');
      window.location.hash = '#dashboard';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    storage.clearAuth();
    setAuthSession(null);
    speechService.stop();
    navigateTo('landing');
  };

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('kisansaathi_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kisansaathi_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kisansaathi_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Data state stored in localStorage
  const [profile, setProfile] = useState<FarmerProfile>(() => storage.getProfile());
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>(() => storage.getBuyerProfile());
  const [offers, setOffers] = useState<BuyerOffer[]>(() => storage.getOffers());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => storage.getPayments());
  const [villageFarmers, setVillageFarmers] = useState<VillageFarmer[]>(() => storage.getVillageFarmers());
  const [listings, setListings] = useState<FarmerListing[]>(() => storage.getListings());

  // Weather state for Hinganghat
  const [weatherPayload, setWeatherPayload] = useState<WeatherDataPayload>(FALLBACK_HINGANGHAT_WEATHER);

  useEffect(() => {
    let isMounted = true;
    weatherService.getWeather().then((data) => {
      if (isMounted) setWeatherPayload(data);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Enforce role-based tab isolation
  useEffect(() => {
    if (authSession?.role === 'buyer') {
      if (['harvest', 'my_crop', 'sell', 'group'].includes(activeTab)) {
        setActiveTab('buyer_browse');
      }
    } else if (authSession?.role === 'farmer') {
      if (['buyer_browse', 'buyer_offers', 'buyer_mandi', 'buyer_clusters'].includes(activeTab)) {
        setActiveTab('harvest');
      }
    }
  }, [authSession?.role, activeTab]);

  // Switch demo account
  const handleSelectAccount = (role: UserRole, accountId: string) => {
    speechService.stop();
    setShowAccountSwitcher(false);

    if (role === 'farmer') {
      const selectedFarmer = SEED_FARMERS.find(f => f.id === accountId) || SEED_FARMERS[0];
      setProfile(selectedFarmer);
      storage.setProfile(selectedFarmer);
      const newAuth: AuthSession = {
        isAuthenticated: true,
        role: 'farmer',
        userId: selectedFarmer.id,
        phone: selectedFarmer.phone,
        name: selectedFarmer.name
      };
      storage.setAuth(newAuth);
      setAuthSession(newAuth);
      setActiveTab('harvest');
      navigateTo('dashboard');
    } else {
      const selectedBuyer = SEED_BUYERS.find(b => b.id === accountId) || SEED_BUYERS[0];
      setBuyerProfile(selectedBuyer);
      storage.setBuyerProfile(selectedBuyer);
      const newAuth: AuthSession = {
        isAuthenticated: true,
        role: 'buyer',
        userId: selectedBuyer.id,
        phone: selectedBuyer.phone,
        name: selectedBuyer.name
      };
      storage.setAuth(newAuth);
      setAuthSession(newAuth);
      setActiveTab('buyer_browse');
      navigateTo('dashboard');
    }
  };

  // Dynamic calculations for active farmer
  const maturity = cropCalendarService.calculateMaturity(profile.selectedCropId, profile.sowingDate);
  const daysRemaining = maturity.daysRemaining;
  const expectedDateString = maturity.expectedDateStrings[currentLang] || maturity.expectedDateStrings.hi;
  
  const day0 = weatherPayload.days[0] || FALLBACK_HINGANGHAT_WEATHER.days[0];
  const day1 = weatherPayload.days[1] || FALLBACK_HINGANGHAT_WEATHER.days[1];
  const maxRainProb = Math.max(day0.rainChance, day1.rainChance);
  const maxPrecip = Math.max(day0.precipitationMm || 0, day1.precipitationMm || 0);

  const todaySignal: 'green' | 'amber' | 'red' = maxRainProb >= 60 || maxPrecip >= 10
    ? 'red'
    : maxRainProb >= 30 || maxPrecip >= 2
    ? 'amber'
    : 'green';

  const todayAdvice = todaySignal === 'red'
    ? (currentLang === 'hi' 
        ? 'अगले 24-48 घंटों में तेज बारिश की आशंका है, आज कटाई स्थगित करें।' 
        : 'Heavy rain expected in next 24-48 hours; do not harvest today.')
    : todaySignal === 'amber'
    ? (currentLang === 'hi' 
        ? 'बादल छाए रहेंगे, नमी जांचने के बाद ही कटाई का निर्णय लें।' 
        : 'Cloudy conditions; check grain moisture before harvesting.')
    : (currentLang === 'hi' 
        ? 'मौसम अनुकूल और सूखा रहेगा, कटाई के लिए उत्तम दिन।' 
        : 'Weather is clear and dry; ideal day for harvesting.');

  const activeMandi = mandiService.getMandiData(profile.selectedCropId);

  // Screen Speaker Read-Out (Dynamic & Page-Specific)
  const handleSpeakCurrentScreen = () => {
    let screenType: any = currentRoute;
    if (currentRoute === 'dashboard') {
      if (authSession?.role === 'buyer') {
        screenType = 'buyer';
      } else {
        screenType = activeTab;
      }
    }

    const textToSpeak = getScreenSpeechText({
      screen: screenType,
      subScreen: undefined,
      lang: currentLang,
      farmerProfile: profile,
      buyerProfile,
      daysRemaining,
      todayAdvice,
      todayMandiRate: activeMandi.currentRate,
      mspRate: activeMandi.mspRate,
      offersCount: offers.filter(o => o.farmerId === profile.id).length,
      pendingNetPayments: payments.filter(p => !p.isReceived).reduce((sum, p) => sum + p.grossAmount - (p.labourCost + p.transportCost), 0)
    });

    speechService.speak(textToSpeak, currentLang);
  };

  // Sync state changes with localStorage
  const handleUpdateProfile = (updated: FarmerProfile) => {
    setProfile(updated);
    storage.setProfile(updated);
  };

  const handleUpdateListings = (updated: FarmerListing[]) => {
    setListings(updated);
    storage.setListings(updated);
  };

  const handleUpdateOffers = (updated: BuyerOffer[]) => {
    setOffers(updated);
    storage.setOffers(updated);
  };

  const handleUpdatePayments = (updated: PaymentRecord[]) => {
    setPayments(updated);
    storage.setPayments(updated);
  };

  const handleJoinLot = (qty: number) => {
    const updated = villageFarmers.map(f => {
      if (f.isCurrentUser) {
        return {
          ...f,
          quantityQuintals: f.quantityQuintals + qty
        };
      }
      return f;
    });
    const newTotal = updated.reduce((sum, f) => sum + f.quantityQuintals, 0);
    const withPercentages = updated.map(f => ({
      ...f,
      payoutSharePercentage: (f.quantityQuintals / newTotal) * 100
    }));
    setVillageFarmers(withPercentages);
    storage.setVillageFarmers(withPercentages);
  };

  const handleResetData = () => {
    storage.resetAll();
    setProfile(SEED_FARMERS[0]);
    setBuyerProfile(SEED_BUYERS[0]);
    setOffers(INITIAL_BUYER_OFFERS);
    setPayments(INITIAL_PAYMENT_RECORDS);
    setVillageFarmers(INITIAL_VILLAGE_FARMERS);
    setListings(INITIAL_FARMER_LISTINGS);
    speechService.stop();
  };

  // 1. PUBLIC LANDING PAGE (DEFAULT ROUTE "/")
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        onNavigateToLogin={(role) => navigateTo('login', role)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  // 2. PUBLIC LOGIN SCREEN (ROUTE "/login")
  if (currentRoute === 'login') {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-slate-950 text-gov-navy dark:text-slate-100 transition-colors">
        <TricolorBar />
        <Header
          onSpeakScreen={handleSpeakCurrentScreen}
          activeScreenName="login"
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onNavigateHome={() => navigateTo('landing')}
        />
        <main className="flex-1 flex items-center justify-center py-6">
          <LoginScreen
            initialRole={loginInitialRole}
            onLoginSuccess={(role, userId) => {
              const newAuth: AuthSession = {
                isAuthenticated: true,
                role,
                userId,
                phone: role === 'buyer' ? buyerProfile.phone : profile.phone,
                name: role === 'buyer' ? buyerProfile.name : profile.name
              };
              setAuthSession(newAuth);
              storage.setAuth(newAuth);
              if (role === 'buyer') {
                setActiveTab('buyer_browse');
              } else {
                setActiveTab('harvest');
              }
              navigateTo('dashboard');
            }}
            onNavigateHome={() => navigateTo('landing')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // 3. AUTHENTICATED DASHBOARD (ROUTE "/dashboard")
  const currentRole = authSession?.role || 'farmer';

  return (
    <div className="min-h-screen flex flex-col bg-gov-cream dark:bg-slate-950 text-gov-navy dark:text-slate-100 transition-colors">
      <TricolorBar />

      <Header
        onSpeakScreen={handleSpeakCurrentScreen}
        activeScreenName={activeTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        isAuthenticated={true}
        onLogout={handleLogout}
        onNavigateHome={() => navigateTo('landing')}
        profileName={currentRole === 'buyer' ? buyerProfile.businessName : profile.name}
        role={currentRole}
        onSwitchAccount={() => setShowAccountSwitcher(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (Role Isolated) */}
        <DesktopSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            speechService.stop();
          }}
          role={currentRole}
          farmerProfile={profile}
          buyerProfile={buyerProfile}
          onResetData={handleResetData}
          onSwitchAccount={() => setShowAccountSwitcher(true)}
        />

        {/* Main Content Area */}
        <main className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 mx-auto w-full pb-28 md:pb-12 transition-all ${currentRole === 'buyer' ? 'max-w-6xl' : 'max-w-5xl'}`}>
          {/* Top Laptop Dashboard Summary Banner (For Farmer only) */}
          {currentRole === 'farmer' && (
            <DashboardSummary
              profile={profile}
              daysRemaining={daysRemaining}
              expectedDateString={expectedDateString}
              todaySignal={todaySignal}
              todayAdvice={todayAdvice}
              currentMandiRate={activeMandi.currentRate}
              mspRate={activeMandi.mspRate}
              payments={payments}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Screen Content Render (Strictly Isolated by Role) */}
          <div className="animate-in fade-in duration-200">
            {/* BUYER ROLE VIEWS */}
            {currentRole === 'buyer' && (
              <BuyerPortalScreen
                buyerProfile={buyerProfile}
                listings={listings}
                offers={offers}
                activeSubTab={activeTab as any}
                onSubTabChange={(tab) => setActiveTab(tab)}
                onSubmitOffer={(newOffer) => {
                  const updated = marketplaceService.submitBuyerOffer(newOffer, offers);
                  setOffers(updated);
                }}
              />
            )}

            {/* FARMER ROLE VIEWS */}
            {currentRole === 'farmer' && (
              <>
                {activeTab === 'my_crop' && (
                  <MyCropScreen
                    profile={profile}
                    onUpdateProfile={handleUpdateProfile}
                  />
                )}

                {activeTab === 'harvest' && (
                  <HarvestScreen
                    profile={profile}
                    onUpdateProfile={handleUpdateProfile}
                  />
                )}

                {activeTab === 'sell' && (
                  <SellDirectlyScreen
                    profile={profile}
                    listings={listings}
                    offers={offers}
                    payments={payments}
                    onUpdateListings={handleUpdateListings}
                    onUpdateOffers={handleUpdateOffers}
                    onUpdatePayments={handleUpdatePayments}
                    onUpdateProfile={handleUpdateProfile}
                  />
                )}

                {activeTab === 'group' && (
                  <VillageGroupScreen
                    villageName={`${profile.village}, ${profile.district}`}
                    farmers={villageFarmers}
                    onJoinLot={handleJoinLot}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Floating Help Button */}
      <FloatingHelp />

      {/* Mobile Bottom Navigation Bar (Role Isolated) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          speechService.stop();
        }}
        role={currentRole}
      />

      {/* Footer */}
      <Footer />

      {/* Account Switcher Modal for Easy Multi-Account Verification */}
      {showAccountSwitcher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="gov-card p-6 border-t-4 border-t-gov-gold max-w-lg w-full space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-[19px] font-bold text-gov-navy dark:text-white">
                  {currentLang === 'hi' ? 'डेमो खाता बदलें (Switch Demo Account)' : 'Switch Demo Account'}
                </h3>
                <p className="text-[12px] text-slate-500">
                  {currentLang === 'hi' ? 'हिंगणघाट किसान व खरीदार खातों का परीक्षण करें' : 'Test farmer and wholesale buyer roles with demo accounts'}
                </p>
              </div>
              <button
                onClick={() => setShowAccountSwitcher(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[13px] font-bold text-gov-green dark:text-emerald-400 block uppercase">
                {currentLang === 'hi' ? 'किसान खाते (Farmer Accounts):' : 'Farmer Accounts:'}
              </span>
              <div className="space-y-2">
                <button
                  data-testid="account-farmer-1"
                  onClick={() => handleSelectAccount('farmer', 'farmer-1')}
                  className={`w-full p-3 text-left rounded-xl border flex items-center justify-between transition-all ${
                    currentRole === 'farmer' && profile.id === 'farmer-1'
                      ? 'border-gov-green bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-[14px]">
                      {currentLang === 'hi' ? 'किसान A: राजेश देशमुख' : 'Farmer A: Rajesh Deshmukh'}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {currentLang === 'hi' ? 'हिंगणघाट • सोयाबीन (JS-335) • 50 क्विंटल स्टॉक' : 'Hinganghat • Soybean (JS-335) • 50 Qtl Inventory'}
                    </div>
                  </div>
                  {currentRole === 'farmer' && profile.id === 'farmer-1' && (
                    <span className="text-[11px] bg-gov-green text-white px-2 py-0.5 rounded-full font-bold">
                      {currentLang === 'hi' ? 'सक्रिय' : 'Active'}
                    </span>
                  )}
                </button>

                <button
                  data-testid="account-farmer-2"
                  onClick={() => handleSelectAccount('farmer', 'farmer-2')}
                  className={`w-full p-3 text-left rounded-xl border flex items-center justify-between transition-all ${
                    currentRole === 'farmer' && profile.id === 'farmer-2'
                      ? 'border-gov-green bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-[14px]">
                      {currentLang === 'hi' ? 'किसान B: रमेश बोरकर' : 'Farmer B: Ramesh Borkar'}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {currentLang === 'hi' ? 'वडनेर, हिंगणघाट • कपास (Bt Cotton) • 35 क्विंटल स्टॉक' : 'Wadner, Hinganghat • Cotton (Bt Cotton) • 35 Qtl Inventory'}
                    </div>
                  </div>
                  {currentRole === 'farmer' && profile.id === 'farmer-2' && (
                    <span className="text-[11px] bg-gov-green text-white px-2 py-0.5 rounded-full font-bold">
                      {currentLang === 'hi' ? 'सक्रिय' : 'Active'}
                    </span>
                  )}
                </button>
              </div>

              <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400 block uppercase pt-2">
                {currentLang === 'hi' ? 'खरीदार खाते (Buyer Accounts):' : 'Buyer Accounts:'}
              </span>
              <div className="space-y-2">
                <button
                  data-testid="account-buyer-1"
                  onClick={() => handleSelectAccount('buyer', 'buyer-1')}
                  className={`w-full p-3 text-left rounded-xl border flex items-center justify-between transition-all ${
                    currentRole === 'buyer' && buyerProfile.id === 'buyer-1'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-[14px]">
                      {currentLang === 'hi' ? 'खरीदार A: राजेश पटेल (विदर्भ एग्रो ट्रेडर्स)' : 'Buyer A: Rajesh Patel (Vidarbha Agro Traders)'}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {currentLang === 'hi' ? 'हिंगणघाट APMC • थोक अनाज व तिलहन खरीदार' : 'Hinganghat APMC • Wholesale Grain & Oilseed Buyer'}
                    </div>
                  </div>
                  {currentRole === 'buyer' && buyerProfile.id === 'buyer-1' && (
                    <span className="text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                      {currentLang === 'hi' ? 'सक्रिय' : 'Active'}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectAccount('buyer', 'buyer-2')}
                  className={`w-full p-3 text-left rounded-xl border flex items-center justify-between transition-all ${
                    currentRole === 'buyer' && buyerProfile.id === 'buyer-2'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-[14px]">
                      {currentLang === 'hi' ? 'खरीदार B: संजय चौधरी (महावीर ग्रेंस)' : 'Buyer B: Sanjay Choudhary (Mahavir Grains)'}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      {currentLang === 'hi' ? 'वर्धा • दाल व कॉटन मिल खरीदार' : 'Wardha • Dal & Cotton Mill Buyer'}
                    </div>
                  </div>
                  {currentRole === 'buyer' && buyerProfile.id === 'buyer-2' && (
                    <span className="text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                      {currentLang === 'hi' ? 'सक्रिय' : 'Active'}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAccountSwitcher(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[14px]"
            >
              {currentLang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Voice Readout Toast */}
      {isSpeaking && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gov-navy/95 text-white backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3.5 max-w-lg w-[92vw] animate-in slide-in-from-bottom-3">
          <div className="w-8 h-8 rounded-full bg-amber-400 text-gov-navy flex items-center justify-center shrink-0 animate-pulse">
            <Volume2 size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
              <span>{currentLang === 'hi' ? 'आवाज से पढ़ा जा रहा है' : 'Reading screen aloud'}</span>
              <span className="flex gap-0.5 items-end h-2.5">
                <span className="w-0.5 h-full bg-amber-300 animate-bounce" />
                <span className="w-0.5 h-1.5 bg-amber-300 animate-bounce delay-75" />
                <span className="w-0.5 h-2 bg-amber-300 animate-bounce delay-150" />
              </span>
            </div>
            <p className="text-[13px] text-slate-100 truncate font-medium">
              {spokenText || (currentLang === 'hi' ? 'स्क्रीन का विवरण सुनाया जा रहा है...' : 'Narrating screen details...')}
            </p>
          </div>
          <button
            onClick={() => speechService.stop()}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Stop reading"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
