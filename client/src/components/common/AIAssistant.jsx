import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { aiChatService } from '../../services/aiChatService';
import { speak, stopSpeaking, getIsSpeaking } from '../../services/ttsService';
import './ai-assistant.css';

// Format text bold: **text** → <strong>text</strong>
const formatMessage = (text) => {
  return text
    .split('\n')
    .map((line, i) => {
      let formatted = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong>$1</strong>'
      );
      // Bullet points
      if (formatted.startsWith('•') || formatted.startsWith('-')) {
        formatted = `<span class="ai-bullet">${formatted}</span>`;
      }
      // Numbered items
      if (/^\d+\./.test(formatted)) {
        formatted = `<span class="ai-numbered">${formatted}</span>`;
      }
      return `<span key="${i}">${formatted}</span>`;
    })
    .join('<br/>');
};

export const AIAssistant = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Xin chào! 👋 Mình là **PhimBot** — trợ lý phim thông minh.\n\nBạn muốn xem phim gì hôm nay? Hãy hỏi mình bất cứ gì nhé! 🎬',
      movies: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  let speakingCheckInterval = useRef(null);

  // Auto scroll xuống cuối khi có tin mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Check speaking status
  useEffect(() => {
    if (voiceEnabled) {
      speakingCheckInterval.current = setInterval(() => {
        setIsSpeaking(getIsSpeaking());
      }, 200);
    } else {
      clearInterval(speakingCheckInterval.current);
      setIsSpeaking(false);
    }
    return () => clearInterval(speakingCheckInterval.current);
  }, [voiceEnabled]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Thêm tin nhắn user
    const userMsg = { id: Date.now(), role: 'user', text, movies: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiChatService.sendMessage(text);
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: response.text,
        movies: response.movies || [],
      };
      setMessages((prev) => [...prev, botMsg]);

      // Đọc tin nhắn bằng giọng nếu bật voice
      if (voiceEnabled) {
        // Chỉ đọc phần text chính, bỏ emoji và format
        const cleanText = response.text
          .replace(/\*\*/g, '')
          .replace(/[•\-]/g, '')
          .replace(/\n+/g, '. ')
          // eslint-disable-next-line no-misleading-character-class
          .replace(/[🎬🔥🎭📺🌏ℹ️💡🔍👁️⭐📺✅👀]/gu, '');
        speak(cleanText, { rate: 1, pitch: 1 });
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: 'Xin lỗi, mình đang gặp lỗi. Vui lòng thử lại nhé 😕',
        movies: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, voiceEnabled]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.slug}`);
    setIsOpen(false);
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      setVoiceEnabled((v) => !v);
    }
  };

  // Quick suggestion buttons
  const quickSuggestions = [
    { text: '🔥 Phim thịnh hành', message: 'Gợi ý phim thịnh hành' },
    { text: '🎭 Hành động', message: 'Gợi ý phim hành động' },
    { text: '🌏 Hàn Quốc', message: 'Phim Hàn Quốc' },
    { text: '📺 Phim bộ', message: 'Phim bộ' },
    { text: '❓ Hướng dẫn', message: 'Giúp tôi' },
  ];

  return (
    <div className={`ai-assistant ${isDark ? 'dark' : 'light'}`}>
      {/* ===== CHAT PANEL ===== */}
      {isOpen && (
        <div className="ai-chat-panel">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-left">
              <div className="ai-bot-avatar">🎬</div>
              <div>
                <div className="ai-bot-name">PhimBot</div>
                <div className="ai-bot-status">
                  <span className="ai-status-dot" />
                  Sẵn sàng giúp bạn
                </div>
              </div>
            </div>
            <div className="ai-chat-header-right">
              {/* Nút bật/tắt giọng nói */}
              <button
                className={`ai-voice-btn ${voiceEnabled ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}
                onClick={toggleVoice}
                title={voiceEnabled ? (isSpeaking ? 'Dừng nói' : 'Đã bật giọng') : 'Bật giọng nói'}
              >
                {isSpeaking ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>

              {/* Nút đóng */}
              <button className="ai-close-btn" onClick={() => setIsOpen(false)} title="Đóng">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message ${msg.role}`}>
                {msg.role === 'bot' && <div className="ai-msg-avatar">🎬</div>}
                <div className="ai-msg-content">
                  <div
                    className="ai-msg-text"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  />

                  {/* Danh sách phim gợi ý */}
                  {msg.movies && msg.movies.length > 0 && (
                    <div className="ai-movies-grid">
                      {msg.movies.map((movie) => (
                        <div
                          key={movie.id}
                          className="ai-movie-card"
                          onClick={() => handleMovieClick(movie)}
                          title={`Xem ${movie.title}`}
                        >
                          <div className="ai-movie-poster">
                            <img
                              src={movie.posterUrl || '/placeholder.jpg'}
                              alt={movie.title}
                              loading="lazy"
                            />
                            <div className="ai-movie-overlay">
                              ▶ Xem ngay
                            </div>
                          </div>
                          <div className="ai-movie-info">
                            <div className="ai-movie-title">{movie.title}</div>
                            <div className="ai-movie-meta">
                              {movie.releaseYear && <span>{movie.releaseYear}</span>}
                              {movie.rating || movie.avgRating ? (
                                <span>⭐ {movie.rating || movie.avgRating}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="ai-message bot">
                <div className="ai-msg-avatar">🎬</div>
                <div className="ai-msg-content">
                  <div className="ai-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions (chỉ hiện khi ít tin nhắn) */}
          {messages.length <= 2 && (
            <div className="ai-suggestions">
              {quickSuggestions.map((s, i) => (
                <button
                  key={i}
                  className="ai-suggestion-btn"
                  onClick={() => {
                    setInput(s.message);
                    inputRef.current?.focus();
                  }}
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ai-chat-input">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi tôi về phim..."
              disabled={isLoading}
            />
            <button
              className={`ai-send-btn ${input.trim() ? 'active' : ''}`}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ===== FLOATING BUTTON ===== */}
      <button
        className={`ai-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        title="Trợ lý phim AI"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}

        {/* Pulse animation */}
        {!isOpen && <span className="ai-fab-pulse" />}
      </button>
    </div>
  );
};