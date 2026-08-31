import React, { useState, useEffect } from 'react';
import { BuyerInquiry, Language, ProductProfile, SellingChannel, UserProfile } from './types';
import { SAMPLE_PRODUCTS, DEMO_PHOTO_OPTIONS } from './data/sampleProducts';
import { DEMO_BUYERS } from './data/buyers';
import { registerSpeakingListener, stopSpeech, playTapTone, speakText } from './utils/audio';

import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeScreen } from './components/HomeScreen';
import { TakePhotoScreen } from './components/TakePhotoScreen';
import { AICheckScreen } from './components/AICheckScreen';
import { SpeakDetailsScreen } from './components/SpeakDetailsScreen';
import { ProductReadyScreen } from './components/ProductReadyScreen';
import { SellEverywhereScreen } from './components/SellEverywhereScreen';
import { GovtFairFlow } from './components/GovtFairFlow';
import { WhatsAppShareScreen } from './components/WhatsAppShareScreen';
import { MyProductsScreen } from './components/MyProductsScreen';
import { BuyersScreen } from './components/BuyersScreen';
import { HelpScreen } from './components/HelpScreen';
import { SellerProfileModal } from './components/SellerProfileModal';
import { ChannelExportModal } from './components/ChannelExportModal';
import { ProductEditModal } from './components/ProductEditModal';
import { BuyerEditModal } from './components/BuyerEditModal';
import { IntroSplash } from './components/IntroSplash';

const PRODUCTS_STORAGE_KEY = 'craft2cart.products';
const PROFILE_STORAGE_KEY = 'craft2cart.profile';
const BUYERS_STORAGE_KEY = 'craft2cart.buyers';

// Products survive page refreshes; falls back to the demo set when storage is
// empty, unreadable, or the user deleted everything (never an empty first run).
const loadStoredProducts = (): ProductProfile[] | null => {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

// Unlike products, an empty buyer list is a legitimate saved state: the user
// may have deleted every inquiry, and we must not resurrect the demo set.
const loadStoredBuyers = (): BuyerInquiry[] | null => {
  try {
    const raw = localStorage.getItem(BUYERS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const loadStoredProfile = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
};

const initialProducts = loadStoredProducts() ?? SAMPLE_PRODUCTS;

export default function App() {
  // Navigation & Language
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'sell' | 'buyers' | 'help'>('home');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Products & Buyers State
  const [products, setProducts] = useState<ProductProfile[]>(initialProducts);
  const [currentProduct, setCurrentProduct] = useState<ProductProfile>(initialProducts[0]);
  const [buyers, setBuyers] = useState<BuyerInquiry[]>(() => loadStoredBuyers() ?? DEMO_BUYERS);

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadStoredProfile() ?? {
    name: 'Lakshmi',
    location: 'Madurai, Tamil Nadu',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbFcB8ddjUgGcIrnZGL5EdCf2ZtC-4meSf22ZkPo8DWZiMP--s2r2jjm4onXvpeWKsrD_DUe22HiD306horcXQZlgZBxIMUPGYoJSXiyRuTJe7W-1rzFB2vRCkZnTmuH-HFMnU3GU-UIl7hIifxPOT6SPeWIseYwTqFo8Hg_t0Ul4afcRgSp-aq_Tl9WodKAK7EURWW40UttIUhXrLbimEkXcXiLjD1GCY1akZFfn5cLTxUVbDy0EI',
    heroPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbFcB8ddjUgGcIrnZGL5EdCf2ZtC-4meSf22ZkPo8DWZiMP--s2r2jjm4onXvpeWKsrD_DUe22HiD306horcXQZlgZBxIMUPGYoJSXiyRuTJe7W-1rzFB2vRCkZnTmuH-HFMnU3GU-UIl7hIifxPOT6SPeWIseYwTqFo8Hg_t0Ul4afcRgSp-aq_Tl9WodKAK7EURWW40UttIUhXrLbimEkXcXiLjD1GCY1akZFfn5cLTxUVbDy0EI',
    story: 'I learned weaving from my mother, and now I weave to send my daughters to school. Every thread holds our history and their future.',
    storyAudioText: 'என் கதை: நான் என் தாயிடமிருந்து நெசவு கற்றுக்கொண்டேன். என் மகள்களை பள்ளிக்கு அனுப்ப நான் இப்போது நெசவு செய்கிறேன். ஒவ்வொரு இழையும் எங்கள் வரலாற்றையும் அவர்களின் எதிர்காலத்தையும் கொண்டுள்ளது.',
    productsSold: 1240,
    fairsAttended: 15,
    craftSpecialty: 'Master Weaver & Handloom Artisan',
    experienceYears: 20,
    phone: '+91 98421 77340',
    pehchanId: 'TN-MDU-2023-8821',
    upiId: 'lakshmi.artisan@upi',
    achievements: [
      { title: 'Master Weaver', subtitle: '20 Yrs Experience', icon: 'workspace_premium', badgeBg: '#d3e8d5' },
      { title: 'Sustainable', subtitle: '100% Organic Dyes', icon: 'eco', badgeBg: '#ffdbcd' },
      { title: 'Verified Artisan', subtitle: 'Craft2Cart Approved', icon: 'verified', badgeBg: '#e1e3e1' }
    ]
  });

  // Sell Flow Internal Step
  const [sellStep, setSellStep] = useState<
    'photo' | 'ai_check' | 'speak' | 'ready' | 'sell_everywhere' | 'govt_fair' | 'whatsapp_share'
  >('photo');

  // Temp Data during Creation
  const [tempPhoto, setTempPhoto] = useState(DEMO_PHOTO_OPTIONS[0].image);
  const [tempDetectedTitle, setTempDetectedTitle] = useState(DEMO_PHOTO_OPTIONS[0].detectedTitle);
  const [tempDetectedMaterial, setTempDetectedMaterial] = useState(DEMO_PHOTO_OPTIONS[0].material);

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedChannelExport, setSelectedChannelExport] = useState<SellingChannel['id'] | null>(null);
  const [productToEdit, setProductToEdit] = useState<ProductProfile | null>(null);
  // null = closed. { buyer: null } = adding; { buyer } = editing that inquiry.
  const [buyerEditor, setBuyerEditor] = useState<{ buyer: BuyerInquiry | null } | null>(null);

  // Lock background scrolling while any modal is open, so touch-dragging the
  // sheet on a phone doesn't scroll the page behind it.
  const anyModalOpen = Boolean(productToEdit || showProfileModal || selectedChannelExport || buyerEditor);
  useEffect(() => {
    if (!anyModalOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [anyModalOpen]);

  // Persist products & profile so a page refresh doesn't wipe the catalog.
  // Camera photos are stored as data URLs, so a full quota (~5MB) is possible —
  // the app then simply keeps working in-memory.
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch {
      /* storage unavailable or full */
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(BUYERS_STORAGE_KEY, JSON.stringify(buyers));
    } catch {
      /* storage unavailable or full */
    }
  }, [buyers]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    } catch {
      /* storage unavailable or full */
    }
  }, [userProfile]);

  // Listen to speech synthesis state
  useEffect(() => {
    registerSpeakingListener((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      stopSpeech();
    };
  }, []);

  // Handlers for Home Screen
  const handleStartSell = () => {
    stopSpeech();
    setSellStep('photo');
    setActiveTab('sell');
  };

  // Step 1: Photo Captured
  const handlePhotoCaptured = (photoUrl: string, sampleInfo?: typeof DEMO_PHOTO_OPTIONS[0]) => {
    stopSpeech();
    setTempPhoto(photoUrl);
    if (sampleInfo) {
      setTempDetectedTitle(sampleInfo.detectedTitle);
      setTempDetectedMaterial(sampleInfo.material);
    } else {
      setTempDetectedTitle('Handmade Artisan Craft');
      setTempDetectedMaterial('Natural Fiber');
    }
    setSellStep('ai_check');
  };

  // Step 2: AI Check Confirmed
  const handleAICheckConfirmed = (confirmedName: string) => {
    stopSpeech();
    setTempDetectedTitle(confirmedName);
    setSellStep('speak');
  };

  // Step 3: Voice Q&A Details Completed -> Build 1 Master Product Profile
  const handleSpeakDetailsComplete = (details: {
    material: string;
    isHandmade: boolean;
    quantity: number;
    price: number;
    costMaterial: number;
    costLabor: number;
  }) => {
    stopSpeech();
    // "handcrafted Handmade Jute Bag" reads doubled — drop handmade/handcrafted
    // from the name inside the generated description.
    const descName =
      tempDetectedTitle.replace(/\b(handmade|handcrafted|hand-made)\b/gi, '').replace(/\s{2,}/g, ' ').trim() ||
      tempDetectedTitle;
    const newProduct: ProductProfile = {
      id: `prod-${Date.now()}`,
      name: tempDetectedTitle,
      category: 'Handicrafts & Sustainable Living',
      material: details.material,
      isHandmade: details.isHandmade,
      quantity: details.quantity,
      price: details.price,
      costMaterial: details.costMaterial,
      costLabor: details.costLabor,
      description: `Eco-friendly, authentic handcrafted ${descName.toLowerCase()} made with ${details.material}. Prepared for multi-channel listing.`,
      image: tempPhoto,
      tags: ['Handmade', 'Artisan', 'Sustainable', 'Craft2Cart Verified'],
      location: userProfile.location || 'Madurai, Tamil Nadu',
      status: 'ready',
      createdAt: 'Just now'
    };

    // Update state
    setCurrentProduct(newProduct);
    setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
    setSellStep('ready');
  };

  // Delete Product Handler
  const handleDeleteProduct = (productId: string) => {
    stopSpeech();
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    if (currentProduct && currentProduct.id === productId) {
      if (updated.length > 0) {
        setCurrentProduct(updated[0]);
      } else {
        // Nothing left to show in the sell flow — restart from the photo step.
        setSellStep('photo');
      }
    }
  };

  // Save Edited Product Handler
  const handleSaveEditedProduct = (updated: ProductProfile) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (currentProduct && currentProduct.id === updated.id) {
      setCurrentProduct(updated);
    }
    setProductToEdit(null);
    speakText(
      currentLang === 'en'
        ? `${updated.name} details updated successfully!`
        : `${updated.name} வெற்றிகரமாக புதுப்பிக்கப்பட்டது!`,
      currentLang
    );
  };

  // Add or update a buyer inquiry. A matching id means an edit, otherwise the
  // new inquiry goes to the top of the list where the user will look for it.
  const handleSaveBuyer = (saved: BuyerInquiry) => {
    stopSpeech();
    const isExisting = buyers.some((b) => b.id === saved.id);
    setBuyers((prev) => (isExisting ? prev.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...prev]));
    setBuyerEditor(null);
    speakText(
      currentLang === 'en'
        ? isExisting
          ? `${saved.name} details updated successfully!`
          : `${saved.name} added to your buyers.`
        : isExisting
          ? `${saved.name} விவரங்கள் புதுப்பிக்கப்பட்டன!`
          : `${saved.name} வாங்குபவர் பட்டியலில் சேர்க்கப்பட்டார்.`,
      currentLang
    );
  };

  const handleDeleteBuyer = (buyerId: string) => {
    stopSpeech();
    setBuyers((prev) => prev.filter((b) => b.id !== buyerId));
  };

  // Update Profile Handler
  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
  };

  // Step 4: Advance to Sell Everywhere
  const handleSellEverywhere = () => {
    stopSpeech();
    setSellStep('sell_everywhere');
  };

  // Navigation Tab Change
  const handleTabChange = (tabId: string) => {
    stopSpeech();
    setActiveTab(tabId as any);
    if (tabId === 'sell' && sellStep === 'ready') {
      // Keep on ready or reset to photo
    }
  };

  // Top App Bar Back Navigation
  const handleTopBack = () => {
    stopSpeech();
    if (activeTab === 'sell') {
      if (sellStep === 'ai_check') setSellStep('photo');
      else if (sellStep === 'speak') setSellStep('ai_check');
      else if (sellStep === 'ready') setSellStep('speak');
      else if (sellStep === 'sell_everywhere') setSellStep('ready');
      else if (sellStep === 'govt_fair' || sellStep === 'whatsapp_share') setSellStep('sell_everywhere');
      else setActiveTab('home');
    } else {
      setActiveTab('home');
    }
  };

  // Remounting the content area on every screen change replays the one-shot
  // enter animation. The sell flow keys on its step too, so each question in
  // the voice flow gets the same gentle arrival as a tab switch.
  const screenKey = activeTab === 'sell' ? `sell:${sellStep}` : activeTab;

  // overflow-x-clip (not -hidden) so this shell never becomes a scroll
  // container and swallows the page's vertical scrolling. select-none is
  // deliberately absent: it blocked caret placement inside the edit forms in
  // some Android WebViews.
  return (
    <div className="min-h-[100svh] w-full overflow-x-clip bg-[#f9f9f6] text-[#1a1c1b] flex flex-col font-['Public_Sans']">
      {/* Top Header Bar */}
      <TopAppBar
        currentLang={currentLang}
        onLanguageChange={(lang) => setCurrentLang(lang)}
        onOpenProfile={() => setShowProfileModal(true)}
        onBack={activeTab !== 'home' ? handleTopBack : undefined}
        title="Craft2Cart"
        isSpeaking={isSpeaking}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userAvatar={userProfile.avatar}
      />

      {/* Main Content Area */}
      {/* Padding reserves the fixed header, the fixed bottom nav, and the
          device's notch/gesture-bar insets — see --app-* vars in index.css. */}
      <div
        key={screenKey}
        className="animate-enter flex-1 w-full max-w-6xl mx-auto flex flex-col min-w-0"
        style={{
          paddingLeft: 'max(1rem, var(--safe-left))',
          paddingRight: 'max(1rem, var(--safe-right))',
          paddingTop: 'calc(var(--app-header-h) + var(--safe-top) + 1rem)',
          paddingBottom: 'calc(var(--app-nav-h) + var(--safe-bottom) + 1rem)'
        }}
      >
        {activeTab === 'home' && (
          <HomeScreen
            lang={currentLang}
            onStartSell={handleStartSell}
            onViewProducts={() => setActiveTab('products')}
            onViewBuyers={() => setActiveTab('buyers')}
          />
        )}

        {activeTab === 'sell' && (
          <>
            {sellStep === 'photo' && (
              <TakePhotoScreen
                lang={currentLang}
                onPhotoCaptured={handlePhotoCaptured}
              />
            )}

            {sellStep === 'ai_check' && (
              <AICheckScreen
                photoUrl={tempPhoto}
                detectedName={tempDetectedTitle}
                detectedMaterial={tempDetectedMaterial}
                lang={currentLang}
                onConfirm={handleAICheckConfirmed}
                onRetake={() => setSellStep('photo')}
              />
            )}

            {sellStep === 'speak' && (
              <SpeakDetailsScreen
                detectedName={tempDetectedTitle}
                detectedMaterial={tempDetectedMaterial}
                photoUrl={tempPhoto}
                lang={currentLang}
                onComplete={handleSpeakDetailsComplete}
                onBack={() => setSellStep('ai_check')}
              />
            )}

            {sellStep === 'ready' && (
              <ProductReadyScreen
                product={currentProduct}
                lang={currentLang}
                onSellEverywhere={handleSellEverywhere}
                onEdit={() => setProductToEdit(currentProduct)}
              />
            )}

            {sellStep === 'sell_everywhere' && (
              <SellEverywhereScreen
                product={currentProduct}
                lang={currentLang}
                onOpenChannel={(channelId) => setSelectedChannelExport(channelId)}
                onOpenGovtFair={() => setSellStep('govt_fair')}
                onOpenWhatsApp={() => setSellStep('whatsapp_share')}
                onEditProduct={() => setProductToEdit(currentProduct)}
              />
            )}

            {sellStep === 'govt_fair' && (
              <GovtFairFlow
                product={currentProduct}
                lang={currentLang}
                onBack={() => setSellStep('sell_everywhere')}
                onFinish={() => {
                  setActiveTab('home');
                  setSellStep('photo');
                }}
              />
            )}

            {sellStep === 'whatsapp_share' && (
              <WhatsAppShareScreen
                product={currentProduct}
                lang={currentLang}
                onBack={() => setSellStep('sell_everywhere')}
              />
            )}
          </>
        )}

        {activeTab === 'products' && (
          <MyProductsScreen
            products={products}
            lang={currentLang}
            onSelectProduct={(prod) => {
              setCurrentProduct(prod);
              setActiveTab('sell');
              setSellStep('sell_everywhere');
            }}
            onAddNewProduct={handleStartSell}
            onDeleteProduct={handleDeleteProduct}
            onEditProduct={(prod) => setProductToEdit(prod)}
          />
        )}

        {activeTab === 'buyers' && (
          <BuyersScreen
            buyers={buyers}
            lang={currentLang}
            onAddBuyer={() => setBuyerEditor({ buyer: null })}
            onEditBuyer={(buyer) => setBuyerEditor({ buyer })}
            onDeleteBuyer={handleDeleteBuyer}
          />
        )}

        {activeTab === 'help' && (
          <HelpScreen lang={currentLang} />
        )}
      </div>

      {/* Product Edit Modal */}
      {productToEdit && (
        <ProductEditModal
          product={productToEdit}
          lang={currentLang}
          onSave={handleSaveEditedProduct}
          onClose={() => setProductToEdit(null)}
        />
      )}

      {/* Buyer Add / Edit Modal */}
      {buyerEditor && (
        <BuyerEditModal
          buyer={buyerEditor.buyer}
          products={products}
          lang={currentLang}
          onSave={handleSaveBuyer}
          onClose={() => setBuyerEditor(null)}
        />
      )}

      {/* Seller Profile Modal (View & Edit) */}
      {showProfileModal && (
        <SellerProfileModal
          lang={currentLang}
          profile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Channel Export / Listing Inspector Modal */}
      {selectedChannelExport && (
        <ChannelExportModal
          channelId={selectedChannelExport}
          product={currentProduct}
          lang={currentLang}
          onClose={() => setSelectedChannelExport(null)}
        />
      )}

      {/* Intro splash. Rendered over an app that is already mounted and
          interactive, so it delays nothing. */}
      {showIntro && <IntroSplash lang={currentLang} onDone={() => setShowIntro(false)} />}

      {/* Persistent Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lang={currentLang}
      />
    </div>
  );
}
