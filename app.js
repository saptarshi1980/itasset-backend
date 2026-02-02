// // app.js
// import express from "express";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// import authRoutes from "./routes/authRoutes.js";
// import assetRoutes from "./routes/assetRoutes.js";
// import * as db from "./db.js";

// /* ---------- FIX __dirname ---------- */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /* ---------- LOAD ENV ---------- */
// dotenv.config({
//   path: path.join(__dirname, ".env"),
// });

// /* ---------- APP ---------- */
// const app = express();
// app.use(express.json());

// /* ---------- ROUTES ---------- */
// app.use("/api/auth", authRoutes);
// app.use("/api/assets", assetRoutes);

// /* ---------- HEALTH CHECK ---------- */
// app.get("/health/db", async (req, res) => {
//   try {
//     const conn = await db.getConnection();
//     await conn.close();
//     res.json({ status: "Oracle connected" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /* ---------- START SERVER ---------- */
// const PORT = process.env.PORT || 3000;

// (async () => {
//   try {
//     await db.initPool();
//     app.listen(PORT, () =>
//       console.log(`ITA Backend running on port ${PORT}`)
//     );
//   } catch (err) {
//     console.error("Startup failed:", err);
//   }
// })();









import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { initPool, getConnection } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";

dotenv.config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);

/* ---------- HEALTH CHECK ---------- */
app.get("/health/db", async (req, res) => {
  try {
    const conn = await getConnection();
    await conn.close();
    res.json({ status: "Oracle connected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- START ---------- */
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await initPool();
    app.listen(PORT, () =>
      console.log(`ITA Backend running on port ${PORT}`)
    );
  } catch (err) {
    console.error("Startup failed:", err);
  }
})();
