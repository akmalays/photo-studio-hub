import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseAdmin.js";

export async function getPortfolio(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from("portfolio_items")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createPortfolio(req: Request, res: Response) {
  try {
    const { title, category, image_url, display_order } = req.body;
    if (!title || !category || !image_url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabaseAdmin
      .from("portfolio_items")
      .insert({ title, category, image_url, display_order: display_order ?? 0 })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deletePortfolio(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from("portfolio_items")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
