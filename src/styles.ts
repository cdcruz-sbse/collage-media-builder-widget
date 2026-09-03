/**
 * All widget CSS. Injected inside a Shadow DOM so it is fully isolated from the
 * host Staffbase page (no class collisions, no leakage in either direction).
 */
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&family=Playfair+Display:wght@700&family=Poppins:wght@600;700&family=Roboto+Mono:wght@500;700&display=swap');

:host {
  --color-primary:#0b2e33; --color-accent:#00a4a6; --color-accent-2:#f5a623;
  --color-text:#16232a; --color-muted:#6b7c85; --color-surface:#ffffff;
  --color-surface-2:#f4f7f8; --color-border:#e2e9ec;
  --font-heading:'Sora',sans-serif; --font-body:'Inter',sans-serif;
  --radius:12px; --radius-sm:8px;
  --shadow:0 6px 24px rgba(11,46,51,0.10); --shadow-sm:0 2px 8px rgba(11,46,51,0.08);
  display:block; font-family:var(--font-body); color:var(--color-text);
  -webkit-font-smoothing:antialiased;
}
* { box-sizing:border-box; }
.root { position:relative; }

.app {
  background:var(--color-surface); border:1px solid var(--color-border);
  border-radius:var(--radius); box-shadow:var(--shadow); overflow:hidden;
  display:grid; grid-template-columns:250px 1fr 280px; grid-template-rows:auto 1fr;
  grid-template-areas:"header header header" "left stage right"; min-height:620px;
}
@media (max-width:1024px){ .app{ grid-template-columns:1fr; grid-template-areas:"header" "stage" "left" "right"; } }

.app-header { grid-area:header; display:flex; align-items:center; gap:12px; padding:14px 18px; border-bottom:1px solid var(--color-border); background:var(--color-surface); flex-wrap:wrap; }
.brand { display:flex; align-items:center; gap:10px; margin-right:auto; }
.brand .logo { width:34px; height:34px; border-radius:9px; background:linear-gradient(135deg,var(--color-accent),var(--color-primary)); display:grid; place-items:center; color:#fff; font-weight:800; font-family:var(--font-heading); font-size:18px; }
.brand h1 { font-family:var(--font-heading); font-size:1.05rem; margin:0; font-weight:700; }
.brand p { margin:0; font-size:.72rem; color:var(--color-muted); }

.btn { font-family:var(--font-body); font-weight:600; font-size:.85rem; border:1px solid var(--color-border); background:var(--color-surface); color:var(--color-text); padding:9px 14px; border-radius:var(--radius-sm); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:7px; transition:all .15s ease; min-height:40px; }
.btn:hover { border-color:var(--color-accent); color:var(--color-accent); }
.btn:focus-visible { outline:2px solid var(--color-accent); outline-offset:2px; }
.btn.primary { background:var(--color-accent); border-color:var(--color-accent); color:#fff; }
.btn.primary:hover { background:#00898b; border-color:#00898b; color:#fff; }
.btn.ghost { background:transparent; }
.btn:disabled { opacity:.5; cursor:not-allowed; }
.btn svg { width:16px; height:16px; }
.btn.block { width:100%; }

.panel { padding:16px; overflow-y:auto; }
.panel.left { grid-area:left; border-right:1px solid var(--color-border); background:var(--color-surface-2); }
.panel.right { grid-area:right; border-left:1px solid var(--color-border); background:var(--color-surface-2); }
.panel h2 { font-family:var(--font-heading); font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; color:var(--color-muted); margin:0 0 10px; font-weight:700; }
.section { margin-bottom:22px; }
.stack { display:flex; flex-direction:column; gap:8px; }
.row { display:flex; gap:8px; align-items:center; }
.grid2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }

label.field { display:block; font-size:.72rem; color:var(--color-muted); margin-bottom:4px; font-weight:600; }
input[type="text"], select, textarea { width:100%; font-family:var(--font-body); font-size:.85rem; padding:8px 10px; border:1px solid var(--color-border); border-radius:var(--radius-sm); background:#fff; color:var(--color-text); }
input:focus, select:focus, textarea:focus { outline:none; border-color:var(--color-accent); }
input[type="range"] { width:100%; accent-color:var(--color-accent); }
input[type="color"] { width:100%; height:36px; padding:2px; border:1px solid var(--color-border); border-radius:var(--radius-sm); background:#fff; cursor:pointer; }

.swatch { height:30px; cursor:pointer; border:1px solid var(--color-border); border-radius:var(--radius-sm); }
.swatch.active { outline:2px solid var(--color-accent); outline-offset:1px; }
.pill { display:inline-block; font-size:.68rem; font-weight:600; color:var(--color-muted); background:#fff; border:1px solid var(--color-border); border-radius:999px; padding:3px 9px; }
.pill.warn { background:#fff4e5; color:#b7791f; border-color:#f5d9a8; }

.stage-wrap { grid-area:stage; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:18px; overflow:auto;
  background:linear-gradient(45deg,#eef2f3 25%,transparent 25%),linear-gradient(-45deg,#eef2f3 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eef2f3 75%),linear-gradient(-45deg,transparent 75%,#eef2f3 75%);
  background-size:20px 20px; background-position:0 0,0 10px,10px -10px,-10px 0; background-color:#f9fbfb; }
.stage-outer { box-shadow:var(--shadow); border-radius:4px; }
.stage { position:relative; overflow:hidden; user-select:none; background-size:cover; background-position:center; width:100%; height:100%; }

.layer { position:absolute; cursor:grab; touch-action:none; }
.layer.selected { outline:2px solid var(--color-accent); outline-offset:0; }
.layer:active { cursor:grabbing; }
.layer img { width:100%; height:100%; object-fit:cover; display:block; pointer-events:none; -webkit-user-drag:none; }
.layer.text { display:flex; align-items:flex-start; padding:2px 4px; white-space:pre-wrap; line-height:1.15; word-break:break-word; }
.layer.text .txt { width:100%; outline:none; }
.slot { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; border:2px dashed rgba(255,255,255,.55); background:rgba(255,255,255,.10); color:#fff; font-size:.72rem; font-weight:600; text-align:center; }
.slot svg { width:22px; height:22px; opacity:.85; }

.handle { position:absolute; width:14px; height:14px; background:#fff; border:2px solid var(--color-accent); border-radius:50%; right:-8px; bottom:-8px; cursor:nwse-resize; display:none; }
.layer.selected .handle { display:block; }
.del { position:absolute; top:-11px; right:-11px; width:22px; height:22px; background:#e5484d; color:#fff; border:none; border-radius:50%; cursor:pointer; display:none; align-items:center; justify-content:center; font-size:13px; line-height:1; }
.layer.selected .del { display:flex; }

.empty-hint { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; color:var(--color-muted); font-size:.85rem; text-align:center; padding:24px; }
.empty-hint svg { width:38px; height:38px; opacity:.4; }

.hidden { display:none !important; }

/* Anchored to the widget (.root is position:relative), NOT the viewport —
   avoids position:fixed breaking when an ancestor page element has a transform. */
.modal-overlay { position:absolute; inset:0; background:rgba(11,46,51,0.55); display:flex; align-items:center; justify-content:center; z-index:2147483000; padding:20px; }
.modal { background:#fff; border-radius:var(--radius); box-shadow:var(--shadow); width:100%; max-width:460px; padding:24px; text-align:center; }
.modal.wide { max-width:720px; text-align:left; }
.modal h3 { font-family:var(--font-heading); margin:0 0 6px; }
.modal p { color:var(--color-muted); font-size:.85rem; margin:0 0 18px; }

.tpl-head { display:flex; align-items:center; margin-bottom:16px; }
.tpl-head h3 { margin:0; }
.tpl-head .pill { margin-left:12px; }
.tpl-close { margin-left:auto; background:none; border:none; font-size:20px; cursor:pointer; color:var(--color-muted); }
.tpl-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
@media (max-width:640px){ .tpl-grid { grid-template-columns:repeat(2,1fr);} }
.tpl-card { cursor:pointer; border:1px solid var(--color-border); border-radius:var(--radius-sm); overflow:hidden; background:#fff; transition:all .15s; }
.tpl-card:hover { border-color:var(--color-accent); box-shadow:var(--shadow-sm); transform:translateY(-2px); }
.tpl-card.active { border-color:var(--color-accent); box-shadow:0 0 0 1px var(--color-accent) inset; }
.tpl-card .thumb { width:100%; height:auto; display:block; background:#f0f0f0; }
.tpl-card .name { padding:6px 8px; font-size:.68rem; font-weight:600; color:var(--color-text); line-height:1.2; }

/* Persistent template picker inside the left panel */
.tpl-rail { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

.steps { text-align:left; margin:0 0 18px; }
.step { display:flex; align-items:center; gap:10px; padding:9px 0; font-size:.85rem; }
.step .dot { width:22px; height:22px; border-radius:50%; flex:0 0 22px; border:2px solid var(--color-border); display:grid; place-items:center; font-size:12px; color:var(--color-muted); }
.step.done .dot { background:var(--color-accent); border-color:var(--color-accent); color:#fff; }
.step.active .dot { border-color:var(--color-accent); border-top-color:transparent; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.step.pending { opacity:.5; }
.badge-mock { display:inline-block; font-size:.66rem; font-weight:700; letter-spacing:.05em; background:#eafafa; color:#00898b; border:1px solid #b8ebec; padding:3px 8px; border-radius:999px; text-transform:uppercase; }
.success-check { width:56px; height:56px; border-radius:50%; background:var(--color-accent); display:grid; place-items:center; margin:0 auto 12px; color:#fff; }
.error-x { width:56px; height:56px; border-radius:50%; background:#e5484d; display:grid; place-items:center; margin:0 auto 12px; color:#fff; }
.link-out { color:var(--color-accent); font-weight:600; text-decoration:none; word-break:break-all; }
.spinner { width:26px; height:26px; border:3px solid var(--color-border); border-top-color:var(--color-accent); border-radius:50%; animation:spin .7s linear infinite; margin:8px auto; }

.toolbar-mini { display:flex; gap:6px; flex-wrap:wrap; }
.icon-toggle { width:38px; height:38px; border:1px solid var(--color-border); background:#fff; border-radius:var(--radius-sm); cursor:pointer; display:grid; place-items:center; font-weight:700; font-size:.85rem; color:var(--color-text); }
.icon-toggle.active { border-color:var(--color-accent); color:var(--color-accent); background:#eafafa; }
.muted-note { font-size:.72rem; color:var(--color-muted); line-height:1.4; }
.layer-empty { font-size:.78rem; color:var(--color-muted); font-style:italic; }
.layer-item { display:flex; align-items:center; gap:8px; padding:7px 9px; background:#fff; border:1px solid var(--color-border); border-radius:var(--radius-sm); cursor:pointer; font-size:.8rem; }
.layer-item.active { border-color:var(--color-accent); background:#eafafa; }
.layer-item .tag { margin-left:auto; font-size:.65rem; color:var(--color-muted); }
`;
