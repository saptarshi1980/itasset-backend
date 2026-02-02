import express from "express";
import { login } from "../services/authService.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { empCode, hexPassword } = req.body;

  if (!empCode || !hexPassword) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    const result = await login(empCode, hexPassword);

    if (result.SUCCESS === 1) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result); // 🔴 THIS WAS MISSING
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
