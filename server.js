const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 10000;

/* =========================
   環境変数
========================= */
const ADMIN_KEY = process.env.ADMIN_KEY;

/* =========================
   データファイル
========================= */
const DATA_FILE = "data.json";              // カレンダー記録
const TOKEN_FILE = "connect_tokens.json";  // ARG連携トークン

/* =========================
   共通関数
========================= */
function loadJSON(file){
  if(!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file,"utf8"));
}

function saveJSON(file,data){
  fs.writeFileSync(file,JSON.stringify(data,null,2));
}

/* =========================
   Middleware
========================= */
app.use(express.json());
app.use(express.static("public"));

/* =========================
   Viewer（BPS）
========================= */
app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"public","viewer.html"));
});

/* =========================
   Admin 認証
========================= */
app.post("/api/admin-login",(req,res)=>{
  const { key } = req.body;

  if(!ADMIN_KEY){
    return res.status(500).json({error:"ADMIN_KEY not set"});
  }

  if(key === ADMIN_KEY){
    res.json({ok:true});
  }else{
    res.status(403).json({ok:false});
  }
});

/* =========================
   カレンダーデータ保存
========================= */
app.post("/api/save",(req,res)=>{
  const { date, detail } = req.body;
  if(!date || !detail){
    return res.status(400).json({error:"Invalid data"});
  }

  const data = loadJSON(DATA_FILE);
  data[date] = detail;
  saveJSON(DATA_FILE,data);

  res.json({ok:true});
});

/* =========================
   カレンダーデータ取得
========================= */
app.get("/api/data",(req,res)=>{
  const data = loadJSON(DATA_FILE);
  res.json(data);
});

/* =========================
   ARG連携トークン生成
   （購入時に呼ばれる）
========================= */
app.post("/api/create-connect-token",(req,res)=>{
  const { argId } = req.body;
  if(!argId){
    return res.status(400).json({error:"ARG ID required"});
  }

  const token = crypto.randomUUID().replace(/-/g,"");
  const tokens = loadJSON(TOKEN_FILE);

  tokens[token] = {
    argId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24h
    used: false
  };

  saveJSON(TOKEN_FILE,tokens);
  res.json({token});
});

/* =========================
   トークン消費（BPS側）
========================= */
app.post("/api/consume-token",(req,res)=>{
  const { token } = req.body;
  const tokens = loadJSON(TOKEN_FILE);
  const t = tokens[token];

  if(!t){
    return res.status(404).json({error:"Token not found"});
  }
  if(t.used){
    return res.status(403).json({error:"Token already used"});
  }
  if(Date.now() > t.expiresAt){
    return res.status(403).json({error:"Token expired"});
  }

  t.used = true;
  saveJSON(TOKEN_FILE,tokens);

  res.json({
    ok:true,
    argId: t.argId
  });
});

/* =========================
   admin直アクセス遮断
========================= */
app.get("/admin",(req,res)=>{
  res.status(403).send("Forbidden");
});

/* =========================
   起動
========================= */
app.listen(PORT,()=>{
  console.log(`BPS server running on port ${PORT}`);
});
