import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { supabaseAdmin } from "./supabaseAdmin.js";
import { adminUsersHandler } from "./routes/adminUsers.js";
import * as portfolio from "./routes/portfolio.js";
import * as services from "./routes/services.js";

const app = express();

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
app.get("/api/portfolio", portfolio.getPortfolio);
app.post("/api/portfolio", portfolio.createPortfolio);
app.delete("/api/portfolio/:id", portfolio.deletePortfolio);

// Services CRUD
app.get("/api/services/categories", services.getCategories);
app.post("/api/services/categories", services.createCategory);
app.delete("/api/services/categories/:id", services.deleteCategory);
app.get("/api/services/photos", services.getPhotos);
app.post("/api/services/photos", services.createPhoto);
app.delete("/api/services/photos/:id", services.deletePhoto);

// Contact Route
// Setup Route (Temporary for first admin)
app.post("/api/setup/admin", async (req, res) => {
  try {
    const { secret, email, password } = req.body;
    if (secret !== "warna-2026") return res.status(401).json({ error: "Invalid secret" });
    
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email || "admin@fotowarna.com",
      password: password || "admin123456",
      email_confirm: true,
    });
    
    let userId = data.user?.id;
    if (authError?.message.includes("already registered")) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      userId = users.users.find(u => u.email === (email || "admin@fotowarna.com"))?.id;
    } else if (authError) throw authError;

    if (!userId) throw new Error("User ID not found");

    await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id" });
    await supabaseAdmin.from("profiles").upsert({ id: userId, full_name: "Admin Studio" }, { onConflict: "id" });

    res.json({ success: true, message: "Admin created/updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${env.port}`);
});

