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

export const isUploadedPhoto = (url: string): boolean => url.startsWith('data:');
