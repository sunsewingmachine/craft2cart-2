import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  orderBy,
  query,
  setDoc
} from 'firebase/firestore';
import { BuyerInquiry, ProductProfile, UserProfile } from '../types';
import { getDb } from '../lib/firebase';
import { uploadProductPhoto } from './mediaService';

// THE client-facing data layer (global rule 5). Screens and App.tsx call these
// functions only; nothing above this file imports Firestore or localStorage.
//
// Two backends behind one interface:
//   signed in  -> Firestore under artisans/{uid}, photos in Cloud Storage
//   otherwise  -> localStorage, exactly as the app behaved before login existed
// Every read falls back to local on error, so a Firestore outage degrades the
// app to the old offline behaviour instead of showing an empty catalog.

const PRODUCTS_KEY = 'craft2cart.products';
const BUYERS_KEY = 'craft2cart.buyers';
const PROFILE_KEY = 'craft2cart.profile';

// ---------------------------------------------------------------- local store

function readLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full — the app keeps working in memory */
  }
}

/** Products survive a refresh; an empty saved list means "fall back to demo". */
export const loadLocalProducts = (): ProductProfile[] | null => {
  const parsed = readLocal<ProductProfile[]>(PRODUCTS_KEY);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
};

/** Unlike products, an empty buyer list is a real saved state we must respect. */
export const loadLocalBuyers = (): BuyerInquiry[] | null => {
  const parsed = readLocal<BuyerInquiry[]>(BUYERS_KEY);
  return Array.isArray(parsed) ? parsed : null;
};

export const loadLocalProfile = (): UserProfile | null => readLocal<UserProfile>(PROFILE_KEY);

export const saveLocalProducts = (products: ProductProfile[]): void => writeLocal(PRODUCTS_KEY, products);
export const saveLocalBuyers = (buyers: BuyerInquiry[]): void => writeLocal(BUYERS_KEY, buyers);
export const saveLocalProfile = (profile: UserProfile): void => writeLocal(PROFILE_KEY, profile);

// ------------------------------------------------------------------ firestore

const productsRef = (uid: string) => collection(getDb()!, 'artisans', uid, 'products');
const buyersRef = (uid: string) => collection(getDb()!, 'artisans', uid, 'buyers');
const profileRef = (uid: string) => doc(getDb()!, 'artisans', uid);

/**
 * Everything one artisan owns, in a single call at sign-in.
 * A null field means "nothing saved yet" — the caller seeds demo data.
 */
export interface ArtisanData {
  products: ProductProfile[] | null;
  buyers: BuyerInquiry[] | null;
  profile: UserProfile | null;
}

export async function loadArtisanData(uid: string): Promise<ArtisanData> {
  const db = getDb();
  if (!db) {
    return { products: loadLocalProducts(), buyers: loadLocalBuyers(), profile: loadLocalProfile() };
  }

  try {
    const [productSnap, buyerSnap, profileSnap] = await Promise.all([
      // savedAt is written on every product; ordering by it keeps the newest first.
      getDocs(query(productsRef(uid), orderBy('savedAt', 'desc'))),
      getDocs(buyersRef(uid)),
      getDoc(profileRef(uid))
    ]);

    const products = productSnap.docs.map((d) => d.data().product as ProductProfile);
    const buyers = buyerSnap.docs.map((d) => d.data().buyer as BuyerInquiry);

    return {
      products: products.length > 0 ? products : null,
      // An existing (even empty) buyers collection is a real state; only treat a
      // brand-new account as "seed the demo buyers".
      buyers: buyerSnap.empty && !profileSnap.exists() ? null : buyers,
      profile: profileSnap.exists() ? (profileSnap.data().profile as UserProfile) : null
    };
  } catch (err) {
    console.warn('[artisanStore] Firestore read failed, using local copy:', err);
    return { products: loadLocalProducts(), buyers: loadLocalBuyers(), profile: loadLocalProfile() };
  }
}

/**
 * Save one product. When signed in the photo is moved to Cloud Storage first and
 * the stored record points at the download URL. Returns the product as saved,
 * so the caller can swap the heavy data URL out of React state.
 */
export async function saveProduct(uid: string | null, product: ProductProfile): Promise<ProductProfile> {
  if (!uid || !getDb()) return product;

  let saved = product;
  const hostedUrl = await uploadProductPhoto(uid, product.id, product.image);
  if (hostedUrl) saved = { ...product, image: hostedUrl };

  try {
    // setDoc with the product id is idempotent: re-saving an edit overwrites
    // rather than creating a duplicate row (global rule 24).
    await setDoc(doc(productsRef(uid), saved.id), { product: saved, savedAt: Date.now() });
  } catch (err) {
    console.warn('[artisanStore] product save failed:', err);
  }
  return saved;
}

export async function deleteProduct(uid: string | null, productId: string): Promise<void> {
  if (!uid || !getDb()) return;
  try {
    await deleteDoc(doc(productsRef(uid), productId));
  } catch (err) {
    console.warn('[artisanStore] product delete failed:', err);
  }
}

export async function saveBuyer(uid: string | null, buyer: BuyerInquiry): Promise<void> {
  if (!uid || !getDb()) return;
  try {
    await setDoc(doc(buyersRef(uid), buyer.id), { buyer, savedAt: Date.now() });
  } catch (err) {
    console.warn('[artisanStore] buyer save failed:', err);
  }
}

export async function deleteBuyer(uid: string | null, buyerId: string): Promise<void> {
  if (!uid || !getDb()) return;
  try {
    await deleteDoc(doc(buyersRef(uid), buyerId));
  } catch (err) {
    console.warn('[artisanStore] buyer delete failed:', err);
  }
}

export async function saveProfile(uid: string | null, profile: UserProfile): Promise<void> {
  if (!uid || !getDb()) return;
  try {
    await setDoc(profileRef(uid), { profile, savedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('[artisanStore] profile save failed:', err);
  }
}

/** First sign-in on a new account: push whatever the artisan already has locally. */
export async function seedArtisanData(
  uid: string,
  data: { products: ProductProfile[]; buyers: BuyerInquiry[]; profile: UserProfile }
): Promise<void> {
  if (!getDb()) return;
  await Promise.all([
    ...data.products.map((p) => saveProduct(uid, p)),
    ...data.buyers.map((b) => saveBuyer(uid, b)),
    saveProfile(uid, data.profile)
  ]);
}
