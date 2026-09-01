import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { getBucket } from '../lib/firebase';

// Product photos. Captured photos arrive as base64 data URLs; keeping those in
// Firestore would blow the 1 MB document limit and make every catalog read
// slow, so the bytes go to Cloud Storage and the document keeps only the URL.
//
// Upload failures are never fatal: the caller falls back to the data URL it
// already has, so the artisan still sees their photo and the flow continues.

/** Demo products ship with https images — only captured data URLs need uploading. */
export const needsUpload = (photoUrl: string): boolean => photoUrl.startsWith('data:');

export const isStorageAvailable = (): boolean => getBucket() !== null;

/**
 * Store a product photo under the signed-in artisan's folder.
 * Returns the public download URL, or null when Storage is unavailable.
 */
export async function uploadProductPhoto(
  uid: string,
  productId: string,
  photoDataUrl: string
): Promise<string | null> {
  const bucket = getBucket();
  if (!bucket || !needsUpload(photoDataUrl)) return null;

  // Path mirrors the Firestore layout and the storage.rules owner check:
  // an artisan can only ever write inside their own uid.
  const objectRef = ref(bucket, `artisans/${uid}/products/${productId}.jpg`);

  try {
    await uploadString(objectRef, photoDataUrl, 'data_url', {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000'
    });
    return await getDownloadURL(objectRef);
  } catch (err) {
    console.warn('[mediaService] photo upload failed, keeping local copy:', err);
    return null;
  }
}
