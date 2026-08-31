// 'en' = English only · 'ta' = Tamil only · 'both' = Tamil and English together
export type Language = 'en' | 'ta' | 'both';

export interface ProductProfile {
  id: string;
  name: string;
  category: string;
  material: string;
  isHandmade: boolean;
  quantity: number;
  price: number;
  costMaterial: number;
  costLabor: number;
  description: string;
  image: string;
  tags: string[];
  location: string;
  status: 'draft' | 'ready' | 'listed';
  createdAt: string;
  dimensions?: string;
  weight?: string;
}

export interface BuyerInquiry {
  id: string;
  name: string;
  role: string;
  productName: string;
  productImage: string;
  quantity: number;
  offeredPrice: number;
  originalPrice: number;
  location: string;
  fullMessage: string;
  isDemo: boolean;
  phone: string;
  timeAgo: string;
}

export interface GovernmentFair {
  id: string;
  easyName: string;
  officialName: string;
  subtitle: string;
  ministry: string;
  location: string;
  dateRange: string;
  stallSubsidy: string;
  matchScore: 'Great Match ✓' | 'Good Match ✓';
  reasons: string[];
  steps: string[];
}

export type ChannelStatus = 'OPEN_NOW' | 'NEEDS_SETUP' | 'LATER';

export interface SellingChannel {
  id: 'whatsapp' | 'ondc' | 'amazon' | 'flipkart' | 'indiahandmade' | 'tulip' | 'fairs' | 'local' | 'gem';
  easyName: string;
  officialName?: string;
  icon: string;
  status: ChannelStatus;
  statusLabel: string;
  tamilSubtitle: string;
  englishSubtitle: string;
  description: string;
}

export interface UserProfile {
  name: string;
  location: string;
  avatar: string;
  heroPhoto: string;
  story: string;
  storyAudioText: string;
  productsSold: number;
  fairsAttended: number;
  phone?: string;
  craftSpecialty?: string;
  pehchanId?: string;
  upiId?: string;
  experienceYears?: number;
  achievements: {
    title: string;
    subtitle: string;
    icon: string;
    badgeBg: string;
  }[];
}
