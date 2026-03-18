import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseAdmin.js";

// Categories
export async function getCategories(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from("service_categories")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, description, display_order } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabaseAdmin
      .from("service_categories")
      .insert({ name, description, display_order: display_order ?? 0 })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from("service_categories")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// Photos
export async function getPhotos(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from("service_photos")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createPhoto(req: Request, res: Response) {
  try {
    const { category_id, image_url, display_order } = req.body;
    if (!category_id || !image_url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabaseAdmin
      .from("service_photos")
      .insert({ category_id, image_url, display_order: display_order ?? 0 })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deletePhoto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from("service_photos")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
