import { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseAdmin.js";
import crypto from "crypto";

export const trackVisit = async (req: Request, res: Response) => {
  try {
    const { page_path, user_agent } = req.body;
    
    // Capture and hash IP
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";
    const ipStr = Array.isArray(ip) ? ip[0] : ip;
    // Take the first IP if there are multiple (proxies)
    const firstIp = ipStr.split(",")[0].trim();
    const cleanIp = firstIp.replace("::ffff:", "");
    const ipHash = crypto.createHash("sha256").update(cleanIp).digest("hex");
    
    // Resolve GeoIP
    let country = "Unknown";
    let city = "Unknown";
    
    try {
      if (cleanIp !== "127.0.0.1" && cleanIp !== "::1") {
        const geoRes = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,city`);
        const geoData = (await geoRes.json()) as any;
        if (geoData.status === "success") {
          country = geoData.country;
          city = geoData.city;
        }
      }
    } catch (e) {
      console.warn("GeoIP lookup failed:", e);
    }

    const { error } = await supabaseAdmin
      .from("visitor_stats")
      .insert([
        { 
          page_path: page_path || "/", 
          user_agent: user_agent || req.headers["user-agent"],
          ip_hash: ipHash,
          country,
          city
        }
      ]);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error("STATS ERROR [trackVisit]:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: error.message, details: error });
  }
};

export const getStatsSummary = async (_req: Request, res: Response) => {
  try {
    // Total hits
    const { count: totalHits, error: totalErr } = await supabaseAdmin
      .from("visitor_stats")
      .select("*", { count: "exact", head: true });
    
    if (totalErr) throw totalErr;

    // Unique visitors (total)
    const { data: uniqueData, error: uniqueErr } = await supabaseAdmin
      .from("visitor_stats")
      .select("ip_hash");
    
    if (uniqueErr) throw uniqueErr;
    const uniqueTotal = new Set(uniqueData?.map(d => d.ip_hash)).size;

    // Hits today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayHits, error: todayErr } = await supabaseAdmin
      .from("visitor_stats")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    if (todayErr) throw todayErr;

    // Unique visitors today
    const { data: uniqueTodayData, error: uniqueTodayErr } = await supabaseAdmin
      .from("visitor_stats")
      .select("ip_hash")
      .gte("created_at", today.toISOString());
    
    if (uniqueTodayErr) throw uniqueTodayErr;
    const uniqueToday = new Set(uniqueTodayData?.map(d => d.ip_hash)).size;

    // Top Locations (Country/City)
    const { data: geoData, error: geoErr } = await supabaseAdmin
      .from("visitor_stats")
      .select("country, city");
    
    if (geoErr) throw geoErr;

    const countriesMap: Record<string, number> = {};
    const citiesMap: Record<string, number> = {};

    geoData?.forEach(d => {
      if (d.country) countriesMap[d.country] = (countriesMap[d.country] || 0) + 1;
      if (d.city) citiesMap[d.city] = (citiesMap[d.city] || 0) + 1;
    });

    const topCountries = Object.keys(countriesMap)
      .map(k => ({ name: k, count: countriesMap[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topCities = Object.keys(citiesMap)
      .map(k => ({ name: k, count: citiesMap[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Last 7 days counts
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabaseAdmin
        .from("visitor_stats")
        .select("ip_hash")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) throw error;
      
      last7Days.push({
        date: start.toLocaleDateString("id-ID", { weekday: "short" }),
        hits: data?.length || 0,
        uniques: new Set(data?.map(d => d.ip_hash)).size
      });
    }

    res.json({
      total: totalHits || 0,
      uniqueTotal,
      today: todayHits || 0,
      uniqueToday,
      topCountries,
      topCities,
      last7Days
    });
  } catch (error: any) {
    console.error("STATS ERROR [getStatsSummary]:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: error.message, details: error });
  }
};
