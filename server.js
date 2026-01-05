const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// 静的ファイル
app.use(express.static("public"));

// viewer
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "viewer.html"));
});

// admin（仮：あとで鍵付きにする）
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on " + PORT);
});
