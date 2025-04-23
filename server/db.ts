import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Cấu hình ws cho neon
neonConfig.webSocketConstructor = ws;

// Kiểm tra biến môi trường DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("Cảnh báo: DATABASE_URL không được thiết lập. Sử dụng kết nối mặc định.");
  process.env.DATABASE_URL = "postgres://vinatex_user:vinatex_password@localhost:5432/vinatex_reports";
}

// Khởi tạo kết nối pool
console.log("Kết nối đến database:", process.env.DATABASE_URL.replace(/:.+@/, ":****@"));
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Số lượng kết nối tối đa
  idleTimeoutMillis: 30000, // Thời gian kết nối không hoạt động (30 giây)
  connectionTimeoutMillis: 5000 // Thời gian chờ kết nối (5 giây)
});

// Khởi tạo Drizzle ORM
export const db = drizzle(pool, { schema });

// Kiểm tra kết nối khi khởi động
pool.query('SELECT NOW()')
  .then(result => console.log('Kết nối database thành công:', result.rows[0].now))
  .catch(error => console.error('Lỗi kết nối database:', error));