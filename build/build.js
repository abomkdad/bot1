
import fs from "node:fs";
import path from "node:path";

const API_URL = process.env.SHEET_API_URL || "";
const SITE_DOMAIN = (process.env.SITE_DOMAIN || "").trim(); // e.g. preview.madperfume.co.il

if (!API_URL) {
  console.error("ERROR: Missing SHEET_API_URL (set it in GitHub Actions vars).");
  process.exit(1);
}

const OUT_DIR = path.resolve("dist");
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

function esc(s="") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function codeBase(code="") {
  let s = String(code).toUpperCase().trim();
  s = s.replace(/^XM\s*/i, "");
  s = s.replaceAll(".", "");
  s = s.replace(/\s+/g, "");
  return s;
}

function toKey(p) {
  return (p.code_key || "").trim() || (p.code_base || "").trim() || codeBase(p.code || "");
}

function pickName(p, lang) {
  if (lang === "he") return (p["עברית"] || p.English || p.original || p.code || "").trim();
  return (p["عربي"] || p.English || p.original || p.code || "").trim();
}

function baseUrl() {
  if (SITE_DOMAIN) return `https://${SITE_DOMAIN}`;
  return "";
}

function buildHtml(p, lang) {
  const dir = "rtl";
  const htmlLang = lang === "he" ? "he" : "ar";

  const name = pickName(p, lang);
  const price = (p.price || "").toString().trim();
  const codeShow = (p.code || "").toString().trim() || (p.code_base || "").toString().trim();
  const img = (p.image || "").toString().trim();

  const title = esc(name);
  const desc = esc(`${price ? price + "₪ — " : ""}Code: ${codeShow}`);

  const key = toKey(p);
  const url = baseUrl() ? `${baseUrl()}/p/${lang}/${encodeURIComponent(key)}/` : "";

  const waNumber = "15558106988";
  const waText = (lang === "he")
    ? `היי, אני רוצה להזמין ${name} (${codeShow})`
    : `مرحبا، بدي اطلب ${name} (${codeShow})`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

  const uiPrice = (lang === "he") ? "מחיר" : "السعر";
  const uiCode  = (lang === "he") ? "קוד" : "الكود";
  const uiBtn   = (lang === "he") ? "להזמנה בוואטסאפ" : "اطلب على واتساب";

  return `<!doctype html>
<html lang="${htmlLang}" dir="${dir}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>

  <meta property="og:type" content="product"/>
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${desc}"/>
  ${img ? `<meta property="og:image" content="${esc(img)}"/>` : ``}
  ${url ? `<meta property="og:url" content="${esc(url)}"/>` : ``}

  <meta name="twitter:card" content="summary_large_image"/>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; background:#0b0b0b; color:#fff; margin:0; padding:20px}
    .card{max-width:520px; margin:0 auto; background:#151515; border:1px solid #2a2a2a; border-radius:16px; overflow:hidden}
    .img{width:100%; background:#000}
    .img img{width:100%; display:block}
    .content{padding:16px}
    .name{font-size:20px; font-weight:800; margin:0 0 10px}
    .meta{opacity:.9; margin:0 0 14px; line-height:1.7}
    .btn{display:block; text-align:center; padding:14px 16px; background:#25D366; color:#000; text-decoration:none; font-weight:900; border-radius:12px}
    .small{opacity:.65; font-size:12px; margin-top:10px}
  </style>
</head>
<body>
  <div class="card">
    ${img ? `<div class="img"><img src="${esc(img)}" alt="product"/></div>` : ``}
    <div class="content">
      <h1 class="name">${title}</h1>
      <div class="meta">
        ${price ? `${uiPrice}: <b>${esc(price)}₪</b><br/>` : ``}
        ${uiCode}: <b>${esc(codeShow)}</b>
      </div>
      <a class="btn" href="${esc(waLink)}">${uiBtn}</a>
      <div class="small">MAD Preview</div>
    </div>
  </div>
</body>
</html>`;
}

async function fetchAllProducts() {
  const limit = 200;
  let offset = 0;
  const all = [];

  while (true) {
    const url = new URL(API_URL);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("require_price", "true");
    url.searchParams.set("require_links", "false");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    const items = data.products || [];
    all.push(...items);

    if (!items.length || items.length < limit) break;
    offset += limit;
    if (offset > 50000) break;
  }

  return all;
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function buildIndex() {
  const domain = SITE_DOMAIN ? `https://${SITE_DOMAIN}` : "(your GitHub Pages URL)";
  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>MAD Preview Pages</title>
  <style>
    body{font-family:system-ui; background:#0b0b0b; color:#fff; margin:0; padding:24px}
    .box{max-width:720px; margin:0 auto; background:#151515; border:1px solid #2a2a2a; border-radius:16px; padding:18px}
    code{background:#0f0f0f; padding:2px 6px; border-radius:8px}
  </style>
</head>
<body>
  <div class="box">
    <h1 style="margin-top:0">MAD Preview Pages</h1>
    <p>البوت يرسل رابط Preview بالشكل:</p>
    <p>عربي: <code>${domain}/p/ar/&lt;code_key&gt;/</code></p>
    <p>عبري: <code>${domain}/p/he/&lt;code_key&gt;/</code></p>
    <p>مثال: <code>${domain}/p/ar/W183_MAN/</code></p>
  </div>
</body>
</html>`;
  writeFile(path.join(OUT_DIR, "index.html"), html);
}

function writeCname() {
  if (!SITE_DOMAIN) return;
  writeFile(path.join(OUT_DIR, "CNAME"), SITE_DOMAIN + "\n");
}

(async () => {
  console.log("Fetching products from API...");
  const products = await fetchAllProducts();
  console.log("Total products:", products.length);

  writeFile(path.join(OUT_DIR, "catalog.json"), JSON.stringify({
    updated_at: new Date().toISOString(),
    total: products.length,
    products
  }, null, 2));

  for (const p of products) {
    const key = toKey(p);
    if (!key) continue;

    writeFile(path.join(OUT_DIR, "p", "ar", key, "index.html"), buildHtml(p, "ar"));
    writeFile(path.join(OUT_DIR, "p", "he", key, "index.html"), buildHtml(p, "he"));
  }

  buildIndex();
  writeCname();

  console.log("Build done. Output:", OUT_DIR);
})();
