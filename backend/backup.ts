import fs from "fs";
import path from "path";
import { supabaseAdmin } from "./supabaseAdmin.js";

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
  console.log("Starting backup process from Supabase...");
  const backupData: Record<string, any[]> = {};

  for (const table of TABLES) {
    console.log(`Backing up ${table}...`);
    const { data, error } = await supabaseAdmin.from(table).select("*");
    
    if (error) {
      console.error(`Error backing up table ${table}:`, error.message);
      continue; // Skip the error ones or let it continue to backup the rest
    }
    
    backupData[table] = data || [];
    console.log(`Successfully backed up ${data?.length || 0} rows from ${table}.`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dirname = "backups";
  const filename = `database-backup-${timestamp}.json`;
  
  // Resolve path correctly
  const backupsDir = path.join(process.cwd(), dirname);
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const filePath = path.join(backupsDir, filename);

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), "utf-8");
  console.log(`\n✅ Backup completed successfully!`);
  console.log(`📂 Saved to: ${filePath}`);
}

backup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
