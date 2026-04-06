import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Ambil variables dari file .env di root
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Credentials Supabase tidak ditemukan di .env!");
  console.error("Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_SERVICE_ROLE_KEY sudah terisi.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const TABLES = [
  "profiles",
  "user_roles",
  "portfolio_categories",
  "portfolio_photos",
  "service_categories",
  "service_photos",
  "contact_messages",
  "announcements",
  "visitor_stats",
];

async function backup() {
  console.log("Memulai proses backup data dari Supabase...");
  const backupData: Record<string, any[]> = {};

  for (const table of TABLES) {
    console.log(`Mengunduh tabel: ${table}...`);
    const { data, error } = await supabaseAdmin.from(table).select("*");
    
    if (error) {
      console.error(`❌ Gagal mengunduh tabel ${table}:`, error.message);
      continue;
    }
    
    backupData[table] = data || [];
    console.log(`✅ ${data?.length || 0} baris berhasil disimpan dari ${table}.`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  
  const backupsDir = path.join(process.cwd(), "supabase", "backups");
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const filename = `database-backup-${timestamp}.json`;
  const filePath = path.join(backupsDir, filename);

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), "utf-8");
  console.log(`\n🎉 Backup berhasil diselesaikan!`);
  console.log(`📂 File Anda aman di: ${filePath}\n`);
}

backup().catch((err) => {
  console.error("Backup gagal total:", err);
  process.exit(1);
});
