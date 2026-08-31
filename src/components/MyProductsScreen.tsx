import React, { useState } from 'react';
import { ProductProfile, Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface MyProductsScreenProps {
  products: ProductProfile[];
  lang: Language;
  onSelectProduct: (product: ProductProfile) => void;
  onAddNewProduct: () => void;
  onDeleteProduct: (productId: string) => void;
  onEditProduct: (product: ProductProfile) => void;
}

export const MyProductsScreen: React.FC<MyProductsScreenProps> = ({
  products,
  lang,
  onSelectProduct,
  onAddNewProduct,
  onDeleteProduct,
  onEditProduct
}) => {
  const t = getTranslation(lang);
  const [productToDelete, setProductToDelete] = useState<ProductProfile | null>(null);
  const [deletedToast, setDeletedToast] = useState<string | null>(null);

  const handleHear = () => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        `Here are your ${products.length} confirmed products. Tap on any product to view selling channels, tap the pencil button to edit details, or tap delete to remove.`,
        `இங்கே உங்கள் ${products.length} பொருட்கள் உள்ளன. விற்க பொருளைத் தட்டவும், விவரங்களைத் திருத்த பென்சில் பொத்தானை அழுத்தவும் அல்லது நீக்க குப்பைத் தொட்டி பொத்தானை அழுத்தவும்.`
      ),
      lang
    );
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    playTapTone('tap');
    const name = productToDelete.name;
    onDeleteProduct(productToDelete.id);
    setProductToDelete(null);

    // Show quick feedback
    setDeletedToast(name);
    setTimeout(() => setDeletedToast(null), 3000);

    speakText(
      speechFor(lang, `${name} has been deleted.`, `${name} வெற்றிகரமாக நீக்கப்பட்டது.`),
      lang
    );
  };

  const handleHearDeleteModal = (product: ProductProfile) => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        `Do you want to delete ${product.name}? This will remove it from your catalog.`,
        `${product.name} பொருளை நீக்க விரும்புகிறீர்களா? இது உங்கள் பட்டியலிலிருந்து அகற்றப்படும்.`
      ),
      lang
    );
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-4">
      {/* Toast Notification */}
      {deletedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1a1c1b] text-white px-4 py-2.5 rounded-full shadow-lg text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in border border-white/10">
          <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
          <span>{bi('நீக்கப்பட்டது', 'Deleted', lang)}: <strong>{deletedToast}</strong></span>
        </div>
      )}

      {/* Screen Title & Audio Assist */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Source_Serif_4',serif] text-2xl sm:text-3xl font-bold text-[#1a1c1b]">
            {t.myProducts}
          </h2>
          <p className="text-xs sm:text-sm text-[#57423a]">
            {bi(`${products.length} பொருட்கள் விற்பனைக்கு தயார்`, `${products.length} ${products.length === 1 ? 'craft item' : 'craft items'} ready for multi-channel sales`, lang)}
          </p>
        </div>
        <button
          onClick={handleHear}
          aria-label="Listen to products list"
          className="w-12 h-12 rounded-full bg-[#d6e0f6] text-[#555f71] flex items-center justify-center hover:bg-[#bdc7dc] transition-colors shadow-sm active:scale-95 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-2xl fill" style={{ fontVariationSettings: "'FILL' 1" }}>
            volume_up
          </span>
        </button>
      </div>

      {/* Empty State when all products are deleted */}
      {products.length === 0 ? (
        <div className="bg-[#ffffff] rounded-3xl p-8 border border-[#e8e5df] text-center flex flex-col items-center gap-4 shadow-sm my-4">
          <div className="w-20 h-20 rounded-full bg-[#ffdbcd]/50 text-[#9f3e07] flex items-center justify-center text-4xl">
            🛍️
          </div>
          <div>
            <h3 className="font-['Source_Serif_4',serif] text-xl sm:text-2xl font-bold text-[#1a1c1b]">
              {bi('இன்னும் பொருட்கள் இல்லை', 'No products yet', lang)}
            </h3>
            <p className="text-xs sm:text-sm text-[#57423a] mt-1 max-w-sm mx-auto">
              {bi('உங்கள் தயாரிப்புகள் எதுவும் இல்லை. ஒரு புகைப்படத்தை எடுத்து முதல் பொருளைச் சேர்க்கவும்.', 'You have no products yet. Take a photo and add your first craft.', lang)}
            </p>
          </div>
          <button
            onClick={() => {
              playTapTone('tap');
              onAddNewProduct();
            }}
            className="mt-2 min-h-[52px] px-6 bg-[#9f3e07] hover:bg-[#c05621] text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-xl">add_a_photo</span>
            <span>{bi('முதல் பொருளைச் சேர்', 'Add Your First Craft', lang)}</span>
          </button>
        </div>
      ) : (
        /* Product List Cards */
        <div className="flex flex-col gap-5">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#ffffff] rounded-2xl shadow-sm overflow-hidden flex flex-col border border-[#e8e5df] hover:border-[#9f3e07]/50 transition-all group relative"
            >
              {/* Product Image Area */}
              <div
                onClick={() => {
                  playTapTone('tap');
                  onSelectProduct(prod);
                }}
                className="relative w-full aspect-[4/3] sm:aspect-square bg-[#eeeeeb] cursor-pointer"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                />
                
                {/* Ready Status Badge */}
                <div className="absolute top-3.5 left-3.5 bg-[#006c3f] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                  <span>{bi('தயார்', 'Ready', lang)}</span>
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>

                {/* Direct Action Buttons on Image Overlay */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                  {/* Quick Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapTone('tap');
                      onEditProduct(prod);
                    }}
                    title={`Edit ${prod.name}`}
                    aria-label={`Edit ${prod.name}`}
                    className="w-10 h-10 rounded-full bg-black/60 hover:bg-[#9f3e07] text-white backdrop-blur-md flex items-center justify-center shadow-lg active:scale-90 transition-all border border-white/20"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>

                  {/* Direct Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapTone('tap');
                      setProductToDelete(prod);
                    }}
                    title={`Delete ${prod.name}`}
                    aria-label={`Delete ${prod.name}`}
                    className="w-10 h-10 rounded-full bg-black/60 hover:bg-[#ba1a1a] text-white backdrop-blur-md flex items-center justify-center shadow-lg active:scale-90 transition-all border border-white/20"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>

                {/* Sell CTA Pill */}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  {bi('எங்கும் விற்க தட்டவும் →', 'Tap to sell everywhere →', lang)}
                </div>
              </div>

              {/* Product Title, Details & Quick Action Buttons */}
              <div className="p-4 sm:p-5 flex flex-col gap-3 bg-[#ffffff]">
                <div
                  onClick={() => {
                    playTapTone('tap');
                    onSelectProduct(prod);
                  }}
                  className="flex justify-between items-start cursor-pointer"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-['Source_Serif_4',serif] text-xl font-bold text-[#1a1c1b] truncate group-hover:text-[#9f3e07] transition-colors">
                      {prod.name}
                    </h3>
                    <span className="text-xs text-[#555f71] block mt-0.5 truncate">
                      🧵 {prod.material} • {bi('எண்ணிக்கை', 'Qty', lang)}: {prod.quantity} {prod.dimensions ? `• ${prod.dimensions}` : ''}
                    </span>
                  </div>

                  <span className="font-['Public_Sans'] font-extrabold text-2xl text-[#9f3e07] shrink-0">
                    ₹{prod.price}
                  </span>
                </div>

                {/* Secondary Action Toolbar */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#e8e5df]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapTone('tap');
                      onEditProduct(prod);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#f4f4f1] hover:bg-[#ffdbcd]/50 text-[#9f3e07] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-[#dec0b5] active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span>{bi('திருத்து', 'Edit Details', lang)}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapTone('tap');
                      onSelectProduct(prod);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#9f3e07] hover:bg-[#c05621] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">storefront</span>
                    <span>{bi('விற்க', 'Sell Channels', lang)}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTapTone('tap');
                      setProductToDelete(prod);
                    }}
                    title={`Delete ${prod.name}`}
                    aria-label={`Delete ${prod.name}`}
                    className="w-9 h-9 rounded-xl bg-[#f4f4f1] hover:bg-[#ffdad6] text-[#555f71] hover:text-[#ba1a1a] flex items-center justify-center transition-colors active:scale-90 border border-[#e8e5df] shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action: Sell a Product */}
      {products.length > 0 && (
        <button
          onClick={() => {
            playTapTone('tap');
            onAddNewProduct();
          }}
          className="w-full min-h-[64px] bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] rounded-2xl font-['Public_Sans'] font-bold text-lg flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
          <span>{t.sellAProduct}</span>
        </button>
      )}

      {/* ===================================================================== */}
      {/* DELETE CONFIRMATION MODAL                                             */}
      {/* ===================================================================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-[#ffffff] text-[#1a1c1b] rounded-3xl w-full max-w-md shadow-2xl border border-[#e8e5df] p-5 sm:p-6 flex flex-col gap-4 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <button
                onClick={() => handleHearDeleteModal(productToDelete)}
                title="Hear audio in Tamil"
                className="w-10 h-10 rounded-full bg-[#d6e0f6] text-[#004a77] flex items-center justify-center hover:bg-[#bdc7dc] transition-all"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  volume_up
                </span>
              </button>
            </div>

            {/* Modal Title & Warning */}
            <div>
              <h3 className="font-['Source_Serif_4',serif] text-xl sm:text-2xl font-bold text-[#ba1a1a]">
                {bi('நீக்கவா?', 'Delete Product?', lang)}
              </h3>
              <p className="text-xs sm:text-sm text-[#57423a] mt-1">
                {bi('இந்த பொருளை உங்கள் பட்டியலிலிருந்து நீக்க விரும்புகிறீர்களா?', 'Are you sure you want to remove this item from your catalog?', lang)}
              </p>
            </div>

            {/* Product Card Preview */}
            <div className="bg-[#f9f9f6] rounded-2xl p-3.5 border border-[#e8e5df] flex items-center gap-3.5">
              <img
                src={productToDelete.image}
                alt={productToDelete.name}
                className="w-16 h-16 rounded-xl object-cover border border-[#e8e5df] bg-[#eeeeeb] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#1a1c1b] truncate">
                  {productToDelete.name}
                </h4>
                <p className="text-xs text-[#57423a] truncate">
                  🧵 {productToDelete.material} • {bi('எண்ணிக்கை', 'Qty', lang)}: {productToDelete.quantity}
                </p>
                <p className="font-extrabold text-sm text-[#9f3e07] mt-0.5">
                  ₹{productToDelete.price}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#ba1a1a] bg-[#ffdad6]/40 p-2.5 rounded-xl border border-[#ffdad6] font-medium">
              ⚠ {bi('இந்த செயல் திரும்பப்பெற முடியாது.', 'This action cannot be undone.', lang)}
            </p>

            {/* Modal Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  playTapTone('tap');
                  setProductToDelete(null);
                }}
                className="flex-1 min-h-[48px] bg-[#f4f4f1] hover:bg-[#e8e5df] text-[#1a1c1b] rounded-xl font-bold text-sm transition-all active:scale-95 border border-[#e8e5df]"
              >
                {bi('ரத்து', 'Cancel', lang)}
              </button>

              <button
                onClick={handleConfirmDelete}
                className="flex-1 min-h-[48px] bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                <span>{bi('நீக்கு', 'Delete', lang)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
