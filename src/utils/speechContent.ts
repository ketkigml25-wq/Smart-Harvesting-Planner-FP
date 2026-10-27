import { Language, FarmerProfile, BuyerProfile } from '../types';
import { BRAND_NAME } from '../constants';

export const getScreenSpeechText = (params: {
  screen: 'landing' | 'login' | 'dashboard' | 'harvest' | 'my_crop' | 'sell' | 'group' | 'buyer';
  subScreen?: 'phone' | 'otp' | 'profile_setup' | 'browse' | 'offers' | 'trends';
  lang: Language;
  farmerProfile?: FarmerProfile;
  buyerProfile?: BuyerProfile;
  daysRemaining?: number;
  todayAdvice?: string;
  todayMandiRate?: number;
  mspRate?: number;
  offersCount?: number;
  pendingNetPayments?: number;
}): string => {
  const { 
    screen, 
    subScreen, 
    lang, 
    farmerProfile, 
    buyerProfile, 
    daysRemaining = 15, 
    todayAdvice, 
    todayMandiRate = 4680, 
    mspRate = 4892, 
    offersCount = 0, 
    pendingNetPayments = 0 
  } = params;

  if (screen === 'landing') {
    if (lang === 'hi') {
      return `${BRAND_NAME} में आपका स्वागत है। सही समय पर कटाई करें, सीधे बेचें और उचित मूल्य पाएं। हिंगणघाट व वर्धा के किसानों के लिए मौसम आधारित कटाई सलाह, पारदर्शी मंडी भाव और व्यापारियों से सीधा संपर्क। लॉगिन करने के लिए किसान लॉगिन या व्यापारी लॉगिन बटन दबाएं।`;
    }
    return `Welcome to ${BRAND_NAME}. Know when to harvest, sell directly, and get a fair price. Weather-driven harvest advisory and direct wholesale portal for farmers and buyers in Hinganghat, Wardha district, Maharashtra.`;
  }

  if (screen === 'login') {
    if (subScreen === 'otp') {
      if (lang === 'hi') return 'ओटीपी सत्यापन स्क्रीन। कृपया अपने 10 अंकों के मोबाइल पर प्राप्त 4 अंकों का डेमो ओटीपी 1234 दर्ज करें।';
      return 'OTP verification screen. Enter your 4-digit demo OTP 1234 to proceed.';
    }
    if (subScreen === 'profile_setup') {
      if (lang === 'hi') return 'प्रथम बार किसान प्रोफाइल सेटअप। अपना पूरा नाम, गाँव, तालुका हिंगणघाट और जिला वर्धा दर्ज करें।';
      return 'One-time profile setup. Enter your name, village, taluka, and Wardha district.';
    }
    if (lang === 'hi') return `${BRAND_NAME} लॉगिन स्क्रीन। किसान या व्यापारी के रूप में 10 अंकों का मोबाइल नंबर दर्ज करें और ओटीपी प्राप्त करें।`;
    return `${BRAND_NAME} login screen. Enter your 10 digit mobile number to receive OTP.`;
  }

  const getCropDisplayName = (cropId?: string, targetLang: Language = 'en'): string => {
    switch (cropId) {
      case 'cotton':
        return targetLang === 'hi' ? 'कपास (मध्यम रेशा)' : 'Cotton (Medium Staple)';
      case 'cotton_long':
        return targetLang === 'hi' ? 'कपास (लंबा रेशा)' : 'Cotton (Long Staple)';
      case 'tur':
        return targetLang === 'hi' ? 'तुअर / अरहर' : 'Pigeon Pea (Tur)';
      case 'gram':
        return targetLang === 'hi' ? 'चना' : 'Chickpea (Gram)';
      case 'wheat':
        return targetLang === 'hi' ? 'गेहूं' : 'Wheat';
      case 'soybean':
      default:
        return targetLang === 'hi' ? 'सोयाबीन' : 'Soybean';
    }
  };

  if (screen === 'harvest') {
    const cropName = getCropDisplayName(farmerProfile?.selectedCropId, lang);
    if (lang === 'hi') {
      return `कटाई सलाह स्क्रीन। हिंगणघाट में आपकी ${cropName} फसल की कटाई में लगभग ${daysRemaining} दिन शेष हैं। आज की मुख्य मौसम सलाह: ${todayAdvice || 'मौसम का ध्यान रखें'}। अनाज की वर्तमान नमी ${farmerProfile?.grainMoisturePercent || 11.5} प्रतिशत है।`;
    }
    return `Harvest advisory screen for Hinganghat, Wardha. Approximately ${daysRemaining} days remaining for ${cropName} harvest. Today's advice: ${todayAdvice || 'Monitor local weather'}. Grain moisture is ${farmerProfile?.grainMoisturePercent || 11.5} percent.`;
  }

  if (screen === 'my_crop') {
    const cropName = getCropDisplayName(farmerProfile?.selectedCropId, lang);
    if (lang === 'hi') {
      return `मेरी फसल स्क्रीन। चयनित फसल ${cropName} है। बुवाई तिथि ${farmerProfile?.sowingDate || '24 जुलाई 2026'} और खेत का स्थान ${farmerProfile?.village || 'हिंगणघाट'}, जिला ${farmerProfile?.district || 'वर्धा'} है।`;
    }
    return `My Crop screen. Selected crop is ${cropName}, sown on ${farmerProfile?.sowingDate || '24 July 2026'} in ${farmerProfile?.village || 'Hinganghat'}, Wardha.`;
  }

  if (screen === 'sell') {
    const cropName = getCropDisplayName(farmerProfile?.selectedCropId, lang);
    const isAbove = todayMandiRate >= mspRate;
    const diff = Math.abs(todayMandiRate - mspRate);

    if (lang === 'hi') {
      return `सीधे बेचें और मंडी भाव स्क्रीन। हिंगणघाट में ${cropName} का बाजार भाव ₹${todayMandiRate} प्रति क्विंटल है, जो शासकीय एमएसपी ₹${mspRate} से ${isAbove ? '₹' + diff + ' अधिक' : '₹' + diff + ' कम'} है। आपके पास ${offersCount} नए खरीदार प्रस्ताव हैं और ₹${pendingNetPayments.toLocaleString('en-IN')} का शुद्ध भुगतान देय है।`;
    }
    return `Sell directly screen. Hinganghat rate for ${cropName} is ₹${todayMandiRate} per quintal against MSP ₹${mspRate} (${isAbove ? '₹' + diff + ' above' : '₹' + diff + ' below'} MSP). You have ${offersCount} buyer offers.`;
  }

  if (screen === 'group') {
    if (lang === 'hi') {
      return 'ग्राम समूह स्क्रीन। हिंगणघाट व वडनेर के किसान मिलकर सामूहिक लॉट बना रहे हैं। 200 क्विंटल पूरा होने पर 30 प्रतिशत तक ट्रक भाड़ा बचत होगी।';
    }
    return 'Village collective group screen. Hinganghat farmers pooling produce to achieve 200 quintals for bulk transport discounts.';
  }

  if (screen === 'buyer') {
    if (lang === 'hi') {
      return `व्यापारी डैशबोर्ड। फर्म: ${buyerProfile?.businessName || 'अधिकृत व्यापारी'}। हिंगणघाट व वर्धा जिले के सत्यापित किसानों की थोक फसल सूचियां देखें और सीधे खरीद प्रस्ताव भेजें।`;
    }
    return `Buyer Dashboard for ${buyerProfile?.businessName || 'Verified Trader'}. Browse verified farmgate harvest listings in Hinganghat, Wardha, and send direct purchase bids.`;
  }

  return 'KISAAN SATHI Portal';
};
