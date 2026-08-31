import { Language } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let onSpeakingChangeCallback: ((speaking: boolean, text: string | null) => void) | null = null;

export const registerSpeakingListener = (callback: (speaking: boolean, text: string | null) => void) => {
  onSpeakingChangeCallback = callback;
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (onSpeakingChangeCallback) {
    onSpeakingChangeCallback(false, null);
  }
};

export const speakText = (text: string, lang: Language = 'en') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser.');
    return;
  }

  // If currently speaking the same, stop
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Language mapping ('both' speaks Tamil — the primary language of the artisan)
  switch (lang) {
    case 'ta':
    case 'both':
      utterance.lang = 'ta-IN';
      utterance.rate = 0.9;
      break;
    case 'en':
    default:
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      break;
  }

  utterance.onstart = () => {
    if (onSpeakingChangeCallback) {
      onSpeakingChangeCallback(true, text);
    }
  };

  utterance.onend = () => {
    if (onSpeakingChangeCallback) {
      onSpeakingChangeCallback(false, null);
    }
  };

  utterance.onerror = () => {
    if (onSpeakingChangeCallback) {
      onSpeakingChangeCallback(false, null);
    }
  };

  // Find natural Indian voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => {
    if (lang === 'ta' || lang === 'both') return v.lang.includes('ta');
    return v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.name.toLowerCase().includes('india');
  });

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
};

// Play simple audio cue using Web Audio API for tactile feedback
export const playTapTone = (type: 'success' | 'tap' | 'mic' | 'shutter' = 'tap') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'shutter') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'mic') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    // Ignore audio context autoplay limitations
  }
};
