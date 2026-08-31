import React, { useState, useEffect } from 'react';
import { Language, ProductProfile, SellingChannel, UserProfile } from './types';
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

export default function App() {
  // Navigation & Language
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'sell' | 'buyers' | 'help'>('home');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Products & Buyers State
  const [products, setProducts] = useState<ProductProfile[]>(SAMPLE_PRODUCTS);
  const [currentProduct, setCurrentProduct] = useState<ProductProfile>(SAMPLE_PRODUCTS[0]);
  const [buyers] = useState(DEMO_BUYERS);

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
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
      description: `Eco-friendly, authentic handcrafted ${tempDetectedTitle.toLowerCase()} made with ${details.material}. Prepared for multi-channel listing.`,
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
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      if (currentProduct && currentProduct.id === productId) {
        if (updated.length > 0) {
          setCurrentProduct(updated[0]);
        }
      }
      return updated;
    });
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

  return (
    <div className="min-h-screen bg-[#f9f9f6] text-[#1a1c1b] flex flex-col font-['Public_Sans'] pb-24 select-none">
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
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-4 flex flex-col">
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

      {/* Persistent Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lang={currentLang}
      />
    </div>
  );
}
