/**
 * TTS Service — Text-to-Speech miễn phí
 * Sử dụng Web Speech API (built-in browser, không cần server)
 */

let currentUtterance = null;
let isSpeaking = false;

// Lấy danh sách giọng tiếng Việt (nếu browser hỗ trợ)
const getVietnameseVoice = () => {
  const voices = window.speechSynthesis?.getVoices() || [];
  // Ưu tiên giọng tiếng Việt
  return (
    voices.find((v) => v.lang === 'vi-VN') ||
    voices.find((v) => v.lang.startsWith('vi')) ||
    null
  );
};

// Khởi tạo voices (Chrome cần load async)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

/**
 * Đọc văn bản bằng giọng nói
 * @param {string} text — nội dung cần đọc
 * @param {object} options — { rate, pitch, volume, onStart, onEnd }
 */
export const speak = (text, options = {}) => {
  if (!window.speechSynthesis) {
    console.warn('Trình duyệt không hỗ trợ Web Speech API');
    return;
  }

  // Dừng bản trước nếu đang nói
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);

  // Cài đặt giọng tiếng Việt
  const vnVoice = getVietnameseVoice();
  if (vnVoice) utterance.voice = vnVoice;
  utterance.lang = 'vi-VN';

  // Cài đặt tốc độ, cao độ, âm lượng
  utterance.rate = options.rate || 1;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume ?? 1;

  // Callbacks
  utterance.onstart = () => {
    isSpeaking = true;
    options.onStart?.();
  };
  utterance.onend = () => {
    isSpeaking = false;
    options.onEnd?.();
  };
  utterance.onerror = () => {
    isSpeaking = false;
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
};

/** Dừng nói */
export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  currentUtterance = null;
};

/** Đang nói hay không */
export const getIsSpeaking = () => isSpeaking;

/** Bật/tắt TTS */
export const toggleSpeaking = (text) => {
  if (isSpeaking) {
    stopSpeaking();
  } else {
    speak(text);
  }
};