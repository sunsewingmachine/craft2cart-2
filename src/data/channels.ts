import { GovernmentFair, SellingChannel } from '../types';

export interface ChannelStepItem {
  stepNumber: number;
  icon: string;
  tamilTitle: string;
  englishTitle: string;
  tamilDesc: string;
  englishDesc: string;
  isVerificationWarning?: boolean;
}

export interface DetailedSellingChannel extends SellingChannel {
  officialUrl?: string;
  officialUrlLabel?: string;
  officialUrlNeedsVerification?: boolean;
  whyLaterReasons?: { tamil: string; english: string }[];
  doItMyselfTitleTa: string;
  doItMyselfTitleEn: string;
  steps: ChannelStepItem[];
  audioChoiceTa: string;
  audioGuideTa: string;
  audioHelpTa: string;
}

export const GOVT_FAIRS: GovernmentFair[] = [
  {
    id: 'shilp-samagam',
    easyName: 'Government Craft Fair',
    officialName: 'Shilp Samagam',
    subtitle: 'Sell at government craft exhibitions across India with stall and travel support.',
    ministry: 'Ministry of Social Justice & Empowerment (NBCFDC)',
    location: 'Major City Centers (Delhi, Mumbai, Chennai)',
    dateRange: 'Next fair: Oct 15 – Oct 24, 2026',
    stallSubsidy: 'Stall & travel allowance (Verify with organiser)',
    matchScore: 'Great Match ✓',
    reasons: [
      'Handmade: Declared by artisan',
      'Looks potentially eligible from your answers — final eligibility is decided by the organiser',
      'Direct government customer access'
    ],
    steps: [
      'Check pre-filled artisan details',
      'Confirm product inventory for stall',
      'Submit stall application for organiser review'
    ]
  },
  {
    id: 'surajkund-mela',
    easyName: 'National Heritage Crafts Mela',
    officialName: 'Surajkund International Crafts Fair',
    subtitle: 'Annual heritage crafts fair connecting master artisans to national buyers.',
    ministry: 'Haryana Tourism & Ministry of Textiles',
    location: 'Surajkund, NCR',
    dateRange: 'Feb 01 – Feb 16, 2027',
    stallSubsidy: 'State-sponsored artisan stalls (Verify with organiser)',
    matchScore: 'Good Match ✓',
    reasons: [
      'Authentic handcrafted items',
      'High footfall retail opportunity'
    ],
    steps: [
      'Check details',
      'Prepare craft documentation',
      'Apply for allocation'
    ]
  },
  {
    id: 'saras-aajeevika',
    easyName: 'Rural Artisan Fair',
    officialName: 'SARAS Aajeevika Mela',
    subtitle: 'National showcase supporting rural artisans and Self Help Groups (SHG).',
    ministry: 'Ministry of Rural Development',
    location: 'Noida / Delhi Haat',
    dateRange: 'Nov 05 – Nov 18, 2026',
    stallSubsidy: 'Complimentary SHG stall allocation (Verify with organiser)',
    matchScore: 'Great Match ✓',
    reasons: [
      'Women & rural artisan priority',
      'Zero commission on all sales'
    ],
    steps: [
      'Check SHG details',
      'Confirm product batch',
      'Apply for stall'
    ]
  }
];

export const DETAILED_SELLING_CHANNELS: DetailedSellingChannel[] = [
  {
    id: 'whatsapp',
    easyName: 'WhatsApp',
    officialName: 'Direct Customer Sharing',
    icon: 'chat',
    status: 'OPEN_NOW',
    statusLabel: '🟢 OPEN NOW',
    tamilSubtitle: 'நேரடி வாடிக்கையாளர் · Direct to customer',
    englishSubtitle: 'Direct to customer',
    description: 'Share a photo card with price and one-tap order link directly to customers.',
    officialUrl: 'https://api.whatsapp.com',
    officialUrlLabel: 'Open WhatsApp',
    doItMyselfTitleTa: 'வாட்ஸ்அப் மூலம் உடனடியாக பகிர்வது எப்படி?',
    doItMyselfTitleEn: 'How to share directly on WhatsApp',
    audioChoiceTa: 'இது வாட்ஸ்அப் நேரடி விற்பனை. உங்கள் தயாரிப்பு அட்டை தயாராக உள்ளது. வாடிக்கையாளர்களுக்கு நேரடியாக அனுப்பலாம்.',
    audioGuideTa: 'படி 1: தயாரிப்பு புகைப்படத்தையும் விலையையும் சரிபார்க்கவும். படி 2: ஷேர் பட்டனை அழுத்தி வாடிக்கையாளர்களுக்கு அனுப்பவும்.',
    audioHelpTa: 'உதவியாளருக்கு அனுப்பினால், அவர்கள் உங்கள் தயாரிப்பு அட்டையை வாடிக்கையாளர் குழுக்களில் பகிர்வார்கள்.',
    steps: [
      {
        stepNumber: 1,
        icon: 'check_circle',
        tamilTitle: 'தயாரிப்பு விவரங்களை சரிபார்க்கவும்',
        englishTitle: 'Check your product information',
        tamilDesc: 'தயாரிப்பு பெயர், விலை மற்றும் புகைப்படம் Craft2Cart-ல் தயாராக உள்ளன.',
        englishDesc: 'Product name, price, and confirmed photograph are ready.'
      },
      {
        stepNumber: 2,
        icon: 'share',
        tamilTitle: 'வாடிக்கையாளர் அல்லது குழுக்களுக்கு அனுப்பவும்',
        englishTitle: 'Share to customers or groups',
        tamilDesc: 'நேரடியாக வாட்ஸ்அப்பில் திறந்து ஆர்வமுள்ள வாங்குபவர்களுக்கு அனுப்பவும்.',
        englishDesc: 'Open directly in WhatsApp and send to interested buyers or family contacts.'
      },
      {
        stepNumber: 3,
        icon: 'payments',
        tamilTitle: 'நேரடி ஆர்டர் மற்றும் கட்டணம் பெறவும்',
        englishTitle: 'Receive direct orders & payment',
        tamilDesc: 'வாடிக்கையாளர் உங்கள் UPI அல்லது வங்கிக் கணக்கிற்கு பணம் அனுப்பலாம்.',
        englishDesc: 'Customers can pay directly to your UPI or bank account upon delivery.'
      }
    ]
  },
  {
    id: 'amazon',
    easyName: 'Amazon',
    officialName: 'Amazon Karigar Storefront',
    icon: 'shopping_cart',
    status: 'NEEDS_SETUP',
    statusLabel: '🟡 NEEDS SETUP',
    tamilSubtitle: 'GST பதிவு தேவை · GST needed',
    englishSubtitle: 'GST needed · Seller setup required',
    description: 'Handmade artisan storefront on Amazon with seller fee incentives. GST and Seller Central account required.',
    officialUrl: 'https://sell.amazon.in/grow-your-business/amazon-karigar',
    officialUrlLabel: 'Amazon Karigar Official Portal',
    doItMyselfTitleTa: 'Amazon-ல் எப்படி விற்கலாம்?',
    doItMyselfTitleEn: 'How to continue with Amazon',
    audioChoiceTa: 'உங்கள் தயாரிப்பு விவரங்கள் தயாராக உள்ளன. நீங்களே தொடர விரும்பினால் ‘நானே செய்வேன்’ என்பதைத் தேர்வு செய்யுங்கள். படிப்படியாக Craft2Cart வழிகாட்டும். உதவி தேவைப்பட்டால் ‘உதவி வேண்டும்’ என்பதைத் தேர்வு செய்யுங்கள்.',
    audioGuideTa: 'Amazon Karigar-ல் விற்க: தேவையான ஜிஎஸ்டி மற்றும் வங்கி கணக்கை சரிபார்க்கவும். விற்பனையாளர் கணக்கு தொடங்கவும். Craft2Cart விவரங்களைப் பயன்படுத்தி பட்டியலிடவும்.',
    audioHelpTa: 'உதவியாளருக்கு தயாரிப்பு விவரங்கள் வாட்ஸ்அப் மூலம் அனுப்பப்படும். அவர்கள் விற்பனையாளர் பதிவில் உதவுவார்கள்.',
    steps: [
      {
        stepNumber: 1,
        icon: 'checklist',
        tamilTitle: 'தேவையானதை சரிபார்க்கவும்',
        englishTitle: 'Check what you need',
        tamilDesc: 'GST பதிவு எண், செயலில் உள்ள வங்கிக் கணக்கு மற்றும் PAN அட்டை தேவை.',
        englishDesc: 'GSTIN, active bank account for payouts, and PAN card.'
      },
      {
        stepNumber: 2,
        icon: 'storefront',
        tamilTitle: 'Amazon Karigar விற்பனையாளர் கணக்கு தொடங்கவும்',
        englishTitle: 'Complete Amazon Karigar seller setup',
        tamilDesc: 'அமேசான் காரிகர் திட்டத்தில் கைவினைஞர் பிரிவில் பதிவு செய்யவும்.',
        englishDesc: 'Register under Amazon Karigar artisan storefront with discounted referral fees.'
      },
      {
        stepNumber: 3,
        icon: 'content_paste',
        tamilTitle: 'Craft2Cart தயாரிப்பு விவரங்களைப் பயன்படுத்தவும்',
        englishTitle: 'Use your Craft2Cart product details',
        tamilDesc: 'தயாரிப்பு பெயர், வகை, பொருள் மற்றும் விலையை உள்ளிடவும்.',
        englishDesc: 'Paste the prepared product name, category, material, and price.'
      },
      {
        stepNumber: 4,
        icon: 'photo_camera',
        tamilTitle: 'உங்கள் தயாரிப்பு புகைப்படத்தை சேர்க்கவும்',
        englishTitle: 'Add your confirmed product image',
        tamilDesc: 'தெளிவான வெள்ளை அல்லது இயற்கை பின்னணியுடன் புகைப்படத்தை பதிவேற்றவும்.',
        englishDesc: 'Upload the confirmed high-resolution product photograph.'
      },
      {
        stepNumber: 5,
        icon: 'fact_check',
        tamilTitle: 'அனைத்தையும் சரிபார்க்கவும்',
        englishTitle: 'Check everything before publishing',
        tamilDesc: 'விலை மற்றும் சரக்கு எண்ணிக்கையை சரிபார்த்து உறுதிப்படுத்தவும்.',
        englishDesc: 'Review price, dimensions, and stock quantity before submitting.'
      },
      {
        stepNumber: 6,
        icon: 'open_in_new',
        tamilTitle: 'அதிகாரப்பூர்வ தளத்தில் தொடரவும்',
        englishTitle: 'Continue on the official channel',
        tamilDesc: 'அமேசான் விற்பனையாளர் போர்ட்டலில் உங்கள் பட்டியலை வெளியிடவும்.',
        englishDesc: 'Launch your product live on Amazon India marketplace.'
      }
    ]
  },
  {
    id: 'ondc',
    easyName: 'ONDC (Seller App)',
    officialName: 'Open Network for Digital Commerce Route',
    icon: 'hub',
    status: 'NEEDS_SETUP',
    statusLabel: '🟡 NEEDS SETUP',
    tamilSubtitle: 'விற்பனையாளர் ஆப் இணைப்பு தேவை · Seller app connection needed',
    englishSubtitle: 'Seller app connection needed',
    description: 'Sell via ONDC buyer apps (Paytm, Magicpin, Mystore) through a registered seller-side participant.',
    officialUrl: 'https://ondc.org/sellers',
    officialUrlLabel: 'ONDC Verified Seller-Side Apps',
    doItMyselfTitleTa: 'ONDC விற்பனையாளர் செயலி மூலம் விற்க',
    doItMyselfTitleEn: 'How to sell through ONDC seller app',
    audioChoiceTa: 'ONDC நெட்வொர்க்கில் விற்க தயாரிப்பு விவரங்கள் தயாராக உள்ளன. பதிவுசெய்த விற்பனையாளர் செயலி மூலம் இணைக்கலாம். நீங்களே செய்ய வழிகாட்டி உள்ளது அல்லது உதவியாளர் உதவலாம்.',
    audioGuideTa: 'ONDC-ல் விற்க: பதிவுசெய்த விற்பனையாளர் செயலியைத் தேர்வு செய்யவும். வங்கி கணக்கை இணைக்கவும். Craft2Cart தயாரிப்பு விவரங்கள் தானாக மாற்றப்படும்.',
    audioHelpTa: 'உதவியாளருக்கு தயாரிப்பு விவரங்கள் அனுப்பப்படும். அவர்கள் ONDC விற்பனையாளர் செயலி பதிவில் உதவுவார்கள்.',
    steps: [
      {
        stepNumber: 1,
        icon: 'apps',
        tamilTitle: 'பதிவுசெய்த ONDC விற்பனையாளர் செயலியைத் தேர்வு செய்யவும்',
        englishTitle: 'Choose a registered ONDC seller app',
        tamilDesc: 'Mystore, SellerApp அல்லது பிற அரசு அங்கீகரித்த ONDC விற்பனையாளர் செயலியை அணுகவும்.',
        englishDesc: 'Select an authorized seller-side participant app to connect your catalog.'
      },
      {
        stepNumber: 2,
        icon: 'account_balance',
        tamilTitle: 'வங்கி விவரங்களை இணைக்கவும்',
        englishTitle: 'Link artisan bank details',
        tamilDesc: 'வாடிக்கையாளர் ஆர்டர்களுக்கான நேரடி வங்கி வைப்பு கணக்கை உள்ளிடவும்.',
        englishDesc: 'Set up payout bank account and basic business identity (GST or Enrolment ID).'
      },
      {
        stepNumber: 3,
        icon: 'dataset',
        tamilTitle: 'Craft2Cart தயாரிப்பு பேக்கைப் பயன்படுத்தவும்',
        englishTitle: 'Provide prepared product details',
        tamilDesc: 'தயாரிப்பு பெயர், விலை, பொருள் மற்றும் கைவினை குறிப்பை உள்ளிடவும்.',
        englishDesc: 'Craft2Cart prepares title, price, materials, weight, and image for entry.'
      },
      {
        stepNumber: 4,
        icon: 'sync_alt',
        tamilTitle: 'செயலி நெட்வொர்க் வடிவத்திற்கு மாற்றும்',
        englishTitle: 'Seller app handles network formatting',
        tamilDesc: 'பதிவுசெய்த விற்பனையாளர் செயலி ONDC நெட்வொர்க் தரநிலைக்கு மாற்றுகிறது.',
        englishDesc: 'A registered seller app formats your product into the open network standard.'
      },
      {
        stepNumber: 5,
        icon: 'shopping_bag',
        tamilTitle: 'வாங்குபவர் செயலிகளில் விற்பனைக்கு வரும்',
        englishTitle: 'Discoverable across buyer apps',
        tamilDesc: 'Paytm, Magicpin, Mystore வாடிக்கையாளர்கள் உங்கள் தயாரிப்பை வாங்க முடியும்.',
        englishDesc: 'Customers on buyer apps can discover and purchase your handcrafted item.'
      }
    ]
  },
  {
    id: 'flipkart',
    easyName: 'Flipkart',
    officialName: 'Flipkart Samarth Initiative',
    icon: 'local_mall',
    status: 'NEEDS_SETUP',
    statusLabel: '🟡 NEEDS SETUP',
    tamilSubtitle: 'விற்பனையாளர் கணக்கு தேவை · Seller account needed',
    englishSubtitle: 'Seller account needed',
    description: 'Dedicated onboarding program for Indian artisans and handicraft makers. Documentation required.',
    officialUrl: 'https://seller.flipkart.com/samarth',
    officialUrlLabel: 'Flipkart Samarth Artisan Portal',
    doItMyselfTitleTa: 'Flipkart Samarth-ல் எப்படி விற்கலாம்?',
    doItMyselfTitleEn: 'How to sell on Flipkart Samarth',
    audioChoiceTa: 'Flipkart சமார்த் விற்பனை வழி. உங்கள் தயாரிப்பு விவரங்கள் தயாராக உள்ளன. நீங்களே தொடங்க வழிகாட்டி உள்ளது அல்லது உதவியாளர் உதவலாம்.',
    audioGuideTa: 'Flipkart சமார்த் திட்டத்தில் பதிவு செய்ய: ஆவணங்களை சரிபார்க்கவும். கைவினைஞர் கணக்கு தொடங்கவும். தயாரிப்பு விவரங்களை சமர்ப்பிக்கவும்.',
    audioHelpTa: 'உதவியாளருக்கு தயாரிப்பு பேக் அனுப்பப்படும். அவர்கள் Flipkart சமார்த் பதிவில் உதவுவார்கள்.',
    steps: [
      {
        stepNumber: 1,
        icon: 'description',
        tamilTitle: 'தேவையான ஆவணங்களை தயார் செய்யவும்',
        englishTitle: 'Check Flipkart Samarth requirements',
        tamilDesc: 'GSTIN, வங்கிக் கணக்கு மற்றும் கைவினைஞர் சுய அறிவிப்பு ஆவணம்.',
        englishDesc: 'GSTIN, active bank account, and self-declared artisan craft verification.'
      },
      {
        stepNumber: 2,
        icon: 'how_to_reg',
        tamilTitle: 'Samarth கைவினைஞர் திட்டத்தில் பதிவு செய்யவும்',
        englishTitle: 'Register on Flipkart Samarth',
        tamilDesc: 'கைவினைஞர்களுக்கான கட்டணச் சலுகை மற்றும் உதவி திட்டத்தில் சேரவும்.',
        englishDesc: 'Sign up for dedicated artisan onboarding support and promotional benefits.'
      },
      {
        stepNumber: 3,
        icon: 'edit_note',
        tamilTitle: 'தயாரிப்பு விவரங்களை உள்ளிடவும்',
        englishTitle: 'Enter prepared product information',
        tamilDesc: 'Craft2Cart தயாரித்த தலைப்பு, பொருள், விலை மற்றும் சரக்கு அளவை வழங்கவும்.',
        englishDesc: 'Enter the prepared title, craft materials, pricing, and stock quantity.'
      },
      {
        stepNumber: 4,
        icon: 'add_a_photo',
        tamilTitle: 'உறுதிப்படுத்தப்பட்ட புகைப்படத்தை பதிவேற்றவும்',
        englishTitle: 'Upload confirmed product photo',
        tamilDesc: 'கைவினை தயாரிப்பின் தெளிவான புகைப்படத்தை இணைக்கவும்.',
        englishDesc: 'Attach the verified craft photo to complete the catalog entry.'
      },
      {
        stepNumber: 5,
        icon: 'verified',
        tamilTitle: 'சரிபார்த்து பட்டியலிடவும்',
        englishTitle: 'Review and go live',
        tamilDesc: 'மதிப்பாய்வு முடிந்ததும் Flipkart தளத்தில் விற்பனை தொடங்கலாம்.',
        englishDesc: 'Once verified by Flipkart Samarth team, your listing goes live.'
      }
    ]
  },
  {
    id: 'indiahandmade',
    easyName: 'IndiaHandmade',
    officialName: 'Ministry of Textiles E-Portal',
    icon: 'assured_workload',
    status: 'NEEDS_SETUP',
    statusLabel: '🟡 NEEDS SETUP',
    tamilSubtitle: 'போர்ட்டல் பதிவு தேவை · Portal registration needed',
    englishSubtitle: 'Portal registration needed',
    description: 'Official national e-marketplace for authentic handlooms and handicrafts from registered artisans.',
    officialUrl: 'https://indiahandmade.com',
    officialUrlLabel: 'IndiaHandmade Official E-Portal',
    doItMyselfTitleTa: 'IndiaHandmade போர்ட்டலில் தொடங்குவது எப்படி?',
    doItMyselfTitleEn: 'How to sell on IndiaHandmade Portal',
    audioChoiceTa: 'ஜவுளி அமைச்சகத்தின் IndiaHandmade போர்ட்டல். தயாரிப்பு விவரங்கள் தயாராக உள்ளன. நீங்களே தொடங்க வழிகாட்டி உள்ளது அல்லது உதவியாளர் உதவலாம்.',
    audioGuideTa: 'IndiaHandmade போர்ட்டலில் விற்க: பெஹ்சான் அடையாள அட்டை தேவை. போர்ட்டலில் கைவினைஞர் கணக்கு தொடங்கி விவரங்களை உள்ளிடவும்.',
    audioHelpTa: 'உதவியாளருக்கு தயாரிப்பு விவரங்கள் அனுப்பப்படும். அவர்கள் போர்டல் பதிவில் உதவுவார்கள்.',
    steps: [
      {
        stepNumber: 1,
        icon: 'badge',
        tamilTitle: 'பெஹ்சான் கைவினைஞர் அட்டையை சரிபார்க்கவும்',
        englishTitle: 'Check Pehchan Artisan ID Card',
        tamilDesc: 'ஜவுளி அமைச்சகத்தின் Pehchan அடையாள அட்டை அல்லது கைத்தறி குறி தேவை.',
        englishDesc: 'Ministry of Textiles Pehchan ID Card or Handloom mark (Verify requirement).',
        isVerificationWarning: true
      },
      {
        stepNumber: 2,
        icon: 'domain',
        tamilTitle: 'போர்ட்டலில் கைவினைஞர் கணக்கு தொடங்கவும்',
        englishTitle: 'Create artisan account on portal',
        tamilDesc: 'indiahandmade.com தளத்தில் இலவச விற்பனையாளர் கணக்கை உருவாக்கவும்.',
        englishDesc: 'Register as an authentic Indian artisan on the national portal with 0% commission.'
      },
      {
        stepNumber: 3,
        icon: 'assignment',
        tamilTitle: 'தயாரிப்பு விவரங்களை நகலெடுக்கவும்',
        englishTitle: 'Copy prepared Craft2Cart details',
        tamilDesc: 'பெயர், பாரம்பரிய மூலப்பொருள், பரிமாணங்கள் மற்றும் விலையை உள்ளிடவும்.',
        englishDesc: 'Use the pre-filled product pack details without re-entering from scratch.'
      },
      {
        stepNumber: 4,
        icon: 'image',
        tamilTitle: 'கைவினை புகைப்படத்தை இணைக்கவும்',
        englishTitle: 'Attach craft photograph',
        tamilDesc: 'போர்ட்டல் வழிகாட்டுதலின்படி உங்கள் தயாரிப்பு புகைப்படத்தை பதிவேற்றவும்.',
        englishDesc: 'Upload the confirmed photograph showcasing authentic handiwork.'
      },
      {
        stepNumber: 5,
        icon: 'check_circle',
        tamilTitle: 'சரிபார்த்து தேசிய சந்தையில் பட்டியலிடவும்',
        englishTitle: 'Publish on national handicraft portal',
        tamilDesc: 'அமைச்சக ஒப்புதலுக்குப் பின் நேரடியாக அரசு தளத்தில் விற்பனையாகும்.',
        englishDesc: 'Submit for listing on the official Ministry of Textiles artisan marketplace.'
      }
    ]
  },
  {
    id: 'tulip',
    easyName: 'Bharat TULIP',
    officialName: 'Artisan Market-Linkage Initiative',
    icon: 'spa',
    status: 'NEEDS_SETUP',
    statusLabel: '🟡 NEEDS SETUP',
    tamilSubtitle: 'திட்ட வழிகாட்டல் · Government market linkage',
    englishSubtitle: 'Government market linkage',
    description: 'Government market-linkage initiative supporting traditional craftspersons. Verification with TULIP required.',
    officialUrl: 'https://tulip.tourism.gov.in',
    officialUrlLabel: 'TULIP Market Linkage Coordinator',
    officialUrlNeedsVerification: true,
    doItMyselfTitleTa: 'பாரத் டியூலிப் திட்டத்தில் இணைவது எப்படி?',
    doItMyselfTitleEn: 'How to continue with Bharat TULIP',
    audioChoiceTa: 'பாரத் டியூலிப் கைவினைஞர் திட்டம். தயாரிப்பு விவரங்கள் தயாராக உள்ளன. தகுதியை சரிபார்த்து நீங்களே விண்ணப்பிக்கலாம் அல்லது உதவியாளர் உதவலாம்.',
    audioGuideTa: 'பாரத் டியூலிப் திட்டத்தில்: உங்கள் பதில்களின் படி தகுதி இருக்கலாம். இறுதி தகுதியை அமைப்பாளர்கள் முடிவு செய்வார்கள்.',
    audioHelpTa: 'உதவியாளருக்கு தயாரிப்பு பேக் அனுப்பப்படும். அவர்கள் டியூலிப் ஒருங்கிணைப்பாளரை தொடர்பு கொள்ள உதவுவார்கள்.',
    steps: [
      {
        stepNumber: 1,
        icon: 'policy',
        tamilTitle: 'வழிகாட்டுதல்களை சரிபார்க்கவும்',
        englishTitle: 'Check verified requirements',
        tamilDesc: 'உங்கள் பதில்களின் படி தகுதி இருக்கலாம் — இறுதி தகுதி அமைப்பாளரால் தீர்மானிக்கப்படுகிறது.',
        englishDesc: 'Looks potentially eligible from your answers — final eligibility decided by programme.',
        isVerificationWarning: true
      },
      {
        stepNumber: 2,
        icon: 'groups',
        tamilTitle: 'கைவினை கிளஸ்டர் விவரங்களை உறுதிப்படுத்தவும்',
        englishTitle: 'Identify craft cluster & artisan group',
        tamilDesc: 'உங்கள் பாரம்பரிய கைவினை வகை மற்றும் பகுதி கிளஸ்டர் விவரங்களை தயார் செய்யவும்.',
        englishDesc: 'Prepare craft cluster documentation and artisan group identification.'
      },
      {
        stepNumber: 3,
        icon: 'send',
        tamilTitle: 'Craft2Cart தயாரிப்பு பேக்கை சமர்ப்பிக்கவும்',
        englishTitle: 'Submit prepared product pack',
        tamilDesc: 'தயாரிக்கப்பட்ட பொருள் விவரங்கள், விலை மற்றும் புகைப்படத்தை டியூலிப் அமைப்பாளரிடம் பகிரவும்.',
        englishDesc: 'Submit the structured product specifications to the TULIP market linkage coordinator.'
      },
      {
        stepNumber: 4,
        icon: 'call',
        tamilTitle: 'ஒருங்கிணைப்பாளரிடம் தொடர்பு கொண்டு உறுதிப்படுத்தவும்',
        englishTitle: 'Verify with TULIP coordinator',
        tamilDesc: 'அங்கீகரிக்கப்பட்ட ஒருங்கிணைப்பாளர் மூலம் அடுத்த கட்ட சந்தை இணைப்பை உறுதி செய்யவும்.',
        englishDesc: 'Follow up with the regional coordinator for institutional buyer linkage.'
      }
    ]
  },
  {
    id: 'fairs',
    easyName: 'Govt. Fairs',
    officialName: 'Shilp Samagam & Saras Melas',
    icon: 'festival',
    status: 'OPEN_NOW',
    statusLabel: '🟢 OPEN NOW',
    tamilSubtitle: 'விண்ணப்பம் செய்யலாம் · Application open',
    englishSubtitle: 'Application open',
    description: 'State and national physical exhibitions sponsored by ministries with stall opportunities.',
    officialUrl: 'https://nbcfdc.gov.in',
    officialUrlLabel: 'NBCFDC Fair Portal (Shilp Samagam)',
    doItMyselfTitleTa: 'அரசு கைவினை கண்காட்சிகளுக்கு விண்ணப்பிப்பது எப்படி?',
    doItMyselfTitleEn: 'How to apply for Government Craft Fairs',
    audioChoiceTa: 'அரசு கைவினை கண்காட்சிகள். உங்கள் தயாரிப்பு விவரங்கள் தயாராக உள்ளன. நீங்களே விண்ணப்பிக்க வழிகாட்டி உள்ளது அல்லது உதவியாளர் உதவலாம்.',
    audioGuideTa: 'அரசு கண்காட்சிகளுக்கு: கைவினைஞர் அடையாளத்தை உறுதி செய்யவும். சரக்குகளை சரிபார்க்கவும். விண்ணப்பத்தை சமர்ப்பிக்கவும்.',
    audioHelpTa: 'உதவியாளருக்கு விவரங்கள் அனுப்பப்படும். அவர்கள் கண்காட்சி அரங்க விண்ணப்பத்தில் உதவுவார்கள்.',
    steps: [
      {
        stepNumber: 1,
        icon: 'badge',
        tamilTitle: 'கைவினைஞர் அடையாள ஆவணத்தை உறுதிப்படுத்தவும்',
        englishTitle: 'Confirm artisan identity proof',
        tamilDesc: 'ஆதார் அட்டை அல்லது கைவினைஞர் அடையாள அட்டை தயாராக வைத்திருக்கவும்.',
        englishDesc: 'Keep Aadhaar card or Artisan Pehchan card ready for fair verification.'
      },
      {
        stepNumber: 2,
        icon: 'inventory_2',
        tamilTitle: 'அரங்கத்திற்கான சரக்குகளை சரிபார்க்கவும்',
        englishTitle: 'Check stall stock quantity',
        tamilDesc: 'கண்காட்சியில் காட்சிப்படுத்த போதுமான தயாரிப்புகள் உள்ளதை உறுதிப்படுத்தவும்.',
        englishDesc: 'Confirm at least 25–50 pieces ready for physical stall exhibition and retail sale.'
      },
      {
        stepNumber: 3,
        icon: 'assignment',
        tamilTitle: 'விண்ணப்பப் படிவத்தை தயார் செய்யவும்',
        englishTitle: 'Prepare pre-filled application',
        tamilDesc: 'Craft2Cart விவரங்களைப் பயன்படுத்தி கண்காட்சி விண்ணப்பத்தை தயார் செய்யவும்.',
        englishDesc: 'Use your verified product name, price, and craft details for the application.'
      },
      {
        stepNumber: 4,
        icon: 'handshake',
        tamilTitle: 'அமைப்பாளரிடம் சமர்ப்பிக்கவும்',
        englishTitle: 'Submit to fair organiser',
        tamilDesc: 'அரங்க மானியம் மற்றும் பயணப்படியை அமைப்பாளரிடம் உறுதிப்படுத்தவும்.',
        englishDesc: 'Submit application for stall allocation (Verify subsidy & travel with organiser).',
        isVerificationWarning: true
      }
    ]
  },
  {
    id: 'local',
    easyName: 'Local Support',
    officialName: 'Poompuhar & District Industries Centre',
    icon: 'storefront',
    status: 'OPEN_NOW',
    statusLabel: '🟢 OPEN NOW',
    tamilSubtitle: 'நேரடி தொடர்பு · Direct contact',
    englishSubtitle: 'Direct contact',
    description: 'Connect with state handicraft emporiums (Poompuhar, Co-optex) and local artisan development centres.',
    officialUrl: 'https://poompuhar.com',
    officialUrlLabel: 'Poompuhar (TN Handicrafts Development Corp)',
    doItMyselfTitleTa: 'பூம்புகார் / DIC தொடர்பு கொள்வது எப்படி?',
    doItMyselfTitleEn: 'How to contact Poompuhar & DIC',
    audioChoiceTa: 'பூம்புகார் மற்றும் மாவட்ட தொழில் மையம். உங்கள் தயாரிப்பு தயாராக உள்ளது. நீங்களே தொடர்பு கொள்ளலாம் அல்லது உதவியாளர் உதவலாம்.',
    audioGuideTa: 'உள்ளூர் ஆதரவு பெற: மாவட்ட தொழில் மையம் அல்லது பூம்புகார் மேலாளரை அழைக்கவும். தயாரிப்பு மாதிரியைக் காட்டி பதிவு செய்யவும்.',
    audioHelpTa: 'உதவியாளருக்கு விவரங்கள் அனுப்பப்படும். அவர்கள் உள்ளூர் அதிகாரியை தொடர்பு கொள்ள உதவுவார்கள்.',
    steps: [
      {
        stepNumber: 1,
        icon: 'phone_in_talk',
        tamilTitle: 'பூம்புகார் / மாவட்ட தொழில் மையத்தை தொடர்பு கொள்ளவும்',
        englishTitle: 'Contact local DIC or Poompuhar emporium',
        tamilDesc: 'அருகிலுள்ள மாவட்ட தொழில் மையம் (DIC) அல்லது பூம்புகார் கிளை மேலாளரை அழைக்கவும்.',
        englishDesc: 'Call your district DIC manager or nearest Poompuhar state emporium.'
      },
      {
        stepNumber: 2,
        icon: 'visibility',
        tamilTitle: 'தயாரிப்பு மாதிரியை ஆய்வு செய்ய திட்டமிடவும்',
        englishTitle: 'Schedule sample inspection',
        tamilDesc: 'உங்கள் கைவினை தயாரிப்பு மாதிரியை அதிகாரியிடம் காட்ட நேரம் பெறவும்.',
        englishDesc: 'Schedule a physical inspection of your handmade sample with the craft officer.'
      },
      {
        stepNumber: 3,
        icon: 'inventory',
        tamilTitle: 'Craft2Cart தயாரிப்பு பேக்கை வழங்கவும்',
        englishTitle: 'Share prepared product pack',
        tamilDesc: 'தயாரிப்பு விலை, மூலப்பொருள் மற்றும் தயாரிப்பு திறனை அதிகாரியிடம் சமர்ப்பிக்கவும்.',
        englishDesc: 'Present the confirmed pricing, material breakdown, and monthly batch capacity.'
      },
      {
        stepNumber: 4,
        icon: 'store',
        tamilTitle: 'மாநில கைவினை விற்பனையகங்களில் காட்சிப்படுத்தவும்',
        englishTitle: 'Display in state handicraft showrooms',
        tamilDesc: 'ஒப்பந்தம் உறுதி செய்யப்பட்டதும் மாநில விற்பனையகங்களில் விற்பனைக்கு வைக்கப்படும்.',
        englishDesc: 'Supply directly to state handicraft showrooms upon procurement approval.'
      }
    ]
  },
  {
    id: 'gem',
    easyName: 'GeM',
    officialName: 'Government e-Marketplace',
    icon: 'account_balance',
    status: 'LATER',
    statusLabel: '🔵 LATER',
    tamilSubtitle: 'அரசு கொள்முதல் · Govt procurement',
    englishSubtitle: 'Govt procurement · Setup required',
    description: 'Government procurement portal. Verified supplier registration and documentation required.',
    officialUrl: 'https://gem.gov.in',
    officialUrlLabel: 'GeM Official Government Portal',
    whyLaterReasons: [
      {
        tamil: 'வணிக & ஜிஎஸ்டி பதிவு ஆவணங்கள் முழுமையாக சரிபார்க்கப்பட வேண்டும்.',
        english: 'Full business & GST supplier registration credentials required.'
      },
      {
        tamil: 'மொத்த அரசு கொள்முதல் ஆர்டர்களுக்கு உற்பத்தி திறன் தேவை.',
        english: 'Larger batch production capacity required for institutional tenders.'
      },
      {
        tamil: 'நேரடி & இணையதள விற்பனை தொடங்கிய பின் இதை முயற்சிப்பது சிறந்தது.',
        english: 'Recommended after establishing direct and marketplace sales.'
      }
    ],
    doItMyselfTitleTa: 'GeM போர்ட்டல் தேவைகள் என்ன?',
    doItMyselfTitleEn: 'What is required for Government e-Marketplace (GeM)',
    audioChoiceTa: 'GeM அரசு கொள்முதல் தளம். இதற்கு வணிக பதிவு மற்றும் ஜிஎஸ்டி தேவை என்பதால் இது அடுத்த கட்டமாகும். என்ன தேவை என்பதைப் பார்க்க வழிகாட்டியைத் திறக்கலாம்.',
    audioGuideTa: 'GeM அரசு தளத்தில் விற்க தேவையானவை: வணிக பதிவு, ஜிஎஸ்டி மற்றும் வரி ஆவணங்கள். இவற்றை தயார் செய்த பின் விண்ணப்பிக்கலாம்.',
    audioHelpTa: 'உதவியாளருக்கு விவரங்கள் அனுப்பப்படும். அவர்கள் GeM அரசு தளம் பற்றிய கூடுதல் தகவல்களை விளக்குவார்கள்.',
    steps: [
      {
        stepNumber: 1,
        icon: 'corporate_fare',
        tamilTitle: 'வணிக / கைவினைஞர் சான்றிதழை சரிபார்க்கவும்',
        englishTitle: 'Validate business / artisan credentials',
        tamilDesc: 'GeM போர்ட்டலில் சப்ளையராக பதிவு செய்ய வணிக மற்றும் வரி ஆவணங்கள் தேவை.',
        englishDesc: 'Supplier registration requires verified business PAN, GSTIN, and identity proof.',
        isVerificationWarning: true
      },
      {
        stepNumber: 2,
        icon: 'receipt_long',
        tamilTitle: 'வரி & வங்கி சரிபார்ப்பை முடிக்கவும்',
        englishTitle: 'Complete tax & bank verification',
        tamilDesc: 'அரசு நிதி பரிவர்த்தனைகளுக்கான சரிபார்க்கப்பட்ட வங்கி கணக்கை இணைக்கவும்.',
        englishDesc: 'Link PFMS-compliant bank account and authorized signatory details.'
      },
      {
        stepNumber: 3,
        icon: 'category',
        tamilTitle: 'கைவினை பொருட்கள் அட்டவணையை உருவாக்கவும்',
        englishTitle: 'Build artisan product catalogue',
        tamilDesc: 'Craft2Cart தயாரிப்பு விவரங்களைப் பயன்படுத்தி அரசு பட்டியலில் சேர்க்கவும்.',
        englishDesc: 'Enter confirmed product specifications into the GeM handicraft catalogue.'
      },
      {
        stepNumber: 4,
        icon: 'gavel',
        tamilTitle: 'அரசு கொள்முதல் டெண்டர்களில் பங்கேற்கவும்',
        englishTitle: 'Participate in government procurement bids',
        tamilDesc: 'அரசு துறைகளின் நேரடி கொள்முதல் தேவைகளுக்கு தயாரிப்புகளை வழங்கவும்.',
        englishDesc: 'Bid on government ministry procurement requests and direct purchase orders.'
      }
    ]
  }
];

export const SELLING_CHANNELS: SellingChannel[] = DETAILED_SELLING_CHANNELS;
