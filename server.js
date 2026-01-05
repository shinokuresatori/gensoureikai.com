const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// static files
app.use(express.static("public"));

// viewer
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "viewer.html"));
});

// admin (temporary)
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on " + PORT);
});
