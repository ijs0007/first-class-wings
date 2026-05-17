import { useState, useEffect } from "react";

// ── SUPABASE CONFIG ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://viqzjftggbcyvjlrttlp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpcXpqZnRnZ2JjeXZqbHJ0dGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDQyNjAsImV4cCI6MjA5NDU4MDI2MH0.afLhgNyGJHToO2NAaHnOaxKFneo3lwUFHhnnDD5Xt-M";

const sb = {
  async get(table, query=""){
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
      headers:{ apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json" }
    });
    return res.json();
  },
  async post(table, body){
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:"POST",
      headers:{ apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json", Prefer:"return=representation" },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  async patch(table, query, body){
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
      method:"PATCH",
      headers:{ apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json", Prefer:"return=representation" },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  async delete(table, query){
    await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
      method:"DELETE",
      headers:{ apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  }
};
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
const MENU_IMAGE_URL = "https://res.cloudinary.com/doqb37ujx/image/upload/IMG_9040_wksvez.png";
// ─────────────────────────────────────────────────────────────────────────────

const FLAVORS = [
  { id:"sweet-spicy",          name:"Sweet Spicy",          emoji:"🔥", desc:"Sweet with a spicy kick",     color:"#c0392b" },
  { id:"buffalo",              name:"Buffalo",              emoji:"🐂", desc:"Classic buffalo heat",         color:"#922b21" },
  { id:"lemon-pepper",         name:"Lemon Pepper",         emoji:"🍋", desc:"Zesty lemon, bold pepper",     color:"#b8860b" },
  { id:"sweet-lemon-pepper",   name:"Sweet Lemon Pepper",   emoji:"✨", desc:"Sweet, zesty, peppery finish", color:"#1a6b3c" },
  { id:"buffalo-lemon-pepper", name:"Buffalo Lemon Pepper", emoji:"💥", desc:"Buffalo heat + lemon pepper",  color:"#7d3c98" },
];
const COMBOS = [
  { id:"6pc",  label:"6 Wings & Fries",   wings:6,  price:12, halfHalf:false },
  { id:"8pc",  label:"8 Wings & Fries",   wings:8,  price:14, halfHalf:false },
  { id:"10pc", label:"10 Wings & Fries",  wings:10, price:16, halfHalf:true  },
];
const DAYS       = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_LABELS = { monday:"Mon",tuesday:"Tue",wednesday:"Wed",thursday:"Thu",friday:"Fri",saturday:"Sat",sunday:"Sun" };
const DAY_FULL   = { monday:"Monday",tuesday:"Tuesday",wednesday:"Wednesday",thursday:"Thursday",friday:"Friday",saturday:"Saturday",sunday:"Sunday" };
const MONTH_NAMES= ["January","February","March","April","May","June","July","August","September","October","November","December"];
// ── helpers ──────────────────────────────────────────────────────────────────
function genOrderNum(){ const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s="FCW-"; for(let i=0;i<5;i++) s+=c[Math.floor(Math.random()*c.length)]; return s; }
function fmtTime(d){ return d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true}); }
function fmtDate(d){ return d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}); }
function dateKey(y,m,d){ return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
function buildPayNote(o){ return `Order ${o.orderNum}\n${o.lastName}, ${o.firstName} | ${o.phone}\nPlaced: ${o.time}\nTotal: $${o.total}`; }
function formatPhone(raw){ const d=raw.replace(/\D/g,"").slice(0,10); if(d.length<=3) return d; if(d.length<=6) return `(${d.slice(0,3)}) ${d.slice(3)}`; return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`; }
function cashAppLink(tag,amt){ return `https://cash.app/${tag.replace("$","")}/${amt}`; }
function venmoLink(user,amt,note){ return `https://venmo.com/${user}?txn=pay&amount=${amt}&note=${encodeURIComponent(note)}`; }

function generateTimeSlots(open,close,slotMins){
  const slots=[];
  const [oh,om]=open.split(":").map(Number);
  const [ch,cm]=close.split(":").map(Number);
  let cur=oh*60+om;
  const end=ch*60+cm;
  while(cur<=end){
    const h=Math.floor(cur/60), m=cur%60;
    const ampm=h>=12?"PM":"AM", h12=h%12||12;
    slots.push(`${h12}:${String(m).padStart(2,"0")} ${ampm}`);
    cur+=slotMins;
  }
  return slots;
}

function useLocalStorage(key,init){
  const [val,setVal]=useState(()=>{ try{ const s=localStorage.getItem(key); return s?JSON.parse(s):init; }catch{ return init; } });
  useEffect(()=>{ try{ localStorage.setItem(key,JSON.stringify(val)); }catch{} },[key,val]);
  return [val,setVal];
}

let _tt;
function useToast(){ const [t,setT]=useState(null); const show=(m)=>{ setT(m); clearTimeout(_tt); _tt=setTimeout(()=>setT(null),3200); }; return [t,show]; }

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blk:#0a0a0a;--dark:#0f0f0f;--card:#181818;--card2:#202020;--bdr:#252525;
  --or:#f5a623;--ord:#d4881a;--rd:#c0392b;--rdd:#922b21;
  --wh:#f5f0e8;--gr:#666;--ok:#27ae60;--blue:#2980b9;
}
body{background:var(--blk);color:var(--wh);font-family:'Inter',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
.app{min-height:100vh;padding-bottom:88px}

/* NAV */
.nav{background:#0a0a0a;border-bottom:2px solid var(--or);padding:0 14px;display:flex;align-items:center;justify-content:space-between;height:56px;position:sticky;top:0;z-index:300}
.nav-logo{font-family:'Bebas Neue',sans-serif;font-size:19px;color:var(--or);letter-spacing:2px;line-height:1;cursor:pointer}
.nav-logo span{color:var(--wh)}
.nav-tabs{display:flex;gap:3px}
.ntab{background:none;border:none;color:var(--gr);font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:1px;padding:5px 10px;border-radius:4px;cursor:pointer;text-transform:uppercase;transition:all .2s}
.ntab.active{background:var(--or);color:var(--blk)}
.ntab:hover:not(.active){color:var(--wh)}

/* BACK BAR */
.back-bar{display:flex;align-items:center;gap:8px;padding:8px 13px;background:#0d0d0d;border-bottom:1px solid var(--bdr);position:sticky;top:56px;z-index:200}
.back-btn{background:none;border:1px solid var(--bdr);color:var(--gr);font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:1px;padding:4px 11px;border-radius:4px;cursor:pointer;text-transform:uppercase;transition:all .2s;display:flex;align-items:center;gap:4px;-webkit-appearance:none;appearance:none}
.back-btn:hover{border-color:var(--or);color:var(--or)}
.fwd-btn{background:none;border:1px solid var(--bdr);color:var(--gr);font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:1px;padding:4px 11px;border-radius:4px;cursor:pointer;text-transform:uppercase;transition:all .2s;display:flex;align-items:center;gap:4px;margin-left:auto}
.fwd-btn:hover{border-color:var(--or);color:var(--or)}
.fwd-btn:disabled{opacity:.3;cursor:not-allowed}
.bar-title{font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:1px;color:var(--gr);text-transform:uppercase}

/* HERO - full width centered */
.hero{background:#0a0a0a;border-bottom:1px solid var(--bdr);padding:32px 16px 26px;position:relative;overflow:hidden;text-align:center}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,rgba(245,166,35,.08) 0%,transparent 65%)}
.hero::after{content:'';position:absolute;bottom:0;left:10%;right:10%;height:1px;background:linear-gradient(to right,transparent,rgba(245,166,35,.3),transparent)}
.hero-left{position:relative;z-index:1}
.hero-eyebrow{font-family:'Oswald',sans-serif;font-size:9px;color:var(--or);letter-spacing:6px;text-transform:uppercase;margin-bottom:6px;opacity:.8}
.hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(48px,13vw,88px);line-height:.88;letter-spacing:4px}
.hero-title .or{color:var(--or)}
.hero-badge{display:inline-block;background:var(--rd);color:var(--wh);font-family:'Oswald',sans-serif;font-size:9px;letter-spacing:2px;padding:3px 12px;border-radius:2px;margin-top:11px;text-transform:uppercase}

/* INSTALL BANNER — mobile only */
@media(min-width:600px){.install-banner{display:none!important}}
.install-banner{display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,rgba(245,166,35,.12),rgba(245,166,35,.06));border-bottom:1px solid rgba(245,166,35,.25);padding:8px 12px}
.install-banner-text{flex:1;font-family:'Oswald',sans-serif;font-size:10px;color:var(--gr);letter-spacing:.3px;line-height:1.3}
.install-banner-btn{background:var(--or);color:#000;border:none;font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:1px;padding:5px 10px;border-radius:4px;cursor:pointer;white-space:nowrap;font-weight:600;flex-shrink:0}
.install-banner-x{background:none;border:none;color:#333;cursor:pointer;font-size:13px;padding:2px 4px;flex-shrink:0;line-height:1}
.menu-overlay{position:fixed;inset:0;z-index:999;pointer-events:none;isolation:isolate}
.menu-overlay.open{pointer-events:all}
.menu-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.0);backdrop-filter:blur(0px);-webkit-backdrop-filter:blur(0px);transition:background .45s ease,backdrop-filter .45s ease,-webkit-backdrop-filter .45s ease}
.menu-overlay.open .menu-backdrop{background:rgba(0,0,0,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.menu-panel{position:absolute;bottom:0;left:0;right:0;height:70vh;border-radius:22px 22px 0 0;overflow:hidden;transform:translateY(102%);transition:transform .5s cubic-bezier(.25,.85,.25,1);will-change:transform}
.menu-overlay.open .menu-panel{transform:translateY(0)}
.menu-glass{position:absolute;inset:0;background:rgba(6,6,6,.6);backdrop-filter:blur(30px) saturate(1.8);-webkit-backdrop-filter:blur(30px) saturate(1.8);border-top:1px solid rgba(245,166,35,.3);border-left:1px solid rgba(245,166,35,.08);border-right:1px solid rgba(245,166,35,.08)}
.menu-inner{position:relative;z-index:1;height:100%;display:flex;flex-direction:column}
.menu-handle{width:40px;height:4px;background:rgba(245,166,35,.4);border-radius:2px;margin:14px auto 0;cursor:pointer}
.menu-hdr{display:flex;align-items:center;justify-content:space-between;padding:13px 16px 11px;border-bottom:1px solid rgba(245,166,35,.1)}
.menu-hdr-title{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--or);letter-spacing:2px}
.menu-hdr-sub{font-size:10px;color:var(--gr);margin-top:1px}
.menu-close{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--gr);width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:all .2s;flex-shrink:0}
.menu-close:hover{background:rgba(245,166,35,.15);border-color:rgba(245,166,35,.3);color:var(--or)}
.menu-scroll{flex:1;overflow-y:auto;padding:16px 14px;-webkit-overflow-scrolling:touch}
.menu-scroll img{width:100%;max-width:460px;display:block;margin:0 auto;border-radius:10px;border:1px solid rgba(245,166,35,.12);box-shadow:0 20px 60px rgba(0,0,0,.5)}

/* AVAIL STRIP */
.avail-strip{background:var(--card);border-bottom:1px solid var(--bdr);padding:7px 13px;display:flex;align-items:center;gap:7px;overflow-x:auto;scrollbar-width:none}
.avail-strip::-webkit-scrollbar{display:none}
.avail-label{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:1px;color:var(--or);text-transform:uppercase;white-space:nowrap;flex-shrink:0}
.avail-days{display:flex;gap:3px}
.aday{font-family:'Oswald',sans-serif;font-size:10px;padding:2px 7px;border-radius:3px;text-transform:uppercase;white-space:nowrap}
.aday.open{background:rgba(245,166,35,.12);color:var(--or);border:1px solid rgba(245,166,35,.35)}
.aday.closed{background:rgba(255,255,255,.02);color:#2a2a2a;border:1px solid #1a1a1a}

/* STEPS */
.step-bar{padding:12px 13px 0;display:flex;align-items:center}
.step-circle{width:25px;height:25px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:13px;transition:all .3s;flex-shrink:0}
.step-circle.done{background:var(--ok);color:#fff}
.step-circle.active{background:var(--or);color:var(--blk)}
.step-circle.future{background:#1c1c1c;color:#333;border:1px solid #282828}
.step-lbl{font-family:'Oswald',sans-serif;font-size:8px;letter-spacing:.5px;text-transform:uppercase;color:var(--gr);white-space:nowrap;margin-top:3px}
.step-lbl.active{color:var(--or)}
.step-conn{height:1px;flex:1;background:#1e1e1e;margin-bottom:11px}
.step-conn.done{background:var(--ok)}

/* CONTENT */
.sc{padding:12px 13px}
.step-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:var(--wh);margin-bottom:10px}
.step-title .or{color:var(--or)}

/* COMBO CARDS with food image headers */
.combo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}
.ccard{background:var(--card);border:2px solid var(--bdr);border-radius:8px;overflow:hidden;cursor:pointer;transition:border-color .2s,transform .2s;position:relative}
.ccard:hover{transform:translateY(-2px)}
.ccard.sel{border-color:var(--or);background:rgba(245,166,35,.06)}
.ccard:not(.sel){border-color:var(--bdr)}
.ccard-img{height:46px;overflow:hidden;position:relative}
.ccard-img img{width:100%;height:100%;object-fit:cover;object-position:center top;filter:brightness(.7)}
.ccard-img-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,.5) 100%)}
.ccard-img-fallback{width:100%;height:100%;background:linear-gradient(135deg,#3d1800,#1a0800);display:flex;align-items:center;justify-content:center;font-size:22px}
.ccard-body{padding:7px 5px;text-align:center}
.c-big{font-family:'Bebas Neue',sans-serif;font-size:32px;color:var(--or);line-height:1}
.c-lbl{font-family:'Oswald',sans-serif;font-size:8px;color:var(--wh);letter-spacing:.5px;text-transform:uppercase;margin:1px 0}
.c-price{font-family:'Bebas Neue',sans-serif;font-size:15px;color:var(--wh);background:var(--rd);display:inline-block;padding:1px 6px;border-radius:3px;margin-top:1px}
.c-check{position:absolute;top:4px;right:4px;width:14px;height:14px;background:var(--ok);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;color:#fff;z-index:2}
.hh-badge{display:inline-block;background:rgba(245,166,35,.15);color:var(--or);font-family:'Oswald',sans-serif;font-size:8px;padding:1px 4px;border-radius:2px;margin-top:1px;text-transform:uppercase}

/* FLAVORS */
.flist{display:flex;flex-direction:column;gap:6px}
.fitem{background:var(--card);border:1.5px solid var(--bdr);border-radius:8px;padding:9px 11px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:9px}
.fitem:hover{border-color:var(--or)}
.fitem.sel{border-color:var(--or);background:rgba(245,166,35,.06)}
.fitem.sel2{border-color:#5dade2;background:rgba(93,173,226,.06)}
.f-swatch{width:32px;height:32px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.f-name{font-family:'Oswald',sans-serif;font-size:12px;font-weight:600;color:var(--or);text-transform:uppercase;letter-spacing:.7px}
.fitem.sel2 .f-name{color:#5dade2}
.f-desc{font-size:10px;color:var(--gr);margin-top:1px}
.f-radio{width:13px;height:13px;border-radius:50%;border:2px solid var(--bdr);flex-shrink:0;margin-left:auto;transition:all .2s}
.fitem.sel .f-radio{background:var(--or);border-color:var(--or)}
.fitem.sel2 .f-radio{background:#5dade2;border-color:#5dade2}
.hh-divider{display:flex;align-items:center;gap:6px;margin:8px 0}
.hh-line{flex:1;height:1px;background:var(--bdr)}
.hh-txt{font-family:'Oswald',sans-serif;font-size:9px;letter-spacing:1px;color:var(--gr);text-transform:uppercase}
.hh-toggle{background:var(--card);border:1.5px solid var(--bdr);border-radius:7px;padding:9px 11px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px;margin-bottom:9px}
.hh-toggle.on{border-color:rgba(245,166,35,.45)}
.pill-radio{width:13px;height:13px;border-radius:50%;border:2px solid var(--bdr);flex-shrink:0;margin-left:auto}
.hh-toggle.on .pill-radio{background:var(--or);border-color:var(--or)}

/* QTY */
.qty-row{display:flex;align-items:center;gap:11px;background:var(--card);border:1px solid var(--bdr);border-radius:8px;padding:10px 12px;margin-bottom:9px}
.qty-lbl{font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:.7px;text-transform:uppercase;flex:1;line-height:1.3}
.qty-lbl small{display:block;font-size:9px;color:var(--gr);margin-top:2px;font-family:'Inter',sans-serif;letter-spacing:0;text-transform:none}
.qty-btn{width:30px;height:30px;border-radius:50%;border:2px solid var(--or);background:none;color:var(--or);font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.qty-btn:hover{background:var(--or);color:var(--blk)}
.qty-num{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--wh);min-width:24px;text-align:center}

/* TIME / DAY PICKER */
.time-picker-card{background:var(--card);border:1.5px solid var(--bdr);border-radius:8px;padding:12px;margin-bottom:10px;transition:border-color .2s}
.time-picker-card.has-selection{border-color:rgba(245,166,35,.45)}
.tp-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.tp-icon{font-size:16px}
.tp-title{font-family:'Oswald',sans-serif;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;flex:1}
.tp-sub{font-size:10px;color:var(--gr);margin-top:1px}
.tp-row{margin-bottom:9px}
.tp-label{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:1px;color:var(--or);text-transform:uppercase;margin-bottom:5px}
.day-chips{display:flex;gap:4px;flex-wrap:wrap}
.day-chip{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:.5px;padding:4px 9px;border-radius:4px;cursor:pointer;transition:all .2s;text-transform:uppercase;border:1px solid var(--bdr);background:none;color:var(--gr)}
.day-chip.avail{color:var(--wh);border-color:#333}
.day-chip.sel{background:var(--or);color:var(--blk);border-color:var(--or)}
.day-chip.special{border-color:rgba(245,166,35,.4);color:var(--or)}
.day-chip.special.sel{background:rgba(245,166,35,.15);color:var(--or);border-color:var(--or)}
.time-slots{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.time-slot{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:.5px;padding:6px 4px;border-radius:4px;cursor:pointer;transition:all .2s;text-transform:uppercase;border:1px solid var(--bdr);background:none;color:var(--gr);text-align:center}
.time-slot:hover{border-color:rgba(245,166,35,.4);color:var(--wh)}
.time-slot.sel{background:var(--or);color:var(--blk);border-color:var(--or)}
.special-day-note{background:rgba(245,166,35,.06);border:1px solid rgba(245,166,35,.2);border-radius:6px;padding:9px 10px;margin-top:7px;font-size:11px;color:rgba(245,166,35,.8);line-height:1.5}

/* ORDER REVIEW */
.order-list-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.ol-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px}
.ol-count{background:var(--rd);color:var(--wh);font-family:'Bebas Neue',sans-serif;font-size:11px;padding:2px 8px;border-radius:9px}
.order-items{display:flex;flex-direction:column;gap:5px;margin-bottom:9px}
.oi{background:var(--card);border:1px solid var(--bdr);border-radius:7px;padding:9px 11px;display:flex;align-items:center;gap:8px;transition:all .25s}
.oi.removing{opacity:.25;transform:scale(.97)}
.oi-name{font-family:'Oswald',sans-serif;font-size:11px;font-weight:600;color:var(--or);text-transform:uppercase;letter-spacing:.5px}
.oi-detail{font-size:10px;color:var(--gr);margin-top:1px}
.oi-price{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--wh);flex-shrink:0}
.oi-remove{background:none;border:1px solid #282828;color:#3a3a3a;font-size:12px;cursor:pointer;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.oi-remove:hover{border-color:var(--rd);color:var(--rd)}
.total-bar{background:var(--card);border:1px solid var(--bdr);border-left:3px solid var(--or);border-radius:6px;padding:9px 11px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.total-lbl{font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:1px}
.total-val{font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--or)}
.add-another-btn{width:100%;padding:10px;border:2px dashed rgba(245,166,35,.35);border-radius:7px;background:rgba(245,166,35,.03);color:var(--or);font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:1.5px;cursor:pointer;text-transform:uppercase;transition:all .2s;margin-bottom:7px}
.add-another-btn:hover{border-color:var(--or);background:rgba(245,166,35,.07)}

/* FORM */
.sec-hdr{display:flex;align-items:center;gap:7px;margin-bottom:9px}
.sec-title{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px}
.sec-line{flex:1;height:1px;background:linear-gradient(to right,var(--or),transparent)}
.name-row{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.form-grp{margin-bottom:9px}
.flabel{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:1px;color:var(--or);text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:4px}
.req{color:var(--rd);font-size:11px}
.finput{width:100%;background:var(--card);border:1px solid var(--bdr);border-radius:6px;padding:9px 11px;color:var(--wh);font-family:'Inter',sans-serif;font-size:13px;outline:none;transition:border-color .2s}
.finput:focus{border-color:var(--or)}
.finput.err{border-color:var(--rd)}
.finput::placeholder{color:#2e2e2e}
textarea.finput{resize:vertical;min-height:54px}
select.finput{appearance:none}
.ferr{font-size:9px;color:var(--rd);margin-top:2px;font-family:'Oswald',sans-serif;letter-spacing:.5px}

/* PAYMENT */
.pay-opts{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.pay-opt{background:var(--card);border:2px solid var(--bdr);border-radius:8px;padding:10px 11px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:9px}
.pay-opt:hover{border-color:var(--or)}
.pay-opt.sel{border-color:var(--or);background:rgba(245,166,35,.05)}
.pay-name{font-family:'Oswald',sans-serif;font-size:12px;font-weight:600;color:var(--wh)}
.pay-sub{font-size:10px;color:var(--gr);margin-top:1px}
.pay-radio{width:13px;height:13px;border-radius:50%;border:2px solid var(--bdr);flex-shrink:0;margin-left:auto}
.pay-opt.sel .pay-radio{background:var(--or);border-color:var(--or)}

/* PAY ACTION BUTTONS */
.pay-actions{display:flex;flex-direction:column;gap:5px;margin-bottom:10px}
.pa-btn{display:flex;align-items:center;gap:8px;padding:11px 12px;border-radius:7px;cursor:pointer;font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;text-decoration:none;transition:all .2s;width:100%;border:1.5px solid #2a2a2a;background:#141414;color:var(--wh)}
.pa-btn:hover{border-color:#3a3a3a;background:#1c1c1c;transform:translateY(-1px)}
.pa-cashapp{border-left:3px solid #00a827}
.pa-venmo{border-left:3px solid #3d95ce}
.pa-zelle{border-left:3px solid #6d1ed4}
.pa-amount{font-family:'Bebas Neue',sans-serif;font-size:16px;margin-left:auto;color:var(--or)}

/* PAY NOTE */
.pay-note-card{background:#0c0c0c;border:1.5px solid var(--or);border-radius:8px;padding:11px;margin-bottom:10px}
.pn-title{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:1.5px;color:var(--or);text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:4px}
.pn-dot{width:5px;height:5px;background:var(--or);border-radius:50%;flex-shrink:0}
.pn-desc{font-size:10px;color:var(--gr);margin-bottom:8px;line-height:1.5}
.pn-desc strong{color:#b09050}
.pn-body{background:#0a0a0a;border:1px solid #222;border-radius:5px;padding:10px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--wh);line-height:1.7;white-space:pre;margin-bottom:8px;overflow-x:auto}
.copy-btn{width:100%;padding:8px;border:none;border-radius:5px;font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:1.5px;cursor:pointer;text-transform:uppercase;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:5px}
.copy-idle{background:rgba(245,166,35,.1);color:var(--or);border:1.5px solid rgba(245,166,35,.35)}
.copy-idle:hover{background:rgba(245,166,35,.18)}
.copy-done{background:var(--ok);color:#fff;border:none}

/* BANNERS */
.warn-banner{background:rgba(192,57,43,.09);border:1.5px solid rgba(192,57,43,.38);border-radius:6px;padding:9px 11px;margin-bottom:10px;display:flex;gap:8px;align-items:flex-start}
.info-banner{background:rgba(41,128,185,.07);border:1.5px solid rgba(41,128,185,.28);border-radius:6px;padding:9px 11px;margin-bottom:10px;display:flex;gap:8px;align-items:flex-start}
.ok-banner{background:rgba(39,174,96,.07);border:1.5px solid rgba(39,174,96,.28);border-radius:6px;padding:9px 11px;margin-bottom:10px;display:flex;gap:8px;align-items:flex-start}
.ban-ico{font-size:13px;flex-shrink:0;margin-top:1px}
.ban-txt{font-size:11px;line-height:1.5}
.warn-banner .ban-txt{color:#d89080}
.info-banner .ban-txt{color:#78b8d8}
.ok-banner .ban-txt{color:#70c890}
.ban-txt strong{opacity:.9}

/* RECEIPT */
.receipt{padding:16px 13px;max-width:420px;margin:0 auto}
.receipt-hdr{text-align:center;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--bdr)}
.receipt-logo{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--or);letter-spacing:2px}
.receipt-ordernum{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:500;color:var(--or);background:rgba(245,166,35,.07);border:1.5px solid rgba(245,166,35,.22);border-radius:5px;padding:5px 13px;display:inline-block;letter-spacing:3px;margin:5px 0 3px}
.receipt-date{font-size:10px;color:var(--gr)}
.rs-card{background:var(--card);border:1px solid var(--bdr);border-radius:7px;padding:11px;margin-bottom:9px}
.rs-title{font-family:'Oswald',sans-serif;font-size:9px;letter-spacing:1.5px;color:var(--or);text-transform:uppercase;margin-bottom:7px}
.rs-row{display:flex;justify-content:space-between;padding:3px 0;font-size:11px;border-bottom:1px solid var(--bdr)}
.rs-row:last-child{border:none}
.rs-lbl{color:var(--gr)}
.rs-val{color:var(--wh);text-align:right;max-width:58%}
.rs-row.total{padding-top:7px;font-family:'Oswald',sans-serif;font-size:13px;color:var(--or)}
.receipt-pending{background:rgba(245,166,35,.05);border:1px solid rgba(245,166,35,.18);border-radius:5px;padding:7px 11px;text-align:center;font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:1px;color:var(--or);text-transform:uppercase;margin-bottom:9px}
.screenshot-note{text-align:center;font-size:10px;color:var(--gr);margin-bottom:10px;line-height:1.5}
.screenshot-note strong{color:rgba(245,166,35,.7)}

/* BUTTONS */
.btn{width:100%;padding:11px;border:none;border-radius:7px;font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:3px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:5px}
.btn+.btn{margin-top:6px}
.btn-or{background:linear-gradient(135deg,var(--or),var(--ord));color:var(--blk)}
.btn-or:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(245,166,35,.22)}
.btn-or:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none}
.btn-ghost{background:none;border:1px solid var(--bdr);color:var(--gr);font-size:12px;letter-spacing:1px}
.btn-ghost:hover{border-color:var(--or);color:var(--or)}
.btn-danger{background:none;border:1px solid rgba(192,57,43,.45);color:var(--rd);font-size:12px;letter-spacing:1px}
.btn-danger:hover{background:rgba(192,57,43,.09)}
.btn-blue{background:rgba(41,128,185,.15);border:1px solid rgba(41,128,185,.4);color:#78b8d8;font-size:12px;letter-spacing:1px}
.btn-blue:hover{background:rgba(41,128,185,.22)}

/* TRAY */
.tray{position:fixed;bottom:0;left:0;right:0;background:#0d0d0d;border-top:2px solid var(--or);padding:9px 13px;z-index:150;display:flex;align-items:center;gap:9px}
.tray-badge{background:var(--rd);color:var(--wh);font-family:'Bebas Neue',sans-serif;font-size:12px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.tray-info{flex:1}
.tray-line{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:.5px;color:var(--gr);text-transform:uppercase}
.tray-total{font-family:'Bebas Neue',sans-serif;font-size:17px;color:var(--or);line-height:1.1}
.tray-btn{background:var(--or);color:var(--blk);border:none;font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:2px;padding:8px 14px;border-radius:5px;cursor:pointer;white-space:nowrap;transition:all .2s;flex-shrink:0}
.tray-btn:hover{background:var(--ord)}
.tray-btn:disabled{opacity:.3;cursor:not-allowed}

/* MENU FULLSCREEN */
.menu-screen{background:var(--blk);min-height:calc(100vh - 56px)}
.menu-img-wrap{width:100%;display:flex;align-items:flex-start;justify-content:center;padding:12px 13px}
.menu-img-wrap img{width:100%;max-width:500px;border-radius:8px;border:1px solid var(--bdr)}
.menu-placeholder{width:100%;max-width:500px;background:var(--card);border:2px dashed rgba(245,166,35,.3);border-radius:8px;padding:40px 20px;text-align:center}
.menu-placeholder-icon{font-size:48px;margin-bottom:12px}
.menu-placeholder-title{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--or);letter-spacing:2px;margin-bottom:6px}
.menu-placeholder-sub{font-size:12px;color:var(--gr);line-height:1.6;max-width:280px;margin:0 auto}

/* OWNER */
.dash{padding:11px}
.dash-title{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--or);letter-spacing:2px;margin-bottom:1px}
.dash-sub{font-size:11px;color:var(--gr);margin-bottom:12px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px}
.stat{background:var(--card);border:1px solid var(--bdr);border-radius:6px;padding:9px 5px;text-align:center}
.stat-n{font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--or)}
.stat-l{font-family:'Oswald',sans-serif;font-size:9px;color:var(--gr);letter-spacing:1px;text-transform:uppercase}
.dtabs{display:flex;gap:0;margin-bottom:11px;background:var(--card);border-radius:6px;padding:2px;border:1px solid var(--bdr)}
.dtab{flex:1;padding:6px 2px;text-align:center;font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:.8px;text-transform:uppercase;border-radius:4px;border:none;background:none;color:var(--gr);cursor:pointer;transition:all .2s}
.dtab.active{background:var(--or);color:var(--blk)}
.orders-list{display:flex;flex-direction:column;gap:8px}
.ocard{background:var(--card);border:1px solid var(--bdr);border-radius:8px;padding:11px}
.ocard.status-new{border-left:4px solid var(--or)}
.ocard.status-confirmed{border-left:4px solid var(--blue)}
.ocard.status-ready{border-left:4px solid var(--ok)}
.ocard.status-done{border-left:4px solid #1c1c1c;opacity:.48}
.onum-chip{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;color:var(--or);background:rgba(245,166,35,.09);border:1px solid rgba(245,166,35,.25);border-radius:3px;padding:1px 7px;letter-spacing:1px;display:inline-block;margin-bottom:5px}
.otop{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px}
.oname{font-family:'Oswald',sans-serif;font-size:13px;font-weight:600}
.obadge{font-family:'Oswald',sans-serif;font-size:9px;letter-spacing:1px;padding:2px 6px;border-radius:3px;text-transform:uppercase}
.b-new{background:rgba(245,166,35,.16);color:var(--or)}
.b-confirmed{background:rgba(41,128,185,.16);color:var(--blue)}
.b-cooking{background:rgba(192,57,43,.16);color:#e88}
.b-ready{background:rgba(39,174,96,.16);color:var(--ok)}
.b-done{background:rgba(255,255,255,.04);color:#3a3a3a}
.b-rain{background:rgba(41,128,185,.12);color:#78b8d8}
.ocard.status-cooking{border-left:4px solid var(--rd)}
.odet{font-size:10px;color:var(--gr);margin-bottom:2px}
.odet strong{color:var(--wh)}
.oprice{font-family:'Bebas Neue',sans-serif;font-size:17px;color:var(--or);margin:4px 0 2px}
.confirm-box{background:rgba(41,128,185,.07);border:1.5px solid rgba(41,128,185,.3);border-radius:7px;padding:9px;margin:6px 0;display:flex;align-items:flex-start;gap:8px;cursor:pointer;transition:all .2s;text-decoration:none}
.confirm-box:hover{border-color:rgba(41,128,185,.55);background:rgba(41,128,185,.12)}
.confirm-box.checked{background:rgba(39,174,96,.06);border-color:rgba(39,174,96,.4)}
.cb-check{width:18px;height:18px;border-radius:3px;border:2px solid rgba(41,128,185,.45);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .2s;margin-top:1px}
.confirm-box.checked .cb-check{background:var(--ok);border-color:var(--ok);color:#fff}
.cb-title{font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:.5px;font-weight:600;text-transform:uppercase;color:var(--wh)}
.confirm-box.checked .cb-title{color:var(--ok)}
.cb-sub{font-size:9px;color:var(--gr);margin-top:2px;line-height:1.4}
.oacts{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;justify-content:center}
.abtn{padding:5px 9px;border-radius:4px;border:none;font-family:'Oswald',sans-serif;font-size:9px;letter-spacing:1px;cursor:pointer;text-transform:uppercase;transition:all .2s;text-decoration:none;display:inline-flex;align-items:center;gap:3px}
.a-ok{background:var(--ok);color:#fff}
.a-done{background:#1e1e1e;color:var(--gr)}
.a-sms{background:rgba(245,166,35,.1);color:var(--or);border:1px solid rgba(245,166,35,.35)}
.abtn:hover{filter:brightness(1.15)}

/* CALENDAR */
.cal-toggle-row{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:9px}
.cal-toggle-btn{padding:7px;text-align:center;font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:1px;text-transform:uppercase;border-radius:5px;border:1px solid var(--bdr);background:none;color:var(--gr);cursor:pointer;transition:all .2s}
.cal-toggle-btn.active{background:var(--or);color:var(--blk);border-color:var(--or)}
.week-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:9px}
.wday{background:var(--card);border:1px solid var(--bdr);border-radius:4px;padding:6px 2px;text-align:center;cursor:pointer;transition:all .2s}
.wday.on{border-color:var(--or);background:rgba(245,166,35,.09)}
.wday-name{font-family:'Oswald',sans-serif;font-size:8px;letter-spacing:.5px;text-transform:uppercase}
.wday.on .wday-name{color:var(--or)}
.wday:not(.on) .wday-name{color:#2e2e2e}
.wdot{width:4px;height:4px;border-radius:50%;margin:3px auto 0}
.wday.on .wdot{background:var(--or)}
.month-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}
.month-nav{background:none;border:1px solid var(--bdr);color:var(--gr);width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .2s}
.month-nav:hover{border-color:var(--or);color:var(--or)}
.month-name{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:var(--wh)}
.month-dow{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:3px}
.dow-lbl{font-family:'Oswald',sans-serif;font-size:8px;text-align:center;color:var(--gr);text-transform:uppercase;padding:2px 0}
.month-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.mday{min-height:30px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;transition:all .2s;border:1px solid transparent}
.mday.empty{cursor:default}
.mday.today{border-color:rgba(245,166,35,.4)!important;color:var(--or)}
.mday.open{background:rgba(245,166,35,.14);border-color:rgba(245,166,35,.45);color:var(--or);font-weight:600}
.mday:not(.empty):not(.open):hover{background:rgba(255,255,255,.04);border-color:#2a2a2a}
.mday.past{opacity:.35;cursor:default}

/* HOURS SETTINGS */
.hours-row{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:7px}
.blast-section{background:rgba(41,128,185,.05);border:1.5px solid rgba(41,128,185,.25);border-radius:7px;padding:11px;margin-bottom:9px}
.blast-title{font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:1.5px;color:var(--blue);text-transform:uppercase;margin-bottom:5px;display:flex;align-items:center;gap:6px}
.blast-sub{font-size:11px;color:var(--gr);margin-bottom:9px;line-height:1.5}
.blast-preview{background:var(--blk);border:1px solid #222;border-radius:5px;padding:9px 10px;font-size:11px;color:var(--gr);line-height:1.6;margin-bottom:8px;font-style:italic}
.customer-chips{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;max-height:80px;overflow-y:auto}
.cust-chip{background:rgba(41,128,185,.12);border:1px solid rgba(41,128,185,.28);color:#78b8d8;font-family:'Oswald',sans-serif;font-size:9px;padding:2px 7px;border-radius:3px;letter-spacing:.5px}

/* SETTINGS */
.scard{background:var(--card);border:1px solid var(--bdr);border-radius:7px;padding:11px;margin-bottom:9px}
.stitle{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:2px;color:var(--or);text-transform:uppercase;margin-bottom:9px}
.clear-warn{background:rgba(192,57,43,.07);border:1.5px solid rgba(192,57,43,.3);border-radius:6px;padding:9px 11px;margin-bottom:8px;font-size:10px;color:#b08080;line-height:1.5}
.clear-warn strong{color:#d09090}
.note{font-size:10px;color:var(--gr);margin-top:4px;line-height:1.5}
.note a{color:var(--or)}
.empty{text-align:center;padding:26px 13px;color:var(--gr)}
.empty-i{font-size:34px;margin-bottom:6px}
.empty-m{font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:1px}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:400;display:flex;align-items:center;justify-content:center;padding:18px}
.modal{background:#181818;border:1.5px solid var(--rd);border-radius:9px;padding:18px;max-width:300px;width:100%}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--rd);letter-spacing:2px;margin-bottom:7px}
.modal-body{font-size:11px;color:var(--gr);line-height:1.6;margin-bottom:14px}
.modal-body strong{color:var(--wh)}
.modal-actions{display:flex;gap:7px}
.modal-actions .btn{flex:1}

.toast{position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:var(--or);color:var(--blk);font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:1px;padding:8px 16px;border-radius:5px;z-index:500;white-space:nowrap;animation:tin .22s ease;max-width:86vw;text-align:center}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(7px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
`;

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [view,setView]       = useState("customer");
  const [orders,setOrders]   = useState([]);
  const [openDates,setOpenDates] = useState({});
  const [settings,setSettingsState] = useState({
    cashapp:"$FirstClassWings", venmo:"FirstClassWings", zelle:"912-227-4387",
    pickupAddress:"Text owner for pickup address", ownerPin:"1234", dateHours:{},
    ownerPhone:"", isClosed:false, closedMsg:"", customMsgs:{},
  });
  const [loading,setLoading] = useState(true);
  const [toast,showToast]    = useToast();
  const [ownerPin,setOwnerPin]           = useState("");
  const [ownerUnlocked,setOwnerUnlocked] = useState(false);

  // Persistent customer state — localStorage only (cart is per-device by design)
  const [cart,setCart]               = useLocalStorage("fcw_cart",[]);
  const [buildStep,setBuildStep]     = useLocalStorage("fcw_step",1);
  const [building,setBuilding]       = useLocalStorage("fcw_building",{combo:null,flavor1:null,flavor2:null,hh:false,qty:1});
  const [custScreen,setCustScreen]   = useLocalStorage("fcw_cust_screen","build");
  const [screenHistory,setScreenHistory] = useLocalStorage("fcw_screen_hist",["build"]);
  const [menuOpen,setMenuOpen]           = useState(false);
  const [installModal,setInstallModal]   = useState(false);
  const [installDismissed,setInstallDismissed] = useState(()=>!!localStorage.getItem("fcw_install_dismissed"));

  // ── LOAD FROM SUPABASE ON MOUNT ──
  useEffect(()=>{
    async function load(){
      try{
        // Load settings
        const s = await sb.get("settings","?id=eq.1&select=*");
        if(s&&s[0]){
          const row=s[0];
          setSettingsState({
            cashapp:row.cashapp||"$FirstClassWings",
            venmo:row.venmo||"FirstClassWings",
            zelle:row.zelle||"912-227-4387",
            pickupAddress:row.pickup_address||"Text owner for pickup address",
            ownerPin:row.owner_pin||"1234",
            dateHours:row.date_hours||{},
            ownerPhone:row.owner_phone||"",
            isClosed:row.is_closed||false,
            closedMsg:row.closed_msg||"",
            customMsgs:row.custom_msgs||{},
          });
        }
        // Load orders
        const o = await sb.get("orders","?select=*&order=created_at.desc");
        if(o&&Array.isArray(o)){
          setOrders(o.map(r=>({
            id:r.id, orderNum:r.order_num, status:r.status,
            firstName:r.first_name, lastName:r.last_name, phone:r.phone,
            notes:r.notes, cartItems:r.cart_items, total:r.total,
            pay:r.pay, orderTime:r.order_time, specDay:r.spec_day,
            reqDay:r.req_day, time:r.time, date:r.date,
          })));
        }
        // Load open dates
        const d = await sb.get("open_dates","?select=date_key");
        if(d&&Array.isArray(d)){
          const obj={};
          d.forEach(row=>{ obj[row.date_key]=true; });
          setOpenDates(obj);
        }
      }catch(e){ console.error("Supabase load error:",e); }
      setLoading(false);
    }
    load();
  },[]);

  // ── SAVE SETTINGS TO SUPABASE ──
  async function setSettings(updater){
    const next = typeof updater==="function" ? updater(settings) : updater;
    setSettingsState(next);
    try{
      await sb.patch("settings","?id=eq.1",{
        cashapp:next.cashapp, venmo:next.venmo, zelle:next.zelle,
        pickup_address:next.pickupAddress, owner_pin:next.ownerPin,
        date_hours:next.dateHours, updated_at:new Date().toISOString(),
      });
    }catch(e){ console.error("Settings save error:",e); }
  }

  // ── TOGGLE DATE IN SUPABASE ──
  const isDateOpen = (key) => !!openDates[key];
  async function toggleDate(key){
    if(openDates[key]){
      setOpenDates(p=>{ const n={...p}; delete n[key]; return n; });
      try{ await sb.delete("open_dates",`?date_key=eq.${key}`); }catch(e){ console.error(e); }
    } else {
      setOpenDates(p=>({...p,[key]:true}));
      try{ await sb.post("open_dates",{date_key:key}); }catch(e){ console.error(e); }
    }
  }

  // ── ADD ORDER TO SUPABASE ──
  async function addOrder(o){
    try{
      const rows = await sb.post("orders",{
        order_num:o.orderNum, status:"new",
        first_name:o.firstName, last_name:o.lastName, phone:o.phone,
        notes:o.notes, cart_items:o.cartItems, total:o.total,
        pay:o.pay, order_time:o.orderTime, spec_day:o.specDay,
        req_day:o.reqDay, time:o.time, date:o.date,
      });
      if(rows&&rows[0]){
        setOrders(p=>[{
          id:rows[0].id, orderNum:rows[0].order_num, status:"new",
          firstName:o.firstName, lastName:o.lastName, phone:o.phone,
          notes:o.notes, cartItems:o.cartItems, total:o.total,
          pay:o.pay, orderTime:o.orderTime, specDay:o.specDay,
          reqDay:o.reqDay, time:o.time, date:o.date,
        },...p]);
      }
    }catch(e){ console.error("Order save error:",e); }
  }

  // ── UPDATE ORDER STATUS IN SUPABASE ──
  async function upStatus(id,s){
    setOrders(p=>p.map(o=>o.id===id?{...o,status:s}:o));
    try{ await sb.patch("orders",`?id=eq.${id}`,{status:s}); }catch(e){ console.error(e); }
    const toasts={cooking:"🍳 Cooking!",ready:"🍗 Ready!",done:"✅ Done!",new:"↩ Back to New",raincheck:"🌧️ Rain Checked!",confirmed:"✅ Confirmed!"};
    showToast(toasts[s]||"Updated!");
  }

  async function confirmOrder(id){
    setOrders(p=>p.map(o=>o.id===id?{...o,status:"confirmed"}:o));
    try{ await sb.patch("orders",`?id=eq.${id}`,{status:"confirmed"}); }catch(e){ console.error(e); }
    const o=orders.find(x=>x.id===id);
    if(o) showToast(`✅ ${o.orderNum} confirmed!`);
  }

  async function clearCompleted(ids){
    if(ids&&ids.length>0){
      setOrders(p=>p.filter(o=>!ids.includes(o.id)));
    } else {
      setOrders(p=>p.filter(o=>o.status!=="done"));
      try{ await sb.delete("orders","?status=eq.done"); }catch(e){ console.error(e); }
    }
    showToast("Cleared!");
  }

  const loginOwner=()=>{ if(ownerPin===settings.ownerPin){setOwnerUnlocked(true);showToast("Welcome back! 👑");}else showToast("Wrong PIN!"); };

  // navigation
  function navigate(screen){ setCustScreen(screen); setScreenHistory(h=>[...h,screen]); }
  function goBack(){ setScreenHistory(h=>{ if(h.length<=1) return h; const nh=h.slice(0,-1); setCustScreen(nh[nh.length-1]); return nh; }); }
  const canGoBack = screenHistory.length > 1;

  function getOpenDayNamesThisWeek(){
    const now=new Date(); const dow=now.getDay();
    return DAYS.filter((_,i)=>{ const off=(i+1)-dow; const d=new Date(now); d.setDate(now.getDate()+off); return isDateOpen(dateKey(d.getFullYear(),d.getMonth(),d.getDate())); });
  }

  const newCt        = orders.filter(o=>o.status==="new").length;
  const confirmedCt  = orders.filter(o=>o.status==="confirmed").length;
  const todayTot     = orders.filter(o=>["confirmed","ready","done"].includes(o.status)).reduce((s,o)=>s+o.total,0);
  const openDayNames = getOpenDayNamesThisWeek();

  if(loading) return(
    <div style={{background:"#0a0a0a",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:"#f5a623",letterSpacing:3}}>FIRST <span style={{color:"#f5f0e8"}}>CLASS</span> WINGS</div>
      <div style={{width:40,height:40,border:"3px solid #252525",borderTop:"3px solid #f5a623",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div className="app">
      <style>{CSS}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={()=>{setView("customer");navigate("build");}}>FIRST <span>CLASS</span> WINGS</div>
        <div className="nav-tabs">
          <button className={`ntab ${view==="customer"?"active":""}`} onClick={()=>setView("customer")}>Order</button>
          <button className="ntab" onClick={()=>setMenuOpen(true)}>Menu</button>
          <button className={`ntab ${view==="owner"?"active":""}`} onClick={()=>setView("owner")}>
            Owner{newCt>0?` (${newCt})`:""}
          </button>
        </div>
      </nav>

      {/* GET THE APP BANNER — mobile only, dismissible */}
      {!installDismissed&&(
        <div className="install-banner">
          <span style={{fontSize:13}}>📲</span>
          <span className="install-banner-text">Add First Class Wings to your home screen</span>
          <button className="install-banner-btn" onClick={()=>setInstallModal(true)}>Get the App</button>
          <button className="install-banner-x" onClick={()=>{setInstallDismissed(true);localStorage.setItem("fcw_install_dismissed","1");}}>✕</button>
        </div>
      )}

      {/* INSTALL MODAL */}
      {installModal&&(
        <div className="modal-overlay" onClick={()=>setInstallModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:340,textAlign:"left"}}>
            <div className="modal-title" style={{textAlign:"center",marginBottom:4}}>📲 Add to Home Screen</div>
            <p style={{fontSize:10,color:"var(--gr)",textAlign:"center",marginBottom:16}}>Get the full app experience — faster, no browser bar, works like a real app!</p>

            {/* iPhone */}
            <div style={{marginBottom:14,padding:"12px",background:"rgba(245,166,35,.04)",border:"1px solid rgba(245,166,35,.15)",borderRadius:8}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--or)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🍎 iPhone / iPad</div>
              {[
                {icon:"1️⃣", text:'Open this page in Safari (not Chrome)'},
                {icon:"2️⃣", text:'Tap the Share button ⬆️ at the bottom of the screen'},
                {icon:"3️⃣", text:'Scroll down and tap "Add to Home Screen"'},
                {icon:"4️⃣", text:'Tap "Add" in the top right — done! 🎉'},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                  <span style={{fontSize:13,flexShrink:0}}>{s.icon}</span>
                  <span style={{fontSize:11,color:"var(--wh)",lineHeight:1.5}}>{s.text}</span>
                </div>
              ))}
            </div>

            {/* Android */}
            <div style={{marginBottom:16,padding:"12px",background:"rgba(41,128,185,.04)",border:"1px solid rgba(41,128,185,.15)",borderRadius:8}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"#78b8d8",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🤖 Android</div>
              {[
                {icon:"1️⃣", text:'Open this page in Chrome'},
                {icon:"2️⃣", text:'Tap the 3-dot menu ⋮ in the top right'},
                {icon:"3️⃣", text:'Tap "Add to Home Screen"'},
                {icon:"4️⃣", text:'Tap "Add" — done! 🎉'},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                  <span style={{fontSize:13,flexShrink:0}}>{s.icon}</span>
                  <span style={{fontSize:11,color:"var(--wh)",lineHeight:1.5}}>{s.text}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-or" onClick={()=>setInstallModal(false)}>Got it! 👑</button>
          </div>
        </div>
      )}

      {view==="customer" &&
        <CustomerView
          openDayNames={openDayNames} openDates={openDates} settings={settings}
          addOrder={addOrder} showToast={showToast}
          cart={cart} setCart={setCart}
          buildStep={buildStep} setBuildStep={setBuildStep}
          building={building} setBuilding={setBuilding}
          screen={custScreen} navigate={navigate} goBack={goBack} canGoBack={canGoBack}
          screenHistory={screenHistory} setScreenHistory={setScreenHistory} setCustScreen={setCustScreen}
        />}
      {view==="owner" &&
        <OwnerView
          unlocked={ownerUnlocked} pin={ownerPin} setPin={setOwnerPin} onLogin={loginOwner}
          orders={orders} newCt={newCt} confirmedCt={confirmedCt} todayTot={todayTot}
          openDates={openDates} toggleDate={toggleDate} isDateOpen={isDateOpen}
          settings={settings} setSettings={setSettings}
          confirmOrder={confirmOrder} upStatus={upStatus}
          showToast={showToast} clearCompleted={clearCompleted}
        />}

      {toast && <div className="toast">{toast}</div>}

      {/* MENU OVERLAY */}
      <div className={`menu-overlay ${menuOpen?"open":""}`}>
        <div className="menu-backdrop" onClick={()=>setMenuOpen(false)}/>
        <div className="menu-panel">
          <div className="menu-glass"/>
          <div className="menu-inner">
            <div className="menu-handle" onClick={()=>setMenuOpen(false)}/>
            <div className="menu-scroll">
              <div style={{position:"relative"}}>
                <button onClick={()=>setMenuOpen(false)} style={{
                  position:"absolute",top:12,right:12,zIndex:10,
                  background:"rgba(0,0,0,.7)",border:"1.5px solid rgba(245,166,35,.5)",
                  color:"var(--or)",width:34,height:34,borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",fontSize:15,fontWeight:"bold",backdropFilter:"blur(4px)"
                }}>✕</button>
                <img src={MENU_IMAGE_URL}
                  alt="First Class Wings Menu"
                  style={{touchAction:"pinch-zoom",width:"100%",maxWidth:460,display:"block",margin:"0 auto",borderRadius:10,border:"1px solid rgba(245,166,35,.12)",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}/>
              </div>
              <div style={{height:24}}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MENU VIEW ─────────────────────────────────────────────────────────────────
// ── CUSTOMER VIEW ─────────────────────────────────────────────────────────────
function CustomerView({openDayNames,openDates,settings,addOrder,showToast,cart,setCart,buildStep,setBuildStep,building,setBuilding,screen,navigate,goBack,canGoBack,screenHistory,setScreenHistory,setCustScreen}){
  const cartTotal = cart.reduce((s,i)=>s+i.subtotal,0);
  const [form,setForm]         = useLocalStorage("fcw_form",{firstName:"",lastName:"",phone:"",notes:""});
  const [errors,setErrors]     = useState({});
  const [orderTime,setOrderTime]= useLocalStorage("fcw_ordertime",{day:null,time:null,isSpecial:false});
  const [lastOrder,setLastOrder]= useLocalStorage("fcw_last_order",null);
  const [removing,setRemoving] = useState(null);
  const [copied,setCopied]     = useState(false);

  const b=building; const setB=setBuilding;
  const step=buildStep; const setStep=setBuildStep;

  function fresh(){ return {combo:null,flavor1:null,flavor2:null,hh:false,qty:1}; }

  // Days available: open dates this week + any future open date (for special)
  const now=new Date();
  const thisWeekOpenDays = DAYS.filter((_,i)=>{
    const off=(i+1)-now.getDay(); const d=new Date(now); d.setDate(now.getDate()+off);
    const k=dateKey(d.getFullYear(),d.getMonth(),d.getDate());
    return openDates[k] && d >= new Date(now.getFullYear(),now.getMonth(),now.getDate());
  });

  function buildItem(){
    const flavorLabel=b.hh&&b.flavor2?`${b.flavor1?.name||""} / ${b.flavor2?.name||""}`:b.flavor1?.name||"";
    return{id:Date.now()+Math.random(),combo:b.combo,flavorLabel,qty:b.qty,subtotal:b.combo.price*b.qty};
  }
  function removeItem(id){ setRemoving(id); setTimeout(()=>{setCart(p=>p.filter(i=>i.id!==id));setRemoving(null);},250); }

  function validate(){
    const e={};
    if(!form.firstName.trim()) e.firstName="Required";
    if(!form.lastName.trim()) e.lastName="Required";
    if(form.phone.replace(/\D/g,"").length<10) e.phone="Valid 10-digit number required";
    setErrors(e); return Object.keys(e).length===0;
  }

  function submitOrder(){
    if(!validate()) return;
    const now=new Date(); const orderNum=genOrderNum(); const time=fmtTime(now); const date=fmtDate(now);
    const order={cartItems:cart,total:cartTotal,orderNum,time,date,...form,pay:"cashapp",specDay:orderTime?.isSpecial||false,reqDay:orderTime?.day||""};
    addOrder(order); setLastOrder(order); navigate("receipt");
    setCart([]); setB(fresh()); setStep(1);
    setForm({firstName:"",lastName:"",phone:"",notes:""});
    setOrderTime({day:null,time:null,isSpecial:false});
    showToast("Order placed! 🍗");
  }

  function copyNote(note){ navigator.clipboard.writeText(note).then(()=>{setCopied(true);showToast("Copied! 📋");setTimeout(()=>setCopied(false),3500);}).catch(()=>showToast("Long-press the note to copy")); }

  const canNext3 = b.flavor1&&(!(b.hh&&b.combo?.halfHalf)||b.flavor2);
  const itemSub  = b.combo?b.combo.price*b.qty:0;
  const STEPS    = ["Combo","Flavor","Qty","Order"];

  // ── RECEIPT ──
  if(screen==="receipt"&&lastOrder){
    const payNote=buildPayNote(lastOrder);
    return(
      <div>
        <div className="back-bar">
          <button className="back-btn" onClick={()=>{setCustScreen("build");setScreenHistory(["build"]);}}>◀ Back</button>
          <span className="bar-title">✅ Order Submitted!</span>
        </div>
        <div className="receipt">

          {/* 1 — PAYMENT WARNING */}
          <div className="warn-banner" style={{marginBottom:12}}>
            <span className="ban-ico">⚠️</span>
            <div className="ban-txt"><strong>Send payment to complete your order.</strong> Your order won't be prepared until payment is received and the owner verifies it.</div>
          </div>

          {/* 2 — PAYMENT NOTE */}
          <div className="pay-note-card" style={{marginBottom:12}}>
            <div className="pn-title"><div className="pn-dot"/>Add This Note to Your Payment</div>
            <div className="pn-desc" style={{marginTop:4}}>Paste into the memo/description when you pay — this connects your payment to your order.</div>
            <div className="pn-body">{payNote}</div>
            <button className={`copy-btn ${copied?"copy-done":"copy-idle"}`} onClick={()=>copyNote(payNote)}>
              {copied?"✓ Copied!":"📋 Tap to Copy"}
            </button>
          </div>

          {/* 3 — PAY BUTTONS */}
          <div className="pay-actions" style={{marginBottom:16}}>
            <a className="pa-btn pa-cashapp" href={cashAppLink(settings.cashapp,lastOrder.total)} target="_blank" rel="noreferrer" onClick={()=>setTimeout(()=>copyNote(payNote),400)}>
              <span>💚</span><span style={{flex:1}}>Pay with Cash App</span><span className="pa-amount">${lastOrder.total}</span>
            </a>
            <a className="pa-btn pa-venmo" href={venmoLink(settings.venmo,lastOrder.total,payNote)} target="_blank" rel="noreferrer" onClick={()=>setTimeout(()=>copyNote(payNote),400)}>
              <span>💜</span><span style={{flex:1}}>Pay with Venmo</span><span className="pa-amount">${lastOrder.total}</span>
            </a>
            <a className="pa-btn pa-zelle" href="https://enroll.zellepay.com/" target="_blank" rel="noreferrer" onClick={()=>setTimeout(()=>copyNote(payNote),400)}>
              <span>📱</span><span style={{flex:1}}>Zelle: {settings.zelle}</span><span className="pa-amount">${lastOrder.total}</span>
            </a>
          </div>

          {/* 4 — ORDER SUMMARY */}
          <div className="rs-card">
            <div className="rs-title">Order Summary</div>
            <div className="rs-row"><span className="rs-lbl">Order #</span><span className="rs-val" style={{fontFamily:"'JetBrains Mono',monospace",color:"var(--or)"}}>{lastOrder.orderNum}</span></div>
            {lastOrder.cartItems?.map((item,i)=>(<div key={i} className="rs-row"><span className="rs-lbl">{item.combo.label}</span><span className="rs-val">{item.flavorLabel} ×{item.qty}</span></div>))}
            {lastOrder.orderTime?.day&&<div className="rs-row"><span className="rs-lbl">Requested</span><span className="rs-val">{lastOrder.orderTime.day}{lastOrder.orderTime.time?` @ ${lastOrder.orderTime.time}`:""}</span></div>}
            {lastOrder.notes&&<div className="rs-row"><span className="rs-lbl">Notes</span><span className="rs-val">{lastOrder.notes}</span></div>}
            <div className="rs-row total"><span>Total</span><span>${lastOrder.total}</span></div>
          </div>

          <div className="screenshot-note">📸 <strong>Screenshot the Order Summary</strong> below as proof of your order number and details</div>
          <div className="info-banner">
            <span className="ban-ico">📱</span>
            <div className="ban-txt">Once payment is confirmed, you'll receive a text at <strong>{lastOrder.phone}</strong>.</div>
          </div>

          <button className="btn btn-or" onClick={()=>{setCustScreen("build");setScreenHistory(["build"]);}}>Place Another Order</button>
          <div style={{height:20}}/>
        </div>
      </div>
    );
  }

  // ── CHECKOUT ──
  if(screen==="checkout"){
    return(
      <div>
        <div className="back-bar">
          {canGoBack&&<button className="back-btn" onClick={goBack}>◀ Back</button>}
          <span className="bar-title">Checkout</span>
        </div>
        <div className="sc">
          <div className="sec-hdr"><div className="sec-title">Your Order</div><div className="sec-line"/></div>
          <div className="order-items">
            {cart.map(item=>(
              <div key={item.id} className={`oi ${removing===item.id?"removing":""}`}>
                <div style={{flex:1}}>
                  <div className="oi-name">{item.combo.label}</div>
                  <div className="oi-detail">{item.flavorLabel} · Qty {item.qty}</div>
                </div>
                <div className="oi-price">${item.subtotal}</div>
                <button className="oi-remove" title="Remove item" onClick={()=>{
                  if(cart.length===1){ setCart([]); navigate("build"); setStep(1); }
                  else { removeItem(item.id); }
                }}>✕</button>
              </div>
            ))}
          </div>
          <div className="total-bar"><span className="total-lbl">Order Total</span><span className="total-val">${cartTotal}</span></div>

          <div className="sec-hdr"><div className="sec-title">Your Info</div><div className="sec-line"/></div>
          <div className="name-row">
            <div className="form-grp">
              <label className="flabel">First Name <span className="req">*</span></label>
              <input className={`finput ${errors.firstName?"err":""}`} placeholder="First" value={form.firstName} onChange={e=>{setForm(f=>({...f,firstName:e.target.value}));setErrors(er=>({...er,firstName:""}));}}/>
              {errors.firstName&&<div className="ferr">{errors.firstName}</div>}
            </div>
            <div className="form-grp">
              <label className="flabel">Last Name <span className="req">*</span></label>
              <input className={`finput ${errors.lastName?"err":""}`} placeholder="Last" value={form.lastName} onChange={e=>{setForm(f=>({...f,lastName:e.target.value}));setErrors(er=>({...er,lastName:""}));}}/>
              {errors.lastName&&<div className="ferr">{errors.lastName}</div>}
            </div>
          </div>
          <div className="form-grp">
            <label className="flabel">Phone Number <span className="req">*</span></label>
            <input className={`finput ${errors.phone?"err":""}`} type="tel" placeholder="(912) 000-0000" value={form.phone} onChange={e=>{setForm(f=>({...f,phone:formatPhone(e.target.value)}));setErrors(er=>({...er,phone:""}));}} maxLength={14}/>
            {errors.phone&&<div className="ferr">{errors.phone}</div>}
            <p className="note">Owner texts this number when your wings are ready 📱</p>
          </div>
          <div className="form-grp">
            <label className="flabel">Special Notes <span style={{color:"var(--gr)",fontSize:9,fontWeight:400,letterSpacing:0,textTransform:"none"}}>(optional)</span></label>
            <textarea className="finput" placeholder="Extra crispy? Sauce on side?" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
          </div>

          {/* ORDER TIME + SPECIAL DAY COMBINED */}
          <div className="sec-hdr" style={{marginTop:12}}><div className="sec-title">When Do You Want It?</div><div className="sec-line"/></div>
          <TimeDayPicker orderTime={orderTime} setOrderTime={setOrderTime} thisWeekOpenDays={thisWeekOpenDays} settings={settings}/>

          <button className="btn btn-or" onClick={submitOrder}>✅ Submit Order — ${cartTotal}</button>
          <div style={{height:20}}/>
        </div>
      </div>
    );
  }

  // ── BUILD ──
  return(
    <div>
      <div className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">★ Premium Wings · ATL Style Flavor ★</div>
          <div className="hero-title">FIRST <span className="or">CLASS</span> WINGS</div>
          <div className="hero-badge">Made Fresh To Order</div>
        </div>
      </div>

      {/* CLOSED BANNER */}
      {settings.isClosed&&(
        <div style={{background:"rgba(192,57,43,.12)",border:"1px solid rgba(192,57,43,.4)",borderRadius:0,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:20}}>🚫</span>
          <div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:700,color:"var(--rd)",letterSpacing:1,textTransform:"uppercase",marginBottom:3}}>Not Taking Orders Right Now</div>
            <div style={{fontSize:11,color:"#b08080",lineHeight:1.5}}>{settings.closedMsg||"We're currently closed. Follow us on Instagram for updates on when we'll be back! 🍗"}</div>
          </div>
        </div>
      )}

      <div className="avail-strip">
        <span className="avail-label">Open:</span>
        <div className="avail-days">
          {DAYS.map(d=>{
            const now2=new Date(); const off=(DAYS.indexOf(d)+1)-now2.getDay();
            const dd=new Date(now2); dd.setDate(now2.getDate()+off);
            const mon=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dd.getMonth()];
            const day=String(dd.getDate()).padStart(2,"0");
            const isOpen=openDayNames.includes(d);
            return(
              <span key={d} className={`aday ${isOpen?"open":"closed"}`} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"3px 7px"}}>
                <span>{DAY_LABELS[d]}</span>
                <span style={{fontSize:8,opacity:.7,letterSpacing:.3}}>{mon} {day}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="step-bar">
        {STEPS.map((s,i)=>{
          const n=i+1,state=n<step?"done":n===step?"active":"future";
          return(<div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:"none"}}>
              <div className={`step-circle ${state}`}>{state==="done"?"✓":n}</div>
              <div className={`step-lbl ${state==="active"?"active":""}`}>{s}</div>
            </div>
            {i<STEPS.length-1&&<div className={`step-conn ${n<step?"done":""}`}/>}
          </div>);
        })}
      </div>

      {/* STEP 1 */}
      {step===1&&(
        <div className="sc">
          <div className="step-title">1. <span className="or">Pick Your Combo</span></div>
          {cart.length>0&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(245,166,35,.06)",border:"1px solid rgba(245,166,35,.2)",borderRadius:7,padding:"8px 12px",marginBottom:10}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:"var(--or)",letterSpacing:.5}}>
                🛒 {cart.length} item{cart.length!==1?"s":""} in your order — ${cartTotal}
              </div>
              <button className="tray-btn" style={{fontSize:10,padding:"5px 10px"}} onClick={()=>navigate("checkout")}>Go to Checkout →</button>
            </div>
          )}
          <div className="combo-grid">
            {COMBOS.map(c=>(
              <div key={c.id} className={`ccard ${b.combo?.id===c.id?"sel":""}`} onClick={()=>setB(p=>({...p,combo:c,flavor2:null,hh:false}))}>
                {b.combo?.id===c.id&&<div className="c-check">✓</div>}
                <div className="ccard-body" style={{padding:"14px 5px"}}>
                  <div style={{fontSize:22,marginBottom:4}}>🍗</div>
                  <div className="c-big">{c.wings}</div>
                  <div className="c-lbl">Wings & Fries</div>
                  <div className="c-price">${c.price}</div>
                  {c.halfHalf&&<div><div className="hh-badge">Half&Half</div></div>}
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-or" disabled={!b.combo} onClick={()=>setStep(2)}>Next: Choose Flavor →</button>
        </div>
      )}

      {/* STEP 2 */}
      {step===2&&(
        <div className="sc">
          <button className="back-btn" style={{marginBottom:10}} onClick={()=>setStep(1)}>◀ Back</button>
          <div className="step-title">2. <span className="or">Pick Your Flavor</span></div>
          {b.combo?.halfHalf&&(
            <div className={`hh-toggle ${b.hh?"on":""}`} onClick={()=>setB(p=>({...p,hh:!p.hh,flavor2:null}))}>
              <span style={{fontSize:15}}>🔀</span>
              <div style={{flex:1}}><div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:".5px"}}>Half &amp; Half</div><div style={{fontSize:9,color:"var(--gr)",marginTop:1}}>Two flavors — one 10pc</div></div>
              <div className="pill-radio" style={b.hh?{background:"var(--or)",borderColor:"var(--or)"}:{}}/>
            </div>
          )}
          {b.hh?(
            <>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,color:"var(--or)",textTransform:"uppercase",marginBottom:6}}>First half</div>
              <div className="flist" style={{marginBottom:8}}>
                {FLAVORS.map(f=>(
                  <div key={f.id} className={`fitem ${b.flavor1?.id===f.id?"sel":""}`} onClick={()=>setB(p=>({...p,flavor1:f,flavor2:p.flavor2?.id===f.id?null:p.flavor2}))}>
                    <div className="f-swatch" style={{background:`${f.color}33`}}><span style={{fontSize:15}}>{f.emoji}</span></div>
                    <div><div className="f-name">{f.name}</div><div className="f-desc">{f.desc}</div></div>
                    <div className="f-radio"/>
                  </div>
                ))}
              </div>
              <div className="hh-divider"><div className="hh-line"/><div className="hh-txt">Second half</div><div className="hh-line"/></div>
              <div className="flist">
                {FLAVORS.filter(f=>f.id!==b.flavor1?.id).map(f=>(
                  <div key={f.id} className={`fitem ${b.flavor2?.id===f.id?"sel2":""}`} onClick={()=>setB(p=>({...p,flavor2:f}))}>
                    <div className="f-swatch" style={{background:`${f.color}33`}}><span style={{fontSize:15}}>{f.emoji}</span></div>
                    <div><div className="f-name" style={b.flavor2?.id===f.id?{color:"#5dade2"}:{}}>{f.name}</div><div className="f-desc">{f.desc}</div></div>
                    <div className="f-radio" style={b.flavor2?.id===f.id?{background:"#5dade2",borderColor:"#5dade2"}:{}}/>
                  </div>
                ))}
              </div>
            </>
          ):(
            <div className="flist">
              {FLAVORS.map(f=>(
                <div key={f.id} className={`fitem ${b.flavor1?.id===f.id?"sel":""}`} onClick={()=>setB(p=>({...p,flavor1:f}))}>
                  <div className="f-swatch" style={{background:`${f.color}33`}}><span style={{fontSize:15}}>{f.emoji}</span></div>
                  <div><div className="f-name">{f.name}</div><div className="f-desc">{f.desc}</div></div>
                  <div className="f-radio"/>
                </div>
              ))}
            </div>
          )}
          <div style={{marginTop:11,display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-or" disabled={!canNext3} onClick={()=>setStep(3)}>Next: Choose Quantity →</button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step===3&&(
        <div className="sc">
          <button className="back-btn" style={{marginBottom:10}} onClick={()=>setStep(2)}>◀ Back</button>
          <div className="step-title">3. <span className="or">How Many of This Order?</span></div>
          <div className="qty-row">
            <div className="qty-lbl">Quantity<small>{b.combo?.label} · {b.hh&&b.flavor2?`${b.flavor1?.name} / ${b.flavor2?.name}`:b.flavor1?.name}</small></div>
            <button className="qty-btn" onClick={()=>setB(p=>({...p,qty:Math.max(1,p.qty-1)}))}>−</button>
            <span className="qty-num">{b.qty}</span>
            <button className="qty-btn" onClick={()=>setB(p=>({...p,qty:p.qty+1}))}>+</button>
          </div>
          <div className="total-bar" style={{marginBottom:11}}>
            <span style={{fontSize:11,color:"var(--gr)"}}>This item subtotal</span>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"var(--or)"}}>${itemSub}</span>
          </div>
          <button className="btn btn-or" onClick={()=>setStep(4)}>Next: Review Your Order →</button>
        </div>
      )}

      {/* STEP 4 */}
      {step===4&&(
        <div className="sc">
          <button className="back-btn" style={{marginBottom:10}} onClick={()=>setStep(3)}>◀ Back</button>
          <div className="order-list-header">
            <div className="ol-title">Your Order</div>
            {cart.length>0&&<div className="ol-count">{cart.length} item{cart.length!==1?"s":""}</div>}
          </div>

          {/* Current item — only show if building something */}
          {b.combo&&(
            <div style={{background:"rgba(245,166,35,.04)",border:"1.5px dashed rgba(245,166,35,.3)",borderRadius:7,padding:"9px 11px",marginBottom:8}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,color:"rgba(245,166,35,.6)",textTransform:"uppercase",marginBottom:4}}>Current item</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1}}><div className="oi-name">{b.combo?.label}</div><div className="oi-detail">{b.hh&&b.flavor2?`${b.flavor1?.name} / ${b.flavor2?.name}`:b.flavor1?.name} · Qty {b.qty}</div></div>
                <div className="oi-price">${itemSub}</div>
                <button className="oi-remove" title="Remove" onClick={()=>{
                  setB(fresh());
                  if(cart.length===0){ setStep(1); }
                }}>✕</button>
              </div>
            </div>
          )}
          {cart.length>0&&(
            <>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,color:"var(--gr)",textTransform:"uppercase",marginBottom:5}}>Also in your order</div>
              <div className="order-items">
                {cart.map(item=>(
                  <div key={item.id} className={`oi ${removing===item.id?"removing":""}`}>
                    <div style={{flex:1}}><div className="oi-name">{item.combo.label}</div><div className="oi-detail">{item.flavorLabel} · Qty {item.qty}</div></div>
                    <div className="oi-price">${item.subtotal}</div>
                    <button className="oi-remove" onClick={()=>{
                      if(cart.length===1&&!b.combo){ setCart([]); setStep(1); }
                      else { removeItem(item.id); }
                    }}>✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="total-bar" style={{marginTop:cart.length>0?0:7}}>
            <span className="total-lbl">Running Total</span>
            <span className="total-val">${b.combo ? cartTotal+itemSub : cartTotal}</span>
          </div>
          <button className="add-another-btn" onClick={()=>{setB(fresh());setStep(1);}}>➕ Add Another Item</button>
          {b.combo
            ? <button className="btn btn-or" onClick={()=>{const item=buildItem();setCart(p=>[...p,item]);setB(fresh());navigate("checkout");}}>✅ I'm Done — Go to Checkout</button>
            : cart.length>0&&<button className="btn btn-or" onClick={()=>navigate("checkout")}>✅ Go to Checkout</button>
          }
        </div>
      )}

      <div style={{height:20}}/>
    </div>
  );
}

// ── TIME/DAY PICKER COMPONENT ──────────────────────────────────────────────────
function TimeDayPicker({orderTime,setOrderTime,thisWeekOpenDays,settings}){
  const hasSelection = orderTime.day || orderTime.time;

  // Get slots for the selected day using per-DATE hours, fall back to defaults
  const selectedDayKey = orderTime.day ? DAYS.find(d=>DAY_FULL[d]===orderTime.day) : null;
  const selectedDateK = selectedDayKey ? (()=>{
    const now2=new Date(); const off=(DAYS.indexOf(selectedDayKey)+1)-now2.getDay();
    const dd=new Date(now2); dd.setDate(now2.getDate()+off);
    return dateKey(dd.getFullYear(),dd.getMonth(),dd.getDate());
  })() : null;
  const dateHours = selectedDateK && settings.dateHours?.[selectedDateK]
    ? settings.dateHours[selectedDateK]
    : { open:"11:00", close:"20:00", slotMins:30 };
  const slots = generateTimeSlots(dateHours.open, dateHours.close, dateHours.slotMins);

  return(
    <div className={`time-picker-card ${hasSelection?"has-selection":""}`}>
      <div className="tp-header">
        <span className="tp-icon">📅</span>
        <div>
          <div className="tp-title">When do you want your order?</div>
          <div className="tp-sub">Pick a day and time below</div>
        </div>
      </div>

      <div className="tp-row">
        <div className="tp-label">Available Days</div>
        <div className="day-chips">
          {DAYS.map(d=>{
            const isAvail=thisWeekOpenDays.includes(d);
            const isSel=orderTime.day===DAY_FULL[d]&&!orderTime.isSpecial;
            if(!isAvail) return null;
            return(
              <button key={d} className={`day-chip avail ${isSel?"sel":""}`}
                onClick={()=>setOrderTime(p=>({...p,day:DAY_FULL[d],isSpecial:false,time:null}))}>
                {DAY_LABELS[d]}
              </button>
            );
          })}
          {/* Special day request inline */}
          <button
            className={`day-chip special ${orderTime.isSpecial?"sel":""}`}
            onClick={()=>setOrderTime(p=>({...p,isSpecial:!p.isSpecial,day:p.isSpecial?null:p.day,time:null}))}>
            + Special Day
          </button>
        </div>
      </div>

      {orderTime.isSpecial&&(
        <div style={{marginBottom:9}}>
          <div className="tp-label" style={{marginBottom:5}}>Which day are you requesting?</div>
          <input className="finput" placeholder="e.g. Monday, next Wednesday..." value={orderTime.day||""}
            onChange={e=>setOrderTime(p=>({...p,day:e.target.value}))}/>
          <div className="special-day-note">📝 Special day requests are subject to owner approval. You'll get a text confirming availability.</div>
        </div>
      )}

      {(orderTime.day&&!orderTime.isSpecial)||(orderTime.isSpecial&&orderTime.day)?(
        <div className="tp-row" style={{marginBottom:0}}>
          <div className="tp-label">Preferred Pickup Time</div>
          <div className="time-slots">
            {slots.map(slot=>(
              <button key={slot} className={`time-slot ${orderTime.time===slot?"sel":""}`}
                onClick={()=>setOrderTime(p=>({...p,time:slot}))}>
                {slot}
              </button>
            ))}
          </div>
        </div>
      ):null}

      {hasSelection&&(
        <div style={{marginTop:9,padding:"7px 9px",background:"rgba(245,166,35,.06)",border:"1px solid rgba(245,166,35,.2)",borderRadius:5,fontSize:10,color:"rgba(245,166,35,.8)",display:"flex",alignItems:"center",gap:6}}>
          <span>✓</span>
          <span>{orderTime.day||"Day TBD"}{orderTime.time?` @ ${orderTime.time}`:""}{orderTime.isSpecial?" (special request)":""}</span>
          <button onClick={()=>setOrderTime({day:null,time:null,isSpecial:false})} style={{marginLeft:"auto",background:"none",border:"none",color:"var(--gr)",cursor:"pointer",fontSize:11}}>✕</button>
        </div>
      )}
    </div>
  );
}

// ── OWNER VIEW ─────────────────────────────────────────────────────────────────
function OwnerView({unlocked,pin,setPin,onLogin,orders,newCt,confirmedCt,todayTot,openDates,toggleDate,isDateOpen,settings,setSettings,confirmOrder,upStatus,showToast,clearCompleted}){
  const [tab,setTab]         = useState("orders");
  const [calView,setCalView] = useState("week");
  const [calMonth,setCalMonth]= useState(()=>{ const n=new Date(); return{y:n.getFullYear(),m:n.getMonth()}; });
  const rainchecks = orders.filter(o=>o.status==="raincheck").length;
  if(tab==="raincheck"&&rainchecks===0) setTab("orders");
  const [showClearToggle,setShowClearToggle] = useState(false);
  const [clearSelected,setClearSelected]     = useState(new Set());
  const [unconfirmModal,setUnconfirmModal]   = useState(null);
  const [raincheckModal,setRaincheckModal]   = useState(null);
  const [attempts,setAttempts]               = useState(0);
  const [lockedUntil,setLockedUntil]         = useState(null);
  const completedCount = orders.filter(o=>o.status==="done").length;

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MINS = 10;
  const isLocked = lockedUntil && new Date() < lockedUntil;
  const lockMinsLeft = isLocked ? Math.ceil((lockedUntil - new Date()) / 60000) : 0;

  function validatePin(p){
    if(p.length<8) return "PIN must be at least 8 characters";
    if(!/[A-Z]/.test(p)) return "PIN must include an uppercase letter";
    if(!/[a-z]/.test(p)) return "PIN must include a lowercase letter";
    if(!/[0-9]/.test(p)) return "PIN must include a number";
    if(!/[^A-Za-z0-9]/.test(p)) return "PIN must include a symbol (e.g. ! @ # $)";
    return null;
  }

  function handleLogin(){
    if(isLocked){ showToast(`🔒 Too many attempts. Try again in ${lockMinsLeft} min.`); return; }
    const err = validatePin(pin);
    if(err){ showToast(err); return; }
    if(pin===settings.ownerPin){
      setAttempts(0); setLockedUntil(null); onLogin();
    } else {
      const newAttempts = attempts+1;
      setAttempts(newAttempts);
      if(newAttempts>=MAX_ATTEMPTS){
        const until = new Date(Date.now() + LOCKOUT_MINS*60*1000);
        setLockedUntil(until);
        setAttempts(0);
        showToast(`🔒 Too many attempts! Locked for ${LOCKOUT_MINS} minutes.`);
      } else {
        showToast(`❌ Wrong PIN. ${MAX_ATTEMPTS-newAttempts} attempt${MAX_ATTEMPTS-newAttempts!==1?"s":""} remaining.`);
      }
      setPin("");
    }
  }

  if(!unlocked) return(
    <div style={{padding:34,maxWidth:280,margin:"0 auto",textAlign:"center"}}>
      <div style={{fontSize:38,marginBottom:8}}>👑</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:21,color:"var(--or)",letterSpacing:2,marginBottom:4}}>Owner Login</div>
      <p style={{fontSize:10,color:"var(--gr)",marginBottom:15}}>Enter your PIN to access the dashboard</p>

      {isLocked?(
        <div style={{background:"rgba(192,57,43,.1)",border:"1px solid rgba(192,57,43,.3)",borderRadius:8,padding:"16px",marginBottom:12}}>
          <div style={{fontSize:28,marginBottom:6}}>🔒</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:"var(--rd)",letterSpacing:1,marginBottom:4}}>LOCKED</div>
          <div style={{fontSize:11,color:"#b08080",lineHeight:1.5}}>Too many failed attempts.<br/>Try again in <strong style={{color:"var(--rd)"}}>{lockMinsLeft} minute{lockMinsLeft!==1?"s":""}</strong>.</div>
        </div>
      ):(
        <>
          <input className="finput" type="password" inputMode="text"
            placeholder="Enter PIN" value={pin}
            onChange={e=>setPin(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            style={{textAlign:"center",fontSize:18,letterSpacing:6,marginBottom:7}}/>
          {attempts>0&&(
            <p style={{fontSize:10,color:"var(--rd)",marginBottom:8}}>
              {MAX_ATTEMPTS-attempts} attempt{MAX_ATTEMPTS-attempts!==1?"s":""} remaining
            </p>
          )}
          <button className="btn btn-or" onClick={handleLogin}>Unlock Dashboard</button>
        </>
      )}
    </div>
  );

  const statusLabel=(s)=>({new:"🔥 New",confirmed:"✅ Confirmed",cooking:"🍳 Cooking",ready:"🍗 Ready",done:"✅ Done",raincheck:"🌧️ Rain Check"}[s]||s);
  const badgeClass=(s)=>({new:"b-new",confirmed:"b-confirmed",cooking:"b-cooking",ready:"b-ready",done:"b-done",raincheck:"b-rain"}[s]||"b-done");
  const prevMonth=()=>setCalMonth(p=>p.m===0?{y:p.y-1,m:11}:{y:p.y,m:p.m-1});
  const nextMonth=()=>setCalMonth(p=>p.m===11?{y:p.y+1,m:0}:{y:p.y,m:p.m+1});

  function renderMonthCal(){
    const{y,m}=calMonth;
    const firstDow=new Date(y,m,1).getDay();
    const daysInMonth=new Date(y,m+1,0).getDate();
    const today=new Date(); const todayK=dateKey(today.getFullYear(),today.getMonth(),today.getDate());
    const cells=[];
    for(let i=0;i<firstDow;i++) cells.push(<div key={`e${i}`} className="mday empty"/>);
    for(let d=1;d<=daysInMonth;d++){
      const k=dateKey(y,m,d);
      const isToday=k===todayK;
      const isOpen=isDateOpen(k);
      const isPast=new Date(y,m,d)<new Date(today.getFullYear(),today.getMonth(),today.getDate());
      cells.push(<div key={k} className={`mday ${isToday?"today":""} ${isOpen?"open":""} ${isPast&&!isToday?"past":""}`} onClick={()=>!isPast&&toggleDate(k)}>{d}</div>);
    }
    return cells;
  }

  return(
    <div className="dash">
      <div className="dash-title">👑 Dashboard</div>
      <div className="dash-sub">First Class Wings · Command Center</div>
      <div className="stats">
        <div className="stat"><div className="stat-n">{newCt}</div><div className="stat-l">New</div></div>
        <div className="stat"><div className="stat-n" style={{color:"var(--blue)"}}>{confirmedCt}</div><div className="stat-l">Confirmed</div></div>
        <div className="stat"><div className="stat-n">${todayTot}</div><div className="stat-l">Earned</div></div>
      </div>
      <div className="dtabs">
        {["orders",...(orders.filter(o=>o.status==="raincheck").length>0?["raincheck"]:[]),"calendar","blast","analytics","settings"].map(t=>(
          <button key={t} className={`dtab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t==="orders"?"📋":t==="raincheck"?"🌧️":t==="calendar"?"📅":t==="blast"?"📲":t==="analytics"?"📊":"⚙️"} {t==="blast"?"Texts":t==="raincheck"?"Rain":t==="analytics"?"Stats":t.charAt(0).toUpperCase()+t.slice(1)}
            {t==="raincheck"&&<span style={{marginLeft:3,background:"rgba(41,128,185,.3)",color:"#78b8d8",borderRadius:10,padding:"0 4px",fontSize:9}}>{orders.filter(o=>o.status==="raincheck").length}</span>}
          </button>
        ))}
      </div>

      {/* ORDERS */}
      {tab==="orders"&&(
        <>
          {orders.length===0
            ?<div className="empty"><div className="empty-i">🍗</div><div className="empty-m">No orders yet</div></div>
            :<div className="orders-list">
              {/* ACTIVE ORDERS FIRST */}
              {orders.filter(o=>o.status!=="done"&&o.status!=="raincheck").map(o=>(
                <div key={o.id} className={`ocard status-${o.status}`} style={{position:"relative"}}>
                  {/* Checkbox for done orders when clear mode active */}
                  {showClearToggle&&o.status==="done"&&(
                    <div onClick={()=>setClearSelected(p=>{const n=new Set(p);n.has(o.id)?n.delete(o.id):n.add(o.id);return n;})}
                      style={{position:"absolute",top:10,right:10,width:22,height:22,borderRadius:5,
                        border:`2px solid ${clearSelected.has(o.id)?"var(--rd)":"#444"}`,
                        background:clearSelected.has(o.id)?"var(--rd)":"transparent",
                        display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:2,transition:"all .15s"
                      }}>
                      {clearSelected.has(o.id)&&<span style={{color:"#fff",fontSize:13,fontWeight:700}}>✓</span>}
                    </div>
                  )}
                  <div className="onum-chip">{o.orderNum}</div>
                  <div className="otop">
                    <div className="oname">{o.firstName} {o.lastName}</div>
                    <span className={`obadge ${badgeClass(o.status)}`}>{statusLabel(o.status)}</span>
                  </div>
                  {o.cartItems?.map((item,i)=>(<div key={i} className="odet"><strong>{item.combo.label}</strong> — {item.flavorLabel} ×{item.qty}</div>))}
                  {o.orderTime?.day&&<div className="odet">📅 Requested: <strong>{o.orderTime.day}{o.orderTime.time?` @ ${o.orderTime.time}`:""}{o.orderTime.isSpecial?" ⭐ Special":""}</strong></div>}
                  <div className="odet">📱 {o.phone} · 🕐 {o.time}</div>
                  {o.notes&&<div className="odet">📝 <em>{o.notes}</em></div>}
                  <div className="oprice">${o.total}</div>

                  {/* CONFIRM BOX — TOP */}
                  {o.status==="new"&&(
                    <a className="confirm-box" style={{textDecoration:"none",display:"flex"}}
                      href={`sms:${o.phone}&body=Hey ${o.firstName}! ✅ Your First Class Wings order ${o.orderNum} is confirmed! We'll text you when it's ready. 🍗👑`}
                      onClick={()=>setTimeout(()=>confirmOrder(o.id),500)}>
                      <div className="cb-check"/>
                      <div><div className="cb-title">Confirm Order &amp; Notify Customer</div><div className="cb-sub">Tap to confirm payment for {o.orderNum} — opens pre-filled text to {o.phone}.</div></div>
                    </a>
                  )}

                  {/* CONTACT — Text first, Call second */}
                  <div style={{display:"flex",gap:6,marginBottom:7}}>
                    <a className="abtn" href={`sms:${o.phone}&body=Hey ${o.firstName}! This is First Class Wings reaching out about your order ${o.orderNum}.`}
                      style={{flex:1,textAlign:"center",background:"rgba(41,128,185,.1)",border:"1px solid rgba(41,128,185,.3)",color:"#78b8d8",textDecoration:"none"}}>
                      💬 Text
                    </a>
                    <a className="abtn" href={`tel:${o.phone}`}
                      style={{flex:1,textAlign:"center",background:"rgba(39,174,96,.1)",border:"1px solid rgba(39,174,96,.3)",color:"#70c890",textDecoration:"none"}}>
                      📞 Call
                    </a>
                  </div>

                  <div className="oacts">
                    {o.status==="confirmed"&&<>
                      <a className="abtn" style={{background:"rgba(192,57,43,.1)",border:"1px solid rgba(192,57,43,.3)",color:"#d09080",textDecoration:"none"}}
                        href={`sms:${o.phone}&body=Hey ${o.firstName}! Just a quick heads up — there's a small update on your order ${o.orderNum}. The owner will reach out to you shortly. 🍗`}
                        onClick={()=>setTimeout(()=>setUnconfirmModal(o.id),500)}>
                        ↩ Unconfirm
                      </a>
                      <a className="abtn a-ok" style={{textDecoration:"none",textAlign:"center"}}
                        href={`sms:${o.phone}&body=Hey ${o.firstName}! 🍳 We're making your First Class Wings right now! Order ${o.orderNum} is in the fryer. Won't be long! 🔥`}
                        onClick={()=>setTimeout(()=>upStatus(o.id,"cooking"),500)}>
                        🍳 Start Cooking
                      </a>
                    </>}
                    {o.status==="cooking"&&(
                      <a className="abtn a-ok" style={{textDecoration:"none",textAlign:"center",width:"100%",justifyContent:"center"}}
                        href={`sms:${o.phone}&body=Hey ${o.firstName}! 🍗🔥 Your First Class Wings are READY for pickup! Order ${o.orderNum}%0A%0A📍 ${settings.pickupAddress}%0A%0ASee you soon! 👑`}
                        onClick={()=>setTimeout(()=>upStatus(o.id,"ready"),500)}>
                        🍗 Mark Ready — Notify Customer
                      </a>
                    )}
                    {o.status==="ready"&&(
                      <button className="abtn a-done" style={{width:"100%",justifyContent:"center"}}
                        onClick={()=>upStatus(o.id,"done")}>
                        ✅ Complete Order
                      </button>
                    )}
                    {["new","confirmed","cooking","ready"].includes(o.status)&&(
                      <button className="abtn" style={{background:"rgba(41,128,185,.08)",border:"1px solid rgba(41,128,185,.25)",color:"#78b8d8",marginTop:4,width:"100%",justifyContent:"center"}}
                        onClick={()=>setRaincheckModal(o)}>🌧️ Rain Check Order</button>
                    )}
                  </div>
                </div>
              ))}

              {/* COMPLETED — dimmed at bottom */}
              {orders.filter(o=>o.status==="done").length>0&&(
                <div style={{marginTop:14}}>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,color:"#2a2a2a",textTransform:"uppercase",marginBottom:6,paddingLeft:2}}>
                    ✅ Completed — {orders.filter(o=>o.status==="done").length} order{orders.filter(o=>o.status==="done").length!==1?"s":""}
                  </div>
                  {orders.filter(o=>o.status==="done").map(o=>(
                    <div key={o.id} className="ocard status-done" style={{marginBottom:6,position:"relative"}}>
                      {showClearToggle&&(
                        <div onClick={()=>setClearSelected(p=>{const n=new Set(p);n.has(o.id)?n.delete(o.id):n.add(o.id);return n;})}
                          style={{position:"absolute",top:10,right:10,width:22,height:22,borderRadius:5,
                            border:`2px solid ${clearSelected.has(o.id)?"var(--rd)":"#333"}`,
                            background:clearSelected.has(o.id)?"var(--rd)":"transparent",
                            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:2
                          }}>
                          {clearSelected.has(o.id)&&<span style={{color:"#fff",fontSize:13,fontWeight:700}}>✓</span>}
                        </div>
                      )}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#333"}}>{o.orderNum}</div>
                        <span className="obadge b-done">✅ Done</span>
                      </div>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"#333"}}>{o.firstName} {o.lastName} · ${o.total}</div>
                      <div style={{fontSize:10,color:"#2a2a2a",marginTop:2}}>{o.cartItems?.map(i=>i.combo.label).join(", ")}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          }

          {/* CLEAR ORDERS CONTROLS */}
          {completedCount>0&&(
            <div style={{marginTop:14,padding:"0 2px"}}>
              {!showClearToggle?(
                <button className="btn btn-ghost" style={{fontSize:11,borderColor:"rgba(192,57,43,.3)",color:"#b08080",width:"100%"}}
                  onClick={()=>{setShowClearToggle(true);setClearSelected(new Set());}}>
                  🗑 Clear Completed Orders
                </button>
              ):(
                <div className="scard" style={{borderColor:"rgba(192,57,43,.25)"}}>
                  <p style={{fontSize:10,color:"var(--gr)",marginBottom:10,lineHeight:1.5}}>
                    Tap checkboxes on the Done orders above, then choose an option below.
                  </p>
                <div className="clear-warn" style={{marginBottom:10}}>
                  ⚠️ <strong>Heads up!</strong> You're about to permanently delete completed orders. This cannot be undone. Check the orders above you want to remove, then choose below.
                </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn btn-ghost" style={{flex:1,fontSize:11}}
                      onClick={()=>{setShowClearToggle(false);setClearSelected(new Set());}}>
                      Cancel
                    </button>
                    <button className="btn btn-danger" style={{flex:1,fontSize:11,opacity:clearSelected.size>0?1:.35}}
                      disabled={clearSelected.size===0}
                      onClick={async()=>{
                        const ids=[...clearSelected];
                        for(const id of ids){ try{ await sb.delete("orders",`?id=eq.${id}`); }catch(e){} }
                        clearCompleted(ids);
                        setShowClearToggle(false); setClearSelected(new Set());
                        showToast(`🗑 Cleared ${ids.length} order${ids.length!==1?"s":""}`);
                      }}>
                      Clear Selected ({clearSelected.size})
                    </button>
                    <button className="btn btn-danger" style={{flex:1,fontSize:11}}
                      onClick={async()=>{
                        const doneIds=orders.filter(o=>o.status==="done").map(o=>o.id);
                        clearCompleted();
                        setShowClearToggle(false); setClearSelected(new Set());
                        showToast(`🗑 Cleared ${doneIds.length} order${doneIds.length!==1?"s":""}`);
                      }}>
                      Clear All ({completedCount})
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* RAIN CHECK TAB */}
      {tab==="raincheck"&&(
        <>
          {orders.filter(o=>o.status==="raincheck").length===0
            ?<div className="empty"><div className="empty-i">🌧️</div><div className="empty-m">No rain checks — all clear!</div></div>
            :<div className="orders-list">
              {orders.filter(o=>o.status==="raincheck").map(o=>(
                <div key={o.id} className="ocard" style={{borderColor:"rgba(41,128,185,.3)",background:"rgba(41,128,185,.04)"}}>
                  <div className="onum-chip" style={{background:"rgba(41,128,185,.2)",color:"#78b8d8"}}>{o.orderNum}</div>
                  <div className="otop">
                    <div className="oname">{o.firstName} {o.lastName}</div>
                    <span className="obadge b-rain">🌧️ Rain Check</span>
                  </div>
                  {o.cartItems?.map((item,i)=>(<div key={i} className="odet"><strong>{item.combo.label}</strong> — {item.flavorLabel} ×{item.qty}</div>))}
                  <div className="odet">📱 {o.phone} · 🕐 {o.time}</div>
                  {o.notes&&<div className="odet">📝 <em>{o.notes}</em></div>}
                  <div className="oprice">${o.total}</div>
                  <div style={{display:"flex",gap:6,marginTop:8}}>
                    <a className="abtn" href={`sms:${o.phone}&body=Hey ${o.firstName}! Following up on your rain-checked order ${o.orderNum}. Ready to get your wings sorted? 🍗`}
                      style={{flex:1,textAlign:"center",background:"rgba(41,128,185,.1)",border:"1px solid rgba(41,128,185,.3)",color:"#78b8d8",textDecoration:"none"}}>
                      💬 Follow Up
                    </a>
                    <a className="abtn a-ok" style={{flex:1,textAlign:"center",textDecoration:"none"}}
                      href={`sms:${o.phone}&body=Hey ${o.firstName}! Great news — your First Class Wings order ${o.orderNum} is back on! We're on it. 🍗👑`}
                      onClick={()=>setTimeout(()=>upStatus(o.id,"confirmed"),500)}>
                      ✅ Restore Order
                    </a>
                  </div>
                </div>
              ))}
            </div>
          }
        </>
      )}
      {tab==="calendar"&&(
        <>
          <div className="scard">
            <div className="stitle">📅 Your Availability</div>
            <div className="cal-toggle-row">
              <button className={`cal-toggle-btn ${calView==="week"?"active":""}`} onClick={()=>setCalView("week")}>📅 This Week</button>
              <button className={`cal-toggle-btn ${calView==="month"?"active":""}`} onClick={()=>setCalView("month")}>📆 Monthly</button>
            </div>
            {calView==="week"&&(
              <>
                <p style={{fontSize:10,color:"var(--gr)",marginBottom:8}}>Tap a day to open/close for this week.</p>
                <div className="week-grid">
                  {DAYS.map(d=>{
                    const now2=new Date(); const dow=now2.getDay();
                    const off=(DAYS.indexOf(d)+1)-dow; const dd=new Date(now2); dd.setDate(now2.getDate()+off);
                    const k=dateKey(dd.getFullYear(),dd.getMonth(),dd.getDate()); const on=isDateOpen(k);
                    const monthShort=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dd.getMonth()];
                    const dayNum=dd.getDate();
                    return(<div key={d} className={`wday ${on?"on":""}`} onClick={()=>toggleDate(k)}>
                      <div className="wday-name">{DAY_LABELS[d]}</div>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,color:on?"rgba(0,0,0,.6)":"var(--gr)",letterSpacing:.5,marginTop:1}}>{monthShort} {dayNum}</div>
                      <div className="wdot"/>
                    </div>);
                  })}
                </div>
              </>
            )}
            {calView==="month"&&(
              <>
                <div className="month-header">
                  <button className="month-nav" onClick={prevMonth}>◀</button>
                  <div className="month-name">{MONTH_NAMES[calMonth.m]} {calMonth.y}</div>
                  <button className="month-nav" onClick={nextMonth}>▶</button>
                </div>
                <div className="month-dow">{["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} className="dow-lbl">{d}</div>)}</div>
                <div className="month-grid">{renderMonthCal()}</div>
                <p style={{fontSize:9,color:"var(--gr)",marginTop:7,lineHeight:1.5}}>Tap future dates to mark open. <span style={{color:"var(--or)"}}>Orange = open.</span></p>
              </>
            )}
          </div>

          {/* PER-DATE HOURS SETTINGS */}
          <div className="scard">
            <div className="stitle">🕐 Hours for Open Dates</div>
            <p style={{fontSize:10,color:"var(--gr)",marginBottom:10,lineHeight:1.5}}>
              Set specific hours for each date you've marked open. Every date can have different hours.
            </p>
            {Object.keys(openDates).length===0?(
              <p style={{fontSize:11,color:"#333",fontFamily:"'Oswald',sans-serif",letterSpacing:.5}}>No open dates yet — mark dates open in the calendar above first.</p>
            ):(
              Object.keys(openDates).sort().map(dateK=>{
                const [y,m,d] = dateK.split("-").map(Number);
                const dateObj = new Date(y, m-1, d);
                const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                const dateHours = settings.dateHours?.[dateK] || {open:"11:00",close:"20:00",slotMins:30};
                const label = dateObj.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
                return(
                  <div key={dateK} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid var(--bdr)",opacity:isPast?.5:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,fontWeight:600,color:"var(--or)",textTransform:"uppercase",letterSpacing:1,flex:1}}>{label}</div>
                      {isPast&&<span style={{fontSize:9,color:"#333",fontFamily:"'Oswald',sans-serif",letterSpacing:.5}}>PAST</span>}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                      <div>
                        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,color:"var(--gr)",letterSpacing:.5,textTransform:"uppercase",marginBottom:3}}>Opens</div>
                        <input className="finput" type="time" value={dateHours.open} disabled={isPast}
                          onChange={e=>setSettings(s=>({...s,dateHours:{...s.dateHours,[dateK]:{...dateHours,open:e.target.value}}}))}
                          style={{padding:"7px 8px",fontSize:12,opacity:isPast?.5:1}}/>
                      </div>
                      <div>
                        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,color:"var(--gr)",letterSpacing:.5,textTransform:"uppercase",marginBottom:3}}>Closes</div>
                        <input className="finput" type="time" value={dateHours.close} disabled={isPast}
                          onChange={e=>setSettings(s=>({...s,dateHours:{...s.dateHours,[dateK]:{...dateHours,close:e.target.value}}}))}
                          style={{padding:"7px 8px",fontSize:12,opacity:isPast?.5:1}}/>
                      </div>
                      <div>
                        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,color:"var(--gr)",letterSpacing:.5,textTransform:"uppercase",marginBottom:3}}>Slots</div>
                        <select className="finput" value={dateHours.slotMins} disabled={isPast}
                          onChange={e=>setSettings(s=>({...s,dateHours:{...s.dateHours,[dateK]:{...dateHours,slotMins:Number(e.target.value)}}}))}
                          style={{padding:"7px 6px",fontSize:11,opacity:isPast?.5:1}}>
                          <option value={15}>15 min</option>
                          <option value={30}>30 min</option>
                          <option value={60}>1 hr</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <p className="note">✅ Hours auto-save per date. Each Saturday, Sunday etc. can have completely different hours.</p>
          </div>
        </>
      )}

      {/* SMS BLAST */}
      {tab==="blast"&&(
        <BlastTab orders={orders} showToast={showToast}/>
      )}

      {/* ANALYTICS TAB */}
      {tab==="analytics"&&(()=>{
        const allDone = orders.filter(o=>["confirmed","ready","done","raincheck"].includes(o.status));
        const today = new Date();
        const todayOrders = allDone.filter(o=>o.date&&o.date.includes(today.toLocaleDateString("en-US",{month:"short",day:"numeric"})));
        const totalEarned = allDone.reduce((s,o)=>s+(o.total||0),0);
        const todayEarned = todayOrders.reduce((s,o)=>s+(o.total||0),0);
        const totalOrders = orders.filter(o=>o.status!=="new").length;
        const avgOrder = totalOrders>0?(totalEarned/totalOrders).toFixed(2):0;

        // Flavor breakdown
        const flavorCounts={};
        orders.forEach(o=>o.cartItems?.forEach(i=>{ const f=i.flavorLabel||"Unknown"; flavorCounts[f]=(flavorCounts[f]||0)+i.qty; }));
        const topFlavors=Object.entries(flavorCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
        const maxFlavor=topFlavors[0]?.[1]||1;

        // Day breakdown
        const dayCounts={Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0,Sun:0};
        orders.forEach(o=>{ if(o.date){ const d=new Date(o.date); const labels=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; const k=labels[d.getDay()]; if(k&&dayCounts[k]!==undefined) dayCounts[k]++; } });
        const maxDay=Math.max(...Object.values(dayCounts))||1;

        return(
          <div style={{padding:"4px 0"}}>
            {/* TOP STATS */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {label:"Today's Earnings",val:`$${todayEarned.toFixed(2)}`,color:"var(--or)",icon:"💰"},
                {label:"All Time Earned",val:`$${totalEarned.toFixed(2)}`,color:"var(--ok)",icon:"🏆"},
                {label:"Total Orders",val:totalOrders,color:"var(--blue)",icon:"📦"},
                {label:"Avg Order Size",val:`$${avgOrder}`,color:"#b08080",icon:"📊"},
              ].map(s=>(
                <div key={s.label} style={{background:"var(--card)",border:"1px solid var(--bdr)",borderRadius:8,padding:"12px 10px",textAlign:"center"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:s.color,letterSpacing:1}}>{s.val}</div>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:8,color:"var(--gr)",letterSpacing:1,textTransform:"uppercase",marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* TOP FLAVORS */}
            <div className="scard" style={{marginBottom:10}}>
              <div className="stitle">🔥 Top Flavors</div>
              {topFlavors.length===0
                ?<div style={{fontSize:11,color:"var(--gr)"}}>No orders yet</div>
                :topFlavors.map(([name,count],i)=>(
                  <div key={name} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:i===0?"var(--or)":"var(--wh)",letterSpacing:.5}}>
                        {i===0?"👑 ":i===1?"🥈 ":i===2?"🥉 ":""}{name}
                      </div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"var(--or)"}}>{count}x</div>
                    </div>
                    <div style={{height:5,background:"#1a1a1a",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(count/maxFlavor)*100}%`,background:i===0?"var(--or)":"#333",borderRadius:3,transition:"width .5s ease"}}/>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* BUSIEST DAYS */}
            <div className="scard" style={{marginBottom:10}}>
              <div className="stitle">📅 Orders by Day</div>
              <div style={{display:"flex",gap:4,alignItems:"flex-end",height:70}}>
                {Object.entries(dayCounts).map(([day,count])=>(
                  <div key={day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:"var(--or)",opacity:count>0?1:.3}}>{count||""}</div>
                    <div style={{width:"100%",height:`${Math.max((count/maxDay)*50,4)}px`,background:count>0?"var(--or)":"#1a1a1a",borderRadius:"3px 3px 0 0",transition:"height .4s ease",minHeight:4}}/>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,color:"var(--gr)",letterSpacing:.5}}>{day}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ORDER STATUS BREAKDOWN */}
            <div className="scard">
              <div className="stitle">📋 Order Breakdown</div>
              {[
                {label:"New / Pending",count:orders.filter(o=>o.status==="new").length,color:"var(--or)"},
                {label:"Confirmed",count:orders.filter(o=>o.status==="confirmed").length,color:"var(--blue)"},
                {label:"Cooking",count:orders.filter(o=>o.status==="cooking").length,color:"var(--rd)"},
                {label:"Ready",count:orders.filter(o=>o.status==="ready").length,color:"var(--ok)"},
                {label:"Completed",count:orders.filter(o=>o.status==="done").length,color:"#3a3a3a"},
                {label:"Rain Checked",count:orders.filter(o=>o.status==="raincheck").length,color:"#78b8d8"},
              ].map(s=>(
                <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #1a1a1a"}}>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:"var(--gr)",letterSpacing:.5}}>{s.label}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:s.color}}>{s.count}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* SETTINGS TAB */}
      {tab==="settings"&&(
        <>
          <div className="scard">
            <div className="stitle">💳 Payment Info</div>
            {[["cashapp","Cash App Tag","$YourCashTag"],["venmo","Venmo Username","YourVenmo"],["zelle","Zelle Phone/Email","912-555-1234"]].map(([k,l,p])=>(
              <div className="form-grp" key={k}><label className="flabel">{l}</label><input className="finput" value={settings[k]||""} onChange={e=>setSettings(s=>({...s,[k]:e.target.value}))} placeholder={p}/></div>
            ))}
          </div>

          {/* OWNER PHONE */}
          <div className="scard">
            <div className="stitle">📱 Owner Phone</div>
            <p style={{fontSize:10,color:"var(--gr)",marginBottom:8,lineHeight:1.5}}>Your phone number. Used to send you an SMS notification when a new order comes in.</p>
            <input className="finput" type="tel" value={settings.ownerPhone||""} onChange={e=>setSettings(s=>({...s,ownerPhone:e.target.value}))} placeholder="(912) 555-1234"/>
          </div>

          {/* CLOSED BANNER */}
          <div className="scard" style={{borderColor:settings.isClosed?"rgba(192,57,43,.4)":"var(--bdr)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div className="stitle" style={{marginBottom:0,color:settings.isClosed?"var(--rd)":"var(--or)"}}>🚫 We're Closed Banner</div>
              <div onClick={()=>setSettings(s=>({...s,isClosed:!s.isClosed}))} style={{
                width:40,height:22,borderRadius:11,background:settings.isClosed?"var(--rd)":"#333",
                cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0
              }}>
                <div style={{position:"absolute",top:3,left:settings.isClosed?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
              </div>
            </div>
            <p style={{fontSize:10,color:"var(--gr)",marginBottom:8,lineHeight:1.5}}>When enabled, customers see a "Not Taking Orders" banner at the top of the app.</p>
            <textarea className="finput" rows={2} value={settings.closedMsg||""} onChange={e=>setSettings(s=>({...s,closedMsg:e.target.value}))}
              placeholder="We're currently closed. Follow us on Instagram for updates! 🍗"
              style={{opacity:settings.isClosed?1:.5}}/>
          </div>

          <div className="scard" style={{borderColor:"rgba(245,166,35,.2)"}}>
            <div className="stitle">📍 Pickup Location</div>
            <p style={{fontSize:10,color:"var(--gr)",marginBottom:8,lineHeight:1.5}}>This goes out automatically in every <strong style={{color:"var(--or)"}}>Ready</strong> text message. Update it anytime — takes effect immediately.</p>
            <textarea className="finput" rows={3} value={settings.pickupAddress||""} onChange={e=>setSettings(s=>({...s,pickupAddress:e.target.value}))} placeholder="e.g. 123 Main St, Savannah GA — or corner of MLK and Bay St, look for the red truck 🚚"/>
            <p style={{fontSize:9,color:"var(--gr)",marginTop:5}}>Preview: "...READY for pickup! 📍 {settings.pickupAddress||"[your address here]"}"</p>
          </div>

          {/* CUSTOM MESSAGES */}
          <div className="scard">
            <div className="stitle">✉️ Custom Messages</div>
            <p style={{fontSize:10,color:"var(--gr)",marginBottom:10,lineHeight:1.5}}>Override any auto-generated SMS. Enable the toggle to activate your custom version. Leave blank to use the default.</p>
            {[
              {key:"newOrder",label:"📦 New Order (to you)",placeholder:"🔥 New Order! {orderNum} from {name} — {total}. Awaiting payment."},
              {key:"confirmed",label:"✅ Order Confirmed (to customer)",placeholder:"Hey {name}! Your order {orderNum} is confirmed! We'll text when ready. 🍗"},
              {key:"cooking",label:"🍳 Order Cooking (to customer)",placeholder:"Hey {name}! Your wings are in the fryer! Order {orderNum}. Won't be long! 🔥"},
              {key:"ready",label:"🍗 Order Ready (to customer)",placeholder:"Hey {name}! Your wings are READY! Order {orderNum} — 📍 {pickup}"},
              {key:"raincheck",label:"🌧️ Rain Check (to customer)",placeholder:"Hey {name}! Your order {orderNum} has been rain-checked. Payment on file — reorder anytime! 🍗"},
            ].map(({key,label,placeholder})=>{
              const enabled=!!settings.customMsgs?.[key+"_on"];
              return(
                <div key={key} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid #1a1a1a"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,color:enabled?"var(--or)":"var(--gr)",letterSpacing:.5}}>{label}</div>
                    <div onClick={()=>setSettings(s=>({...s,customMsgs:{...s.customMsgs,[key+"_on"]:!enabled}}))} style={{
                      width:34,height:18,borderRadius:9,background:enabled?"var(--or)":"#333",
                      cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0
                    }}>
                      <div style={{position:"absolute",top:2,left:enabled?17:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
                    </div>
                  </div>
                  <textarea className="finput" rows={2} disabled={!enabled}
                    value={settings.customMsgs?.[key]||""}
                    onChange={e=>setSettings(s=>({...s,customMsgs:{...s.customMsgs,[key]:e.target.value}}))}
                    placeholder={placeholder}
                    style={{fontSize:11,opacity:enabled?1:.35,transition:"opacity .2s"}}/>
                  {enabled&&<p style={{fontSize:9,color:"var(--gr)",marginTop:3}}>{"Variables: {name} {orderNum} {total} {pickup}"}</p>}
                </div>
              );
            })}
          </div>

          <div className="scard">
            <div className="stitle">🔐 Security</div>
            <div className="form-grp">
              <label className="flabel">Dashboard PIN</label>
              <PinField value={settings.ownerPin||""} onChange={v=>setSettings(s=>({...s,ownerPin:v}))}/>
            </div>
          </div>
          <button className="btn btn-or" onClick={async()=>{
            try{
              await sb.patch("settings","?id=eq.1",{
                cashapp:settings.cashapp, venmo:settings.venmo, zelle:settings.zelle,
                pickup_address:settings.pickupAddress, owner_pin:settings.ownerPin,
                date_hours:settings.dateHours||{}, updated_at:new Date().toISOString(),
                owner_phone:settings.ownerPhone||"",
                is_closed:settings.isClosed||false,
                closed_msg:settings.closedMsg||"",
                custom_msgs:settings.customMsgs||{},
              });
              showToast("Settings saved to cloud! ☁️✅");
            }catch(e){ showToast("Save failed — check connection"); }
          }}>Save Settings</button>
          <p className="note" style={{marginTop:7,textAlign:"center"}}>☁️ Saves to Supabase — works on all devices</p>

          <div style={{height:20}}/>
        </>
      )}

      {/* UNCONFIRM MODAL */}
      {unconfirmModal&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title" style={{color:"var(--rd)"}}>⚠️ Unconfirm Order?</div>
            <div className="modal-body">
              <strong>Payment has already been received for this order.</strong>
              <br/><br/>
              By unconfirming, you are responsible for either:
              <br/>• Fulfilling the order at a later time, OR
              <br/>• Returning the customer's payment promptly
              <br/><br/>
              Please reach out to the customer directly to work something out before proceeding.
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={()=>setUnconfirmModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={()=>{upStatus(unconfirmModal,"new");setUnconfirmModal(null);}}>I Understand — Unconfirm</button>
            </div>
          </div>
        </div>
      )}

      {/* RAIN CHECK MODAL */}
      {raincheckModal&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title" style={{color:"#78b8d8"}}>🌧️ Rain Check Order?</div>
            <div className="modal-body">
              This will mark <strong>{raincheckModal.orderNum}</strong> as a Rain Check.
              <br/><br/>
              The order details and payment are preserved. Two SMS messages will open — one for you, one for the customer — with the full order summary and order number for both your records.
              <br/><br/>
              <strong>The customer keeps their order number</strong> and can reference it when they reorder.
            </div>
            <div className="modal-actions" style={{flexDirection:"column",gap:6}}>
              <a className="btn btn-blue" style={{textDecoration:"none",textAlign:"center"}}
                href={`sms:${raincheckModal.phone}&body=Hey ${raincheckModal.firstName}! Your First Class Wings order has been rain-checked 🌧️%0A%0AOrder: ${raincheckModal.orderNum}%0AItems: ${raincheckModal.cartItems?.map(i=>`${i.combo.label} (${i.flavorLabel})`).join(", ")}%0ATotal: $${raincheckModal.total}%0A%0AYour payment is on file — just reorder anytime and reference this order number. We got you! 🍗👑`}
                onClick={()=>{ setTimeout(()=>{ upStatus(raincheckModal.id,"raincheck"); setRaincheckModal(null); },500); }}>
                📱 Text Customer & Rain Check
              </a>
              <button className="btn btn-ghost" onClick={()=>setRaincheckModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── PIN FIELD WITH EYE TOGGLE ─────────────────────────────────────────────────
function PinField({value,onChange}){
  const [show,setShow]=useState(false);
  const checks=[
    {label:"8+ characters",ok:value.length>=8},
    {label:"Uppercase letter",ok:/[A-Z]/.test(value)},
    {label:"Lowercase letter",ok:/[a-z]/.test(value)},
    {label:"Number",ok:/[0-9]/.test(value)},
    {label:"Symbol (! @ # $ etc)",ok:/[^A-Za-z0-9]/.test(value)},
  ];
  return(
    <div>
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <input className="finput" type={show?"text":"password"} inputMode="text"
          value={value}
          onChange={e=>onChange(e.target.value)}
          placeholder="Min 8 chars, upper, lower, number, symbol"
          style={{paddingRight:40,fontSize:14}}/>
        <button onClick={()=>setShow(s=>!s)} style={{
          position:"absolute",right:10,background:"none",border:"none",
          color:"var(--gr)",cursor:"pointer",fontSize:16,padding:4,lineHeight:1
        }}>{show?"🙈":"👁"}</button>
      </div>
      {value.length>0&&(
        <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>
          {checks.map(c=>(
            <div key={c.label} style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:10,color:c.ok?"var(--ok)":"#333"}}>{c.ok?"✓":"○"}</span>
              <span style={{fontSize:9,color:c.ok?"var(--ok)":"#444",fontFamily:"'Oswald',sans-serif",letterSpacing:.3}}>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── QUICK TEXT TAB ────────────────────────────────────────────────────────────
const AUTO_MESSAGES = [
  "Hey {name}! 🔥 First Class Wings is cooking this week. Wings & Fries starting at $12. Order now — made fresh, ATL style!",
  "What's good {name}! 👑 First Class Wings got you covered this weekend. 6pc, 8pc, or 10pc combos w/ fries. Hit the link and order up!",
  "Aye {name}! 🍗 Fresh wings dropping soon. Sweet Spicy, Buffalo, Lemon Pepper & more. First Class Wings — premium ATL flavor. Don't sleep!",
  "Hey {name}! 💥 First Class Wings special this week — 10pc Half & Half for $16. Two flavors, one order. Tap in and order before we sell out!",
  "{name}! 🔥 You already know the wings are hitting different this week. First Class Wings — Bold Flavor Every Time. Come get it!",
  "Heads up {name} 👑 First Class Wings is open and fresh. Lemon Pepper hitting different rn. 6pc w/ fries only $12. Order while you can!",
  "What's up {name}! 🍗 First Class Wings back at it. ATL style wings made fresh to order. Starting at $12. You know what to do!",
];

function BlastTab({orders,showToast}){
  const allCustomers = [...new Map(
    orders.filter(o=>o.phone)
      .map(o=>([o.phone,{phone:o.phone,name:`${o.firstName||""} ${o.lastName||""}`.trim()||o.phone}]))
  ).values()];

  const todayIdx = new Date().getDate() % AUTO_MESSAGES.length;
  const [autoIdx,setAutoIdx]     = useState(todayIdx);
  const [msgMode,setMsgMode]     = useState("auto"); // "auto" or "custom"
  const [customMsg,setCustomMsg] = useState("");

  function getFinalMsg(name){
    if(msgMode==="auto") return AUTO_MESSAGES[autoIdx].replace(/\{name\}/g, name||"");
    return customMsg.trim().replace(/\{name\}/g, name||"");
  }

  const ready = msgMode==="auto" || (msgMode==="custom" && customMsg.trim());

  if(allCustomers.length===0) return(
    <div className="blast-section">
      <div className="blast-title">📲 Quick Text</div>
      <div className="empty"><div className="empty-i">📱</div><div className="empty-m">No customers yet — numbers appear after first order</div></div>
    </div>
  );

  return(
    <div className="blast-section">
      <div className="blast-title">📲 Quick Text</div>
      <div className="blast-sub">Build your message below, then tap 📱 next to any customer to open their SMS pre-filled and ready to send.</div>

      {/* AUTO MESSAGE */}
      <div className="scard" style={{marginBottom:9,borderColor:msgMode==="auto"?"rgba(245,166,35,.4)":"var(--bdr)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:1,color:msgMode==="auto"?"var(--or)":"var(--gr)",textTransform:"uppercase"}}>✨ Auto Message</div>
          <button onClick={()=>setMsgMode("auto")} style={{
            background:msgMode==="auto"?"var(--or)":"none",
            border:`1px solid ${msgMode==="auto"?"var(--or)":"#333"}`,
            color:msgMode==="auto"?"#000":"var(--gr)",
            fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,
            padding:"3px 10px",borderRadius:20,cursor:"pointer",textTransform:"uppercase"
          }}>{msgMode==="auto"?"✓ Selected":"Use This"}</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <button onClick={()=>setAutoIdx(i=>(i-1+AUTO_MESSAGES.length)%AUTO_MESSAGES.length)}
            style={{background:"none",border:"1px solid var(--bdr)",color:"var(--gr)",width:28,height:28,borderRadius:4,cursor:"pointer",fontSize:14,flexShrink:0}}>◀</button>
          <div style={{flex:1,fontSize:10,color:"var(--gr)",textAlign:"center",fontFamily:"'Oswald',sans-serif",letterSpacing:.5}}>
            Message {autoIdx+1} of {AUTO_MESSAGES.length}
          </div>
          <button onClick={()=>setAutoIdx(i=>(i+1)%AUTO_MESSAGES.length)}
            style={{background:"none",border:"1px solid var(--bdr)",color:"var(--gr)",width:28,height:28,borderRadius:4,cursor:"pointer",fontSize:14,flexShrink:0}}>▶</button>
        </div>
        <div style={{background:"#0c0c0c",border:"1px solid #222",borderRadius:6,padding:"9px 10px",fontSize:11,color:msgMode==="auto"?"var(--wh)":"#444",lineHeight:1.6,fontStyle:"italic",transition:"color .2s"}}>
          "{AUTO_MESSAGES[autoIdx].replace(/\{name\}/g,"{name}")}"
        </div>
      </div>
      <div className="scard" style={{marginBottom:9,borderColor:msgMode==="custom"?"rgba(245,166,35,.4)":"var(--bdr)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:1,color:msgMode==="custom"?"var(--or)":"var(--gr)",textTransform:"uppercase"}}>✏️ Custom Message</div>
          <button onClick={()=>setMsgMode("custom")} style={{
            background:msgMode==="custom"?"var(--or)":"none",
            border:`1px solid ${msgMode==="custom"?"var(--or)":"#333"}`,
            color:msgMode==="custom"?"#000":"var(--gr)",
            fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,
            padding:"3px 10px",borderRadius:20,cursor:"pointer",textTransform:"uppercase"
          }}>{msgMode==="custom"?"✓ Selected":"Use This"}</button>
        </div>
        <textarea className="finput" rows={4} placeholder={"Write your message here...\n\nUse {name} and it auto-fills each customer's first name.\n\nExample: Hey {name}! Wings are ready this Saturday 🔥"}
          value={customMsg} onChange={e=>setCustomMsg(e.target.value)}
          style={{fontSize:12,opacity:msgMode==="custom"?1:.4,transition:"opacity .2s"}}/>
        {msgMode==="custom"&&(
          <p style={{fontSize:10,color:"var(--or)",marginTop:5,lineHeight:1.5}}>
            💡 Use <strong style={{fontFamily:"'JetBrains Mono',monospace",background:"rgba(245,166,35,.1)",padding:"1px 5px",borderRadius:3}}>{"{name}"}</strong> — auto-fills each customer's first name
          </p>
        )}
      </div>

      {/* CUSTOMER LIST */}
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:1.5,color:"var(--or)",textTransform:"uppercase",marginBottom:8}}>
        Customers — {allCustomers.length} total
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {allCustomers.map(c=>(
          <div key={c.phone} style={{
            background:"var(--card)",border:"1px solid var(--bdr)",borderRadius:8,
            padding:"10px 12px",display:"flex",alignItems:"center",gap:10
          }}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,fontWeight:600,color:"var(--wh)",letterSpacing:.5}}>{c.name||c.phone}</div>
              <div style={{fontSize:10,color:"var(--gr)",marginTop:1,fontFamily:"'JetBrains Mono',monospace"}}>{c.phone}</div>
            </div>
            {ready?(
              <a href={`sms:${c.phone}&body=${encodeURIComponent(getFinalMsg(c.name?.split(" ")[0]||""))}`}
                style={{textDecoration:"none",flexShrink:0}}>
                <div style={{
                  background:"var(--or)",borderRadius:22,padding:"7px 14px",
                  display:"flex",alignItems:"center",gap:6,
                }}>
                  <span style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:.5,color:"#000",fontWeight:600}}>Text</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect width="18" height="18" rx="9" fill="#000" fillOpacity=".18"/>
                    <path d="M5 9h8M10 6l3 3-3 3" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </a>
            ):(
              <div style={{fontSize:10,color:"#333",fontFamily:"'Oswald',sans-serif",letterSpacing:.5,flexShrink:0}}>Pick msg ↑</div>
            )}
          </div>
        ))}
      </div>
      <p className="note" style={{marginTop:10}}>Opens your Messages app pre-filled. Review and tap Send. Free — uses your regular texting.</p>
    </div>
  );
}
