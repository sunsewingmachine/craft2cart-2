import React, { useState } from 'react';
import { BuyerInquiry, ProductProfile, Language } from '../types';
import { bi, speechFor } from '../data/translations';
import { speakText, playTapTone } from '../utils/audio';

interface BuyerEditModalProps {
  /** null = adding a brand new buyer inquiry. */
  buyer: BuyerInquiry | null;
  /** Used to offer the seller's own catalog as the requested product. */
  products: ProductProfile[];
  lang: Language;
  onSave: (buyer: BuyerInquiry) => void;
  onClose: () => void;
}

const FALLBACK_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCLH6bRHq3rAzbbw3XPl3p803tF261Tvc8ol4La8t7dSft3VZutPHGe9J-nPrYYx-JVD22O_RcoavEYQb4obS4iU8sk8s3ssvzimuRORmK7WSDZoWodBA8HeSR-PAxQ7-Nctr4-F9cfEBimlGD0g1-JhHTFSKZW8Gkc5_53DQEXWlbFeY4PvcksipcoZFBPyhsD8LZiQii1TdXhHSwaMM---qxUAbFN5GUEgqmDYWM6a9P8y3VCqe54';

const TIME_OPTIONS = ['Just now', '2 hours ago', 'Yesterday', '2 days ago', 'Last week'];

export const BuyerEditModal: React.FC<BuyerEditModalProps> = ({
  buyer,
  products,
  lang,
  onSave,
  onClose
}) => {
  const isNew = buyer === null;
  const firstProduct = products[0];

  const [name, setName] = useState(buyer?.name ?? '');
  const [role, setRole] = useState(buyer?.role ?? '');
  const [location, setLocation] = useState(buyer?.location ?? '');
  const [phone, setPhone] = useState(buyer?.phone ?? '+91 ');
  const [productName, setProductName] = useState(
    buyer?.productName ?? firstProduct?.name ?? ''
  );
  const [productImage, setProductImage] = useState(
    buyer?.productImage ?? firstProduct?.image ?? FALLBACK_IMAGE
  );
  const [quantity, setQuantity] = useState<number>(buyer?.quantity ?? 10);
  const [offeredPrice, setOfferedPrice] = useState<number>(
    buyer?.offeredPrice ?? firstProduct?.price ?? 600
  );
  const [originalPrice, setOriginalPrice] = useState<number>(
    buyer?.originalPrice ?? firstProduct?.price ?? 600
  );
  const [fullMessage, setFullMessage] = useState(buyer?.fullMessage ?? '');
  const [timeAgo, setTimeAgo] = useState(buyer?.timeAgo ?? 'Just now');
  const [isDemo, setIsDemo] = useState(buyer?.isDemo ?? false);

  const totalValue = Math.max(0, quantity) * Math.max(0, offeredPrice);

  const handleHear = () => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        isNew
          ? 'Add a buyer inquiry. Fill in the buyer name, their shop, phone number, which product they want, how many pieces and the price they offered. Tap Save when done.'
          : `Editing the inquiry from ${name}. You can change their details, the product, the quantity and the offered price here.`,
        isNew
          ? 'புதிய வாங்குபவர் கோரிக்கையைச் சேர்க்கவும். பெயர், கடை, தொலைபேசி எண், பொருள், எண்ணிக்கை மற்றும் விலையை நிரப்பவும். முடிந்ததும் சேமிக்கவும்.'
          : `${name} அவர்களின் கோரிக்கையைத் திருத்துகிறீர்கள். விவரங்கள், பொருள், எண்ணிக்கை மற்றும் விலையை இங்கே மாற்றலாம்.`
      ),
      lang
    );
  };

  // Selecting one of the seller's own crafts fills in the picture and a
  // sensible starting price in one tap.
  const handlePickProduct = (product: ProductProfile) => {
    playTapTone('tap');
    setProductName(product.name);
    setProductImage(product.image);
    setOriginalPrice(product.price);
    if (!buyer) setOfferedPrice(product.price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTapTone('success');

    const trimmedName = name.trim();
    const trimmedProduct = productName.trim();
    const cleanQuantity = Math.max(1, Number(quantity) || 1);
    const cleanOffered = Math.max(1, Number(offeredPrice) || 1);

    const saved: BuyerInquiry = {
      id: buyer?.id ?? `buyer-${Date.now()}`,
      name: trimmedName,
      role: role.trim() || bi('வாங்குபவர்', 'Buyer', lang),
      productName: trimmedProduct,
      productImage: productImage || FALLBACK_IMAGE,
      quantity: cleanQuantity,
      offeredPrice: cleanOffered,
      originalPrice: Math.max(1, Number(originalPrice) || cleanOffered),
      location: location.trim(),
      fullMessage:
        fullMessage.trim() ||
        `${trimmedName} wants ${cleanQuantity} pieces of ${trimmedProduct} at ₹${cleanOffered} each.`,
      isDemo,
      phone: phone.trim(),
      timeAgo: timeAgo.trim() || 'Just now'
    };

    onSave(saved);
  };

  const fieldClass =
    'w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] focus:ring-1 focus:ring-[#9f3e07] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#1a1c1b] outline-none transition-all';
  const labelClass = 'text-xs font-bold text-[#57423a] uppercase tracking-wider';

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
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e8e5df]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#d6e0f6] text-[#555f71] flex items-center justify-center border border-[#bdc7dc] shrink-0">
              <span className="material-symbols-outlined text-2xl">
                {isNew ? 'person_add' : 'edit_note'}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-['Source_Serif_4',serif] text-xl sm:text-2xl font-bold text-[#1a1c1b] leading-tight">
                {isNew
                  ? bi('வாங்குபவரைச் சேர்', 'Add Buyer', lang)
                  : bi('வாங்குபவரைத் திருத்து', 'Edit Buyer', lang)}
              </h3>
              <p className="text-xs text-[#57423a] font-medium">
                {bi('வாங்குபவர் கோரிக்கை விவரங்கள்', 'Buyer inquiry details', lang)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleHear}
              aria-label="Hear instructions"
              className="w-10 h-10 rounded-full bg-[#d6e0f6] text-[#004a77] flex items-center justify-center hover:bg-[#bdc7dc] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                volume_up
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full bg-[#e2e3e0] text-[#57423a] flex items-center justify-center hover:bg-[#d5d7d4] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Who is the buyer */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="buyer-name">
                👤 {bi('வாங்குபவர் பெயர்', 'Buyer Name', lang)}
              </label>
              <input
                id="buyer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amit Verma"
                required
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="buyer-role">
                  🏬 {bi('கடை / நிறுவனம்', 'Shop / Company', lang)}
                </label>
                <input
                  id="buyer-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Eco Living Retail Store"
                  className={fieldClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="buyer-location">
                  📍 {bi('இடம்', 'City / State', lang)}
                </label>
                <input
                  id="buyer-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, Karnataka"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="buyer-phone">
                📞 {bi('தொலைபேசி எண்', 'Phone Number', lang)}
              </label>
              <input
                id="buyer-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345"
                required
                className={fieldClass}
              />
              <p className="text-[11px] text-[#78716c]">
                {bi(
                  'இந்த எண்ணுக்குத்தான் அழைப்பு மற்றும் வாட்ஸ்அப் பொத்தான்கள் செல்லும்.',
                  'The Call and WhatsApp buttons on the card use this number.',
                  lang
                )}
              </p>
            </div>
          </div>

          {/* What they want */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-3">
            <label className={labelClass} htmlFor="buyer-product">
              🛍️ {bi('எந்த பொருள்', 'Which Product', lang)}
            </label>

            <div className="flex items-center gap-3">
              <img
                src={productImage || FALLBACK_IMAGE}
                alt={productName}
                className="w-16 h-16 rounded-2xl object-cover border border-[#e8e5df] bg-[#eeeeeb] shrink-0"
              />
              <input
                id="buyer-product"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Handmade Jute Bag"
                required
                className={fieldClass}
              />
            </div>

            {/* One-tap pick from the seller's own catalog */}
            {products.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {products.slice(0, 8).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handlePickProduct(product)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                      productName === product.name
                        ? 'bg-[#ffdbcd] text-[#9f3e07] border-[#9f3e07]'
                        : 'bg-[#f4f4f1] text-[#57423a] border-[#e8e5df] hover:border-[#9f3e07]/40'
                    }`}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity & price */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  📦 {bi('எத்தனை வேண்டும்', 'Quantity Wanted', lang)}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 shrink-0 rounded-xl bg-[#f4f4f1] hover:bg-[#e2e3e0] text-[#57423a] font-bold text-lg flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full text-center bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl py-2 text-lg font-bold text-[#1a1c1b] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="w-10 h-10 shrink-0 rounded-xl bg-[#f4f4f1] hover:bg-[#e2e3e0] text-[#57423a] font-bold text-lg flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass} htmlFor="buyer-offered">
                  💰 {bi('ஒன்றுக்கு தரும் விலை', 'Offered Price (each)', lang)}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#9f3e07] shrink-0">₹</span>
                  <input
                    id="buyer-offered"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(Number(e.target.value))}
                    required
                    className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3 py-2 text-xl font-extrabold text-[#9f3e07] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="buyer-original">
                🏷️ {bi('உங்கள் விலை', 'Your Listed Price (each)', lang)}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#57423a] shrink-0">₹</span>
                <input
                  id="buyer-original"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Live total so the artisan sees the deal size while typing */}
            <div className="bg-[#f9f9f6] rounded-xl border border-[#e8e5df] px-3.5 py-2.5 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#57423a]">
                {bi('மொத்த மதிப்பு', 'Total Value', lang)}
              </span>
              <span className="font-extrabold text-lg text-[#9f3e07] nowrap">
                ₹{totalValue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Message & meta */}
          <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#e8e5df] flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="buyer-message">
                💬 {bi('வாங்குபவரின் செய்தி', "Buyer's Message", lang)}
              </label>
              <textarea
                id="buyer-message"
                rows={3}
                value={fullMessage}
                onChange={(e) => setFullMessage(e.target.value)}
                placeholder="What did the buyer ask for?"
                className="w-full bg-[#f9f9f6] border border-[#dec0b5] focus:border-[#9f3e07] rounded-xl px-3.5 py-2.5 text-sm font-normal text-[#1a1c1b] outline-none leading-relaxed"
              />
              <p className="text-[11px] text-[#78716c]">
                {bi(
                  'காலியாக விட்டால் சுருக்கமான செய்தி தானாக உருவாக்கப்படும்.',
                  'Left empty, a short summary message is generated for you.',
                  lang
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass} htmlFor="buyer-when">
                  🕒 {bi('எப்போது கேட்டார்', 'Enquired', lang)}
                </label>
                <select
                  id="buyer-when"
                  value={TIME_OPTIONS.includes(timeAgo) ? timeAgo : 'Just now'}
                  onChange={(e) => setTimeAgo(e.target.value)}
                  className={fieldClass}
                >
                  {TIME_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 bg-[#f9f9f6] border border-[#e8e5df] rounded-xl px-3.5 py-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="w-5 h-5 accent-[#9f3e07] shrink-0"
                />
                <span className="text-xs font-semibold text-[#57423a]">
                  {bi('இது ஒரு மாதிரி (டெமோ) வாங்குபவர்', 'This is a demo buyer', lang)}
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
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
              className="flex-1 min-h-[52px] bg-[#9f3e07] hover:bg-[#c05621] text-white rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">save</span>
              <span>
                {isNew ? bi('சேர்', 'Add Buyer', lang) : bi('சேமி', 'Save Changes', lang)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
