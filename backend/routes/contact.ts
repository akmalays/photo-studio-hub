import type { Request, Response } from "express";
import { env } from "../env.js";
import { supabaseAdmin } from "../supabaseAdmin.js";
import { requireAdmin } from "../auth.js";

export async function contactHandler(req: Request, res: Response) {
  try {
    const { name, email, message } = req.body as { name?: string; email?: string; message?: string };
    if (!name || !email || !message) throw new Error("Missing required fields");

    // Always persist the message for admin notifications/inbox
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("contact_messages")
      .insert({ name, email, message })
      .select("id, created_at")
      .single();
    if (insertError) throw insertError;

    return res.json({
      success: true,
      message_saved: true,
      message_id: inserted.id,
      created_at: inserted.created_at
    });
  } catch (error: any) {
    return res.status(400).json({ error: error?.message ?? "Unknown error" });
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    await requireAdmin(req);
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return res.json(data);
  } catch (error: any) {
    return res.status(error.message === "Unauthorized" || error.message === "Not an admin" ? 403 : 400)
      .json({ error: error?.message ?? "Unknown error" });
  }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    await requireAdmin(req);
    const { id } = req.params;
    if (!id) throw new Error("Missing message ID");
    
    const { error } = await supabaseAdmin.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
    
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(error.message === "Unauthorized" || error.message === "Not an admin" ? 403 : 400).json({ error: error?.message ?? "Unknown error" });
  }
}
