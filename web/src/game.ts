import kaplay from "kaplay";
import type { SaveData, LevelDef } from "./types";
import { LEVELS } from "./lib/levelData";
import { COLORS, FACES, COSTUMES, getColor, getFace, getCostume, RARITY_COLORS, RARITY_LABELS } from "./lib/cosmetics";
import { loadSave, writeSave, addStars, spendStars, unlockItem } from "./lib/saveData";

type K = ReturnType<typeof kaplay>;

const VW = 480;
const VH = 720;

// ── palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:     [18, 18, 28]   as [number,number,number],
  panel:  [34, 34, 54]   as [number,number,number],
  accent: [180,140,255]  as [number,number,number],
  gold:   [255,210, 60]  as [number,number,number],
  white:  [255,255,255]  as [number,number,number],
  dim:    [120,120,150]  as [number,number,number],
  green:  [100,220,140]  as [number,number,number],
  red:    [255,100,100]  as [number,number,number],
};

// ── hex → rgb helper ──────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number,number,number] {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

// ── simple button ─────────────────────────────────────────────────────────────
function btn(
  k: K, label: string,
  x: number, y: number, w: number, h: number,
  col: [number,number,number],
  textCol: [number,number,number],
  onClick: () => void,
  size = 16
) {
  const b = k.add([
    k.rect(w, h, { radius: 10 }),
    k.color(...col),
    k.area(),
    k.anchor("center"),
    k.pos(x, y),
    k.opacity(1),
  ]);
  k.add([
    k.text(label, { size, font: "sans-serif" }),
    k.color(...textCol),
    k.anchor("center"),
    k.pos(x, y),
  ]);
  b.onClick(onClick);
  b.onHover(() => { b.opacity = 0.82; });
  b.onHoverEnd(() => { b.opacity = 1; });
  return b;
}

// ── draw the cube (menus + gameplay) ─────────────────────────────────────────
function drawCube(
  k: K,
  cx: number, cy: number, size: number,
  colorId: string, faceId: string, costumeId: string,
  squishY = 1, squishX = 1
) {
  const col     = getColor(colorId);
  const face    = getFace(faceId);
  const costume = getCostume(costumeId);
  const w = size * squishX;
  const h = size * squishY;

  // shadow
  k.drawEllipse({
    pos: k.vec2(cx, cy + h/2 + 5),
    radiusX: w * 0.44, radiusY: 5,
    color: k.rgb(0,0,0), opacity: 0.18,
  });

  // body
  k.drawRect({
    pos: k.vec2(cx - w/2, cy - h/2),
    width: w, height: h,
    radius: size * 0.18,
    color: k.rgb(...col.rgb),
  });

  // shine
  k.drawRect({
    pos: k.vec2(cx - w/2 + 5, cy - h/2 + 5),
    width: w * 0.28, height: h * 0.18,
    radius: 4,
    color: k.rgb(255,255,255), opacity: 0.38,
  });

  // face
  k.drawText({
    text: face.emoji,
    pos: k.vec2(cx, cy + 2),
    size: size * 0.46,
    font: "sans-serif",
    anchor: "center",
    color: k.rgb(255,255,255),
  });

  // costume
  if (costume.id !== "none") {
    const hatY = cy - h/2 - 4;
    switch (costume.id) {
      case "bunny":
        k.drawRect({ pos: k.vec2(cx - w*0.22, hatY-22), width:10, height:22, radius:5, color: k.rgb(255,200,220) });
        k.drawRect({ pos: k.vec2(cx + w*0.12, hatY-22), width:10, height:22, radius:5, color: k.rgb(255,200,220) });
        k.drawRect({ pos: k.vec2(cx - w*0.20+2, hatY-20), width:6, height:16, radius:3, color: k.rgb(255,150,180) });
        k.drawRect({ pos: k.vec2(cx + w*0.14,  hatY-20), width:6, height:16, radius:3, color: k.rgb(255,150,180) });
        break;
      case "tophat":
        k.drawRect({ pos: k.vec2(cx - w*0.36, hatY-2),  width:w*0.72, height:6,  radius:2, color: k.rgb(40,30,30) });
        k.drawRect({ pos: k.vec2(cx - w*0.22, hatY-22), width:w*0.44, height:20, radius:3, color: k.rgb(40,30,30) });
        k.drawRect({ pos: k.vec2(cx - w*0.18, hatY-18), width:w*0.36, height:8,  radius:2, color: k.rgb(180,40,40) });
        break;
      case "bow":
        k.drawRect({ pos: k.vec2(cx-15, hatY-10), width:12, height:10, radius:4, color: k.rgb(255,100,160) });
        k.drawRect({ pos: k.vec2(cx+3,  hatY-10), width:12, height:10, radius:4, color: k.rgb(255,100,160) });
        k.drawCircle({ pos: k.vec2(cx, hatY-5), radius:4, color: k.rgb(255,50,130) });
        break;
      case "cap":
        k.drawRect({ pos: k.vec2(cx - w*0.38, hatY-2),  width:w*0.76, height:5,  radius:2, color: k.rgb(80,120,220) });
        k.drawRect({ pos: k.vec2(cx - w*0.24, hatY-18), width:w*0.48, height:16, radius:5, color: k.rgb(80,120,220) });
        k.drawRect({ pos: k.vec2(cx - w*0.08, hatY-14), width:w*0.2,  height:8,  radius:2, color: k.rgb(255,255,255), opacity:0.38 });
        break;
      case "flowercrown":
        for (let i = 0; i < 5; i++) {
          const fx = cx + (i-2)*11;
          k.drawCircle({ pos: k.vec2(fx, hatY-8), radius:6, color: k.rgb(255,160,200) });
          k.drawCircle({ pos: k.vec2(fx, hatY-8), radius:3, color: k.rgb(255,230,100) });
        }
        break;
      case "crown":
        k.drawRect({ pos: k.vec2(cx - w*0.28, hatY-16), width:w*0.56, height:14, radius:2, color: k.rgb(255,200,30) });
        k.drawRect({ pos: k.vec2(cx - w*0.28, hatY-22), width:8, height:8, radius:2, color: k.rgb(255,200,30) });
        k.drawRect({ pos: k.vec2(cx - w*0.04, hatY-24), width:8, height:10, radius:2, color: k.rgb(255,200,30) });
        k.drawRect({ pos: k.vec2(cx + w*0.20, hatY-22), width:8, height:8, radius:2, color: k.rgb(255,200,30) });
        k.drawCircle({ pos: k.vec2(cx, hatY-20), radius:3, color: k.rgb(255,100,100) });
        break;
      case "catears":
        k.drawRect({ pos: k.vec2(cx - w*0.25, hatY-18), width:10, height:16, radius:3, color: k.rgb(255,180,200) });
        k.drawRect({ pos: k.vec2(cx + w*0.15, hatY-18), width:10, height:16, radius:3, color: k.rgb(255,180,200) });
        k.drawRect({ pos: k.vec2(cx - w*0.23+2, hatY-16), width:6, height:10, radius:2, color: k.rgb(255,130,160) });
        k.drawRect({ pos: k.vec2(cx + w*0.17,   hatY-16), width:6, height:10, radius:2, color: k.rgb(255,130,160) });
        break;
      case "froghat":
        k.drawRect({ pos: k.vec2(cx - w*0.30, hatY-16), width:w*0.60, height:14, radius:6, color: k.rgb(80,180,80) });
        k.drawCircle({ pos: k.vec2(cx - w*0.12, hatY-16), radius:5, color: k.rgb(100,210,100) });
        k.drawCircle({ pos: k.vec2(cx + w*0.12, hatY-16), radius:5, color: k.rgb(100,210,100) });
        k.drawCircle({ pos: k.vec2(cx - w*0.12, hatY-16), radius:2, color: k.rgb(20,20,20) });
        k.drawCircle({ pos: k.vec2(cx + w*0.12, hatY-16), radius:2, color: k.rgb(20,20,20) });
        break;
      case "scarf":
        k.drawRect({ pos: k.vec2(cx - w*0.40, cy + h*0.25), width:w*0.80, height:10, radius:4, color: k.rgb(255,120,120) });
        k.drawRect({ pos: k.vec2(cx - w*0.30, cy + h*0.35), width:14, height:18, radius:4, color: k.rgb(255,120,120) });
        break;
      case "starhalo":
        for (let i = 0; i < 6; i++) {
          const ang = (i/6)*Math.PI*2;
          const sx = cx + Math.cos(ang)*w*0.38;
          const sy = (cy - h/2 - 10) + Math.sin(ang)*5;
          k.drawText({ text:"⭐", pos:k.vec2(sx,sy), size:9, font:"sans-serif", anchor:"center", color:k.rgb(255,220,60) });
        }
        break;
      case "mushroom":
        k.drawRect({ pos: k.vec2(cx - w*0.22, hatY-4), width:w*0.44, height:6, radius:2, color: k.rgb(240,220,200) });
        k.drawEllipse({ pos: k.vec2(cx, hatY-18), radiusX:w*0.32, radiusY:16, color: k.rgb(220,60,60) });
        for (let i = 0; i < 3; i++)
          k.drawCircle({ pos: k.vec2(cx+(i-1)*12, hatY-20), radius:4, color: k.rgb(255,255,255) });
        break;
    }
  }
}

// ── particle burst ────────────────────────────────────────────────────────────
function spawnParticles(k: K, x: number, y: number, col: [number,number,number], count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = k.rand(60, 150);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const p = k.add([
      k.circle(k.rand(3,6)),
      k.color(...col),
      k.pos(x, y),
      k.opacity(1),
      k.anchor("center"),
    ]);
    let life = 0.6;
    const upd = k.onUpdate(() => {
      p.pos.x += vx * k.dt();
      p.pos.y += vy * k.dt();
      p.opacity -= k.dt() / life;
      if (p.opacity <= 0) { k.destroy(p); upd.cancel(); }
    });
  }
}

// ── twinkling background stars ────────────────────────────────────────────────
function addBgStars(k: K, count = 28) {
  for (let i = 0; i < count; i++) {
    const x = k.rand(0, VW);
    const y = k.rand(0, VH);
    const s = k.rand(1, 2.5);
    const phase = k.rand(0, Math.PI*2);
    const drift = k.rand(0.4, 1.2);
    const p = k.add([
      k.circle(s),
      k.color(255,255,255),
      k.opacity(0.4),
      k.pos(x, y),
      k.anchor("center"),
    ]);
    k.onUpdate(() => { p.opacity = 0.25 + Math.sin(k.time()*drift + phase)*0.25; });
  }
}

// ── toast message ─────────────────────────────────────────────────────────────
function flashMsg(k: K, msg: string) {
  const t = k.add([
    k.text(msg, { size: 16, font: "sans-serif" }),
    k.color(...C.white),
    k.anchor("center"),
    k.pos(VW/2, VH/2 - 60),
    k.opacity(1),
  ]);
  let life = 1.6;
  const upd = k.onUpdate(() => {
    life -= k.dt();
    t.opacity = Math.min(1, life * 1.4);
    t.pos.y -= 30 * k.dt();
    if (life <= 0) { k.destroy(t); upd.cancel(); }
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY
// ═════════════════════════════════════════════════════════════════════════════
export function startGame(canvas: HTMLCanvasElement, onScore: (n: number) => void): () => void {
  const k = kaplay({
    canvas,
    width: VW,
    height: VH,
    letterbox: true,
    background: C.bg,
    global: false,
    pixelDensity: Math.min(window.devicePixelRatio || 1, 2),
  });

  let save = loadSave();

  // ── SCENE: MENU ────────────────────────────────────────────────────────────
  k.scene("menu", () => {
    save = loadSave();
    addBgStars(k);

    k.add([k.text("CUBIworld", { size: 46, font:"sans-serif" }),
      k.color(...C.accent), k.anchor("center"), k.pos(VW/2, 108)]);
    k.add([k.text("✦ Cozy Rhythm Platformer ✦", { size: 13, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 146)]);
    k.add([k.text(`⭐ ${save.stars.toLocaleString()} Stars`, { size: 17, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 178)]);

    // animated cube preview
    k.onDraw(() => {
      drawCube(k, VW/2, 268, 70,
        save.equippedColor, save.equippedFace, save.equippedCostume,
        1 + Math.sin(k.time()*2)*0.04);
    });

    btn(k, "▶  Play",       VW/2, 366, 200, 48, C.accent, C.white, () => k.go("levelselect"), 20);
    btn(k, "🎨 Customise",  VW/2, 426, 200, 44, C.panel,  C.white, () => k.go("customise"));
    btn(k, "🛍️  Shop",       VW/2, 480, 200, 44, C.panel,  C.white, () => k.go("shop"));
    btn(k, "👤 Profile",    VW/2, 534, 200, 44, C.panel,  C.white, () => k.go("profile"));

    k.add([k.text("SPACE / tap to jump during play", { size: 11, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 618)]);
  });

  // ── SCENE: LEVEL SELECT ────────────────────────────────────────────────────
  k.scene("levelselect", () => {
    save = loadSave();
    addBgStars(k);

    k.add([k.text("Choose Level", { size: 28, font:"sans-serif" }),
      k.color(...C.white), k.anchor("center"), k.pos(VW/2, 44)]);
    btn(k, "← Back", 52, 44, 80, 34, C.panel, C.white, () => k.go("menu"), 13);

    const cardW = 200, cardH = 80, gapX = 14, gapY = 8;
    const cols = 2;
    const startX = (VW - (cols*cardW + (cols-1)*gapX))/2 + cardW/2;
    const startY = 90;

    LEVELS.forEach((lvl, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col*(cardW+gapX);
      const cy = startY + row*(cardH+gapY) + cardH/2;
      const lsave  = save.levels[lvl.id];
      const done   = lsave?.completed ?? false;
      const earned = lsave?.stars ?? 0;
      const locked = i > 0 && !(save.levels[LEVELS[i-1]!.id]?.completed);
      const cardCol: [number,number,number] = locked ? [24,24,38] : done ? [30,56,36] : C.panel;

      k.add([k.rect(cardW, cardH, { radius: 12 }),
        k.color(...cardCol), k.anchor("center"), k.pos(cx, cy)]);

      k.add([k.text(`${lvl.emoji} ${i+1}. ${lvl.name}`, { size: 12, font:"sans-serif" }),
        k.color(...(locked ? C.dim : C.white)), k.anchor("center"), k.pos(cx, cy-18)]);

      const starStr = [0,1,2].map(s => s < earned ? "⭐" : "☆").join(" ");
      k.add([k.text(starStr, { size: 14, font:"sans-serif" }),
        k.color(...C.gold), k.anchor("center"), k.pos(cx, cy+4)]);

      if (locked) {
        k.add([k.text("🔒 Complete previous level", { size: 9, font:"sans-serif" }),
          k.color(...C.dim), k.anchor("center"), k.pos(cx, cy+22)]);
      } else {
        const hitbox = k.add([
          k.rect(cardW, cardH, { radius: 12 }),
          k.color(255,255,255),
          k.area(),
          k.anchor("center"),
          k.pos(cx, cy),
          k.opacity(0),
        ]);
        hitbox.onClick(() => k.go("play", lvl.id));
      }
    });
  });

  // ── SCENE: CUSTOMISE ───────────────────────────────────────────────────────
  k.scene("customise", () => {
    save = loadSave();
    let selColor   = save.equippedColor;
    let selFace    = save.equippedFace;
    let selCostume = save.equippedCostume;
    let tab: "color"|"face"|"costume" = "color";

    k.add([k.text("Customise Cube", { size: 26, font:"sans-serif" }),
      k.color(...C.white), k.anchor("center"), k.pos(VW/2, 36)]);
    btn(k, "← Back", 52, 36, 80, 30, C.panel, C.white, () => k.go("menu"), 13);

    // preview box
    k.add([k.rect(150, 150, { radius: 16 }), k.color(...C.panel),
      k.anchor("center"), k.pos(VW/2, 138)]);
    k.onDraw(() => {
      drawCube(k, VW/2, 138, 60, selColor, selFace, selCostume,
        1 + Math.sin(k.time()*1.8)*0.05);
    });

    // tab buttons
    const tabDefs: Array<{id:"color"|"face"|"costume", label:string}> = [
      { id:"color",   label:"🎨 Colour"  },
      { id:"face",    label:"😊 Face"    },
      { id:"costume", label:"🎩 Costume" },
    ];
    tabDefs.forEach((t, i) => {
      const tx = 80 + i*130;
      const tb = k.add([k.rect(120, 32, { radius: 8 }),
        k.color(...C.panel), k.area(), k.anchor("center"), k.pos(tx, 230)]);
      k.add([k.text(t.label, { size: 11, font:"sans-serif" }),
        k.color(...C.white), k.anchor("center"), k.pos(tx, 230)]);
      tb.onClick(() => { tab = t.id; rebuildGrid(); });
    });

    let gridObjs: ReturnType<typeof k.add>[] = [];

    function rebuildGrid() {
      gridObjs.forEach(o => k.destroy(o));
      gridObjs = [];

      const items = tab === "color" ? COLORS : tab === "face" ? FACES : COSTUMES;
      const cellW = 96, cellH = 78, cols = 4;
      const gx0 = (VW - cols*cellW)/2 + cellW/2;
      const gy0 = 272;

      items.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx  = gx0 + col*cellW;
        const cy  = gy0 + row*cellH;
        const unlockedList = tab==="color" ? save.unlockedColors
          : tab==="face" ? save.unlockedFaces : save.unlockedCostumes;
        const isUnlocked = unlockedList.includes(item.id);
        const isSelected = tab==="color" ? selColor===item.id
          : tab==="face" ? selFace===item.id : selCostume===item.id;

        const borderCol: [number,number,number] = isSelected ? C.gold : isUnlocked ? [50,50,72] : [32,32,48];
        const cell = k.add([k.rect(cellW-8, cellH-8, { radius: 10 }),
          k.color(...borderCol), k.area(), k.anchor("center"), k.pos(cx, cy)]);
        gridObjs.push(cell);

        if (tab === "color") {
          const c = item as typeof COLORS[0];
          const swatch = k.add([k.rect(cellW-22, cellH-28, { radius: 8 }),
            k.color(...c.rgb), k.anchor("center"), k.pos(cx, cy-8)]);
          gridObjs.push(swatch);
          const nl = k.add([k.text(c.name, { size: 8, font:"sans-serif" }),
            k.color(...(isUnlocked ? C.white : C.dim)), k.anchor("center"), k.pos(cx, cy+24)]);
          gridObjs.push(nl);
        } else {
          const fi = item as typeof FACES[0];
          const el = k.add([k.text(fi.emoji, { size: 26, font:"sans-serif" }),
            k.color(255,255,255), k.anchor("center"), k.pos(cx, cy-8),
            k.opacity(isUnlocked ? 1 : 0.3)]);
          gridObjs.push(el);
          const nl = k.add([k.text(fi.name, { size: 8, font:"sans-serif" }),
            k.color(...(isUnlocked ? C.white : C.dim)), k.anchor("center"), k.pos(cx, cy+24)]);
          gridObjs.push(nl);
        }

        if (!isUnlocked) {
          const lk = k.add([k.text("🔒", { size: 11, font:"sans-serif" }),
            k.anchor("center"), k.pos(cx+28, cy-26)]);
          gridObjs.push(lk);
        } else {
          cell.onClick(() => {
            if (tab==="color")   selColor   = item.id;
            else if (tab==="face")    selFace    = item.id;
            else                 selCostume = item.id;
            rebuildGrid();
          });
        }
      });

      // equip button
      const eqBtn = k.add([k.rect(180, 44, { radius: 10 }),
        k.color(...C.green), k.area(), k.anchor("center"), k.pos(VW/2, VH-56)]);
      gridObjs.push(eqBtn);
      const eqTxt = k.add([k.text("✓ Equip Selection", { size: 15, font:"sans-serif" }),
        k.color(...C.white), k.anchor("center"), k.pos(VW/2, VH-56)]);
      gridObjs.push(eqTxt);
      eqBtn.onClick(() => {
        save.equippedColor   = selColor;
        save.equippedFace    = selFace;
        save.equippedCostume = selCostume;
        writeSave(save);
        spawnParticles(k, VW/2, VH-56, C.green, 14);
        flashMsg(k, "Saved! ✓");
      });
    }

    rebuildGrid();
  });

  // ── SCENE: SHOP ───────────────────────────────────────────────────────────
  k.scene("shop", () => {
    save = loadSave();
    let shopTab: "color"|"face"|"costume" = "color";

    addBgStars(k);
    k.add([k.text("⭐ Star Shop", { size: 28, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 36)]);
    btn(k, "← Back", 52, 36, 80, 30, C.panel, C.white, () => k.go("menu"), 13);

    const starDisp = k.add([k.text(`⭐ ${save.stars.toLocaleString()}`, { size: 16, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 68)]);

    const shopTabDefs: Array<{id:"color"|"face"|"costume", label:string}> = [
      { id:"color",   label:"🎨 Colours"  },
      { id:"face",    label:"😊 Faces"    },
      { id:"costume", label:"🎩 Costumes" },
    ];
    shopTabDefs.forEach((t, i) => {
      const tx = 80 + i*130;
      const tb = k.add([k.rect(120, 30, { radius: 8 }),
        k.color(...C.panel), k.area(), k.anchor("center"), k.pos(tx, 94)]);
      k.add([k.text(t.label, { size: 11, font:"sans-serif" }),
        k.color(...C.white), k.anchor("center"), k.pos(tx, 94)]);
      tb.onClick(() => { shopTab = t.id; rebuildShop(); });
    });

    let shopObjs: ReturnType<typeof k.add>[] = [];

    function rebuildShop() {
      shopObjs.forEach(o => k.destroy(o));
      shopObjs = [];
      save = loadSave();
      starDisp.text = `⭐ ${save.stars.toLocaleString()}`;

      const items = shopTab==="color" ? COLORS : shopTab==="face" ? FACES : COSTUMES;
      const cellW = 210, cellH = 78, cols = 2;
      const gx0 = (VW - cols*cellW)/2 + cellW/2;
      const gy0 = 122;

      items.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx  = gx0 + col*cellW;
        const cy  = gy0 + row*cellH;
        const cat = shopTab==="color" ? "colors" : shopTab==="face" ? "faces" : "costumes";
        const ownedList = shopTab==="color" ? save.unlockedColors
          : shopTab==="face" ? save.unlockedFaces : save.unlockedCostumes;
        const owned = ownedList.includes(item.id);

        const cardBg = k.add([k.rect(cellW-8, cellH-6, { radius: 10 }),
          k.color(...(owned ? [30,52,32] as [number,number,number] : C.panel)),
          k.anchor("center"), k.pos(cx, cy)]);
        shopObjs.push(cardBg);

        const emoji = (item as typeof FACES[0]).emoji ?? "";
        const el = k.add([k.text(emoji, { size: 22, font:"sans-serif" }),
          k.color(255,255,255), k.anchor("center"), k.pos(cx-72, cy)]);
        shopObjs.push(el);

        const nl = k.add([k.text(item.name, { size: 12, font:"sans-serif" }),
          k.color(...C.white), k.anchor("left"), k.pos(cx-52, cy-18)]);
        shopObjs.push(nl);

        const rarHex = RARITY_COLORS[item.rarity] ?? "#9ca3af";
        const rarLabel = RARITY_LABELS[item.rarity] ?? "🌱 Common";
        const rl = k.add([k.text(rarLabel, { size: 9, font:"sans-serif" }),
          k.color(...hexToRgb(rarHex)), k.anchor("left"), k.pos(cx-52, cy-2)]);
        shopObjs.push(rl);

        if (owned) {
          const ol = k.add([k.text("✓ Owned", { size: 11, font:"sans-serif" }),
            k.color(...C.green), k.anchor("left"), k.pos(cx-52, cy+16)]);
          shopObjs.push(ol);
        } else if (item.price === 0) {
          const fl = k.add([k.text("Free!", { size: 11, font:"sans-serif" }),
            k.color(...C.green), k.anchor("left"), k.pos(cx-52, cy+16)]);
          shopObjs.push(fl);
        } else {
          const pb = k.add([k.rect(84, 26, { radius: 6 }),
            k.color(...C.gold), k.area(), k.anchor("left"), k.pos(cx-52, cy+10)]);
          shopObjs.push(pb);
          const pt = k.add([k.text(`⭐ ${item.price}`, { size: 12, font:"sans-serif" }),
            k.color(40,30,0), k.anchor("left"), k.pos(cx-46, cy+16)]);
          shopObjs.push(pt);
          pb.onClick(() => {
            const next = spendStars(save, item.price);
            if (!next) { flashMsg(k, "Not enough Stars! ⭐"); return; }
            save = unlockItem(next, cat, item.id);
            writeSave(save);
            flashMsg(k, `Unlocked ${item.name}! 🎉`);
            rebuildShop();
          });
        }
      });
    }

    rebuildShop();
  });

  // ── SCENE: PROFILE ────────────────────────────────────────────────────────
  k.scene("profile", () => {
    save = loadSave();
    addBgStars(k);

    k.add([k.text("👤 Profile", { size: 28, font:"sans-serif" }),
      k.color(...C.white), k.anchor("center"), k.pos(VW/2, 40)]);
    btn(k, "← Back", 52, 40, 80, 30, C.panel, C.white, () => k.go("menu"), 13);

    k.add([k.rect(190, 190, { radius: 20 }), k.color(...C.panel),
      k.anchor("center"), k.pos(VW/2, 178)]);
    k.onDraw(() => {
      drawCube(k, VW/2, 178, 78,
        save.equippedColor, save.equippedFace, save.equippedCostume,
        1 + Math.sin(k.time()*1.5)*0.06,
        1 + Math.sin(k.time()*1.1)*0.03);
    });

    k.add([k.text(`⭐ Stars: ${save.stars.toLocaleString()}`, { size: 20, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 298)]);

    const col  = getColor(save.equippedColor);
    const face = getFace(save.equippedFace);
    const cos  = getCostume(save.equippedCostume);
    [
      `🎨 Colour: ${col.name}`,
      `😊 Face: ${face.name} ${face.emoji}`,
      `🎩 Costume: ${cos.name} ${cos.emoji}`,
    ].forEach((line, i) => {
      k.add([k.text(line, { size: 14, font:"sans-serif" }),
        k.color(...C.white), k.anchor("center"), k.pos(VW/2, 338 + i*28)]);
    });

    let completed = 0, totalStars = 0;
    LEVELS.forEach(lvl => {
      const ls = save.levels[lvl.id];
      if (ls?.completed) completed++;
      totalStars += ls?.stars ?? 0;
    });
    k.add([k.text(`Levels: ${completed}/${LEVELS.length} completed`, { size: 13, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 438)]);
    k.add([k.text(`Level Stars: ${totalStars} / ${LEVELS.length*3}`, { size: 13, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 462)]);
    k.add([k.text(`Deaths: ${save.totalDeaths}`, { size: 13, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 486)]);
  });

  // ── SCENE: PLAY ───────────────────────────────────────────────────────────
  k.scene("play", (levelId: string) => {
    save = loadSave();
    const lvlDef: LevelDef | undefined = LEVELS.find(l => l.id === levelId);
    if (!lvlDef) { k.go("levelselect"); return; }

    // ── camera / world setup ─────────────────────────────────────────────
    const GROUND_Y  = 520;   // top of ground surface
    const CUBE_SIZE = 44;
    const CAM_OFFSET_X = VW * 0.28; // cube stays left of centre

    let camX       = 0;
    let starsCollected = 0;
    let dead       = false;
    let won        = false;
    let deathTimer = 0;
    let jumpSquish = 1;   // squishY for jump animation
    let landTimer  = 0;   // frames of land squish
    let onGround   = false;
    let prevOnGround = false;

    // ── gradient background ──────────────────────────────────────────────
    k.onDraw(() => {
      const [t, b] = lvlDef.bgColors;
      // draw two halves as gradient approximation
      k.drawRect({ pos: k.vec2(0,0), width: VW, height: VH/2, color: k.rgb(...t) });
      k.drawRect({ pos: k.vec2(0,VH/2), width: VW, height: VH/2, color: k.rgb(...b) });
      // soft ground line
      k.drawRect({ pos: k.vec2(0, GROUND_Y - camX*0), width: VW, height: 4,
        color: k.rgb(...lvlDef.accentColor), opacity: 0.3 });
    });

    // ── decorative clouds ────────────────────────────────────────────────
    const cloudPositions: Array<{wx:number, wy:number, scale:number}> = [];
    for (let i = 0; i < 12; i++) {
      cloudPositions.push({
        wx: k.rand(0, lvlDef.length),
        wy: k.rand(60, 280),
        scale: k.rand(0.6, 1.4),
      });
    }

    // ── obstacle & platform entities ────────────────────────────────────
    interface PlatformState {
      obj: ReturnType<typeof k.add>;
      baseX: number;
      phase: number;
      disappeared: boolean;
      disappearTimer: number;
    }
    const platforms: PlatformState[] = [];

    lvlDef.obstacles.forEach(obs => {
      if (obs.type === "platform") {
        const obj = k.add([
          k.rect(obs.w, obs.h, { radius: 4 }),
          k.color(...lvlDef.groundColor),
          k.area(),
          k.anchor("topleft"),
          k.pos(obs.x - camX, obs.y),
          "platform",
        ]);
        platforms.push({
          obj,
          baseX: obs.x,
          phase: k.rand(0, Math.PI*2),
          disappeared: false,
          disappearTimer: 0,
        });
      } else if (obs.type === "block") {
        k.add([
          k.rect(obs.w, obs.h, { radius: 4 }),
          k.color(...lvlDef.groundColor),
          k.area(),
          k.anchor("topleft"),
          k.pos(obs.x - camX, obs.y),
          "block",
          { worldX: obs.x },
        ]);
      }
    });

    // ── collectible stars ────────────────────────────────────────────────
    interface StarState {
      obj: ReturnType<typeof k.add>;
      worldX: number;
      worldY: number;
      value: number;
      collected: boolean;
    }
    const starObjs: StarState[] = lvlDef.stars.map(sd => ({
      obj: k.add([
        k.text("⭐", { size: 22, font:"sans-serif" }),
        k.color(255,220,60),
        k.anchor("center"),
        k.pos(sd.x - camX, sd.y),
        k.area({ shape: new k.Rect(k.vec2(-12,-12), 24, 24) }),
        "star",
      ]),
      worldX: sd.x,
      worldY: sd.y,
      value: sd.value,
      collected: false,
    }));

    // ── goal flag ────────────────────────────────────────────────────────
    const goalX = lvlDef.length - 80;
    const goalObj = k.add([
      k.rect(10, 120, { radius: 2 }),
      k.color(...lvlDef.accentColor),
      k.area(),
      k.anchor("topleft"),
      k.pos(goalX - camX, GROUND_Y - 120),
      "goal",
    ]);
    k.add([
      k.rect(50, 30, { radius: 4 }),
      k.color(...C.green),
      k.anchor("topleft"),
      k.pos(goalX - camX + 10, GROUND_Y - 120),
    ]);

    // ── player cube ──────────────────────────────────────────────────────
    let cubeWorldX = 80;
    let cubeY      = GROUND_Y - CUBE_SIZE;
    let velY       = 0;
    const GRAVITY  = lvlDef.gravity;
    const JUMP_VEL = -Math.sqrt(2 * GRAVITY * 160); // jump ~160px high
    const SPEED    = lvlDef.speed;

    // ── HUD ──────────────────────────────────────────────────────────────
    k.add([k.rect(VW, 44, { radius: 0 }), k.color(0,0,0), k.anchor("topleft"),
      k.pos(0,0), k.opacity(0.35), k.fixed()]);
    const hudLevel = k.add([k.text(`${lvlDef.emoji} ${lvlDef.name}`, { size: 13, font:"sans-serif" }),
      k.color(...C.white), k.anchor("left"), k.pos(10, 14), k.fixed()]);
    const hudStars = k.add([k.text(`⭐ ${save.stars}`, { size: 13, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("right"), k.pos(VW-10, 14), k.fixed()]);
    const hudCollected = k.add([k.text(`0/${lvlDef.stars.length} ⭐`, { size: 12, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 14), k.fixed()]);
    void hudLevel; void hudStars;

    // ── jump input ────────────────────────────────────────────────────────
    function tryJump() {
      if (dead || won) return;
      if (onGround) {
        velY = JUMP_VEL;
        onGround = false;
        jumpSquish = 0.65; // squish on takeoff
        spawnParticles(k, CAM_OFFSET_X, cubeY + CUBE_SIZE,
          getColor(save.equippedColor).rgb, 6);
      }
    }

    k.onKeyPress("space", tryJump);
    k.onMousePress(tryJump);
    k.onTouchStart(tryJump);

    // ── main update ───────────────────────────────────────────────────────
    k.onUpdate(() => {
      if (dead) {
        deathTimer -= k.dt();
        if (deathTimer <= 0) k.go("play", levelId);
        return;
      }
      if (won) return;

      // advance world
      cubeWorldX += SPEED * k.dt();
      camX = cubeWorldX - CAM_OFFSET_X;

      // physics
      velY += GRAVITY * k.dt();
      cubeY += velY * k.dt();

      // jump squish animation
      if (jumpSquish < 1) jumpSquish = Math.min(1, jumpSquish + k.dt() * 4);
      if (landTimer > 0) { landTimer -= k.dt(); }

      // ── reposition all world objects based on camX ─────────────────
      // blocks
      k.get("block").forEach(b => {
        const bwx = (b as ReturnType<typeof k.add> & { worldX: number }).worldX;
        b.pos.x = bwx - camX;
      });

      // platforms (moving + disappearing)
      const lvlObs = lvlDef.obstacles;
      platforms.forEach((ps, pi) => {
        const obsDef = lvlObs.filter(o => o.type === "platform")[pi];
        if (!obsDef) return;

        if (obsDef.moving && obsDef.moveRange && obsDef.moveSpeed) {
          ps.phase += k.dt() * (obsDef.moveSpeed / 60);
          const offsetX = Math.sin(ps.phase) * obsDef.moveRange;
          ps.obj.pos.x = (obsDef.x + offsetX) - camX;
        } else {
          ps.obj.pos.x = obsDef.x - camX;
        }
        ps.obj.pos.y = obsDef.y;

        // disappearing
        if (obsDef.disappear && !ps.disappeared) {
          // check if cube is standing on it
          const screenX = CAM_OFFSET_X;
          const platLeft  = ps.obj.pos.x;
          const platRight = ps.obj.pos.x + obsDef.w;
          const platTop   = ps.obj.pos.y;
          if (
            screenX + CUBE_SIZE/2 > platLeft &&
            screenX - CUBE_SIZE/2 < platRight &&
            Math.abs(cubeY + CUBE_SIZE - platTop) < 6 &&
            velY >= 0
          ) {
            ps.disappearTimer += k.dt();
            if (ps.disappearTimer > 0.5) {
              ps.disappeared = true;
              k.destroy(ps.obj);
            }
          }
        }
      });

      // goal
      goalObj.pos.x = goalX - camX;
      goalObj.pos.y = GROUND_Y - 120;

      // stars
      starObjs.forEach(ss => {
        if (!ss.collected) {
          ss.obj.pos.x = ss.worldX - camX;
          ss.obj.pos.y = ss.worldY + Math.sin(k.time()*2 + ss.worldX)*5;
        }
      });

      // ── ground collision ──────────────────────────────────────────────
      prevOnGround = onGround;
      onGround = false;

      // main ground
      if (cubeY + CUBE_SIZE >= GROUND_Y) {
        // check it's not a gap
        const isGap = lvlDef.obstacles.some(obs =>
          obs.type === "block" &&
          cubeWorldX + CUBE_SIZE/2 > obs.x &&
          cubeWorldX - CUBE_SIZE/2 < obs.x + obs.w &&
          false // gaps are represented by ABSENCE of ground blocks
        );
        void isGap;

        // check if there's ground beneath us
        const hasGround = lvlDef.obstacles.some(obs =>
          obs.type === "block" &&
          obs.y <= GROUND_Y &&
          cubeWorldX + CUBE_SIZE*0.4 > obs.x &&
          cubeWorldX - CUBE_SIZE*0.4 < obs.x + obs.w
        );

        if (hasGround) {
          cubeY = GROUND_Y - CUBE_SIZE;
          velY  = 0;
          onGround = true;
        }
      }

      // platform collisions
      if (!onGround && velY > 0) {
        platforms.forEach(ps => {
          if (ps.disappeared) return;
          const platLeft  = ps.obj.pos.x;
          const platRight = ps.obj.pos.x + (ps.obj.width ?? 80);
          const platTop   = ps.obj.pos.y;
          const screenX   = CAM_OFFSET_X;
          if (
            screenX + CUBE_SIZE*0.4 > platLeft &&
            screenX - CUBE_SIZE*0.4 < platRight &&
            cubeY + CUBE_SIZE >= platTop &&
            cubeY + CUBE_SIZE <= platTop + 20 + velY * k.dt() * 2
          ) {
            cubeY    = platTop - CUBE_SIZE;
            velY     = 0;
            onGround = true;
          }
        });
      }

      // block top collisions (jumping onto blocks)
      if (!onGround && velY > 0) {
        k.get("block").forEach(b => {
          const bx  = b.pos.x;
          const bDef = lvlDef.obstacles.find(o =>
            o.type === "block" &&
            Math.abs(o.x - (bx + camX)) < 2
          );
          if (!bDef) return;
          const blockTop = bDef.y;
          const screenX  = CAM_OFFSET_X;
          if (
            screenX + CUBE_SIZE*0.4 > b.pos.x &&
            screenX - CUBE_SIZE*0.4 < b.pos.x + bDef.w &&
            cubeY + CUBE_SIZE >= blockTop &&
            cubeY + CUBE_SIZE <= blockTop + 16 + velY * k.dt() * 2
          ) {
            cubeY    = blockTop - CUBE_SIZE;
            velY     = 0;
            onGround = true;
          }
        });
      }

      // land squish
      if (!prevOnGround && onGround) {
        landTimer  = 0.15;
        jumpSquish = 1.35; // squash on land
        spawnParticles(k, CAM_OFFSET_X, cubeY + CUBE_SIZE,
          lvlDef.groundColor, 5);
      }

      // ── star collection ───────────────────────────────────────────────
      starObjs.forEach(ss => {
        if (ss.collected) return;
        const dx = Math.abs(CAM_OFFSET_X - ss.obj.pos.x);
        const dy = Math.abs(cubeY + CUBE_SIZE/2 - ss.obj.pos.y);
        if (dx < CUBE_SIZE/2 + 14 && dy < CUBE_SIZE/2 + 14) {
          ss.collected = true;
          k.destroy(ss.obj);
          starsCollected++;
          save = addStars(save, ss.value);
          onScore(save.stars);
          hudStars.text  = `⭐ ${save.stars}`;
          hudCollected.text = `${starsCollected}/${lvlDef.stars.length} ⭐`;
          spawnParticles(k, CAM_OFFSET_X, cubeY, C.gold, 10);
          flashMsg(k, `+${ss.value} ⭐`);
        }
      });

      // ── death: fall into gap ──────────────────────────────────────────
      if (cubeY > VH + 100 && !dead) {
        die();
        return;
      }

      // ── death: hit block from side ────────────────────────────────────
      k.get("block").forEach(b => {
        if (dead) return;
        const bx   = b.pos.x;
        const bDef = lvlDef.obstacles.find(o =>
          o.type === "block" && Math.abs(o.x - (bx + camX)) < 2
        );
        if (!bDef) return;
        const screenX = CAM_OFFSET_X;
        const overlapX = screenX + CUBE_SIZE/2 > b.pos.x && screenX - CUBE_SIZE/2 < b.pos.x + bDef.w;
        const overlapY = cubeY < bDef.y + bDef.h && cubeY + CUBE_SIZE > bDef.y;
        if (overlapX && overlapY) {
          // only die if hitting the side (not landing on top)
          const fromTop = cubeY + CUBE_SIZE <= bDef.y + 12;
          if (!fromTop) die();
        }
      });

      // ── reach goal ────────────────────────────────────────────────────
      const goalScreenX = goalX - camX;
      if (Math.abs(CAM_OFFSET_X - goalScreenX) < CUBE_SIZE && !won) {
        winLevel();
      }
    });

    function die() {
      if (dead || won) return;
      dead = true;
      deathTimer = 0.8;
      save.totalDeaths++;
      writeSave(save);
      spawnParticles(k, CAM_OFFSET_X, cubeY + CUBE_SIZE/2,
        getColor(save.equippedColor).rgb, 16);
      flashMsg(k, "Oops! Try again ✨");
    }

    function winLevel() {
      won = true;
      // award completion stars
      const bonus = 10 + starsCollected * 5;
      save = addStars(save, bonus);
      onScore(save.stars);

      // update level save
      const prev = save.levels[lvlDef.id] ?? { completed: false, stars: 0, bestTime: 0 };
      save.levels = {
        ...save.levels,
        [lvlDef.id]: {
          completed: true,
          stars: Math.max(prev.stars, starsCollected),
          bestTime: 0,
        },
      };
      writeSave(save);

      spawnParticles(k, CAM_OFFSET_X, cubeY, C.gold, 20);
      k.wait(1.6, () => k.go("levelcomplete", lvlDef.id, starsCollected, bonus));
    }

    // ── draw everything ───────────────────────────────────────────────────
    k.onDraw(() => {
      // clouds
      cloudPositions.forEach(c => {
        const sx = c.wx - camX;
        if (sx < -200 || sx > VW + 200) return;
        const sc = c.scale;
        k.drawRect({ pos: k.vec2(sx, c.wy),          width:70*sc, height:28*sc, radius:14*sc, color:k.rgb(255,255,255), opacity:0.55 });
        k.drawRect({ pos: k.vec2(sx+20*sc, c.wy-14*sc), width:50*sc, height:26*sc, radius:13*sc, color:k.rgb(255,255,255), opacity:0.55 });
        k.drawRect({ pos: k.vec2(sx-10*sc, c.wy-8*sc),  width:40*sc, height:22*sc, radius:11*sc, color:k.rgb(255,255,255), opacity:0.55 });
      });

      // goal flag
      const gsx = goalX - camX;
      k.drawRect({ pos: k.vec2(gsx, GROUND_Y-120), width:10, height:120, radius:2,
        color: k.rgb(...lvlDef.accentColor) });
      k.drawRect({ pos: k.vec2(gsx+10, GROUND_Y-120), width:50, height:30, radius:4,
        color: k.rgb(...C.green) });
      k.drawText({ text:"GOAL", pos: k.vec2(gsx+35, GROUND_Y-105),
        size:11, font:"sans-serif", anchor:"center", color:k.rgb(255,255,255) });

      // cube with squish
      const squishY = landTimer > 0 ? 1.3 : jumpSquish;
      const squishX = landTimer > 0 ? 0.75 : (jumpSquish < 1 ? 1.2 : 1);
      drawCube(k, CAM_OFFSET_X, cubeY + CUBE_SIZE/2, CUBE_SIZE,
        save.equippedColor, save.equippedFace, save.equippedCostume,
        squishY, squishX);

      // death flash
      if (dead) {
        k.drawRect({ pos: k.vec2(0,0), width:VW, height:VH,
          color: k.rgb(255,80,80), opacity: 0.18 });
      }
    });

    // ── rhythm beat indicator ─────────────────────────────────────────────
    const beatInterval = 60 / lvlDef.bpm;
    let beatPhase = 0;
    k.onUpdate(() => {
      beatPhase = (beatPhase + k.dt() / beatInterval) % 1;
    });
    k.onDraw(() => {
      const pulse = Math.max(0, 1 - beatPhase * 3);
      if (pulse > 0) {
        k.drawRect({ pos: k.vec2(0, VH-4), width: VW * pulse, height: 4,
          color: k.rgb(...lvlDef.accentColor), opacity: 0.7 });
      }
    });
  });

  // ── SCENE: LEVEL COMPLETE ─────────────────────────────────────────────────
  k.scene("levelcomplete", (levelId: string, starsGot: number, bonus: number) => {
    save = loadSave();
    addBgStars(k);
    spawnParticles(k, VW/2, VH/2, C.gold, 20);

    k.add([k.text("Level Complete! 🎉", { size: 30, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 180)]);

    const lvl = LEVELS.find(l => l.id === levelId);
    if (lvl) {
      k.add([k.text(`${lvl.emoji} ${lvl.name}`, { size: 18, font:"sans-serif" }),
        k.color(...C.white), k.anchor("center"), k.pos(VW/2, 222)]);
    }

    const starStr = [0,1,2].map(s => s < starsGot ? "⭐" : "☆").join("  ");
    k.add([k.text(starStr, { size: 36, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 288)]);

    k.add([k.text(`+${bonus} ⭐ earned!`, { size: 18, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 340)]);
    k.add([k.text(`Total: ⭐ ${save.stars.toLocaleString()}`, { size: 16, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 372)]);

    const lvlIdx = LEVELS.findIndex(l => l.id === levelId);
    const nextLvl = LEVELS[lvlIdx + 1];

    btn(k, "▶ Next Level", VW/2, 444, 200, 48, C.green, C.white,
      () => nextLvl ? k.go("play", nextLvl.id) : k.go("levelselect"), 18);
    btn(k, "↩ Retry",     VW/2, 504, 200, 44, C.panel, C.white,
      () => k.go("play", levelId));
    btn(k, "🏠 Menu",      VW/2, 556, 200, 44, C.panel, C.white,
      () => k.go("menu"));
  });

  k.go("menu");
  return () => k.quit();
}
