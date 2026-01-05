const express = require("express");
const cors = require("cors");

const app = express();

// ===== middleware =====
app.use(cors());
app.use(express.json());

// ===== 状態保存（最小構成）=====
let currentStatus = {
  message: "System initialized.",
  updatedAt: new Date().toISOString()
};

// ===== API =====

// viewer 用
app.get("/status", (req, res) => {
  res.json(currentStatus);
});

// admin 用
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

// 動作確認用
app.get("/", (req, res) => {
  res.send("BPS server is running");
});

// ===== server start =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on " + PORT);
});
