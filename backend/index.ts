import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { adminUsersHandler } from "./routes/adminUsers.js";
import { contactHandler } from "./routes/contact.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/admin/users", adminUsersHandler);
app.post("/api/contact", contactHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${env.port}`);
});

