const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

// ===== ENV =====
const ADMIN_KEY = process.env.ADMIN_KEY;

// ===== DATA =====
const DATA_FILE = path.join(__dirname, "data.json");

// ===== middleware =====
app.use(express.json());
app.use(express.static("public"));

// ===== util =====
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ===== viewer =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== admin login =====
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

// ===== admin save =====
app.post("/api/save", (req, res) => {
  const { key, date, detail } = req.body;

  if (key !== ADMIN_KEY) {
    return res.status(403).json({ error: "INVALID KEY" });
  }

  if (!date || !detail) {
    return res.status(400).json({ error: "INVALID DATA" });
  }

  const data = loadData();
  data[date] = detail;
  saveData(data);

  res.json({ ok: true });
});

// ===== viewer load =====
app.get("/api/data", (req, res) => {
  res.json(loadData());
});

// ===== start =====
app.listen(PORT, () => {
  console.log(`BPS CORE running on port ${PORT}`);
});
