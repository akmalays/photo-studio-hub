import { supabaseAdmin } from "./supabaseAdmin.js";

async function checkTable() {
  try {
    const { data, error } = await supabaseAdmin
      .from("visitor_stats")
      .select("*")
      .limit(1);
    
    if (error) {
      console.error("Table check error:", error.message);
    } else {
      console.log("Table exists! Rows found:", data.length);
    }
  } catch (err) {
    console.error("Execution error:", err);
  }
}

checkTable();
