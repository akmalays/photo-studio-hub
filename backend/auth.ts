import type { Request } from "express";
import { supabaseAdmin } from "./supabaseAdmin.js";
import { getBearerToken } from "./http.js";

export async function requireAdmin(req: Request): Promise<{ userId: string }> {
  const token = getBearerToken(req.header("Authorization") ?? null);
  if (!token) throw new Error("Unauthorized");

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) throw new Error("Unauthorized");

  const { data: roleCheck, error: roleError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) throw roleError;
  if (!roleCheck) throw new Error("Not an admin");

  return { userId: user.id };
}
