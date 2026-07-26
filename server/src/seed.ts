// seed.ts — Gọi VSMOV API → Đổ vào Aiven MySQL
// Chạy: cd server && npx ts-node src/seed.ts
// ============================================================
// CHÍNH SÁCH SEED (IDEMPOTENT — KHÔNG XÓA DATA CŨ):
//   • KHÔNG TRUNCATE bảng nào. Phim cũ + tập cũ + Server 2 thêm
//     bằng tay đều được GIỮ NGUYÊN.
//   • Script chỉ INSERT phim MỚI (slug chưa có trong DB).
//   • Phim đã có → skip toàn bộ (cả Server 1 lẫn Server 2 đều
//     không bị đè).
//   • Muốn seed lại 1 phim → xóa phim đó trong DB rồi chạy lại.
// ============================================================

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import axios from 'axios';
import mysql, { type RowDataPacket } from 'mysql2/promise';

// ============================================================
// INTERFACES — Khai báo kiểu rõ ràng, ESLint không báo lỗi
// ============================================================

interface VsmovTmdb {
  type: string;
  id: string | null;
  season: string | null;
  vote_average: string;
  vote_count: number;
}

interface VsmovImdb {
  id: string | null;
}

interface VsmovListItem {
  _id: number;
  name: string;
  slug: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  tmdb: VsmovTmdb;
  imdb: VsmovImdb;
}

interface VsmovCategory {
  id: number;
  name: string;
  slug: string;
}

interface VsmovCountry {
  id: number;
  name: string;
  slug: string;
}

interface VsmovEpisodeItem {
  link_m3u8: string;
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
}

interface VsmovServer {
  server_name: string;
  server_data: VsmovEpisodeItem[];
}

interface VsmovMovieDetail {
  name: string;
  slug: string;
  origin_name: string;
  content: string | null;
  type: string;
  status: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  episode_current: string | null;
  episode_total: string | null;
  view: number;
  tmdb: VsmovTmdb;
  imdb: VsmovImdb;
  category: VsmovCategory[];
  country: VsmovCountry[];
  episodes: VsmovServer[];
}

interface VsmovListResponse {
  status: boolean;
  items: VsmovListItem[];
  pagination: { totalPages: number };
}

interface VsmovDetailResponse {
  status: boolean;
  movie: VsmovMovieDetail | null;
  episodes: VsmovServer[];
}

interface GenreRow extends RowDataPacket {
  id: number;
}

interface MovieRow extends RowDataPacket {
  id: number;
}

// ============================================================
// CẤU HÌNH
// ============================================================

const VSMOV = 'https://vsmov.com/api';
const PAGES = 5;
const DELAY = 1200;

const dbConfig = {
  host: process.env.DB_HOST ?? '',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  user: process.env.DB_USER ?? process.env.DB_USERNAME ?? '',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? process.env.DB_NAME ?? '',
  ssl: { rejectUnauthorized: false } as const,
};

if (
  !dbConfig.host ||
  !dbConfig.user ||
  !dbConfig.password ||
  !dbConfig.database
) {
  console.error('❌ Thiếu biến môi trường cho kết nối DB.');
  console.error('Hãy thêm vào server/.env:');
  console.error('  DB_HOST=...');
  console.error('  DB_PORT=3306');
  console.error('  DB_USER=...');
  console.error('  DB_PASSWORD=...');
  console.error('  DB_DATABASE=...');
  process.exit(1);
}

// ============================================================
// HELPERS
// ============================================================

function mapType(vsmovType: string, categorySlugs: string[]): string {
  if (categorySlugs.some((s) => s === 'hoat-hinh')) return 'hoat_hinh';
  if (categorySlugs.some((s) => s.includes('anime'))) return 'anime';
  return vsmovType === 'tv' || vsmovType === 'series' ? 'phim_bo' : 'phim_le';
}

function mapStatus(s: string): string {
  return s === 'completed' ? 'completed' : 'ongoing';
}

function parseRating(v: string): number {
  if (!v || v === '0.0') return 0;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : Math.min(n, 9.9);
}

function parseEpisodes(epStr: string | null): number {
  if (!epStr) return 0;
  const matches = epStr.match(/(\d+)/g);
  if (!matches) return 0;
  return matches.length >= 2 ? parseInt(matches[1]) : parseInt(matches[0]);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// LẤY DANH SÁCH PHIM
// ============================================================

async function fetchList(): Promise<VsmovListItem[]> {
  console.log(`\n📥 Lấy danh sách phim (${PAGES} trang)...`);
  const all: VsmovListItem[] = [];

  for (let p = 1; p <= PAGES; p++) {
    try {
      const { data } = await axios.get<VsmovListResponse>(
        `${VSMOV}/danh-sach/phim-moi-cap-nhat?page=${p}`,
        { headers: { Accept: 'application/json' }, timeout: 15000 },
      );

      if (data?.items?.length > 0) {
        all.push(...data.items);
        console.log(
          `   ✅ Trang ${p}: +${data.items.length} (tổng ${all.length})`,
        );
      } else {
        console.log(`   ⚠️  Trang ${p}: trống, dừng.`);
        break;
      }

      if (p < PAGES) await wait(DELAY);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ Trang ${p}: ${msg}`);
      break;
    }
  }

  return all;
}

// ============================================================
// LẤY CHI TIẾT 1 PHIM
// ============================================================

async function fetchDetail(slug: string): Promise<VsmovDetailResponse | null> {
  try {
    const { data } = await axios.get<VsmovDetailResponse>(
      `${VSMOV}/phim/${slug}`,
      { headers: { Accept: 'application/json' }, timeout: 15000 },
    );
    return data; // ✅ TRẢ VỀ TOÀN BỘ DATA (bao gồm movie và episodes)
  } catch {
    return null;
  }
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════');
  console.log('  PHIMPLAY24 — Seed từ VSMOV API');
  console.log('  (IDEMPOTENT: không xóa data cũ, chỉ thêm phim mới)');
  console.log('═══════════════════════════════════════');

  const conn = await mysql.createConnection(dbConfig);
  console.log(
    `🔌 DB: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} ✅`,
  );

  // ⚠️  KHÔNG TRUNCATE BẤT KỲ BẢNG NÀO.
  // Phim cũ + tập cũ + Server 2 thêm bằng tay → GIỮ NGUYÊN.
  // Script chỉ INSERT phim mới (slug chưa có trong DB).
  console.log('ℹ️  Chế độ: KHÔNG xóa data cũ. Phim nào đã có sẽ được skip.');

  // 1. Lấy danh sách phim
  const list = await fetchList();
  if (list.length === 0) {
    console.log('❌ Không lấy được phim nào.');
    process.exit(1);
  }

  // 2. Xử lý từng phim
  let insertedMovies = 0;
  let insertedEpisodes = 0;
  let skipped = 0;
  const skippedSlugs: string[] = [];

  console.log('\n🔄 Lấy chi tiết & đổ dữ liệu...');

  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    // Kiểm tra slug đã tồn tại chưa → skip phim đó (giữ nguyên data cũ + Server 2)
    const [existRows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM movies WHERE slug = ?',
      [item.slug],
    );

    if (existRows.length > 0) {
      skipped++;
      skippedSlugs.push(item.slug);
      continue;
    }

    // Lấy chi tiết phim
    const detailResponse = await fetchDetail(item.slug);
    if (!detailResponse || !detailResponse.movie) {
      skipped++;
      continue;
    }

    const detail = detailResponse.movie;
    const episodes = Array.isArray(detailResponse.episodes)
      ? detailResponse.episodes
      : [];

    // Bảo vệ trước dữ liệu API không đồng nhất
    const categories = Array.isArray(detail.category) ? detail.category : [];
    const countries = Array.isArray(detail.country) ? detail.country : [];

    // Tạo mảng slug thể loại (dùng để detect type)
    const catSlugs: string[] = categories.map((c) => c.slug);

    // Tính các giá trị
    const type = mapType(detail.type || 'movie', catSlugs);
    const status = mapStatus(detail.status || 'ongoing');
    const rating = parseRating(detail.tmdb?.vote_average ?? '0');
    const totalEp = parseEpisodes(detail.episode_total);
    const views = detail.view || 0;
    const featured = rating >= 8.5;

    // Insert genres (IGNORE nếu đã có trong seed.sql)
    for (const cat of categories) {
      await conn.execute(
        'INSERT IGNORE INTO genres (name, slug, is_visible) VALUES (?, ?, 1)',
        [cat.name, cat.slug],
      );
    }

    // Insert countries (IGNORE nếu đã có)
    for (const c of countries) {
      await conn.execute(
        'INSERT IGNORE INTO countries (name, slug) VALUES (?, ?)',
        [c.name, c.slug],
      );
    }

    // Insert PHIM — khớp đúng schema.sql
    await conn.execute(
      `INSERT INTO movies
        (title, slug, description, poster_url, banner_url, type, status,
         release_year, total_episodes, view_count, avg_rating, rating_count,
         is_featured, is_visible, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        detail.name,
        item.slug,
        detail.content ?? null,
        item.poster_url ?? null,
        item.thumb_url ?? null,
        type,
        status,
        detail.year || null,
        totalEp,
        views,
        rating,
        0,
        featured,
        true,
      ],
    );
    insertedMovies++;

    // Lấy movie_id vừa insert
    const [movieRows] = await conn.execute<MovieRow[]>(
      'SELECT id FROM movies WHERE slug = ?',
      [item.slug],
    );
    const movieId = movieRows[0]?.id;
    if (!movieId) {
      skipped++;
      continue;
    }

    // Gắn thể loại → movie_genres
    for (const cat of categories) {
      const [genreRows] = await conn.execute<GenreRow[]>(
        'SELECT id FROM genres WHERE slug = ?',
        [cat.slug],
      );

      if (genreRows.length > 0) {
        await conn.execute(
          'INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
          [movieId, genreRows[0].id],
        );
      }
    }

    // Gắn quốc gia → movie_countries
    for (const c of countries) {
      const [countryRows] = await conn.execute<GenreRow[]>(
        'SELECT id FROM countries WHERE slug = ?',
        [c.slug],
      );

      if (countryRows.length > 0) {
        await conn.execute(
          'INSERT IGNORE INTO movie_countries (movie_id, country_id) VALUES (?, ?)',
          [movieId, countryRows[0].id],
        );
      }
    }

    // Insert TẬP PHIM — Quét qua tất cả server từ VSMOV
    // (VSMOV thường trả nhiều server: Server 1, HD Thuyết Minh, VIP...)
    // Mỗi server lưu thành 1 dòng riêng với server_name khác nhau.
    if (episodes.length > 0) {
      for (const server of episodes) {
        const serverData = Array.isArray(server?.server_data)
          ? server.server_data
          : [];
        const serverName = server?.server_name?.trim() || 'Server 1';

        for (const ep of serverData) {
          // Ưu tiên link_embed, nếu không có thì lấy link_m3u8
          const linkToSave = ep.link_embed || ep.link_m3u8;
          if (!linkToSave) continue;

          // Bóc tách số tập từ filename hoặc name
          let epNum = 0;
          const numMatch = (ep.filename || ep.name || '').match(/\d+/);
          if (numMatch) {
            epNum = parseInt(numMatch[0]);
          }

          // Nếu không tìm thấy số, dùng index làm số tập
          if (epNum <= 0) {
            epNum = serverData.indexOf(ep) + 1;
          }

          if (epNum <= 0) continue;

          // Dùng INSERT IGNORE để nếu trùng (movie_id, episode_number, server_name)
          // thì không báo lỗi — giữ nguyên bản ghi cũ (vd. Server 2 bạn thêm bằng tay)
          await conn.execute(
            `INSERT IGNORE INTO episodes
              (movie_id, episode_number, title, embed_url, server_name, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              movieId,
              epNum,
              ep.filename || `Tập ${epNum}`,
              linkToSave,
              serverName,
            ],
          );
          insertedEpisodes++;
        }
      }
    }

    // Log tiến độ
    if ((i + 1) % 10 === 0) {
      console.log(`   📦 Đã xử lý ${i + 1}/${list.length}...`);
    }

    await wait(DELAY);
  }

  // Kết quả
  console.log('\n═══════════════════════════════════════');
  console.log('  KẾT QUẢ SEED');
  console.log('═══════════════════════════════════════');
  console.log(`   ✅ Phim mới:     ${insertedMovies}`);
  console.log(`   ✅ Tập phim:     ${insertedEpisodes}`);
  console.log(`   ⏭️  Bỏ qua:      ${skipped} (đã có sẵn — giữ nguyên data cũ + Server 2)`);
  if (skippedSlugs.length > 0) {
    console.log(`   📋 Slug đã skip:`);
    skippedSlugs.forEach((s) => console.log(`      • ${s}`));
  }
  console.log('═══════════════════════════════════════');
  console.log('  💡 LƯU Ý: Muốn seed lại 1 phim → xóa phim đó trong DB rồi chạy lại script.');
  console.log('═══════════════════════════════════════\n');

  await conn.end();
}

main().catch((err: unknown) => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});