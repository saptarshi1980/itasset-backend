import express from "express";
import assetService from "../services/assetService.js";

const router = express.Router();


/* ---------- Asset Master CRUD ---------- */

/* -------- Asset Master -------- */

router.get("/master", async (req, res) => {
  try {
    const assets = await assetService.listAssets();
    console.log("ASSETS FROM DB:", assets);
    res.json(assets);
  } catch (err) {
    console.error("ASSET MASTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// Create new asset
//router.post("/master/create", async (req, res) => {
router.post("/master", async (req, res) => {
  try {
    const asset = req.body;
    await assetService.createAsset(asset);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update asset master
//router.put("/master/update/:assetNo", async (req, res) => {
router.put("/master/:assetNo", async (req, res) => {  
  try {
    const assetNo = req.params.assetNo;
    const asset = req.body;
    await assetService.updateAsset(assetNo, asset);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Optional: List all assets
router.get("/master/list", async (req, res) => {
  try {
    const assets = await assetService.listAssets();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ---------------- Allocate Asset ---------------- */
router.post("/allocate", async (req, res) => {
  try {
    const { assetNo, empCode, remarks } = req.body;
    await assetService.allocateAsset(assetNo, empCode, remarks);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* ---------------- Return Asset ---------------- */
router.post("/return", async (req, res) => {
  try {
    const { assetNo, remarks } = req.body;
    await assetService.returnAsset(assetNo, remarks);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* -------- Get current asset by Asset No -------- */
router.get("/current/:assetNo", async (req, res) => {
  try {
    const asset = await assetService.getAssetByAssetNo(req.params.assetNo);
    res.json(asset);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/* -------- Get assets by Employee -------- */
router.get("/by-employee/:empCode", async (req, res) => {
  try {
    const assets = await assetService.getAssetsByEmployee(req.params.empCode);
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
