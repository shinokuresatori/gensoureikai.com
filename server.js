// server.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

// 🔐 管理者鍵（Render環境変数で設定）
const ADMIN_KEY = process.env.ADMIN_KEY;

// データ保存ファイル
const DATA_FILE = "data.json";

// ===== ミドルウェア =====
app.use(express.json());
app.use(express.static("public")); // public配下の静的ファイルを自動配信

// ===== ビューワー =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "viewer.html"));
});

// ===== 調査の手引きページ =====
app.get("/instruction", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "bVgr6sSX8uJpcMJ.html"));
});

// ===== admin ログイン =====
app.post("/api/admin-login", (req, res) => {
  const { key } = req.body;

  if (!ADMIN_KEY) {
    return res.status(500).json({ error: "ADMIN_KEY not set" });
  }

  if (key === ADMIN_KEY) {
    res.json({ ok: true });
  } else {
    res.status(403).json({ ok: false });
  }
});

// ===== 予定データ保存 =====
app.post("/api/save", (req, res) => {
  const { date, detail } = req.body;

  if (!date || !detail) {
    return res.status(400).json({ error: "Invalid data" });
  }

  let data = {};
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }

  data[date] = detail;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.json({ ok: true });
});

// ===== 予定データ取得 =====
app.get("/api/data", (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json({});
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  res.json(data);
});

// ===== 不正 admin 直アクセス防止 =====
app.get("/admin", (req, res) => {
  res.status(403).send("Forbidden");
});

// ===== サーバー起動 =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
