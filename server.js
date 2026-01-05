const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== middleware =====
app.use(cors());
app.use(express.json());

// ===== 状態保存 =====
let currentStatus = {
  message: "System initialized.",
  updatedAt: new Date().toISOString()
};

// ===== API =====

// viewer 用
app.get("/status", (req, res) => {
  res.json(currentStatus);
});

// admin 用（更新）
app.post("/status", (req, res) => {
  const { message } = req.body;

  if (typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "Invalid message" });
  }

  currentStatus = {
    message,
    updatedAt: new Date().toISOString()
  };

  res.json({ success: true });
});

// ===== viewer ページ =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "viewer.html"));
});
