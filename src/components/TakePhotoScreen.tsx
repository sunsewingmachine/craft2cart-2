import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { getTranslation, bi, speechFor } from '../data/translations';
import { DEMO_PHOTO_OPTIONS } from '../data/sampleProducts';
import { speakText, playTapTone, stopSpeech } from '../utils/audio';
import { fileToListingPhoto, scaleDataUrl } from '../utils/image';

interface TakePhotoScreenProps {
  lang: Language;
  onPhotoCaptured: (photoUrl: string, sampleInfo?: typeof DEMO_PHOTO_OPTIONS[0]) => void;
}

export const TakePhotoScreen: React.FC<TakePhotoScreenProps> = ({
  lang,
  onPhotoCaptured
}) => {
  const t = getTranslation(lang);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  // Mirror of `stream` for the unmount cleanup — the [] effect below would
  // otherwise close over the initial null and leave tracks running.
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<typeof DEMO_PHOTO_OPTIONS[0] | undefined>(undefined);
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    streamRef.current = null;
    setIsCameraActive(false);
  }, [stream]);

  // Start device live camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user' = 'environment') => {
    stopCamera();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API not available in this browser');
      return;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 1280 }
        },
        audio: false
      });

      setStream(newStream);
      streamRef.current = newStream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Unable to access live webcam/camera stream:', err);
      setIsCameraActive(false);
      setCameraError(err?.message || 'Camera permission denied or camera not found');
    }
  }, [stopCamera]);

  // The camera starts only on a user tap — a permission popup that fires the
  // moment the screen opens gets denied (or auto-blocked) far more often.
  // This effect only stops any live tracks on unmount.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Update video element when stream is ready
  useEffect(() => {
    if (videoRef.current && stream && isCameraActive) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isCameraActive]);

  // Voice Instructions
  const handleHearInstructions = () => {
    playTapTone('tap');
    speakText(
      speechFor(
        lang,
        capturedPhoto
          ? "Photo captured! Tap the big orange button to continue, or tap Retake to take another photo."
          : "Take a photo of your handmade craft. Point the camera at your product and tap the orange camera button.",
        capturedPhoto
          ? "புகைப்படம் எடுக்கப்பட்டது! தொடர ஆரஞ்சு பொத்தானை அழுத்தவும், அல்லது மீண்டும் எடுக்கவும்."
          : "உங்கள் கைவினைப் பொருளை புகைப்படம் எடுக்கவும். கேமராவை நேராக வைத்து ஆரஞ்சு பொத்தானை அழுத்தவும்."
      ),
      lang
    );
  };

  // Snap photo from live video feed
  const handleSnapLivePhoto = () => {
    if (videoRef.current && isCameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // If user mode, flip horizontally for mirror preview
        if (facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        playTapTone('shutter');
        stopCamera();
        setCapturedPhoto(dataUrl);
        setSelectedSample(undefined);
        // Shrink in the background so the AI step sends a light image; the
        // full-size shot is already on screen, so this is invisible.
        void scaleDataUrl(dataUrl).then((scaled) => setCapturedPhoto(scaled)).catch(() => {});

        speakText(
          speechFor(
            lang,
            "Photo captured! Tap Use This Photo to continue.",
            "புகைப்படம் எடுக்கப்பட்டது! தொடர இந்த புகைப்படத்தைப் பயன்படுத்தவும் என்பதை அழுத்தவும்."
          ),
          lang
        );
      }
    } else {
      // If camera stream not active, trigger native mobile camera input
      cameraInputRef.current?.click();
    }
  };

  // Handle image file selection (from phone camera or gallery)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // A raw phone photo is several megabytes. Downscaling here keeps the upload
    // and the AI call quick, and keeps the listing well under Firestore limits.
    try {
      const photo = await fileToListingPhoto(file);
      playTapTone('shutter');
      stopCamera();
      setCapturedPhoto(photo);
      setSelectedSample(undefined);

      speakText(
        speechFor(
          lang,
          "Photo selected! Tap Use This Photo to continue.",
          "புகைப்படம் தேர்வு செய்யப்பட்டது! தொடர அழுத்தவும்."
        ),
        lang
      );
    } catch {
      speakText(
        speechFor(
          lang,
          "That photo could not be used. Please try another one.",
          "அந்த புகைப்படத்தை பயன்படுத்த முடியவில்லை. வேறொன்றை முயற்சிக்கவும்."
        ),
        lang
      );
    } finally {
      // Let the same file be picked again after a failed or repeated attempt.
      e.target.value = '';
    }
  };

  // Retake / Reset
  const handleRetake = () => {
    playTapTone('tap');
    stopSpeech();
    setCapturedPhoto(null);
    setSelectedSample(undefined);
    startCamera(facingMode);
  };

  // Confirm photo and move to AI Check
  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      playTapTone('success');
      stopSpeech();
      onPhotoCaptured(capturedPhoto, selectedSample);
    }
  };

  // Switch between front and back camera
  const handleFlipCamera = () => {
    playTapTone('tap');
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Select demo sample only when user explicitly asks for demo
  const handleSelectSample = (sample: typeof DEMO_PHOTO_OPTIONS[0]) => {
    playTapTone('tap');
    stopCamera();
    setCapturedPhoto(sample.image);
    setSelectedSample(sample);
  };

  return (
    <main className="w-full max-w-xl mx-auto flex-1 flex flex-col py-2 gap-4">
      {/* Hidden inputs & canvas */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header with Step and Audio Instructions */}
      <div className="bg-[#ffffff] rounded-2xl shadow-sm border border-[#e8e5df] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ffdbcd]/50 flex items-center justify-center text-[#9f3e07] shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_camera
            </span>
          </div>
          <div>
            <h2 className="font-['Public_Sans'] text-xl sm:text-2xl font-bold text-[#1a1c1b] leading-tight">
              {capturedPhoto ? t.photoCaptured : t.takePhoto}
            </h2>
            <p className="text-xs sm:text-sm text-[#57423a] mt-0.5">
              {capturedPhoto ? t.aiChecking : t.photoTip}
            </p>
          </div>
        </div>

        <button
          onClick={handleHearInstructions}
          aria-label="Hear instructions"
          className="w-12 h-12 rounded-full bg-[#f2f0eb] text-[#9f3e07] flex items-center justify-center shrink-0 border border-[#e8e5df] hover:bg-[#ffdbcd]/30 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            volume_up
          </span>
        </button>
      </div>

      {/* Viewfinder Area */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-md border-2 border-[#e8e5df] flex flex-col justify-between p-4">
        {/* CASE 1: Photo has been captured / selected */}
        {capturedPhoto ? (
          <>
            <img
              src={capturedPhoto}
              alt="Captured Product"
              className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            />
            {/* Top Badge: Photo Ready */}
            <div className="relative z-10 flex justify-between items-center text-white">
              <span className="bg-[#128752] text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                {t.photoCaptured}
              </span>
            </div>

            {/* Bottom prompt */}
            <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-2xl p-3 text-center text-white text-xs sm:text-sm font-medium">
              {bi('பொருள் விவரங்களை சரிபார்க்க தயார்', 'Ready to verify craft details', lang)}
            </div>
          </>
        ) : isCameraActive ? (
          /* CASE 2: Live Camera Video Stream is Active */
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Live Camera Framing Corner Marks */}
            <div className="absolute inset-0 border-2 border-white/20 m-6 rounded-2xl pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
            </div>

            {/* Center Focus Reticle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/60 rounded-full flex items-center justify-center pointer-events-none opacity-80 animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>

            {/* Top Viewfinder Controls */}
            <div className="relative z-10 flex justify-between items-center text-white">
              <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                {t.cameraLive}
              </span>
              <button
                onClick={handleFlipCamera}
                title="Flip camera"
                className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/70 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">flip_camera_ios</span>
              </button>
            </div>

            {/* Bottom Tip */}
            <div className="relative z-10 bg-black/60 backdrop-blur-sm rounded-xl p-2.5 text-center text-white text-xs font-medium">
              {t.pointCameraPrompt}
            </div>
          </>
        ) : (
          /* CASE 3: Camera Stream Not Active (Browser sandbox or prompt to open camera) */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-[#2a2c2b] to-[#1a1c1b]">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 text-[#ffdbcd]">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                photo_camera
              </span>
            </div>
            <h3 className="font-['Public_Sans'] font-bold text-lg text-white mb-1">
              {t.takePhoto}
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-xs mb-6">
              {t.pointCameraPrompt}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              {/* Take Photo Button (Direct Camera Trigger) */}
              <button
                onClick={() => {
                  playTapTone('tap');
                  // Prefer the live in-app camera; fall back to the device's
                  // native camera input when the stream is blocked/unsupported.
                  if (cameraError || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
                    cameraInputRef.current?.click();
                  } else {
                    startCamera(facingMode);
                  }
                }}
                className="flex-1 bg-[#9f3e07] hover:bg-[#c05621] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">photo_camera</span>
                <span>{t.takePhotoWithCamera}</span>
              </button>

              {/* Upload from Gallery Button */}
              <button
                onClick={() => {
                  playTapTone('tap');
                  galleryInputRef.current?.click();
                }}
                className="flex-1 bg-white/15 hover:bg-white/25 text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-white/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">photo_library</span>
                <span>{t.uploadFromGallery}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Action Controls */}
      {capturedPhoto ? (
        /* Action buttons once photo is snapped */
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <button
            onClick={handleRetake}
            className="flex-1 bg-[#ffffff] border border-[#e8e5df] text-[#57423a] py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#f2f0eb] active:scale-98 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
            <span>{t.retakePhoto}</span>
          </button>

          <button
            onClick={handleConfirmPhoto}
            className="flex-1 bg-[#9f3e07] hover:bg-[#c05621] text-[#ffffff] py-3.5 px-5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
          >
            <span>{t.useThisPhoto}</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      ) : (
        /* Shutter & Quick Capture Controls when camera is live */
        <div className="flex justify-around items-center w-full px-4 mt-2">
          {/* Gallery Upload */}
          <button
            onClick={() => {
              playTapTone('tap');
              galleryInputRef.current?.click();
            }}
            aria-label="Upload from gallery"
            className="w-14 h-14 rounded-full bg-[#ffffff] border border-[#e8e5df] text-[#57423a] flex flex-col items-center justify-center shadow-sm hover:bg-[#f2f0eb] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">photo_library</span>
            <span className="text-[10px] font-bold mt-0.5">{t.gallery}</span>
          </button>

          {/* Main Shutter Button */}
          <button
            onClick={handleSnapLivePhoto}
            aria-label="Take Photo"
            className="w-20 h-20 rounded-full bg-white border-4 border-[#9f3e07] p-1 flex items-center justify-center active:scale-90 transition-all shadow-[0px_4px_20px_rgba(159,62,7,0.35)] cursor-pointer"
          >
            <div className="w-full h-full bg-[#9f3e07] hover:bg-[#c05621] rounded-full flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                photo_camera
              </span>
            </div>
          </button>

          {/* Camera File / Native Trigger */}
          <button
            onClick={() => {
              playTapTone('tap');
              cameraInputRef.current?.click();
            }}
            aria-label="Device camera"
            className="w-14 h-14 rounded-full bg-[#ffffff] border border-[#e8e5df] text-[#57423a] flex flex-col items-center justify-center shadow-sm hover:bg-[#f2f0eb] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">camera_alt</span>
            <span className="text-[10px] font-bold mt-0.5">{t.camera}</span>
          </button>
        </div>
      )}

      {/* Discrete Testing Helper (Not showing preloaded image, only optional dropdown) */}
      <div className="mt-4 pt-3 border-t border-[#e8e5df]">
        <button
          onClick={() => setShowDemoOptions(!showDemoOptions)}
          className="text-xs text-[#78716c] hover:text-[#9f3e07] font-medium flex items-center justify-center gap-1 mx-auto py-1"
        >
          <span>{t.trySampleCraft}</span>
          <span className="material-symbols-outlined text-base">
            {showDemoOptions ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showDemoOptions && (
          <div className="flex gap-2 justify-center mt-2 flex-wrap">
            {DEMO_PHOTO_OPTIONS.map((opt) => (
              <button
                key={opt.name}
                onClick={() => handleSelectSample(opt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#ffffff] text-[#57423a] border border-[#e8e5df] hover:border-[#9f3e07] shadow-xs active:scale-95 transition-all"
              >
                <img src={opt.image} alt={opt.name} className="w-5 h-5 rounded object-cover" />
                <span>{opt.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
