// Helpers for user-uploaded photos.
//
// The profile is persisted in localStorage as JSON, so a raw phone photo
// (3-8 MB as a data URL) would blow the ~5MB quota on the very first save.
// Every uploaded photo is therefore center-cropped to a square and scaled
// down before it ever reaches React state.

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB source file

export type PhotoError = 'not-image' | 'too-large' | 'unreadable';

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('unreadable'));
    img.src = src;
  });

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('unreadable'));
    reader.readAsDataURL(file);
  });

/**
 * Turn a picked image file into a square JPEG data URL of at most `size` px.
 * Rejects with a `PhotoError` message for anything we can't use.
 */
export const fileToSquareDataUrl = async (file: File, size = 512): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new Error('not-image' as PhotoError);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('too-large' as PhotoError);

  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const side = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
  if (!side) throw new Error('unreadable' as PhotoError);

  const target = Math.min(size, side);
  const canvas = document.createElement('canvas');
  canvas.width = target;
  canvas.height = target;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('unreadable' as PhotoError);

  // Center crop to a square, then scale into the canvas.
  const sx = ((img.naturalWidth || img.width) - side) / 2;
  const sy = ((img.naturalHeight || img.height) - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);

  return canvas.toDataURL('image/jpeg', 0.85);
};

/**
 * Scale a data URL so its longest edge is at most `maxEdge`, keeping the aspect
 * ratio. Product photos must NOT be square-cropped like avatars are — cropping
 * a tall vase to a square cuts off the very thing being catalogued.
 */
export const scaleDataUrl = async (dataUrl: string, maxEdge = 1024, quality = 0.82): Promise<string> => {
  const img = await loadImage(dataUrl);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) throw new Error('unreadable' as PhotoError);

  const scale = Math.min(1, maxEdge / Math.max(width, height));
  if (scale === 1) return dataUrl;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('unreadable' as PhotoError);

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
};

/**
 * Turn a picked product photo into something we can actually send: a phone
 * photo is 3-8 MB, which is slow to upload on an artisan's data plan, slow for
 * the model to read, and past the API's size cap. 1024px is plenty for both
 * cataloging and the listing thumbnail.
 */
export const fileToListingPhoto = async (file: File, maxEdge = 1024): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new Error('not-image' as PhotoError);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('too-large' as PhotoError);

  const dataUrl = await readAsDataUrl(file);
  return scaleDataUrl(dataUrl, maxEdge);
};

export const isUploadedPhoto = (url: string): boolean => url.startsWith('data:');
