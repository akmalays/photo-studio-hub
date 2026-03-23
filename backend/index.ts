import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { supabaseAdmin } from "./supabaseAdmin.js";
import { adminUsersHandler } from "./routes/adminUsers.js";
import * as portfolio from "./routes/portfolio.js";
import * as services from "./routes/services.js";
import * as contact from "./routes/contact.js";
import * as announcements from "./routes/announcements.js";

const app = express();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

console.log("Starting server with env:", JSON.stringify({ port: env.port, env: env.nodeEnv }));

app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Admin Routes
app.post("/api/admin/users", adminUsersHandler);

// Portfolio CRUD
app.get("/api/portfolio/categories", portfolio.getCategories);
app.post("/api/portfolio/categories", portfolio.createCategory);
app.put("/api/portfolio/categories/:id", portfolio.updateCategory);
app.delete("/api/portfolio/categories/:id", portfolio.deleteCategory);
app.get("/api/portfolio/photos", portfolio.getPhotos);
app.post("/api/portfolio/photos", portfolio.createPhoto);
app.put("/api/portfolio/photos/:id", portfolio.updatePhoto);
app.delete("/api/portfolio/photos/:id", portfolio.deletePhoto);

// Services CRUD
app.get("/api/services/categories", services.getCategories);
app.post("/api/services/categories", services.createCategory);
app.delete("/api/services/categories/:id", services.deleteCategory);
app.get("/api/services/photos", services.getPhotos);
app.post("/api/services/photos", services.createPhoto);
app.delete("/api/services/photos/:id", services.deletePhoto);

// Contact Routes
app.post("/api/contact", contact.contactHandler);
app.get("/api/contact/messages", contact.getMessages);
app.delete("/api/contact/messages/:id", contact.deleteMessage);

// Announcements (Ticker) Routes
app.get("/api/announcements", announcements.getAnnouncements);
app.post("/api/announcements", announcements.createAnnouncement);
app.put("/api/announcements/:id", announcements.updateAnnouncement);
app.delete("/api/announcements/:id", announcements.deleteAnnouncement);
// Cleanup Route (Temporary to clear user roles)
app.post("/api/setup/cleanup", async (req, res) => {
  try {
    const { secret } = req.body;
    if (secret !== "warna-2026") return res.status(401).json({ error: "Invalid secret" });
    
    const { error } = await supabaseAdmin.from("user_roles").delete().not("role", "is", null);
    if (error) throw error;

    res.json({ success: true, message: "user_roles table cleared successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Route (Temporary for first admin)
app.post("/api/setup/admin", async (req, res) => {
  try {
    const { secret, email, password, full_name } = req.body;
    if (secret !== "warna-2026") return res.status(401).json({ error: "Invalid secret" });
    
    const targetEmail = email || "admin@warnastudio.com";
    const targetPassword = password || "admin123456";
    const targetName = full_name || "Admin Studio";

    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
    });
    
    let userId = data.user?.id;
    if (authError) {
      console.log("Auth Error during setup:", JSON.stringify(authError));
      // Broadened check for "registered" or "already exist" or status 422
      const isRegistered = authError.message.includes("registered") || 
                          authError.message.includes("exists") || 
                          authError.status === 422;
      
      if (isRegistered) {
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        userId = users.users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())?.id;
      } else {
        throw authError;
      }
    }

    console.log("Setup found/created userId:", userId);

    if (!userId) throw new Error("User ID not found");

    // Assign Role & Create Profile
    const { error: roleErr } = await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleErr) {
      console.error("Role Upsert Error:", roleErr);
      throw roleErr;
    }

    const { error: profileErr } = await supabaseAdmin.from("profiles").upsert({ id: userId, full_name: targetName }, { onConflict: "id" });
    if (profileErr) {
      console.error("Profile Upsert Error:", profileErr);
      throw profileErr;
    }

    res.json({ 
      success: true, 
      message: "Admin created/updated successfully",
      user: {
        id: userId,
        email: targetEmail,
        full_name: targetName,
        role: "admin"
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${env.port}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

server.on("close", () => {
  console.log("Server closed");
});

// Force process to stay alive for debugging
setInterval(() => {
  if (server.listening) {
    // heart beat
  } else {
    console.log("Server is no longer listening");
  }
}, 5000);

