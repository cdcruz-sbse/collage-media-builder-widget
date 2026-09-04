import { CSS } from "./styles";
import { listCollections, uploadMedia, addToCollection, createCollection, Collection, ApiConfig } from "./api";

const LANGS: [string, string][] = [
  ["en", "English"], ["de", "German"], ["fr", "French"], ["es", "Spanish"],
  ["it", "Italian"], ["nl", "Dutch"], ["pt", "Portuguese"], ["pl", "Polish"],
  ["sv", "Swedish"], ["cs", "Czech"], ["ja", "Japanese"], ["zh", "Chinese"],
  ["ko", "Korean"], ["ru", "Russian"], ["ar", "Arabic"], ["tr", "Turkish"],
];

export interface WidgetConfig {
  baseUrl: string;
  token: string;
  defaultCollectionId: string;
}

type Layer = any;

const APP_HTML = `
<div class="root">
<div class="app">
  <header class="app-header">
    <div class="brand">
      <div class="logo">C</div>
      <div>
        <h1>Collage Media Builder</h1>
        <p>Landscape signage &middot; publish to the File Manager</p>
      </div>
    </div>
    <button class="btn ghost" id="btnReset" title="Clear canvas">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> Clear
    </button>
    <button class="btn" id="btnDownload">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg> Download PNG
    </button>
    <button class="btn primary" id="btnPublish">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg> Publish to Staffbase
    </button>
  </header>

  <aside class="panel left">
    <div class="tabs" id="leftTabs">
      <button class="tab active" data-tab="design">Design</button>
      <button class="tab" data-tab="translate">Translate</button>
    </div>
    <div class="tabpane" id="pane-design">
    <div class="section">
      <h2>Templates</h2>
      <div class="stack">
        <span class="pill">Landscape &middot; 1920 &times; 1080</span>
        <div class="tpl-rail" id="tplRail"></div>
      </div>
    </div>
    <div class="section">
      <h2>Background</h2>
      <div class="stack">
        <input type="color" id="bgColor" value="#0b2e33" />
        <div class="grid4">
          <button class="swatch" style="background:#0b2e33" data-c="#0b2e33"></button>
          <button class="swatch" style="background:#00a4a6" data-c="#00a4a6"></button>
          <button class="swatch" style="background:#ffffff;border:1px solid #ccc" data-c="#ffffff"></button>
          <button class="swatch" style="background:#f5a623" data-c="#f5a623"></button>
          <button class="swatch" style="background:#e5484d" data-c="#e5484d"></button>
          <button class="swatch" style="background:#7c3aed" data-c="#7c3aed"></button>
          <button class="swatch" style="background:#111827" data-c="#111827"></button>
          <button class="swatch" style="background:#000000" data-c="#000000"></button>
        </div>
      </div>
    </div>
    <div class="section">
      <h2>Add</h2>
      <div class="stack">
        <button class="btn block" id="btnAddPhoto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg> Add photo
        </button>
        <button class="btn block" id="btnAddText">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V5h16v2"/><path d="M9 19h6"/><path d="M12 5v14"/></svg> Add text
        </button>
        <input type="file" id="fileInput" accept="image/*" class="hidden" multiple />
        <p class="muted-note">Click a photo slot to fill it. Drag layers to move, corner dot to resize, double-click text to edit.</p>
      </div>
    </div>
    <div class="section">
      <h2>Layers</h2>
      <div class="stack" id="layerList"><span class="layer-empty">No layers yet.</span></div>
    </div>
    </div><!-- /pane-design -->

    <div class="tabpane hidden" id="pane-translate">
      <div class="section">
        <h2>Languages</h2>
        <div class="stack">
          <label class="field">Source language (Original)</label>
          <select id="srcLang"></select>
          <label class="field">Add a language</label>
          <div class="row">
            <select id="tgtLang" style="flex:1"></select>
            <button class="btn primary" id="btnAddLang">Add</button>
          </div>
          <p class="muted-note" id="translateStatus"></p>
        </div>
      </div>
      <div class="section">
        <h2>Show language</h2>
        <div class="stack">
          <div class="lang-chips" id="langChips"><span class="layer-empty">Add a language to start.</span></div>
          <p class="muted-note">Pick a language chip, then select a text layer and edit its wording for that language. Whichever language is active is what Download / Publish exports (filename suffixed, e.g. collage-de.png). Original stays intact.</p>
        </div>
      </div>
    </div>
  </aside>

  <div class="stage-wrap">
    <div class="stage-outer">
      <div class="stage" id="stage">
        <div class="empty-hint" id="emptyHint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <span>Pick a layout from the <strong>Templates</strong> panel&nbsp;&larr;<br>or add photos and text manually.</span>
        </div>
      </div>
    </div>
  </div>

  <aside class="panel right" id="rightPanel">
    <div id="noSelection">
      <h2>Properties</h2>
      <p class="muted-note">Select a layer on the canvas to edit it.</p>
    </div>
    <div id="textProps" class="hidden">
      <div class="section"><h2>Text</h2><div class="stack"><textarea id="txtContent" rows="3" placeholder="Type your text…"></textarea></div></div>
      <div class="section">
        <h2>Font</h2>
        <div class="stack">
          <select id="txtFont">
            <option value="Sora">Sora</option><option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option><option value="Playfair Display">Playfair Display</option>
            <option value="Roboto Mono">Roboto Mono</option>
          </select>
          <div class="row">
            <div class="toolbar-mini">
              <button class="icon-toggle" id="txtBold" title="Bold" style="font-weight:800">B</button>
              <button class="icon-toggle" id="txtItalic" title="Italic" style="font-style:italic">I</button>
            </div>
            <div class="toolbar-mini" style="margin-left:auto">
              <button class="icon-toggle active" data-align="left" title="Left">↤</button>
              <button class="icon-toggle" data-align="center" title="Center">↔</button>
              <button class="icon-toggle" data-align="right" title="Right">↦</button>
            </div>
          </div>
          <label class="field">Size <span id="sizeVal">5</span>%</label>
          <input type="range" id="txtSize" min="1.5" max="12" step="0.25" value="5" />
          <label class="field">Colour</label><input type="color" id="txtColor" value="#ffffff" />
          <label class="field">Highlight</label>
          <div class="row"><input type="color" id="txtBg" value="#00a4a6" style="flex:1" /><button class="btn ghost" id="txtBgClear" style="padding:8px 10px">None</button></div>
        </div>
      </div>
    </div>
    <div id="imgProps" class="hidden">
      <div class="section">
        <h2>Photo</h2>
        <div class="stack">
          <button class="btn primary block hidden" id="imgUpload">Upload photo</button>
          <button class="btn block hidden" id="imgReplace">Replace photo</button>
          <label class="field">Corner radius <span id="radVal">0</span>px</label>
          <input type="range" id="imgRadius" min="0" max="240" step="2" value="0" />
          <label class="field">Opacity <span id="opVal">100</span>%</label>
          <input type="range" id="imgOpacity" min="20" max="100" step="1" value="100" />
          <div class="grid2"><button class="btn ghost" id="imgFront">Bring front</button><button class="btn ghost" id="imgBack">Send back</button></div>
        </div>
      </div>
    </div>
  </aside>
</div>

<div class="modal-overlay hidden" id="modal"><div class="modal" id="modalBody"></div></div>
</div>
`;

// ---- Templates (landscape layout patterns) ------------------------------
const mkImg = (x: number, y: number, w: number, h: number, extra: any = {}) =>
  Object.assign({ type: "image", src: null, x, y, w, h, radius: 0, opacity: 1, ratio: 1 }, extra);
const mkTxt = (text: string, x: number, y: number, w: number, h: number, extra: any = {}) =>
  Object.assign({ type: "text", text, x, y, w, h, font: "Sora", size: 0.04, color: "#ffffff", bold: false, italic: false, align: "left", bgColor: null }, extra);

const TEMPLATES = [
  { id: "grid-caption", name: "Photo grid + caption", bg: "#0b2e33", layers: [
    mkImg(0.04,0.08,0.27,0.4), mkImg(0.32,0.08,0.27,0.4), mkImg(0.04,0.52,0.27,0.4), mkImg(0.32,0.52,0.27,0.4),
    mkTxt("Driven by Quality",0.64,0.26,0.32,0.2,{size:0.085,bold:true}),
    mkTxt("Add a short supporting sentence about this update for your teams.",0.64,0.5,0.32,0.4,{size:0.035,color:"#c7d3d6",font:"Inter"}),
  ]},
  { id: "header-grid", name: "Header + photo row", bg: "#111827", layers: [
    mkTxt("Powered by Collaboration",0.04,0.08,0.6,0.16,{size:0.08,bold:true}),
    mkTxt("Introduce the theme in one or two lines here.",0.04,0.28,0.55,0.12,{size:0.035,color:"#9aa5b1",font:"Inter"}),
    mkImg(0.04,0.46,0.22,0.48), mkImg(0.28,0.46,0.22,0.48), mkImg(0.52,0.46,0.22,0.48), mkImg(0.76,0.46,0.20,0.48),
  ]},
  { id: "spotlight", name: "Full-photo spotlight", bg: "#000000", layers: [
    mkImg(0,0,1,1),
    mkTxt("Tech Talk",0.5,0.34,0.46,0.2,{size:0.11,bold:true,bgColor:"#0b2e33"}),
    mkTxt("How AI is transforming the way we work",0.5,0.58,0.46,0.14,{size:0.045,color:"#00d0d2"}),
    mkTxt("Speaker Name · Role",0.04,0.86,0.5,0.08,{size:0.032,color:"#ffffff",font:"Inter"}),
  ]},
  { id: "interview", name: "Interview / podcast", bg: "#12232b", layers: [
    mkTxt("VIDEO PODCAST",0.04,0.08,0.5,0.08,{size:0.032,bold:true,color:"#00d0d2",font:"Inter"}),
    mkImg(0.55,0.24,0.2,0.52), mkImg(0.77,0.24,0.19,0.52),
    mkTxt("A conversation on culture and people",0.04,0.34,0.48,0.32,{size:0.07,bold:true}),
    mkTxt("Listen now in the app.",0.04,0.72,0.45,0.1,{size:0.035,color:"#9fb0b5",font:"Inter"}),
  ]},
  { id: "announcement", name: "Centered announcement", bg: "#0b2e33", layers: [
    mkImg(0.4,0.1,0.08,0.14), mkImg(0.52,0.1,0.08,0.14),
    mkTxt("Explore Approved Tools",0.1,0.34,0.8,0.16,{size:0.08,bold:true,align:"center"}),
    mkTxt("Add a paragraph describing the announcement and why it matters to everyone.",0.15,0.56,0.7,0.3,{size:0.038,color:"#c7d3d6",align:"center",font:"Inter"}),
  ]},
  { id: "title-photo", name: "Title + single photo", bg: "#111827", layers: [
    mkTxt("New Interns Spotted?",0.05,0.2,0.4,0.2,{size:0.078,bold:true}),
    mkTxt("A short intro sentence goes here to set up the photo beside it.",0.05,0.46,0.38,0.3,{size:0.035,color:"#9aa5b1",font:"Inter"}),
    mkImg(0.5,0,0.5,1),
  ]},
  { id: "cover", name: "Cover / closing card", bg: "#000000", layers: [
    mkImg(0,0,1,1),
    mkTxt("Your Program Name",0.15,0.4,0.7,0.18,{size:0.09,bold:true,align:"center",bgColor:"#0b2e33"}),
    mkTxt("A tagline for the moment",0.2,0.64,0.6,0.1,{size:0.04,color:"#00d0d2",align:"center"}),
  ]},
];

/**
 * Mounts the whole builder inside a Shadow DOM on `container`.
 * Re-entrant-safe: reuses an existing shadow root if present.
 */
export function mountCollageBuilder(container: HTMLElement, cfg: WidgetConfig): void {
  const root: ShadowRoot = container.shadowRoot || container.attachShadow({ mode: "open" });
  root.innerHTML = `<style>${CSS}</style>` + APP_HTML;

  const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector(sel) as unknown as T;
  const $$ = (sel: string) => Array.from(root.querySelectorAll(sel)) as HTMLElement[];

  const apiCfg: ApiConfig = { baseUrl: cfg.baseUrl, token: cfg.token };
  const configured = !!(cfg.baseUrl && cfg.token);
  let collections: Collection[] | null = null;

  const stage = $("#stage");
  const emptyHint = $("#emptyHint");
  const canvasW = 1920, canvasH = 1080;
  let bg = "#0b2e33";
  let layers: Layer[] = [];
  let selectedId: number | null = null;
  let uid = 0;
  let pendingSlotId: number | null = null;

  // Language state (manual multi-language text entry)
  let originalTexts: Record<number, string> | null = null;      // source-language text per layer id
  const variants: Record<string, Record<number, string>> = {};  // lang -> {layerId: text}
  let activeLang: string | null = null;                          // null = original/source

  // ---- layout ----
  function layoutStage() {
    const wrap = stage.parentElement!.parentElement as HTMLElement;
    const maxW = Math.min(wrap.clientWidth - 36, 680);
    const maxH = Math.min(wrap.clientHeight - 36, 560);
    const ar = canvasW / canvasH;
    let dispW = maxW, dispH = maxW / ar;
    if (dispH > maxH) { dispH = maxH; dispW = maxH * ar; }
    const outer = stage.parentElement as HTMLElement;
    outer.style.width = dispW + "px";
    outer.style.height = dispH + "px";
    stage.style.background = bg;
    renderLayers();
  }

  function addImageLayer(src: string, ratio: number) {
    const w = 0.4, h = Math.min(w / ratio * (canvasW / canvasH), 0.5);
    const layer = { id: ++uid, type: "image", src, x: 0.3, y: 0.28, w, h, radius: 0, opacity: 1, ratio };
    layers.push(layer); selectLayer(layer.id); renderLayers(); renderLayerList();
  }
  function addTextLayer() {
    const layer = { id: ++uid, type: "text", text: "Your text here", x: 0.1, y: 0.42, w: 0.8, h: 0.12,
      font: "Sora", size: 0.06, color: "#ffffff", bold: true, italic: false, align: "left", bgColor: null };
    layers.push(layer); selectLayer(layer.id); renderLayers(); renderLayerList();
  }
  function applyTemplate(tpl: any) {
    bg = tpl.bg; stage.style.background = bg;
    ($("#bgColor") as HTMLInputElement).value = bg;
    layers = tpl.layers.map((l: any) => Object.assign({ id: ++uid }, JSON.parse(JSON.stringify(l))));
    selectedId = null; resetTranslations(); renderLayers(); renderLayerList(); showProps();
  }

  // ---- render ----
  function renderLayers() {
    $$(".layer").forEach((n) => n.remove());
    const dispW = stage.clientWidth, dispH = stage.clientHeight;
    layers.forEach((layer) => {
      const el = document.createElement("div");
      el.className = "layer " + layer.type + (layer.id === selectedId ? " selected" : "");
      el.dataset.id = String(layer.id);
      el.style.left = layer.x * dispW + "px"; el.style.top = layer.y * dispH + "px";
      el.style.width = layer.w * dispW + "px"; el.style.height = layer.h * dispH + "px";
      if (layer.type === "image") {
        if (!layer.src) {
          const slot = document.createElement("div");
          slot.className = "slot"; slot.style.borderRadius = (layer.radius / canvasW * dispW) + "px";
          slot.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span>Add photo</span>';
          el.appendChild(slot);
        } else {
          el.style.opacity = String(layer.opacity);
          const img = document.createElement("img");
          img.src = layer.src; img.style.borderRadius = (layer.radius / canvasW * dispW) + "px";
          el.appendChild(img);
        }
      } else {
        el.style.justifyContent = layer.align === "center" ? "center" : layer.align === "right" ? "flex-end" : "flex-start";
        const t = document.createElement("div");
        t.className = "txt"; t.textContent = layer.text;
        t.style.fontFamily = "'" + layer.font + "', sans-serif";
        t.style.fontSize = layer.size * dispH + "px"; t.style.color = layer.color;
        t.style.fontWeight = layer.bold ? "700" : "400"; t.style.fontStyle = layer.italic ? "italic" : "normal";
        t.style.textAlign = layer.align;
        if (layer.bgColor) { t.style.background = layer.bgColor; (t.style as any).boxDecorationBreak = "clone"; (t.style as any).webkitBoxDecorationBreak = "clone"; t.style.padding = "0.05em 0.2em"; }
        el.appendChild(t);
      }
      const del = document.createElement("button");
      del.className = "del"; del.innerHTML = "✕";
      del.addEventListener("pointerdown", (e) => e.stopPropagation());
      del.addEventListener("click", (e) => { e.stopPropagation(); removeLayer(layer.id); });
      el.appendChild(del);
      const handle = document.createElement("div"); handle.className = "handle"; el.appendChild(handle);
      attachDrag(el, layer, handle);
      if (layer.type === "text") el.addEventListener("dblclick", () => beginInlineEdit(el, layer));
      el.addEventListener("pointerdown", () => selectLayer(layer.id));
      stage.appendChild(el);
    });
    emptyHint.classList.toggle("hidden", layers.length > 0);
  }

  function renderLayerList() {
    const list = $("#layerList");
    if (!layers.length) { list.innerHTML = '<span class="layer-empty">No layers yet.</span>'; return; }
    list.innerHTML = "";
    [...layers].reverse().forEach((layer) => {
      const item = document.createElement("div");
      item.className = "layer-item" + (layer.id === selectedId ? " active" : "");
      const label = layer.type === "text" ? (layer.text.slice(0, 18) || "Text") : (layer.src ? "Photo" : "Photo slot");
      item.innerHTML = "<span>" + (layer.type === "text" ? "🅣" : "🖼️") + "</span><span>" + escapeHtml(label) + '</span><span class="tag">' + layer.type + "</span>";
      item.addEventListener("click", () => selectLayer(layer.id));
      list.appendChild(item);
    });
  }

  function selectLayer(id: number) {
    selectedId = id;
    $$(".layer").forEach((n) => n.classList.toggle("selected", Number(n.dataset.id) === id));
    renderLayerList(); showProps();
  }

  function showProps() {
    const layer = layers.find((l) => l.id === selectedId);
    $("#noSelection").classList.toggle("hidden", !!layer);
    $("#textProps").classList.add("hidden"); $("#imgProps").classList.add("hidden");
    if (!layer) return;
    if (layer.type === "text") {
      $("#textProps").classList.remove("hidden");
      ($("#txtContent") as HTMLTextAreaElement).value = layer.text;
      ($("#txtFont") as HTMLSelectElement).value = layer.font;
      ($("#txtSize") as HTMLInputElement).value = (layer.size * 100).toFixed(2);
      $("#sizeVal").textContent = (layer.size * 100).toFixed(1);
      ($("#txtColor") as HTMLInputElement).value = layer.color;
      $("#txtBold").classList.toggle("active", layer.bold);
      $("#txtItalic").classList.toggle("active", layer.italic);
      ($("#txtBg") as HTMLInputElement).value = layer.bgColor || "#00a4a6";
      $$("[data-align]").forEach((b) => b.classList.toggle("active", b.dataset.align === layer.align));
    } else {
      $("#imgProps").classList.remove("hidden");
      $("#imgUpload").classList.toggle("hidden", !!layer.src);
      $("#imgReplace").classList.toggle("hidden", !layer.src);
      ($("#imgRadius") as HTMLInputElement).value = layer.radius;
      $("#radVal").textContent = layer.radius;
      ($("#imgOpacity") as HTMLInputElement).value = String(Math.round(layer.opacity * 100));
      $("#opVal").textContent = String(Math.round(layer.opacity * 100));
    }
  }

  function removeLayer(id: number) {
    layers = layers.filter((l) => l.id !== id);
    if (selectedId === id) selectedId = null;
    renderLayers(); renderLayerList(); showProps();
  }

  // ---- drag & resize ----
  function attachDrag(el: HTMLElement, layer: any, handle: HTMLElement) {
    let mode: string | null = null, startX = 0, startY = 0, orig: any, moved = false;
    function down(e: PointerEvent, m: string) {
      e.preventDefault(); mode = m; moved = false; startX = e.clientX; startY = e.clientY;
      orig = { x: layer.x, y: layer.y, w: layer.w, h: layer.h };
      el.setPointerCapture(e.pointerId);
      window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    }
    function move(e: PointerEvent) {
      const dispW = stage.clientWidth, dispH = stage.clientHeight;
      const dxp = e.clientX - startX, dyp = e.clientY - startY;
      if (Math.abs(dxp) > 4 || Math.abs(dyp) > 4) moved = true;
      const dx = dxp / dispW, dy = dyp / dispH;
      if (mode === "move") {
        layer.x = clamp(orig.x + dx, -layer.w + 0.05, 0.95);
        layer.y = clamp(orig.y + dy, -layer.h + 0.05, 0.97);
      } else {
        layer.w = Math.max(0.05, orig.w + dx);
        if (layer.type === "image" && layer.src) layer.h = layer.w / layer.ratio * (canvasW / canvasH);
        else layer.h = Math.max(0.03, orig.h + dy);
      }
      applyGeometry(el, layer);
    }
    function up() {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      if (!moved && layer.type === "image" && !layer.src) fillSlot(layer.id);
      mode = null;
    }
    el.addEventListener("pointerdown", (e) => {
      if (e.target === handle) return;
      const t = el.querySelector(".txt") as HTMLElement;
      if (t && t.isContentEditable) return;
      down(e as PointerEvent, "move");
    });
    handle.addEventListener("pointerdown", (e) => { e.stopPropagation(); down(e as PointerEvent, "resize"); });
  }
  function applyGeometry(el: HTMLElement, layer: any) {
    const dispW = stage.clientWidth, dispH = stage.clientHeight;
    el.style.left = layer.x * dispW + "px"; el.style.top = layer.y * dispH + "px";
    el.style.width = layer.w * dispW + "px"; el.style.height = layer.h * dispH + "px";
  }

  function beginInlineEdit(el: HTMLElement, layer: any) {
    const t = el.querySelector(".txt") as HTMLElement;
    t.contentEditable = "true"; t.focus();
    try { document.execCommand("selectAll", false); } catch {}
    const finish = () => {
      t.contentEditable = "false"; layer.text = t.textContent || "";
      persistActiveText(layer);
      renderLayerList();
      if (selectedId === layer.id) ($("#txtContent") as HTMLTextAreaElement).value = layer.text;
      t.removeEventListener("blur", finish);
    };
    t.addEventListener("blur", finish);
  }

  function fillSlot(id: number) { pendingSlotId = id; ($("#fileInput") as HTMLInputElement).click(); }
  function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
  function escapeHtml(s: string) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c]); }

  // ---- template thumbnails ----
  function renderThumb(tpl: any, w: number) {
    const h = w * canvasH / canvasW;
    let s = `<svg class="thumb" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">`;
    s += `<rect width="${w}" height="${h}" fill="${tpl.bg}"/>`;
    tpl.layers.forEach((l: any) => {
      const x = l.x * w, y = l.y * h, lw = l.w * w, lh = l.h * h;
      if (l.type === "image") {
        s += `<rect x="${x}" y="${y}" width="${lw}" height="${lh}" rx="3" fill="#c9d3d6"/>`;
        const cx = x + lw / 2, cy = y + lh / 2, r = Math.min(lw, lh) * 0.14;
        s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#eef2f3"/>`;
      } else {
        const lineH = Math.max(2.2, l.size * h * 0.55);
        const cx = l.align === "center" ? x + lw / 2 : l.align === "right" ? x + lw : x;
        const anchor = (frac: number) => l.align === "center" ? cx - (lw * frac) / 2 : l.align === "right" ? cx - lw * frac : cx;
        [0.9, 0.7, 0.5].forEach((frac, i) => {
          const ly = y + i * lineH * 1.7;
          if (i > 0 && lh < lineH * (1 + i * 1.7)) return;
          s += `<rect x="${anchor(frac)}" y="${ly}" width="${lw * frac}" height="${lineH}" rx="${lineH / 2}" fill="${l.color}" opacity="${i === 0 ? 0.95 : 0.6}"/>`;
        });
      }
    });
    return s + "</svg>";
  }
  function buildRail() {
    const rail = $("#tplRail"); rail.innerHTML = "";
    TEMPLATES.forEach((tpl) => {
      const card = document.createElement("div");
      card.className = "tpl-card"; card.dataset.tpl = tpl.id;
      card.innerHTML = renderThumb(tpl, 120) + `<div class="name">${escapeHtml(tpl.name)}</div>`;
      card.addEventListener("click", () => { applyTemplate(tpl); markActiveTemplate(tpl.id); });
      rail.appendChild(card);
    });
  }
  function markActiveTemplate(id: string) {
    $$("#tplRail .tpl-card").forEach((c) => c.classList.toggle("active", c.dataset.tpl === id));
  }

  // ---- export to canvas ----
  function renderToCanvas(): Promise<Blob> {
    return new Promise((resolve) => {
      const cv = document.createElement("canvas");
      cv.width = canvasW; cv.height = canvasH;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);
      const imgLayers = layers.filter((l) => l.type === "image" && l.src);
      let loaded = 0; const imgs: any = {};
      const draw = () => {
        layers.forEach((layer) => {
          const x = layer.x * canvasW, y = layer.y * canvasH, w = layer.w * canvasW, h = layer.h * canvasH;
          if (layer.type === "image") {
            if (!layer.src) return;
            ctx.save(); ctx.globalAlpha = layer.opacity;
            roundRect(ctx, x, y, w, h, layer.radius); ctx.clip();
            drawCover(ctx, imgs[layer.id], x, y, w, h); ctx.restore();
          } else {
            ctx.save();
            const fs = layer.size * canvasH;
            ctx.font = (layer.italic ? "italic " : "") + (layer.bold ? "700 " : "400 ") + fs + "px '" + layer.font + "', sans-serif";
            ctx.textBaseline = "top";
            const lines = wrapText(ctx, layer.text, w); const lineH = fs * 1.15;
            lines.forEach((line, i) => {
              const tw = ctx.measureText(line).width; let lx = x;
              if (layer.align === "center") lx = x + (w - tw) / 2; else if (layer.align === "right") lx = x + (w - tw);
              const ly = y + i * lineH;
              if (layer.bgColor) { ctx.fillStyle = layer.bgColor; const padX = fs * 0.2, padY = fs * 0.05; ctx.fillRect(lx - padX, ly - padY, tw + padX * 2, lineH); }
              ctx.fillStyle = layer.color; ctx.fillText(line, lx, ly);
            });
            ctx.restore();
          }
        });
        cv.toBlob((b) => resolve(b as Blob), "image/png");
      };
      if (!imgLayers.length) { draw(); return; }
      imgLayers.forEach((layer) => {
        const im = new Image(); im.crossOrigin = "anonymous";
        im.onload = () => { imgs[layer.id] = im; if (++loaded === imgLayers.length) draw(); };
        im.onerror = () => { if (++loaded === imgLayers.length) draw(); };
        im.src = layer.src;
      });
    });
  }
  function drawCover(ctx: any, img: any, x: number, y: number, w: number, h: number) {
    if (!img) return;
    const ir = img.width / img.height, tr = w / h; let sw, sh, sx, sy;
    if (ir > tr) { sh = img.height; sw = sh * tr; sx = (img.width - sw) / 2; sy = 0; }
    else { sw = img.width; sh = sw / tr; sx = 0; sy = (img.height - sh) / 2; }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }
  function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function wrapText(ctx: any, text: string, maxW: number) {
    const out: string[] = [];
    text.split("\n").forEach((para) => {
      const words = para.split(" "); let line = "";
      words.forEach((word) => {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = word; } else line = test;
      });
      out.push(line);
    });
    return out;
  }

  // ---- publish (REAL API) ----
  const modal = $("#modal"); const modalBody = $("#modalBody");
  function openModal(html: string) { modal.classList.remove("hidden"); modalBody.innerHTML = html; }
  function closeModal() { modal.classList.add("hidden"); }

  async function publish() {
    if (!layers.length) { flashEmpty(); return; }
    if (!configured) { openModal(notConfiguredMarkup()); wireModalClose(); return; }
    openModal(chooseMarkup());
    wireModalClose();
    // load collections (cache after first fetch)
    try {
      if (!collections) collections = await listCollections(apiCfg);
      renderCollectionChooser(collections);
    } catch (e: any) {
      openModal(errorMarkup("Couldn’t load collections", e?.message || String(e)));
      wireModalClose();
      $("#retryBtn")?.addEventListener("click", publish);
    }
  }

  function setChooserStatus(msg: string) { const el = $("#chooserStatus"); if (el) el.textContent = msg; }

  function fillCollectionOptions(select: HTMLSelectElement, cols: Collection[]) {
    select.innerHTML = cols.length
      ? cols.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}${c.mediumCount != null ? " (" + c.mediumCount + ")" : ""}</option>`).join("")
      : `<option value="">No collections found</option>`;
    if (cfg.defaultCollectionId && cols.some((c) => c.id === cfg.defaultCollectionId)) select.value = cfg.defaultCollectionId;
  }

  function renderCollectionChooser(cols: Collection[]) {
    const select = $("#collectionSelect") as HTMLSelectElement | null;
    const loading = $("#collLoading");
    if (loading) loading.classList.add("hidden");
    if (!select) return;
    select.classList.remove("hidden");
    fillCollectionOptions(select, cols);

    const confirm = $("#confirmUpload") as HTMLButtonElement;
    confirm.disabled = !cols.length;
    confirm.addEventListener("click", () => {
      const id = select.value;
      const name = cols.find((c) => c.id === id)?.name || "collection";
      if (id) doUpload(id, name);
    });

    // Create a new collection (guaranteed writable by this token)
    const createBtn = $("#createCollBtn") as HTMLButtonElement;
    const nameInput = $("#newCollName") as HTMLInputElement;
    createBtn.addEventListener("click", async () => {
      const name = nameInput.value.trim();
      if (!name) { setChooserStatus("Enter a name for the new collection."); return; }
      createBtn.disabled = true; setChooserStatus("Creating…");
      try {
        const c = await createCollection(apiCfg, name);
        cols.unshift(c); collections = cols;
        fillCollectionOptions(select, cols);
        select.value = c.id;
        confirm.disabled = false;
        nameInput.value = "";
        setChooserStatus(`Created “${c.name}” ✓ — selected as the destination.`);
      } catch (e: any) {
        setChooserStatus(e?.message || String(e));
      } finally {
        createBtn.disabled = false;
      }
    });
  }

  async function doUpload(collectionId: string, collectionName: string) {
    openModal(uploadingMarkup(collectionName));
    let blob: Blob;
    try { blob = await renderToCanvas(); setStep("render", "done"); }
    catch (e: any) { openModal(errorMarkup("Couldn’t render the image", e?.message || String(e))); wireModalClose(); return; }
    try {
      setStep("upload", "active");
      const media = await uploadMedia(apiCfg, blob, `collage${activeLang ? "-" + activeLang : ""}-${Date.now()}.png`);
      setStep("upload", "done"); setStep("collection", "active");
      await addToCollection(apiCfg, collectionId, media.id);
      setStep("collection", "done");
      openModal(successMarkup(media.url, blob, collectionName));
      wireModalClose();
    } catch (e: any) {
      openModal(errorMarkup("Upload failed", e?.message || String(e), blob!));
      wireModalClose();
      $("#retryBtn")?.addEventListener("click", () => doUpload(collectionId, collectionName));
    }
  }

  function chooseMarkup() {
    return `
      <span class="badge-mock">Live upload</span>
      <h3 style="margin-top:12px">Publish to Staffbase</h3>
      <p>Choose the File Manager collection to add this image to.</p>
      <div id="collLoading" style="margin-bottom:18px"><div class="spinner"></div><p style="margin:0">Loading collections…</p></div>
      <div class="stack" style="text-align:left">
        <label class="field">Destination collection</label>
        <select id="collectionSelect" class="hidden"></select>
        <div class="row" style="margin-top:2px">
          <input type="text" id="newCollName" placeholder="…or create a new collection" style="flex:1" />
          <button class="btn" id="createCollBtn">Create</button>
        </div>
        <p class="muted-note" id="chooserStatus"></p>
      </div>
      <div class="row" style="justify-content:center;gap:8px;margin-top:12px">
        <button class="btn ghost" id="cancelBtn">Cancel</button>
        <button class="btn primary" id="confirmUpload" disabled>Upload &amp; add to collection</button>
      </div>`;
  }
  function uploadingMarkup(collectionName: string) {
    return `
      <span class="badge-mock">Live upload</span>
      <h3 style="margin-top:12px">Publishing…</h3>
      <p>Adding to <strong>${escapeHtml(collectionName)}</strong></p>
      <div class="steps">
        <div class="step active" data-step="render"><span class="dot">1</span><span>Rendering PNG from canvas</span></div>
        <div class="step pending" data-step="upload"><span class="dot">2</span><span>Uploading to Media API</span></div>
        <div class="step pending" data-step="collection"><span class="dot">3</span><span>Adding to File Manager collection</span></div>
      </div>`;
  }
  function successMarkup(url: string | undefined, blob: Blob, collectionName: string) {
    const localUrl = URL.createObjectURL(blob);
    return `
      <div class="success-check"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h3>Added to File Manager</h3>
      <p>Uploaded and added to <strong>${escapeHtml(collectionName)}</strong>.</p>
      ${url ? `<p style="font-size:.8rem;margin-bottom:6px"><strong>Media URL:</strong><br><a class="link-out" href="${url}" target="_blank" rel="noopener">${escapeHtml(url)}</a></p>` : ""}
      <div class="row" style="justify-content:center;gap:8px;margin-top:14px">
        <a class="btn" href="${localUrl}" download="collage.png">Download PNG</a>
        <button class="btn primary" id="cancelBtn">Done</button>
      </div>`;
  }
  function errorMarkup(title: string, detail: string, blob?: Blob) {
    const dl = blob ? `<a class="btn" href="${URL.createObjectURL(blob)}" download="collage.png">Download PNG</a>` : "";
    return `
      <div class="error-x"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></div>
      <h3>${escapeHtml(title)}</h3>
      <p style="word-break:break-word">${escapeHtml(detail)}</p>
      <div class="row" style="justify-content:center;gap:8px;margin-top:8px">
        ${dl}
        <button class="btn" id="retryBtn">Try again</button>
        <button class="btn primary" id="cancelBtn">Close</button>
      </div>`;
  }
  function notConfiguredMarkup() {
    return `
      <span class="pill warn">Not configured</span>
      <h3 style="margin-top:12px">Add API settings first</h3>
      <p>This widget needs an <strong>API base URL</strong> and <strong>API token</strong> before it can upload. Open the widget’s configuration (edit the page → widget settings) and fill those in.</p>
      <p class="muted-note">You can still design and download a PNG without configuring the API.</p>
      <div class="row" style="justify-content:center;margin-top:8px"><button class="btn primary" id="cancelBtn">Got it</button></div>`;
  }
  function setStep(name: string, cls: string) {
    const el = modalBody.querySelector('[data-step="' + name + '"]');
    if (!el) return;
    el.classList.remove("pending", "active", "done"); el.classList.add(cls);
    if (cls === "done") (el.querySelector(".dot") as HTMLElement).innerHTML = "✓";
  }
  function wireModalClose() {
    $("#cancelBtn")?.addEventListener("click", closeModal);
  }
  function flashEmpty() {
    const b = $("#btnPublish"); b.style.borderColor = "#e5484d";
    setTimeout(() => (b.style.borderColor = ""), 800);
  }
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  function fileNameFor() { return `collage${activeLang ? "-" + activeLang : ""}.png`; }

  async function download() {
    if (!layers.length) return;
    const blob = await renderToCanvas();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = fileNameFor(); a.click();
  }

  // ---- languages (manual multi-language text) ----
  function textLayers() { return layers.filter((l) => l.type === "text"); }
  function langName(code: string) { return (LANGS.find((l) => l[0] === code) || [code, code])[1]; }
  function setTranslateStatus(msg: string) { $("#translateStatus").textContent = msg; }
  function resetTranslations() {
    originalTexts = null;
    Object.keys(variants).forEach((k) => delete variants[k]);
    activeLang = null;
    renderLangChips();
  }

  // Snapshot the source-language text once, so switching back to Original is lossless.
  function ensureBase() {
    if (!originalTexts) { originalTexts = {}; textLayers().forEach((l) => (originalTexts![l.id] = l.text)); }
  }

  function addLanguage(lang: string) {
    if (!textLayers().length) { setTranslateStatus("Add some text layers first."); return; }
    const src = ($("#srcLang") as HTMLSelectElement).value;
    if (lang === src) { setTranslateStatus("That's the source language already."); return; }
    ensureBase();
    if (!variants[lang]) {
      // seed each layer from the original text so it's a starting point to edit
      variants[lang] = {};
      textLayers().forEach((l) => (variants[lang][l.id] = originalTexts![l.id] ?? l.text));
    }
    applyLang(lang);
    setTranslateStatus(`Editing ${langName(lang)} — select a text layer and edit its wording.`);
  }

  // Persist the current text of a layer into whichever language is active.
  function persistActiveText(layer: any) {
    if (!originalTexts || layer.type !== "text") return; // no languages yet → nothing to track
    if (activeLang) (variants[activeLang] || (variants[activeLang] = {}))[layer.id] = layer.text;
    else originalTexts[layer.id] = layer.text;
  }

  function applyLang(lang: string | null) {
    activeLang = lang;
    const store = lang ? variants[lang] : originalTexts;
    if (store) layers.forEach((l) => {
      if (l.type === "text") l.text = store[l.id] != null ? store[l.id] : (originalTexts ? originalTexts[l.id] ?? l.text : l.text);
    });
    renderLayers(); renderLayerList(); renderLangChips();
    if (selectedId != null) showProps();
  }

  function renderLangChips() {
    const wrap = $("#langChips");
    const langs = Object.keys(variants);
    if (!langs.length) { wrap.innerHTML = '<span class="layer-empty">Add a language to start.</span>'; return; }
    let html = `<button class="lang-chip ${activeLang === null ? "active" : ""}" data-lang="">Original</button>`;
    html += langs.map((c) =>
      `<button class="lang-chip ${activeLang === c ? "active" : ""}" data-lang="${c}">${escapeHtml(langName(c))}<span class="x" data-del="${c}">✕</span></button>`
    ).join("");
    wrap.innerHTML = html;
    wrap.querySelectorAll(".lang-chip").forEach((ch) =>
      ch.addEventListener("click", (e) => {
        const t = e.target as HTMLElement;
        if (t.dataset.del) {
          e.stopPropagation();
          delete variants[t.dataset.del];
          if (activeLang === t.dataset.del) applyLang(null); else renderLangChips();
          return;
        }
        applyLang((ch as HTMLElement).dataset.lang || null);
      })
    );
  }

  // ---- wire up ----
  ($("#bgColor") as HTMLInputElement).addEventListener("input", (e) => { bg = (e.target as HTMLInputElement).value; stage.style.background = bg; });
  $$(".swatch").forEach((s) => s.addEventListener("click", () => { bg = s.dataset.c!; stage.style.background = bg; ($("#bgColor") as HTMLInputElement).value = bg; }));

  $("#btnAddPhoto").addEventListener("click", () => { pendingSlotId = null; ($("#fileInput") as HTMLInputElement).click(); });
  ($("#fileInput") as HTMLInputElement).addEventListener("change", (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    if (pendingSlotId != null) {
      const layer = layers.find((l) => l.id === pendingSlotId); const file = files[0];
      if (layer && file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const im = new Image();
          im.onload = () => { layer.src = ev.target!.result as string; layer.ratio = im.width / im.height; renderLayers(); renderLayerList(); showProps(); };
          im.src = ev.target!.result as string;
        };
        reader.readAsDataURL(file);
      }
      pendingSlotId = null;
    } else {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => { const im = new Image(); im.onload = () => addImageLayer(ev.target!.result as string, im.width / im.height); im.src = ev.target!.result as string; };
        reader.readAsDataURL(file);
      });
    }
    (e.target as HTMLInputElement).value = "";
  });

  $("#btnAddText").addEventListener("click", addTextLayer);

  const bindText = (id: string, fn: (l: any, v: string) => void) =>
    $(id).addEventListener("input", (e: any) => { const layer = layers.find((l) => l.id === selectedId); if (!layer || layer.type !== "text") return; fn(layer, e.target.value); renderLayers(); renderLayerList(); });
  bindText("#txtContent", (l, v) => { l.text = v; persistActiveText(l); });
  bindText("#txtFont", (l, v) => (l.font = v));
  bindText("#txtColor", (l, v) => (l.color = v));
  bindText("#txtBg", (l, v) => (l.bgColor = v));
  ($("#txtSize") as HTMLInputElement).addEventListener("input", (e) => {
    const l = layers.find((x) => x.id === selectedId); if (!l) return;
    l.size = +(e.target as HTMLInputElement).value / 100; $("#sizeVal").textContent = (+(e.target as HTMLInputElement).value).toFixed(1); renderLayers();
  });
  $("#txtBold").addEventListener("click", () => toggleText("bold"));
  $("#txtItalic").addEventListener("click", () => toggleText("italic"));
  $("#txtBgClear").addEventListener("click", () => { const l = layers.find((x) => x.id === selectedId); if (!l) return; l.bgColor = null; renderLayers(); });
  function toggleText(prop: string) {
    const l = layers.find((x) => x.id === selectedId); if (!l) return;
    l[prop] = !l[prop];
    $(prop === "bold" ? "#txtBold" : "#txtItalic").classList.toggle("active", l[prop]);
    renderLayers();
  }
  $$("[data-align]").forEach((b) => b.addEventListener("click", () => {
    const l = layers.find((x) => x.id === selectedId); if (!l) return;
    l.align = b.dataset.align;
    $$("[data-align]").forEach((x) => x.classList.toggle("active", x === b));
    renderLayers();
  }));

  $("#imgUpload").addEventListener("click", () => { if (selectedId != null) fillSlot(selectedId); });
  $("#imgReplace").addEventListener("click", () => { if (selectedId != null) fillSlot(selectedId); });
  ($("#imgRadius") as HTMLInputElement).addEventListener("input", (e) => {
    const l = layers.find((x) => x.id === selectedId); if (!l) return;
    l.radius = +(e.target as HTMLInputElement).value; $("#radVal").textContent = (e.target as HTMLInputElement).value; renderLayers();
  });
  ($("#imgOpacity") as HTMLInputElement).addEventListener("input", (e) => {
    const l = layers.find((x) => x.id === selectedId); if (!l) return;
    l.opacity = +(e.target as HTMLInputElement).value / 100; $("#opVal").textContent = (e.target as HTMLInputElement).value; renderLayers();
  });
  $("#imgFront").addEventListener("click", () => reorder(1));
  $("#imgBack").addEventListener("click", () => reorder(-1));
  function reorder(dir: number) {
    const i = layers.findIndex((l) => l.id === selectedId); if (i < 0) return;
    if (dir === 1 && i < layers.length - 1) { const t = layers[i]; layers[i] = layers[i + 1]; layers[i + 1] = t; }
    if (dir === -1 && i > 0) { const t = layers[i]; layers[i] = layers[i - 1]; layers[i - 1] = t; }
    renderLayers(); renderLayerList();
  }

  $("#btnDownload").addEventListener("click", download);
  $("#btnPublish").addEventListener("click", publish);
  $("#btnReset").addEventListener("click", () => { layers = []; selectedId = null; markActiveTemplate(""); resetTranslations(); renderLayers(); renderLayerList(); showProps(); });

  // Left-panel tabs (Design / Translate)
  $$("#leftTabs .tab").forEach((t) =>
    t.addEventListener("click", () => {
      $$("#leftTabs .tab").forEach((x) => x.classList.toggle("active", x === t));
      const tab = t.dataset.tab;
      $("#pane-design").classList.toggle("hidden", tab !== "design");
      $("#pane-translate").classList.toggle("hidden", tab !== "translate");
    })
  );

  // Translation controls
  (function populateLangs() {
    const opts = LANGS.map(([c, n]) => `<option value="${c}">${n}</option>`).join("");
    ($("#srcLang") as HTMLSelectElement).innerHTML = opts;
    ($("#tgtLang") as HTMLSelectElement).innerHTML = opts;
    ($("#srcLang") as HTMLSelectElement).value = "en";
    ($("#tgtLang") as HTMLSelectElement).value = "de";
  })();
  $("#btnAddLang").addEventListener("click", () => addLanguage(($("#tgtLang") as HTMLSelectElement).value));

  stage.addEventListener("pointerdown", (e) => { if (e.target === stage) { selectedId = null; renderLayers(); renderLayerList(); showProps(); } });

  const ro = new ResizeObserver(() => layoutStage());
  ro.observe(container);

  // init
  buildRail();
  renderLangChips();
  layoutStage();
}
