import { CropInfo } from '../types';
import { HINGANGHAT_WARDHA_CROPS } from './cropCalendarService';

export interface MspDetails {
  cropId: string;
  cropName: {
    en: string;
    hi: string;
  };
  mspPerQuintal: number;
  marketingSeason: string;
  sourceAuthority: string;
  notificationDate: string;
  procurementAgencyInMaharashtra: string;
  requiredDocuments: {
    key: string;
    labelHi: string;
    labelEn: string;
    mandatory: boolean;
  }[];
}

export const mspService = {
  getAllMspRates: (): CropInfo[] => {
    return HINGANGHAT_WARDHA_CROPS;
  },

  getMspDetails: (cropId: string): MspDetails => {
    const crop = HINGANGHAT_WARDHA_CROPS.find(c => c.id === cropId) || HINGANGHAT_WARDHA_CROPS[0];
    
    return {
      cropId: crop.id,
      cropName: {
        en: crop.name.en,
        hi: crop.name.hi
      },
      mspPerQuintal: crop.mspPerQuintal,
      marketingSeason: crop.marketingSeason,
      sourceAuthority: crop.mspOfficialSource,
      notificationDate: 'Government of India Gazette Notification (June 2024 / Oct 2024)',
      procurementAgencyInMaharashtra: crop.id.startsWith('cotton')
        ? 'Cotton Corporation of India (CCI) & Maharashtra State Cotton Federation'
        : 'NAFED & Maharashtra State Co-operative Marketing Federation Ltd.',
      requiredDocuments: [
        {
          key: 'landRecord712',
          labelHi: 'डिजिटल 7/12 भू-अभिलेख पर्ची (फसल प्रविष्टि सहित)',
          labelEn: 'Digital 7/12 Land Record (with e-Pik Pahani crop entry)',
          mandatory: true
        },
        {
          key: 'aadhaarLinked',
          labelHi: 'आधार कार्ड (NPCI / DBT बैंक खाते से लिंक)',
          labelEn: 'Aadhaar Card (Linked with Bank DBT)',
          mandatory: true
        },
        {
          key: 'bankPassbook',
          labelHi: 'सक्रिय बैंक पासबुक / IFSC खाता विवरण',
          labelEn: 'Active Bank Passbook & IFSC Details',
          mandatory: true
        },
        {
          key: 'mobileActive',
          labelHi: 'आधार से जुड़ा चालू मोबाइल नंबर (OTP सत्यापन हेतु)',
          labelEn: 'Aadhaar-linked active Mobile Number for OTP',
          mandatory: true
        }
      ]
    };
  }
};
