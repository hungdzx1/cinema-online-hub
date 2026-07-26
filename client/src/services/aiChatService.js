/**
 * AI Chat Service — Trợ lý phim thông minh
 * Biết thông tin phim từ API của website
 * MIỄN PHÍ — không cần API key bên ngoài
 */

import { movieApi } from './movieApi';
import { genreApi } from './genreApi';

// ===== PHÂN TÍCH Ý ĐỊNH NGƯỜI DÙNG =====
const detectIntent = (message) => {
  const msg = message.toLowerCase().trim();

  // Chào hỏi
  if (/^(xin chào|hello|hi|hey|chào|alo|hola|chào bạn|chào admin)/.test(msg)) {
    return 'greeting';
  }

  // Tìm kiếm phim theo tên
  if (/^(tìm|search|kiếm|cho tôi xem|phim có|phim tên|đọc|xem phim|có phim)/.test(msg)) {
    return 'search';
  }

  // Gợi ý / đề xuất phim
  if (/(gợi ý|đề xuất|recommend|cho xem|xem gì|phim gì|phim hay|phim mới|phim hot|phim phổ biến|phim thịnh hành)/.test(msg)) {
    return 'recommend';
  }

  // Thể loại cụ thể
  if (/(hành động|action|tình cảm|romance|tình yêu|hài|hài huộc|kinh dị|horror|hoạt hình|anime|sci-fi|khoa học|viễn tưởng|fantasy|giả tưởng|thriller|bí ẩn|mystery|võ thuật|chiến tranh|war|family|gia đình|âm nhạc|musical)/.test(msg)) {
    return 'genre_recommend';
  }

  // Phim lẻ / phim bộ
  if (/(phim lẻ|phim bộ|phim một tập|phim nhiều tập|series|movie)/.test(msg)) {
    return 'type_filter';
  }

  // Phim theo quốc gia
  if (/(hàn quốc|korea|trung quốc|china|nhật bản|japan|thái lan|thailand|âu mỹ|hồng kông|đài loan|việt nam|ấn độ|anh|pháp|mỹ)/.test(msg)) {
    return 'country_filter';
  }

  // Trạng thái phim
  if (/(đang chiếu|đang cập nhật|hoàn thành|đã hoàn thành|full|trọn bộ)/.test(msg)) {
    return 'status_filter';
  }

  // Giúp đỡ / hướng dẫn
  if (/(giúp|help|hướng dẫn|cách dùng|tính năng|có thể làm gì|làm được gì|lệnh)/.test(msg)) {
    return 'help';
  }

  // Cảm ơn
  if (/(cảm ơn|thanks|thank you|cảm ơn bạn|tks|thx)/.test(msg)) {
    return 'thanks';
  }

  // Mặc định: tìm kiếm
  return 'search';
};

// ===== MAP THỂ LOẠI TIẾNG VIỆT → SLUG =====
const GENRE_MAP = {
  'hành động': 'hanh-dong',
  'action': 'hanh-dong',
  'tình cảm': 'tinh-cam',
  'romance': 'tinh-cam',
  'tình yêu': 'tinh-cam',
  'hài': 'hai-huoc',
  'hài huộc': 'hai-huoc',
  'kinh dị': 'kinh-di',
  'horror': 'kinh-di',
  'hoạt hình': 'hoat-hinh',
  'anime': 'hoat-hinh',
  'khoa học': 'khoa-hoc-vien-tuong',
  'viễn tưởng': 'khoa-hoc-vien-tuong',
  'sci-fi': 'khoa-hoc-vien-tuong',
  'giả tưởng': 'khoa-hoc-vien-tuong',
  'bí ẩn': 'bi-an',
  'mystery': 'bi-an',
  'võ thuật': 'vo-thuat',
  'chiến tranh': 'chien-tranh',
  'gia đình': 'gia-dinh',
  'âm nhạc': 'am-nhac',
};

// ===== MAP QUỐC GIA =====
const COUNTRY_MAP = {
  'hàn quốc': 'han-quoc',
  'korea': 'han-quoc',
  'trung quốc': 'trung-quoc',
  'china': 'trung-quoc',
  'nhật bản': 'nhat-ban',
  'japan': 'nhat-ban',
  'thái lan': 'thai-lan',
  'thailand': 'thai-lan',
  'âu mỹ': 'au-my',
  'mỹ': 'au-my',
  'hồng kông': 'hong-kong',
  'đài loan': 'dai-loan',
  'việt nam': 'viet-nam',
  'ấn độ': 'an-do',
  'anh': 'anh',
};

// ===== XỬ LÝ TỪNG Ý ĐỊNH =====

const handleGreeting = () => ({
  text: 'Xin chào! 👋 Mình là PhimBot — trợ lý phim của Phim Hay 24h.\n\nMình có thể giúp bạn:\n• 🔍 Tìm phim theo tên\n• 🎭 Gợi ý phim theo thể loại\n• 🌏 Phim theo quốc gia\n• 📺 Phim lẻ / phim bộ\n• 🔥 Phim thịnh hành\n\nBạn muốn xem phim gì hôm nay?',
  movies: [],
});

const handleHelp = () => ({
  text: '🎬 **Hướng dẫn sử dụng PhimBot:**\n\n**Tìm phim:** "Tìm phim Dấu Vết Trọn Đời"\n**Gợi ý:** "Gợi ý phim hành động"\n**Thể loại:** "Phim tình cảm", "Phim kinh dị"\n**Quốc gia:** "Phim Hàn Quốc", "Phim Nhật Bản"\n**Loại:** "Phim lẻ", "Phim bộ"\n**Trạng thái:** "Phim đang chiếu", "Phim hoàn thành"\n\n💡 Mình biết TẤT CẢ phim trên website! Hãy hỏi mình bất cứ gì nhé.',
  movies: [],
});

const handleThanks = () => ({
  text: 'Không có gì! 😊 Nếu cần xem thêm phim gì nữa, cứ hỏi mình nhé. Chúc bạn xem phim vui vẻ! 🎬',
  movies: [],
});

const handleSearch = async (message) => {
  try {
    const keyword = message
      .replace(/^(tìm|search|kiếm|cho tôi xem|phim có|phim tên|đọc|xem phim|có phim)\s*/i, '')
      .trim();

    if (!keyword) {
      return {
        text: 'Bạn muốn tìm phim nào? Hãy nói tên phim nhé, ví dụ: "Tìm phim Oppenheimer" 🎬',
        movies: [],
      };
    }

    const result = await movieApi.filterMovies({
      keyword,
      limit: 5,
    });

    const movies = result?.data || result || [];

    if (movies.length === 0) {
      return {
        text: `Hmm, mình không tìm thấy phim nào với từ khóa "${keyword}" 😕\n\nThử tìm bằng tên khác hoặc để mình gợi ý phim nhé!`,
        movies: [],
      };
    }

    const movieList = movies
      .map((m, i) => `${i + 1}. **${m.title}** (${m.releaseYear || '?'}) — ⭐ ${m.rating || m.avgRating || 'N/A'} | ${m.type === 'phim_bo' ? `📺 ${m.totalEpisodes || '?'} tập` : '🎞️ Phim lẻ'}`)
      .join('\n');

    return {
      text: `🔍 Tìm thấy **${movies.length} phim** liên quan đến "${keyword}":\n\n${movieList}\n\n💬 Click vào phim để xem chi tiết nhé!`,
      movies,
    };
  } catch (err) {
    return {
      text: 'Lỗi khi tìm phim. Vui lòng thử lại sau 😕',
      movies: [],
    };
  }
};

const handleRecommend = async () => {
  try {
    const result = await movieApi.filterMovies({
      sortBy: 'views',
      limit: 5,
    });

    const movies = result?.data || result || [];

    if (movies.length === 0) {
      return { text: 'Hiện chưa có phim nào trên hệ thống 😕', movies: [] };
    }

    const movieList = movies
      .map((m, i) => `${i + 1}. **${m.title}** (${m.releaseYear || '?'}) — 👁️ ${m.viewCount?.toLocaleString() || '?'} lượt xem | ⭐ ${m.rating || m.avgRating || 'N/A'}`)
      .join('\n');

    return {
      text: `🔥 **Phim Thịnh Hành Nhất** hiện tại:\n\n${movieList}\n\n💬 Cần mình gợi ý theo thể loại cụ thể không?`,
      movies,
    };
  } catch (err) {
    return { text: 'Lỗi khi tải phim thịnh hành 😕', movies: [] };
  }
};

const handleGenreRecommend = async (message) => {
  const msg = message.toLowerCase();

  // Tìm thể loại trong câu
  let foundSlug = null;
  let foundName = null;
  for (const [name, slug] of Object.entries(GENRE_MAP)) {
    if (msg.includes(name)) {
      foundSlug = slug;
      foundName = name;
      break;
    }
  }

  if (!foundSlug) {
    return handleRecommend();
  }

  try {
    const result = await movieApi.filterMovies({
      genreIds: [null], // sẽ không hoạt động, dùng keyword thay thế
      keyword: foundName,
      limit: 5,
    });

    const movies = result?.data || result || [];

    if (movies.length === 0) {
      return {
        text: `Hiện chưa có phim ${foundName} nào trên hệ thống 😕`,
        movies: [],
      };
    }

    const movieList = movies
      .slice(0, 5)
      .map((m, i) => `${i + 1}. **${m.title}** (${m.releaseYear || '?'}) — ⭐ ${m.rating || m.avgRating || 'N/A'}`)
      .join('\n');

    return {
      text: `🎭 **Phim ${foundName.charAt(0).toUpperCase() + foundName.slice(1)}** gợi ý cho bạn:\n\n${movieList}\n\n💬 Thích thể loại khác không?`,
      movies: movies.slice(0, 5),
    };
  } catch (err) {
    return { text: 'Lỗi khi tải phim 😕', movies: [] };
  }
};

const handleTypeFilter = async (message) => {
  const msg = message.toLowerCase();
  const type = msg.includes('lẻ') || msg.includes('movie') ? 'phim_le' : 'phim_bo';

  try {
    const result = await movieApi.filterMovies({
      type,
      limit: 5,
      sortBy: 'views',
    });

    const movies = result?.data || result || [];
    const label = type === 'phim_le' ? 'Phim Lẻ' : 'Phim Bộ';

    if (movies.length === 0) {
      return { text: `Hiện chưa có ${label.toLowerCase()} nào 😕`, movies: [] };
    }

    const movieList = movies
      .map((m, i) => `${i + 1}. **${m.title}** (${m.releaseYear || '?'}) — ⭐ ${m.rating || m.avgRating || 'N/A'}${type === 'phim_bo' ? ` | 📺 ${m.totalEpisodes || '?'} tập` : ''}`)
      .join('\n');

    return {
      text: `📺 **${label} Xem Nhiều Nhất:**\n\n${movieList}`,
      movies,
    };
  } catch (err) {
    return { text: 'Lỗi khi tải phim 😕', movies: [] };
  }
};

const handleCountryFilter = async (message) => {
  const msg = message.toLowerCase();

  let foundSlug = null;
  let foundName = null;
  for (const [name, slug] of Object.entries(COUNTRY_MAP)) {
    if (msg.includes(name)) {
      foundSlug = slug;
      foundName = name;
      break;
    }
  }

  if (!foundSlug) {
    return {
      text: 'Bạn muốn xem phim nước nào? Ví dụ: Hàn Quốc, Nhật Bản, Trung Quốc, Âu Mỹ...',
      movies: [],
    };
  }

  try {
    const result = await movieApi.filterMovies({
      country: foundSlug,
      limit: 5,
      sortBy: 'views',
    });

    const movies = result?.data || result || [];

    if (movies.length === 0) {
      return {
        text: `Hiện chưa có phim ${foundName} nào 😕`,
        movies: [],
      };
    }

    const movieList = movies
      .map((m, i) => `${i + 1}. **${m.title}** (${m.releaseYear || '?'}) — ⭐ ${m.rating || m.avgRating || 'N/A'}`)
      .join('\n');

    return {
      text: `🌏 **Phim ${foundName.charAt(0).toUpperCase() + foundName.slice(1)}:**\n\n${movieList}`,
      movies,
    };
  } catch (err) {
    return { text: 'Lỗi khi tải phim 😕', movies: [] };
  }
};

const handleStatusFilter = async (message) => {
  const msg = message.toLowerCase();
  const status = msg.includes('hoàn thành') || msg.includes('full') || msg.includes('trọn bộ') ? 'completed' : 'ongoing';

  try {
    const result = await movieApi.filterMovies({
      status,
      limit: 5,
      sortBy: 'views',
    });

    const movies = result?.data || result || [];
    const label = status === 'ongoing' ? 'Đang Chiếu' : 'Hoàn Thành';

    if (movies.length === 0) {
      return { text: `Hiện chưa có phim ${label.toLowerCase()} nào 😕`, movies: [] };
    }

    const movieList = movies
      .map((m, i) => `${i + 1}. **${m.title}** — ${status === 'ongoing' ? `📺 ${m.totalEpisodes || '?'} tập` : '✅ Trọn bộ'}`)
      .join('\n');

    return {
      text: `🎬 **Phim ${label}:**\n\n${movieList}`,
      movies,
    };
  } catch (err) {
    return { text: 'Lỗi khi tải phim 😕', movies: [] };
  }
};

// ===== HÀM CHÍNH: NHẬN TIN NHẮN → TRẢ KẾT QUẢ =====
export const aiChatService = {
  sendMessage: async (message) => {
    const intent = detectIntent(message);

    let result;
    switch (intent) {
      case 'greeting':     result = handleGreeting(); break;
      case 'help':         result = handleHelp(); break;
      case 'thanks':       result = handleThanks(); break;
      case 'search':       result = await handleSearch(message); break;
      case 'recommend':    result = await handleRecommend(); break;
      case 'genre_recommend': result = await handleGenreRecommend(message); break;
      case 'type_filter':  result = await handleTypeFilter(message); break;
      case 'country_filter': result = await handleCountryFilter(message); break;
      case 'status_filter': result = await handleStatusFilter(message); break;
      default:             result = await handleSearch(message); break;
    }

    return result;
  },
};