import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseAdmin.js";
import { getBearerToken } from "../http.js";

type Action =
  | "list_users"
  | "update_profile"
  | "update_password"
  | "add_role"
  | "remove_role"
  | "create_user"
  | "delete_user";

async function requireAdmin(req: Request): Promise<{ userId: string }> {
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

export async function adminUsersHandler(req: Request, res: Response) {
  try {
    const { userId } = await requireAdmin(req);
    const { action, ...params } = req.body as { action?: Action } & Record<string, unknown>;
    if (!action) throw new Error("Missing action");

    if (action === "list_users") {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;

      const { data: profiles, error: profilesError } = await supabaseAdmin.from("profiles").select("*");
      if (profilesError) throw profilesError;
      const { data: roles, error: rolesError } = await supabaseAdmin.from("user_roles").select("*");
      if (rolesError) throw rolesError;

      const users = data.users ?? [];
      const enriched = users.map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: profiles?.find((p: any) => p.id === u.id)?.full_name || "",
        roles: roles?.filter((r: any) => r.user_id === u.id).map((r: any) => r.role) || [],
        created_at: u.created_at,
      }));

      return res.json(enriched);
    }

    if (action === "update_profile") {
      const { user_id, full_name } = params as any;
      const targetId = user_id || userId;
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ full_name, updated_at: new Date().toISOString() })
        .eq("id", targetId);
      if (error) throw error;
      return res.json({ success: true });
    }

    if (action === "update_password") {
      const { new_password } = params as any;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: new_password });
      if (error) throw error;
      return res.json({ success: true });
    }

    if (action === "add_role") {
      const { user_id, role } = params as any;
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id, role });
      if (error) throw error;
      return res.json({ success: true });
    }

    if (action === "remove_role") {
      const { user_id, role } = params as any;
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
      if (error) throw error;
      return res.json({ success: true });
    }

    if (action === "create_user") {
      const { email, password, full_name, role } = params as any;
      const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });
      if (error) throw error;

      await supabaseAdmin.from("profiles").upsert({ id: newUser.user.id, full_name: full_name || "" });
      if (role) {
        await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role });
      }

      return res.json({ success: true, user_id: newUser.user.id });
    }

    if (action === "delete_user") {
      const { user_id } = params as any;
      if (user_id === userId) throw new Error("Cannot delete yourself");
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return res.json({ success: true });
    }

    throw new Error("Unknown action");
  } catch (error: any) {
    return res.status(400).json({ error: error?.message ?? "Unknown error" });
  }
}

