import dotenv from "dotenv";
import { join } from "path";

// Load from current dir or root dir
dotenv.config();
dotenv.config({ path: join(process.cwd(), "..", ".env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 8080),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",

  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),

  notificationApiKey: process.env.NOTIFICATION_API_KEY || process.env.LOVABLE_API_KEY,
};

