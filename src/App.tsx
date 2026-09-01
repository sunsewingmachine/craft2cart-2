import React, { useState, useEffect, useRef } from 'react';
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
import { LoginScreen } from './components/auth/LoginScreen';

import { ArtisanAccount, isAuthAvailable, signOutArtisan, watchAccount } from './services/authService';
import {
  deleteBuyer as deleteBuyerRemote,
  deleteProduct as deleteProductRemote,
  loadArtisanData,
  loadLocalBuyers,
  loadLocalProducts,
  loadLocalProfile,
  saveBuyer as saveBuyerRemote,
  saveLocalBuyers,
  saveLocalProducts,
  saveLocalProfile,
  saveProduct as saveProductRemote,
  saveProfile as saveProfileRemote,
  seedArtisanData
} from './services/artisanStore';
import {
  CatalogDraft,
  analyzeProductPhoto,
  draftDescription,
  draftName
} from './services/catalogService';

const initialProducts = loadLocalProducts() ?? SAMPLE_PRODUCTS;

export default function App() {
  // Navigation & Language
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'sell' | 'buyers' | 'help'>('home');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Sign-in. When Firebase is not configured the app runs exactly as before:
  // no login wall, everything in localStorage.
  const [account, setAccount] = useState<ArtisanAccount | null>(null);
  const [authReady, setAuthReady] = useState(!isAuthAvailable());
  const [skippedLogin, setSkippedLogin] = useState(false);

  // Products & Buyers State
  const [products, setProducts] = useState<ProductProfile[]>(initialProducts);
  const [currentProduct, setCurrentProduct] = useState<ProductProfile>(initialProducts[0]);
  const [buyers, setBuyers] = useState<BuyerInquiry[]>(() => loadLocalBuyers() ?? DEMO_BUYERS);

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadLocalProfile() ?? {
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

  // Smart cataloging. `catalogDraft` is whatever the AI last read from the
  // photo; `analysisId` discards a slow reply that lands after a retake.
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [catalogDraft, setCatalogDraft] = useState<CatalogDraft | null>(null);
  const [aiSource, setAiSource] = useState<'ai' | 'fallback' | null>(null);
  const analysisId = useRef(0);

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
  // This local copy is kept even when signed in: it is the offline cache and
  // the demo-mode store. Camera photos are data URLs, so a full quota (~5MB) is
  // possible — the app then simply keeps working in-memory.
  useEffect(() => {
    saveLocalProducts(products);
  }, [products]);

  useEffect(() => {
    saveLocalBuyers(buyers);
  }, [buyers]);

  useEffect(() => {
    saveLocalProfile(userProfile);
  }, [userProfile]);

  // Follow the signed-in artisan. Fires once with the restored session, which
  // is what clears the auth loading state on a refresh.
  useEffect(() => {
    if (!isAuthAvailable()) return;
    return watchAccount((next) => {
      setAccount(next);
      setAuthReady(true);
    });
  }, []);

  // Pull this artisan's catalog out of Firestore on sign-in. A brand-new
  // account has nothing there, so we push up whatever is on the device — that
  // way the first sign-in never looks like the app lost their work.
  useEffect(() => {
    if (!account) return;
    let cancelled = false;

    (async () => {
      const data = await loadArtisanData(account.uid);
      if (cancelled) return;

      if (!data.products && !data.buyers && !data.profile) {
        const seedProducts = loadLocalProducts() ?? SAMPLE_PRODUCTS;
        const seedBuyers = loadLocalBuyers() ?? DEMO_BUYERS;
        const seedProfile = loadLocalProfile() ?? userProfile;
        setProducts(seedProducts);
        setCurrentProduct(seedProducts[0]);
        setBuyers(seedBuyers);
        void seedArtisanData(account.uid, {
          products: seedProducts,
          buyers: seedBuyers,
          profile: seedProfile
        });
        return;
      }

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        setCurrentProduct(data.products[0]);
      }
      if (data.buyers) setBuyers(data.buyers);
      if (data.profile) setUserProfile(data.profile);
    })();

    return () => {
      cancelled = true;
    };
    // userProfile is only read as a seed value on first sign-in; re-running this
    // on every profile edit would re-fetch the whole catalog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

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

  // Step 1: Photo Captured -> hand the photo to Gemini for smart cataloging.
  // The demo samples ship with their own details and skip the round trip; a real
  // camera or gallery photo is a data URL and gets analysed.
  const handlePhotoCaptured = (photoUrl: string, sampleInfo?: typeof DEMO_PHOTO_OPTIONS[0]) => {
    stopSpeech();
    setTempPhoto(photoUrl);
    setCatalogDraft(null);
    setAiSource(null);

    const fallbackName = sampleInfo?.detectedTitle ?? 'Handmade Artisan Craft';
    const fallbackMaterial = sampleInfo?.material ?? 'Natural Fiber';
    setTempDetectedTitle(fallbackName);
    setTempDetectedMaterial(fallbackMaterial);
    setSellStep('ai_check');

    if (!photoUrl.startsWith('data:')) {
      setIsAnalyzing(false);
      return;
    }

    const requestId = ++analysisId.current;
    setIsAnalyzing(true);

    void analyzeProductPhoto(photoUrl, { name: fallbackName, material: fallbackMaterial }).then(
      (result) => {
        // A retake started a newer analysis — this answer is stale, drop it.
        if (requestId !== analysisId.current) return;
        setCatalogDraft(result.draft);
        setAiSource(result.source);
        setTempDetectedTitle(draftName(result.draft, currentLang));
        setTempDetectedMaterial(result.draft.material || fallbackMaterial);
        setIsAnalyzing(false);
      }
    );
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
      // The AI's own reading wins where it has one; the old generic strings stay
      // as the fallback for demo samples and offline runs.
      category: catalogDraft?.category || 'Handicrafts & Sustainable Living',
      material: details.material,
      isHandmade: details.isHandmade,
      quantity: details.quantity,
      price: details.price,
      costMaterial: details.costMaterial,
      costLabor: details.costLabor,
      description: catalogDraft
        ? draftDescription(catalogDraft, currentLang)
        : `Eco-friendly, authentic handcrafted ${descName.toLowerCase()} made with ${details.material}. Prepared for multi-channel listing.`,
      image: tempPhoto,
      tags:
        catalogDraft && catalogDraft.tags.length > 0
          ? catalogDraft.tags
          : ['Handmade', 'Artisan', 'Sustainable', 'Craft2Cart Verified'],
      location: userProfile.location || 'Madurai, Tamil Nadu',
      status: 'ready',
      createdAt: 'Just now'
    };

    // Update state
    setCurrentProduct(newProduct);
    setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
    setSellStep('ready');

    // Persist. The photo moves to Cloud Storage and the saved record comes back
    // pointing at the hosted URL, which we swap in so the heavy data URL is
    // dropped from state and from the local cache.
    void saveProductRemote(account?.uid ?? null, newProduct).then((saved) => {
      if (saved.image === newProduct.image) return;
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setCurrentProduct((prev) => (prev.id === saved.id ? saved : prev));
    });
  };

  // Delete Product Handler
  const handleDeleteProduct = (productId: string) => {
    stopSpeech();
    void deleteProductRemote(account?.uid ?? null, productId);
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
    void saveProductRemote(account?.uid ?? null, updated);
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
    void saveBuyerRemote(account?.uid ?? null, saved);
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
    void deleteBuyerRemote(account?.uid ?? null, buyerId);
    setBuyers((prev) => prev.filter((b) => b.id !== buyerId));
  };

  // Update Profile Handler
  const handleUpdateProfile = (updated: UserProfile) => {
    void saveProfileRemote(account?.uid ?? null, updated);
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

  // Sign out returns the app to the login wall and clears this artisan's data
  // out of memory, so the next person on a shared phone starts clean.
  const handleSignOut = async () => {
    stopSpeech();
    await signOutArtisan();
    setSkippedLogin(false);
    setActiveTab('home');
    setSellStep('photo');
    setShowProfileModal(false);
    setProducts(SAMPLE_PRODUCTS);
    setCurrentProduct(SAMPLE_PRODUCTS[0]);
    setBuyers(DEMO_BUYERS);
  };

  // Wait for Firebase to say whether a session was restored, so a signed-in
  // artisan never sees the login screen flash on a refresh.
  if (isAuthAvailable() && !authReady) {
    return (
      <div className="min-h-[100svh] w-full bg-[#f9f9f6] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#d6e0f6] border-t-[#128752] animate-spin" />
      </div>
    );
  }

  if (isAuthAvailable() && !account && !skippedLogin) {
    return (
      <LoginScreen
        lang={currentLang}
        onLanguageChange={setCurrentLang}
        onSkip={() => setSkippedLogin(true)}
      />
    );
  }

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
                isAnalyzing={isAnalyzing}
                draft={catalogDraft}
                aiSource={aiSource}
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
          accountLabel={account ? account.phoneNumber ?? account.email ?? account.displayName : null}
          onSignOut={account ? handleSignOut : undefined}
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
