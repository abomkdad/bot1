// site_demo/catalog.js
// Loads products from your Apps Script API and provides fast search.
// Put your WebApp URL below.

const MAD_API_URL = "https://script.google.com/macros/s/AKfycbz0e5l7X7Di-8syjJy43Lky8BdmNHIglpOTevs2xF8e30CmRU3WXcxhU1LcMN7wntI_/exec";

function normSpaces(s){ return String(s||"").replace(/\s+/g," ").trim(); }

function codeBase(code){
  let s = String(code||"").toUpperCase().trim();
  s = s.replace(/^XM\s*/i,"");
  s = s.replace(/\./g,"");
  s = s.replace(/\s+/g,"");
  return s;
}

function normalizeQuery(q){
  let s = String(q||"").trim();
  if(!s) return "";
  s = s.replace(/[^\w\s\u0590-\u05FF\u0600-\u06FF]+/g," ");
  s = s.replace(/\s+/g," ").trim().toLowerCase();
  s = s.replace(/\byo\b/g, "you");
  return s;
}

function genderFix(g){
  const s = String(g||"").toUpperCase().trim();
  if (!s) return "";
  if (s.includes("MAN") || s.includes("MEN") || s.includes("גברים") || s.includes("رج")) return "MAN";
  if (s.includes("WOM") || s.includes("נשים") || s.includes("نس")) return "WOMEN";
  return "";
}

export async function loadCatalog({limit=500, require_links=true, require_price=true} = {}) {
  const url = new URL(MAD_API_URL);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("require_links", require_links ? "1" : "0");
  url.searchParams.set("require_price", require_price ? "1" : "0");

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "API error");

  const products = (data.products || []).map(p => ({
    ...p,
    code_base: p.code_base || codeBase(p.code),
    gender_en_fixed: p.gender_en_fixed || genderFix(p.gender_en || p.gender_ar || p.gender_he),
    code_key: p.code_key || ((p.code_base || codeBase(p.code)) + "_" + (p.gender_en_fixed || genderFix(p.gender_en || p.gender_ar || p.gender_he))),
    search_norm: normalizeQuery(p.search_norm || (p.original + " " + p.English + " " + p["عربي"] + " " + p["עברית"] + " " + p.code))
  }));

  // indexes
  const byCodeKey = new Map();
  const byCodeBase = new Map();
  for (const p of products){
    if (!byCodeKey.has(p.code_key)) byCodeKey.set(p.code_key, p);
    const cb = p.code_base;
    if (!byCodeBase.has(cb)) byCodeBase.set(cb, []);
    byCodeBase.get(cb).push(p);
  }

  return { products, byCodeKey, byCodeBase, updated_at: data.updated_at || "" };
}

export function searchCatalog(catalog, query) {
  const qn = normalizeQuery(query);
  if (!qn) return [];
  const cb = codeBase(query);
  if (cb && catalog.byCodeBase.has(cb)) return catalog.byCodeBase.get(cb);

  const res = [];
  for (const p of catalog.products){
    if ((p.search_norm || "").includes(qn)) res.push(p);
  }
  return res;
}

export function formatOneProduct(p, lang="AR") {
  // returns 1-2 lines max: name + price + link
  const name = (lang === "HE") ? (p["עברית"] || p.English || p.original) :
               (lang === "EN") ? (p.English || p.original) :
               (p["عربي"] || p.English || p.original);

  const link = (lang === "HE") ? (p.buy_link_il || p.buy_link_ps || "") :
               (p.buy_link_ps || p.buy_link_il || "");

  const price = p.price || "";
  return `${name}\n${price} ${link}`.trim();
}
