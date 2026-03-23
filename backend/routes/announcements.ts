import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseAdmin.js";
import { requireAdmin } from "../auth.js";

export async function getAnnouncements(_req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.message ?? "Unknown error" });
  }
}

export async function createAnnouncement(req: Request, res: Response) {
  try {
    await requireAdmin(req);
    const { text, is_active = true, display_order = 0 } = req.body;
    if (!text) throw new Error("Text is required");
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .insert({ text, is_active, display_order })
      .select()
      .single();
    if (error) throw error;
    return res.json(data);
  } catch (error: any) {
    return res.status(error.message === "Unauthorized" ? 403 : 400).json({ error: error?.message ?? "Unknown error" });
  }
}

export async function updateAnnouncement(req: Request, res: Response) {
  try {
    await requireAdmin(req);
    const { id } = req.params;
    const { text, is_active, display_order } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (text !== undefined) updates.text = text;
    if (is_active !== undefined) updates.is_active = is_active;
    if (display_order !== undefined) updates.display_order = display_order;
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return res.json(data);
  } catch (error: any) {
    return res.status(error.message === "Unauthorized" ? 403 : 400).json({ error: error?.message ?? "Unknown error" });
  }
}

export async function deleteAnnouncement(req: Request, res: Response) {
  try {
    await requireAdmin(req);
    const { id } = req.params;
    const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(error.message === "Unauthorized" ? 403 : 400).json({ error: error?.message ?? "Unknown error" });
  }
}
