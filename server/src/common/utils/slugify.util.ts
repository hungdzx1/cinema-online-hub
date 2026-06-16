// Chuyển "Hành Động" -> "hanh-dong", "Phim Hay" -> "phim-hay"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Tách dấu khỏi chữ
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu (á -> a)
    .replace(/đ/g, 'd') // đ -> d
    .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Khoảng trắng -> gạch ngang
    .replace(/-+/g, '-'); // Gộp nhiều gạch ngang thành 1
}
