import React, { useState } from 'react';
import { ProductProfile, Language } from '../types';
import { DEMO_PHOTO_OPTIONS } from '../data/sampleProducts';
import { bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface ProductEditModalProps {
  product: ProductProfile;
  lang: Language;
  onSave: (updatedProduct: ProductProfile) => void;
  onClose: () => void;
}

const COMMON_MATERIALS = [
  'Natural Golden Jute',
  'Terracotta Clay',
  'Pure Cotton Handloom',
  'Banana Fiber',
  'Palm Leaf Weave',
  'Teak Wood',
  'Brass / Bell Metal',
  'Silk Handloom'
];

const CATEGORIES = [
  'Handicrafts & Sustainable Living',
  'Home Decor & Pottery',
  'Handloom Textiles & Apparel',
  'Eco Bags & Storage',
  'Kitchen & Dining',
  'Traditional Heritage Art'
];

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  lang,
  onSave,
  onClose
}) => {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState<number>(product.price || 0);
  const [material, setMaterial] = useState(product.material || '');
  const [quantity, setQuantity] = useState<number>(product.quantity || 1);
  const [category, setCategory] = useState(product.category || CATEGORIES[0]);
  const [dimensions, setDimensions] = useState(product.dimensions || '');
  const [weight, setWeight] = useState(product.weight || '');
  const [description, setDescription] = useState(product.description || '');
  const [location, setLocation] = useState(product.location || 'Madurai, Tamil Nadu');
  const [image, setImage] = useState(product.image);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  // Audio helper
  const handleHear = () => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        `Editing ${name}. You can change the name, price, material, stock, dimensions, and description here. Tap Save when done.`,
        `${name} பொருளைத் திருத்துகிறீர்கள். பெயர், விலை, பொருள், இருப்பு, அளவு மற்றும் விளக்கத்தை இங்கே மாற்றலாம். முடிந்ததும் சேமிக்கவும்.`
      ),
      lang
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTapTone('success');

    const updated: ProductProfile = {
      ...product,
      name: name.trim() || product.name,
      price: Math.max(1, Number(price) || product.price),
      material: material.trim() || product.material,
      quantity: Math.max(1, Number(quantity) || 1),
      category,
      dimensions: dimensions.trim() || undefined,
      weight: weight.trim() || undefined,
      description: description.trim() || product.description,
      location: location.trim() || product.location,
      image
    };

    onSave(updated);
  };

  return (
    <div
      className="fixed inset-0 z-50 h-[100svh] bg-black/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto overscroll-contain animate-fade-in"
      style={{
        paddingTop: 'max(0.75rem, var(--safe-top))',
        paddingBottom: 'max(0.75rem, var(--safe-bottom))',
        paddingLeft: 'max(0.75rem, var(--safe-left))',
        paddingRight: 'max(0.75rem, var(--safe-right))'
      }}
    >
      <div className="bg-[#f9f9f6] text-[#1a1c1b] rounded-3xl w-full max-w-xl shadow-2xl border border-[#e8e5df] p-4 sm:p-7 my-auto relative flex flex-col gap-5">
        
        {/* ========================================================================= */}
        {/* HEADER                                                                    */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e8e5df]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ffdbcd] text-[#9f3e07] flex items-center justify-center border border-[#dec0b5] shrink-0">
              <span className="material-symbols-outlined text-2xl">edit_note</span>
            </div>
            <div>
              <h3 className="font-['Source_Serif_4',serif] text-xl sm:text-2xl font-bold text-[#1a1c1b]">
                {bi('பொருளைத் திருத்து', 'Edit Product', lang)}
              </h3>
              <p className="text-xs text-[#57423a] font-medium">
                {bi('தயாரிப்பு விவரங்களைத் திருத்து', 'Modify details', lang)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleHear}
              title="Hear instructions in Tamil"
              aria-label="Hear instructions in Tamil"
              className="w-10 h-10 rounded-full bg-[#d6e0f6] text-[#004a77] flex items-center justify-center hover:bg-[#bdc7dc] active:scale-95 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                volume_up
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full bg-[#e2e3e0] text-[#57423a] flex items-center justify-center hover:bg-[#d5d7d4] active:scale-95 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EDIT FORM                                                                 */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Photo & Image Switcher */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-3">
            <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider flex items-center justify-between">
              <span>📸 {bi('பொருளின் புகைப்படம்', 'Product Photograph', lang)}</span>
              <button
                type="button"
                onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                className="text-xs text-[#9f3e07] hover:underline font-bold"
              >
                {showPhotoPicker ? bi('மூடு', 'Close Picker', lang) : bi('புகைப்படத்தை மாற்று', 'Change Photo', lang)}
              </button>
            </label>

            <div className="flex items-center gap-4">
              <img
                src={image}
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#dec0b5] shadow-xs bg-[#eeeeeb]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#1a1c1b] font-semibold">{bi('தற்போதைய புகைப்படம்', 'Active catalog photo', lang)}</p>
                <p className="text-[11px] text-[#78716c] mt-0.5">{bi('வாட்ஸ்அப், ONDC & அமேசானில் காட்டப்படும் படம்', 'High-quality craft image shown across WhatsApp, ONDC, & Amazon', lang)}</p>
                <button
                  type="button"
                  onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                  className="mt-2 text-xs bg-[#f4f4f1] hover:bg-[#e2e3e0] text-[#57423a] px-3 py-1.5 rounded-xl font-bold border border-[#e8e5df] transition-all inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">photo_library</span>
                  <span>{bi('கேலரியில் இருந்து தேர்வு', 'Choose from Gallery', lang)}</span>
                </button>
              </div>
            </div>

            {/* Gallery Picker Grid */}
            {showPhotoPicker && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#e8e5df] animate-fade-in">
                {DEMO_PHOTO_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      playTapTone('tap');
                      setImage(opt.image);
                      if (!name || name === product.name) setName(opt.detectedTitle);
                      if (!material || material === product.material) setMaterial(opt.material);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      image === opt.image ? 'border-[#9f3e07] ring-2 ring-[#ffdbcd]' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={opt.image} alt={opt.detectedTitle} className="w-full h-full object-cover" />
                    {image === opt.image && (
                      <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#9f3e07] text-white rounded-full flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Name */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
              🏷️ {bi('பெயர்', 'Product Name / Title', lang)}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handmade Jute Bag"
              required
              className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] focus:ring-1 focus:ring-[#9f3e07] rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold text-[#1a1c1b] outline-none transition-all"
            />
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Price */}
            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-2">
              <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                💰 {bi('விலை (INR)', 'Price (INR)', lang)}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#9f3e07]">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] focus:ring-1 focus:ring-[#9f3e07] rounded-xl px-3 py-2 text-xl font-extrabold text-[#9f3e07] outline-none"
                />
              </div>
              {/* Quick adjustment pills */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPrice((p) => Math.max(10, p - 50))}
                  className="px-2.5 py-1 rounded-lg bg-[#f4f4f1] hover:bg-[#e2e3e0] text-xs font-bold text-[#57423a]"
                >
                  -₹50
                </button>
                <button
                  type="button"
                  onClick={() => setPrice((p) => p + 50)}
                  className="px-2.5 py-1 rounded-lg bg-[#f4f4f1] hover:bg-[#e2e3e0] text-xs font-bold text-[#57423a]"
                >
                  +₹50
                </button>
                <button
                  type="button"
                  onClick={() => setPrice((p) => p + 100)}
                  className="px-2.5 py-1 rounded-lg bg-[#f4f4f1] hover:bg-[#e2e3e0] text-xs font-bold text-[#57423a]"
                >
                  +₹100
                </button>
              </div>
            </div>

            {/* Stock Quantity */}
            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-2">
              <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                📦 {bi('இருப்பு', 'Stock Quantity', lang)}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-[#f4f4f1] hover:bg-[#e2e3e0] text-[#57423a] font-bold text-lg flex items-center justify-center shrink-0"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  required
                  className="w-full text-center bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl py-2 text-lg font-bold text-[#1a1c1b] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-xl bg-[#f4f4f1] hover:bg-[#e2e3e0] text-[#57423a] font-bold text-lg flex items-center justify-center shrink-0"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-1.5 pt-1 justify-center">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 5)}
                  className="px-2 py-0.5 rounded-lg bg-[#f4f4f1] text-[11px] font-bold text-[#57423a]"
                >
                  +5 units
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 10)}
                  className="px-2 py-0.5 rounded-lg bg-[#f4f4f1] text-[11px] font-bold text-[#57423a]"
                >
                  +10 units
                </button>
              </div>
            </div>
          </div>

          {/* Material */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-2">
            <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
              🧱 {bi('மூலப்பொருள்', 'Material', lang)}
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. Natural Golden Jute"
              className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#1a1c1b] outline-none"
            />
            {/* Quick Material Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_MATERIALS.map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => {
                    playTapTone('tap');
                    setMaterial(mat);
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    material === mat
                      ? 'bg-[#ffdbcd] text-[#9f3e07] border-[#9f3e07]'
                      : 'bg-[#f4f4f1] text-[#57423a] border-[#e8e5df] hover:border-[#9f3e07]/40'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Size & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                📏 {bi('அளவு', 'Size / Dimensions', lang)}
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 14&quot; x 12&quot; x 5&quot; or 10 inches"
                className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1a1c1b] outline-none"
              />
            </div>

            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                ⚖️ {bi('எடை', 'Weight', lang)}
              </label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 450g or 1.2 kg"
                className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1a1c1b] outline-none"
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
              📂 {bi('வகை', 'Category', lang)}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1a1c1b] outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
                📝 {bi('விளக்கம்', 'Product Story / Description', lang)}
              </label>
              <button
                type="button"
                onClick={() => {
                  playTapTone('tap');
                  setDescription(
                    `Authentic handcrafted ${name.toLowerCase()} skillfully made with ${material || 'natural materials'} by master artisans in ${location}. 100% eco-friendly and sustainable.`
                  );
                }}
                className="text-[11px] text-[#004a77] hover:underline font-bold"
              >
                ✨ {bi('கதையை தானாக உருவாக்கு', 'Auto-Craft Story', lang)}
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your craft, heritage technique, or usage..."
              className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-normal text-[#1a1c1b] outline-none leading-relaxed"
            />
          </div>

          {/* Location */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#57423a] uppercase tracking-wider">
              📍 {bi('இடம்', 'Workshop Location', lang)}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Madurai, Tamil Nadu"
              className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1a1c1b] outline-none"
            />
          </div>

          {/* ========================================================================= */}
          {/* ACTION BUTTONS                                                            */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#e8e5df]">
            <button
              type="button"
              onClick={() => {
                playTapTone('tap');
                onClose();
              }}
              className="flex-1 min-h-[52px] bg-[#f4f4f1] hover:bg-[#e8e5df] text-[#57423a] rounded-2xl font-bold text-sm sm:text-base border border-[#e8e5df] active:scale-95 transition-all"
            >
              {bi('ரத்து', 'Cancel', lang)}
            </button>

            <button
              type="submit"
              className="flex-1 min-h-[52px] bg-[#9f3e07] hover:bg-[#c05621] text-white rounded-2xl font-['Public_Sans'] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-xl">save</span>
              <span>{bi('சேமி', 'Save Changes', lang)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
