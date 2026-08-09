import kaplay from "kaplay";
import type { SaveData, LevelDef, ObstacleDef } from "./types";
import { LEVELS } from "./lib/levelData";
import { COLORS, FACES, COSTUMES, getColor, getFace, getCostume, RARITY_COLORS, RARITY_LABELS } from "./lib/cosmetics";
import { loadSave, writeSave, addStars, spendStars, unlockItem } from "./lib/saveData";

type K = ReturnType<typeof kaplay>;

const VW = 480;
const VH = 720;

// ─── palette ────────────────────────────────────────────────────────────────
const C = {
  bg:      [18, 18, 28] as [number,number,number],
  panel:   [30, 30, 48] as [number,number,number],
  accent:  [180, 140, 255] as [number,number,number],
  gold:    [255, 210, 60] as [number,number,number],
  white:   [255, 255, 255] as [number,number,number],
  dim:     [120, 120, 150] as [number,number,number],
  green:   [100, 220, 140] as [number,number,number],
  red:     [255, 100, 100] as [number,number,number],
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function rgb(r:number,g:number,b:number){ return [r,g,b] as [number,number,number]; }

function drawRoundRect(k: K, x:number, y:number, w:number, h:number, r:number, col:[number,number,number], alpha=1){
  k.drawRect({ pos: k.vec2(x,y), width: w, height: h, radius: r,
    color: k.rgb(...col), opacity: alpha });
}

function btn(k: K, label: string, x:number, y:number, w:number, h:number,
  col:[number,number,number], textCol:[number,number,number], onClick:()=>void, size=16){
  const b = k.add([
    k.rect(w, h, { radius: 10 }),
    k.color(...col),
    k.area(),
    k.anchor("center"),
    k.pos(x, y),
    k.opacity(1),
    "btn",
  ]);
  k.add([
    k.text(label, { size, font: "sans-serif" }),
    k.color(...textCol),
    k.anchor("center"),
    k.pos(x, y),
  ]);
  b.onClick(onClick);
  b.onHover(() => { b.opacity = 0.85; });
  b.onHoverEnd(() => { b.opacity = 1; });
  return b;
}

// ─── draw the cube (used in menus + game) ────────────────────────────────────
function drawCube(k: K, cx:number, cy:number, size:number,
  colorId:string, faceId:string, costumeId:string,
  squishY=1, squishX=1){
  const col = getColor(colorId);
  const face = getFace(faceId);
  const costume = getCostume(costumeId);
  const w = size * squishX;
  const h = size * squishY;

  // shadow
  k.drawEllipse({ pos: k.vec2(cx, cy + h/2 + 4), radiusX: w*0.45, radiusY: 6,
    color: k.rgb(0,0,0), opacity: 0.18 });

  // body
  k.drawRect({ pos: k.vec2(cx - w/2, cy - h/2), width: w, height: h,
    radius: size * 0.18, color: k.rgb(...col.rgb) });

  // shine
  k.drawRect({ pos: k.vec2(cx - w/2 + 4, cy - h/2 + 4),
    width: w*0.3, height: h*0.2, radius: 4,
    color: k.rgb(255,255,255), opacity: 0.35 });

  // face emoji
  k.drawText({ text: face.emoji, pos: k.vec2(cx, cy + 2),
    size: size * 0.48, font: "sans-serif", anchor: "center", color: k.rgb(255,255,255) });

  // costume
  if (costume.id !== "none") {
    const hatY = cy - h/2 - 4;
    switch(costume.id){
      case "bunny":
        // two ears
        k.drawRect({ pos: k.vec2(cx - w*0.22, hatY - 20), width: 10, height: 22, radius: 5, color: k.rgb(255,200,220) });
        k.drawRect({ pos: k.vec2(cx + w*0.12, hatY - 20), width: 10, height: 22, radius: 5, color: k.rgb(255,200,220) });
        k.drawRect({ pos: k.vec2(cx - w*0.20 + 2, hatY - 18), width: 6, height: 16, radius: 3, color: k.rgb(255,160,180) });
        k.drawRect({ pos: k.vec2(cx + w*0.14, hatY - 18), width: 6, height: 16, radius: 3, color: k.rgb(255,160,180) });
        break;
      case "tophat":
        k.drawRect({ pos: k.vec2(cx - w*0.35, hatY - 2), width: w*0.7, height: 6, radius: 2, color: k.rgb(40,30,30) });
        k.drawRect({ pos: k.vec2(cx - w*0.22, hatY - 22), width: w*0.44, height: 20, radius: 3, color: k.rgb(40,30,30) });
        k.drawRect({ pos: k.vec2(cx - w*0.18, hatY - 18), width: w*0.36, height: 8, radius: 2, color: k.rgb(180,40,40) });
        break;
      case "bow":
        k.drawRect({ pos: k.vec2(cx - 14, hatY - 10), width: 12, height: 10, radius: 4, color: k.rgb(255,100,160) });
        k.drawRect({ pos: k.vec2(cx + 2, hatY - 10), width: 12, height: 10, radius: 4, color: k.rgb(255,100,160) });
        k.drawCircle({ pos: k.vec2(cx, hatY - 5), radius: 4, color: k.rgb(255,60,130) });
        break;
      case "cap":
        k.drawRect({ pos: k.vec2(cx - w*0.38, hatY - 2), width: w*0.76, height: 5, radius: 2, color: k.rgb(80,120,220) });
        k.drawRect({ pos: k.vec2(cx - w*0.24, hatY - 18), width: w*0.48, height: 16, radius: 5, color: k.rgb(80,120,220) });
        k.drawRect({ pos: k.vec2(cx - w*0.08, hatY - 14), width: w*0.2, height: 8, radius: 2, color: k.rgb(255,255,255), opacity: 0.4 });
        break;
      case "flowercrown":
        for(let i=0;i<5;i++){
          const fx = cx + (i-2)*10;
          k.drawCircle({ pos: k.vec2(fx, hatY - 8), radius: 6, color: k.rgb(255,160,200) });
          k.drawCircle({ pos: k.vec2(fx, hatY - 8), radius: 3, color: k.rgb(255,230,100) });
        }
        break;
      case "crown":
        k.drawRect({ pos: k.vec2(cx - w*0.28, hatY - 16), width: w*0.56, height: 14, radius: 2, color: k.rgb(255,200,30) });
        k.drawRect({ pos: k.vec2(cx - w*0.28, hatY - 22), width: 8, height: 8, radius: 2, color: k.rgb(255,200,30) });
        k.drawRect({ pos: k.vec2(cx - w*0.04, hatY - 24), width: 8, height: 10, radius: 2, color: k.rgb(255,200,30) });
        k.drawRect({ pos: k.vec2(cx + w*0.20, hatY - 22), width: 8, height: 8, radius: 2, color: k.rgb(255,200,30) });
        k.drawCircle({ pos: k.vec2(cx, hatY - 20), radius: 3, color: k.rgb(255,100,100) });
        break;
      case "catears":
        k.drawRect({ pos: k.vec2(cx - w*0.25, hatY - 18), width: 10, height: 16,
          radius: 3, color: k.rgb(255,180,200) });
        k.drawRect({ pos: k.vec2(cx + w*0.15, hatY - 18), width: 10, height: 16,
          radius: 3, color: k.rgb(255,180,200) });
        k.drawRect({ pos: k.vec2(cx - w*0.23 + 2, hatY - 16), width: 6, height: 10,
          radius: 2, color: k.rgb(255,130,160) });
        k.drawRect({ pos: k.vec2(cx + w*0.17, hatY - 16), width: 6, height: 10,
          radius: 2, color: k.rgb(255,130,160) });
        break;
      case "froghat":
        k.drawRect({ pos: k.vec2(cx - w*0.3, hatY - 16), width: w*0.6, height: 14,
          radius: 6, color: k.rgb(80,180,80) });
        k.drawCircle({ pos: k.vec2(cx - w*0.12, hatY - 16), radius: 5, color: k.rgb(100,210,100) });
        k.drawCircle({ pos: k.vec2(cx + w*0.12, hatY - 16), radius: 5, color: k.rgb(100,210,100) });
        k.drawCircle({ pos: k.vec2(cx - w*0.12, hatY - 16), radius: 2, color: k.rgb(20,20,20) });
        k.drawCircle({ pos: k.vec2(cx + w*0.12, hatY - 16), radius: 2, color: k.rgb(20,20,20) });
        break;
      case "scarf":
        k.drawRect({ pos: k.vec2(cx - w*0.4, cy + h*0.25), width: w*0.8, height: 10,
          radius: 4, color: k.rgb(255,120,120) });
        k.drawRect({ pos: k.vec2(cx - w*0.3, cy + h*0.35), width: 14, height: 18,
          radius: 4, color: k.rgb(255,120,120) });
        break;
      case "starhalo":
        for(let i=0;i<6;i++){
          const angle = (i/6)*Math.PI*2;
          const sx = cx + Math.cos(angle)*w*0.38;
          const sy = (cy - h/2 - 10) + Math.sin(angle)*6;
          k.drawText({ text:"⭐", pos: k.vec2(sx, sy), size: 10,
            font:"sans-serif", anchor:"center", color: k.rgb(255,220,60) });
        }
        break;
      case "mushroom":
        k.drawRect({ pos: k.vec2(cx - w*0.22, hatY - 4), width: w*0.44, height: 6,
          radius: 2, color: k.rgb(240,220,200) });
        k.drawEllipse({ pos: k.vec2(cx, hatY - 18), radiusX: w*0.32, radiusY: 16,
          color: k.rgb(220,60,60) });
        for(let i=0;i<3;i++){
          k.drawCircle({ pos: k.vec2(cx + (i-1)*12, hatY - 20), radius: 4,
            color: k.rgb(255,255,255) });
        }
        break;
    }
  }
}

// ─── particle burst ───────────────────────────────────────────────────────────
function spawnParticles(k: K, x:number, y:number, col:[number,number,number], count=8){
  for(let i=0;i<count;i++){
    const angle = (i/count)*Math.PI*2;
    const speed = k.rand(60,140);
    const p = k.add([
      k.circle(k.rand(3,6)),
      k.color(...col),
      k.pos(x,y),
      k.opacity(1),
      k.anchor("center"),
      { vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 0.6 },
    ]);
    const up = k.onUpdate(() => {
      p.pos.x += p.vx * k.dt();
      p.pos.y += p.vy * k.dt();
      p.opacity -= k.dt() / p.life;
      if(p.opacity <= 0){ k.destroy(p); up.cancel(); }
    });
  }
}

// ─── floating star particles in bg ───────────────────────────────────────────
function addBgStars(k: K, count=30){
  for(let i=0;i<count;i++){
    const x = k.rand(0,VW), y = k.rand(0,VH);
    const s = k.rand(1,3);
    const p = k.add([
      k.circle(s), k.color(255,255,255), k.opacity(k.rand(0.2,0.7)),
      k.pos(x,y), k.anchor("center"),
      { drift: k.rand(0.2,0.8), phase: k.rand(0,Math.PI*2) },
    ]);
    k.onUpdate(() => {
      p.opacity = 0.3 + Math.sin(k.time()*p.drift + p.phase)*0.3;
    });
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE: MENU
  // ═══════════════════════════════════════════════════════════════════════════
  k.scene("menu", () => {
    save = loadSave();
    addBgStars(k);

    // title
    k.add([k.text("CUBIworld", { size: 44, font:"sans-serif" }),
      k.color(...C.accent), k.anchor("center"), k.pos(VW/2, 110)]);
    k.add([k.text("✦ Cozy Rhythm Platformer ✦", { size: 14, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 148)]);

    // star display
    k.add([k.text(`⭐ ${save.stars.toLocaleString()} Stars`, { size: 18, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 180)]);

    // cube preview
    k.onDraw(() => {
      drawCube(k, VW/2, 270, 72, save.equippedColor, save.equippedFace, save.equippedCostume,
        1 + Math.sin(k.time()*2)*0.04);
    });

    btn(k,"▶  Play",        VW/2, 370, 200, 48, C.accent,  C.white, () => k.go("levelselect"), 20);
    btn(k,"🎨 Customise",   VW/2, 430, 200, 44, C.panel,   C.white, () => k.go("customise"));
    btn(k,"🛍️  Shop",        VW/2, 484, 200, 44, C.panel,   C.white, () => k.go("shop"));
    btn(k,"👤 Profile",     VW/2, 538, 200, 44, C.panel,   C.white, () => k.go("profile"));

    k.add([k.text("tap or press SPACE to jump during play", { size: 11, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 620)]);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE: LEVEL SELECT
  // ═══════════════════════════════════════════════════════════════════════════
  k.scene("levelselect", () => {
    save = loadSave();
    addBgStars(k);

    k.add([k.text("Choose Level", { size: 28, font:"sans-serif" }),
      k.color(...C.white), k.anchor("center"), k.pos(VW/2, 44)]);

    btn(k,"← Back", 52, 44, 80, 36, C.panel, C.white, () => k.go("menu"), 13);

    const cols = 2, rows = 5;
    const cardW = 200, cardH = 80, gapX = 16, gapY = 10;
    const startX = (VW - (cols*cardW + (cols-1)*gapX))/2 + cardW/2;
    const startY = 90;

    LEVELS.forEach((lvl, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = startX + col*(cardW+gapX);
      const cy = startY + row*(cardH+gapY) + cardH/2;
      const lsave = save.levels[lvl.id];
      const completed = lsave?.completed ?? false;
      const starsEarned = lsave?.stars ?? 0;
      const locked = i > 0 && !(save.levels[LEVELS[i-1]!.id]?.completed);

      const cardCol: [number,number,number] = locked ? [25,25,40] : completed ? [40,60,40] : C.panel;

      k.add([k.rect(cardW, cardH, { radius: 12 }), k.color(...cardCol),
        k.anchor("center"), k.pos(cx, cy)]);

      k.add([k.text(`${lvl.emoji} ${i+1}. ${lvl.name}`, { size: 13, font:"sans-serif" }),
        k.color(locked ? C.dim : C.white), k.anchor("center"), k.pos(cx, cy-16)]);

      // stars
      const starStr = [0,1,2].map(s => s < starsEarned ? "⭐" : "☆").join(" ");
      k.add([k.text(starStr, { size: 14, font:"sans-serif" }),
        k.color(...C.gold), k.anchor("center"), k.pos(cx, cy+8)]);

      if(locked){
        k.add([k.text("🔒 Complete previous level", { size: 10, font:"sans-serif" }),
          k.color(...C.dim), k.anchor("center"), k.pos(cx, cy+26)]);
      } else {
        const card = k.add([k.rect(cardW, cardH, { radius: 12 }),
          k.color(...cardCol), k.area(), k.anchor("center"), k.pos(cx, cy), k.opacity(0)]);
        card.onClick(() => k.go("play", lvl.id));
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE: CUSTOMISE
  // ═══════════════════════════════════════════════════════════════════════════
  k.scene("customise", () => {
    save = loadSave();
    let selColor = save.equippedColor;
    let selFace  = save.equippedFace;
    let selCostume = save.equippedCostume;
    let tab: "color"|"face"|"costume" = "color";

    k.add([k.text("Customise Cube", { size: 26, font:"sans-serif" }),
      k.color(...C.white), k.anchor("center"), k.pos(VW/2, 36)]);
    btn(k,"← Back", 52, 36, 80, 32, C.panel, C.white, () => k.go("menu"), 13);

    // preview area
    k.add([k.rect(160, 160, { radius: 16 }), k.color(...C.panel),
      k.anchor("center"), k.pos(VW/2, 140)]);
    k.onDraw(() => {
      drawCube(k, VW/2, 140, 64, selColor, selFace, selCostume,
        1 + Math.sin(k.time()*1.8)*0.05);
    });

    // tabs
    const tabs: Array<{id:"color"|"face"|"costume", label:string}> = [
      { id:"color", label:"🎨 Colour" },
      { id:"face",  label:"😊 Face"  },
      { id:"costume", label:"🎩 Costume" },
    ];

    const tabBtns: ReturnType<typeof k.add>[] = [];
    tabs.forEach((t, i) => {
      const tx = 80 + i*130;
      const tb = k.add([k.rect(120, 34, { radius: 8 }), k.color(...C.panel),
        k.area(), k.anchor("center"), k.pos(tx, 235), k.opacity(1)]);
      k.add([k.text(t.label, { size: 12, font:"sans-serif" }),
        k.color(...C.white), k.anchor("center"), k.pos(tx, 235)]);
      tb.onClick(() => { tab = t.id; rebuildGrid(); });
      tabBtns.push(tb);
    });

    // grid area
    let gridObjs: ReturnType<typeof k.add>[] = [];

    function rebuildGrid(){
      gridObjs.forEach(o => k.destroy(o));
      gridObjs = [];

      const items = tab === "color" ? COLORS : tab === "face" ? FACES : COSTUMES;
      const cols2 = 4;
      const cellW = 96, cellH = 80;
      const gx0 = (VW - cols2*cellW)/2 + cellW/2;
      const gy0 = 280;

      items.forEach((item, idx) => {
        const col2 = idx % cols2;
        const row2 = Math.floor(idx / cols2);
        const cx2 = gx0 + col2*cellW;
        const cy2 = gy0 + row2*cellH;
        const isUnlocked = (tab==="color" ? save.unlockedColors : tab==="face" ? save.unlockedFaces : save.unlockedCostumes).includes(item.id);
        const isSelected = tab==="color" ? selColor===item.id : tab==="face" ? selFace===item.id : selCostume===item.id;

        const borderCol: [number,number,number] = isSelected ? C.gold : isUnlocked ? C.panel : [40,40,60];
        const cell = k.add([k.rect(cellW-8, cellH-8, { radius: 10 }),
          k.color(...borderCol), k.area(), k.anchor("center"), k.pos(cx2, cy2), k.opacity(1)]);
        gridObjs.push(cell);

        if(tab==="color"){
          const c = item as typeof COLORS[0];
          const cc = k.add([k.rect(cellW-20, cellH-24, { radius: 8 }),
            k.color(...c.rgb), k.anchor("center"), k.pos(cx2, cy2-6)]);
          gridObjs.push(cc);
          const nl = k.add([k.text(c.name, { size: 9, font:"sans-serif" }),
            k.color(...(isUnlocked ? C.white : C.dim)), k.anchor("center"), k.pos(cx2, cy2+26)]);
          gridObjs.push(nl);
        } else {
          const fi = item as typeof FACES[0];
          const el = k.add([k.text(fi.emoji, { size: 28, font:"sans-serif" }),
            k.color(255,255,255), k.anchor("center"), k.pos(cx2, cy2-6),
            k.opacity(isUnlocked ? 1 : 0.35)]);
          gridObjs.push(el);
          const nl = k.add([k.text(fi.name, { size: 9, font:"sans-serif" }),
            k.color(...(isUnlocked ? C.white : C.dim)), k.anchor("center"), k.pos(cx2, cy2+26)]);
          gridObjs.push(nl);
        }

        if(!isUnlocked){
          const lock = k.add([k.text("🔒", { size: 12, font:"sans-serif" }),
            k.anchor("center"), k.pos(cx2+28, cy2-28)]);
          gridObjs.push(lock);
        }

        if(isUnlocked){
          cell.onClick(() => {
            if(tab==="color") selColor = item.id;
            else if(tab==="face") selFace = item.id;
            else selCostume = item.id;
            rebuildGrid();
          });
        }
      });

      // equip button
      const eqBtn = k.add([k.rect(180, 44, { radius: 10 }),
        k.color(...C.green), k.area(), k.anchor("center"),
        k.pos(VW/2, VH - 60)]);
      gridObjs.push(eqBtn);
      const eqTxt = k.add([k.text("✓ Equip Selection", { size: 15, font:"sans-serif" }),
        k.color(...C.white), k.anchor("center"), k.pos(VW/2, VH - 60)]);
      gridObjs.push(eqTxt);
      eqBtn.onClick(() => {
        save.equippedColor   = selColor;
        save.equippedFace    = selFace;
        save.equippedCostume = selCostume;
        writeSave(save);
        spawnParticles(k, VW/2, VH-60, C.green, 12);
      });
    }

    rebuildGrid();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE: SHOP
  // ═══════════════════════════════════════════════════════════════════════════
  k.scene("shop", () => {
    save = loadSave();
    let shopTab: "color"|"face"|"costume" = "color";

    addBgStars(k);
    k.add([k.text("⭐ Star Shop", { size: 28, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 36)]);
    btn(k,"← Back", 52, 36, 80, 32, C.panel, C.white, () => k.go("menu"), 13);

    // star display
    const starDisp = k.add([k.text(`⭐ ${save.stars.toLocaleString()}`, { size: 16, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 68)]);

    // tabs
    const shopTabs: Array<{id:"color"|"face"|"costume", label:string}> = [
      { id:"color",   label:"🎨 Colours" },
      { id:"face",    label:"😊 Faces"   },
      { id:"costume", label:"🎩 Costumes"},
    ];
    shopTabs.forEach((t, i) => {
      const tx = 80 + i*130;
      const tb = k.add([k.rect(120, 32, { radius: 8 }), k.color(...C.panel),
        k.area(), k.anchor("center"), k.pos(tx, 95)]);
      k.add([k.text(t.label, { size: 11, font:"sans-serif" }),
        k.color(...C.white), k.anchor("center"), k.pos(tx, 95)]);
      tb.onClick(() => { shopTab = t.id; rebuildShop(); });
    });

    let shopObjs: ReturnType<typeof k.add>[] = [];

    function rebuildShop(){
      shopObjs.forEach(o => k.destroy(o));
      shopObjs = [];
      save = loadSave();
      starDisp.text = `⭐ ${save.stars.toLocaleString()}`;

      const items = shopTab === "color" ? COLORS : shopTab === "face" ? FACES : COSTUMES;
      const cols2 = 2, cellW = 210, cellH = 80;
      const gx0 = (VW - cols2*cellW)/2 + cellW/2;
      const gy0 = 128;

      items.forEach((item, idx) => {
        const col2 = idx % cols2;
        const row2 = Math.floor(idx / cols2);
        const cx2 = gx0 + col2*cellW;
        const cy2 = gy0 + row2*cellH;
        const cat = shopTab === "color" ? "colors" : shopTab === "face" ? "faces" : "costumes";
        const owned = (shopTab==="color" ? save.unlockedColors : shopTab==="face" ? save.unlockedFaces : save.unlockedCostumes).includes(item.id);
        const rarCol = RARITY_COLORS[item.rarity] ?? "#9ca3af";
        const rarLabel = RARITY_LABELS[item.rarity] ?? "Common";

        const cardBg = k.add([k.rect(cellW-8, cellH-6, { radius: 10 }),
          k.color(...(owned ? [35,55,35] as [number,number,number] : C.panel)),
          k.anchor("center"), k.pos(cx2, cy2)]);
        shopObjs.push(cardBg);

        const emoji = (item as typeof FACES[0]).emoji ?? "";
        const el = k.add([k.text(emoji, { size: 24, font:"sans-serif" }),
          k.color(255,255,255), k.anchor("center"), k.pos(cx2 - 70, cy2)]);
        shopObjs.push(el);

        const nl = k.add([k.text(item.name, { size: 12, font:"sans-serif" }),
          k.color(...C.white), k.anchor("left"), k.pos(cx2 - 50, cy2 - 18)]);
        shopObjs.push(nl);

        const rl = k.add([k.text(rarLabel, { size: 9, font:"sans-serif" }),
          k.color(k.rgb(...hexToRgb(rarCol))), k.anchor("left"), k.pos(cx2 - 50, cy2 - 2)]);
        shopObjs.push(rl);

        if(owned){
          const ol = k.add([k.text("✓ Owned", { size: 11, font:"sans-serif" }),
            k.color(...C.green), k.anchor("left"), k.pos(cx2 - 50, cy2 + 16)]);
          shopObjs.push(ol);
        } else if(item.price === 0){
          const fl = k.add([k.text("Free!", { size: 11, font:"sans-serif" }),
            k.color(...C.green), k.anchor("left"), k.pos(cx2 - 50, cy2 + 16)]);
          shopObjs.push(fl);
        } else {
          const pb = k.add([k.rect(80, 26, { radius: 6 }),
            k.color(...C.gold), k.area(), k.anchor("left"), k.pos(cx2 - 50, cy2 + 10)]);
          shopObjs.push(pb);
          const pt = k.add([k.text(`⭐ ${item.price}`, { size: 12, font:"sans-serif" }),
            k.color(40,30,0), k.anchor("left"), k.pos(cx2 - 44, cy2 + 16)]);
          shopObjs.push(pt);
          pb.onClick(() => {
            const next = spendStars(save, item.price);
            if(!next){ flashMsg(k, "Not enough Stars! ⭐"); return; }
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

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE: PROFILE
  // ═══════════════════════════════════════════════════════════════════════════
  k.scene("profile", () => {
    save = loadSave();
    addBgStars(k);

    k.add([k.text("👤 Profile", { size: 28, font:"sans-serif" }),
      k.color(...C.white), k.anchor("center"), k.pos(VW/2, 40)]);
    btn(k,"← Back", 52, 40, 80, 32, C.panel, C.white, () => k.go("menu"), 13);

    // big cube preview
    k.add([k.rect(200, 200, { radius: 20 }), k.color(...C.panel),
      k.anchor("center"), k.pos(VW/2, 180)]);
    k.onDraw(() => {
      drawCube(k, VW/2, 180, 80, save.equippedColor, save.equippedFace, save.equippedCostume,
        1 + Math.sin(k.time()*1.5)*0.06, 1 + Math.sin(k.time()*1.2)*0.03);
    });

    k.add([k.text(`⭐ Stars: ${save.stars.toLocaleString()}`, { size: 20, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 300)]);

    const col = getColor(save.equippedColor);
    const face = getFace(save.equippedFace);
    const costume = getCostume(save.equippedCostume);

    const info = [
      `🎨 Colour: ${col.name}`,
      `😊 Face: ${face.name} ${face.emoji}`,
      `🎩 Costume: ${costume.name} ${costume.emoji}`,
    ];
    info.forEach((line, i) => {
      k.add([k.text(line, { size: 14, font:"sans-serif" }),
        k.color(...C.white), k.anchor("center"), k.pos(VW/2, 340 + i*28)]);
    });

    // level stats
    let completed = 0, totalStars = 0;
    LEVELS.forEach(lvl => {
      const ls = save.levels[lvl.id];
      if(ls?.completed) completed++;
      totalStars += ls?.stars ?? 0;
    });
    k.add([k.text(`Levels: ${completed}/${LEVELS.length} completed`, { size: 13, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 440)]);
    k.add([k.text(`Level Stars: ${totalStars} / ${LEVELS.length*3}`, { size: 13, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 464)]);
    k.add([k.text(`Total Deaths: ${save.totalDeaths}`, { size: 13, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 488)]);

    btn(k,"🎨 Customise Cube", VW/2, 560, 220, 44, C.accent, C.white, () => k.go("customise"));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE: PLAY
  // ═══════════════════════════════════════════════════════════════════════════
  k.scene("play", (levelId: string) => {
    save = loadSave();
    const levelDef: LevelDef = LEVELS.find(l => l.id === levelId) ?? LEVELS[0]!;

    // ── camera / world setup ────────────────────────────────────────────────
    const GROUND_Y = 520;
    const CUBE_SIZE = 44;
    const JUMP_FORCE = -520;
    let cameraX = 0;
    let starsCollected = 0;
    let dead = false;
    let finished = false;
    let squishTimer = 0;
    let squishY = 1;
    let squishX = 1;
    let beatFlash = 0;
    let startTime = k.time();

    onScore(0);

    // ── background gradient ─────────────────────────────────────────────────
    k.onDraw(() => {
      const [t, b] = levelDef.bgColors;
      // top half
      k.drawRect({ pos: k.vec2(0,0), width: VW, height: VH/2,
        color: k.rgb(...t) });
      // bottom half
      k.drawRect({ pos: k.vec2(0, VH/2), width: VW, height: VH/2,
        color: k.rgb(...b) });
    });

    // ── decorative bg elements ──────────────────────────────────────────────
    k.onDraw(() => {
      // clouds / stars based on level theme
      const t = k.time();
      for(let i=0;i<5;i++){
        const cx2 = ((i*180 + t*18) % (VW+120)) - 60;
        const cy2 = 80 + i*30;
        k.drawEllipse({ pos: k.vec2(cx2, cy2), radiusX: 40, radiusY: 18,
          color: k.rgb(255,255,255), opacity: 0.15 });
        k.drawEllipse({ pos: k.vec2(cx2+20, cy2-8), radiusX: 28, radiusY: 14,
          color: k.rgb(255,255,255), opacity: 0.12 });
      }
    });

    // ── rhythm beat indicator ───────────────────────────────────────────────
    const beatInterval = 60 / levelDef.bpm;
    let nextBeat = beatInterval;
    k.onUpdate(() => {
      if(k.time() - startTime >= nextBeat - startTime % beatInterval){
        nextBeat += beatInterval;
        beatFlash = 0.15;
      }
      if(beatFlash > 0) beatFlash -= k.dt() * 3;
    });
    k.onDraw(() => {
      if(beatFlash > 0){
        k.drawRect({ pos: k.vec2(0,0), width: VW, height: VH,
          color: k.rgb(255,255,255), opacity: beatFlash * 0.08 });
      }
      // beat dot
      k.drawCircle({ pos: k.vec2(VW - 24, 24), radius: 8,
        color: k.rgb(...levelDef.accentColor), opacity: 0.4 + beatFlash });
    });

    // ── world objects ───────────────────────────────────────────────────────
    // We draw everything manually offset by cameraX (side-scrolling)

    // Build obstacle data with moving platform state
    interface PlatformState { def: ObstacleDef; offset: number; dir: number; disappearTimer: number; visible: boolean; stepped: boolean }
    const platforms: PlatformState[] = [];
    const staticBlocks: ObstacleDef[] = [];

    levelDef.obstacles.forEach(obs => {
      if(obs.type === "platform"){
        platforms.push({ def: obs, offset: 0, dir: 1, disappearTimer: 0, visible: true, stepped: false });
      } else {
        staticBlocks.push(obs);
      }
    });

    // Star collection state
    const starState: { def: typeof levelDef.stars[0]; collected: boolean }[] =
      levelDef.stars.map(s => ({ def: s, collected: false }));

    // ── player ──────────────────────────────────────────────────────────────
    let playerX = 80;
    let playerY = GROUND_Y - CUBE_SIZE;
    let velY = 0;
    let onGround = false;
    let jumpsLeft = 1; // single jump only

    // ── finish flag position ─────────────────────────────────────────────────
    const finishX = levelDef.length - 100;

    // ── jump function ────────────────────────────────────────────────────────
    function tryJump(){
      if(dead || finished) return;
      if(jumpsLeft > 0){
        velY = JUMP_FORCE;
        jumpsLeft--;
        squishY = 0.6; squishX = 1.3; squishTimer = 0.12;
        spawnParticles(k, VW/2, playerY + CUBE_SIZE, getColor(save.equippedColor).rgb, 6);
      }
    }

    k.onKeyPress("space", tryJump);
    k.onMousePress(tryJump);
    k.onTouchStart(tryJump);

    // ── HUD ─────────────────────────────────────────────────────────────────
    k.onDraw(() => {
      // top bar
      drawRoundRect(k, 0, 0, VW, 44, 0, C.bg, 0.7);
      k.drawText({ text: `${levelDef.emoji} ${levelDef.name}`,
        pos: k.vec2(12, 8), size: 14, font:"sans-serif", color: k.rgb(...C.white) });
      k.drawText({ text: `⭐ ${starsCollected}/${levelDef.stars.length}`,
        pos: k.vec2(VW - 80, 8), size: 14, font:"sans-serif", color: k.rgb(...C.gold) });

      // progress bar
      const prog = Math.min(playerX / levelDef.length, 1);
      k.drawRect({ pos: k.vec2(0, 40), width: VW, height: 4, color: k.rgb(40,40,60) });
      k.drawRect({ pos: k.vec2(0, 40), width: VW * prog, height: 4,
        color: k.rgb(...levelDef.accentColor) });
    });

    // ── main update ──────────────────────────────────────────────────────────
    k.onUpdate(() => {
      if(dead || finished) return;
      const dt = k.dt();

      // apply gravity
      velY += levelDef.gravity * dt;
      playerY += velY * dt;

      // auto-move
      playerX += levelDef.speed * dt;
      cameraX = Math.max(0, playerX - VW/3);

      // squish recovery
      if(squishTimer > 0){
        squishTimer -= dt;
        if(squishTimer <= 0){ squishY = 1; squishX = 1; }
      }

      // ── collision with static blocks ─────────────────────────────────────
      onGround = false;
      const px = playerX - CUBE_SIZE/2;
      const py = playerY;
      const pw = CUBE_SIZE;
      const ph = CUBE_SIZE;

      for(const obs of staticBlocks){
        if(obs.type === "gap") continue;
        const ox = obs.x, oy = obs.y, ow = obs.w, oh = obs.h;
        if(px + pw > ox && px < ox + ow && py + ph > oy && py < oy + oh){
          // coming from above
          if(velY >= 0 && py + ph - velY*dt <= oy + 2){
            playerY = oy - ph;
            velY = 0;
            onGround = true;
            jumpsLeft = 1;
            if(squishTimer <= 0){ squishY = 1.25; squishX = 0.8; squishTimer = 0.1; }
          } else {
            // side / bottom hit = death
            triggerDeath();
            return;
          }
        }
      }

      // ── moving / disappearing platforms ──────────────────────────────────
      for(const p of platforms){
        if(!p.visible) continue;
        const pd = p.def;
        // update moving
        if(pd.moving && pd.moveRange && pd.moveSpeed){
          p.offset += p.dir * pd.moveSpeed * dt;
          if(Math.abs(p.offset) >= pd.moveRange) p.dir *= -1;
        }
        const ox = pd.x + (pd.moving ? p.offset : 0);
        const oy = pd.y;
        const ow = pd.w, oh = pd.h;
        if(px + pw > ox && px < ox + ow && py + ph > oy && py < oy + oh){
          if(velY >= 0 && py + ph - velY*dt <= oy + 4){
            playerY = oy - ph;
            velY = 0;
            onGround = true;
            jumpsLeft = 1;
            if(!p.stepped){
              p.stepped = true;
              if(pd.disappear){ p.disappearTimer = 0.5; }
            }
            if(squishTimer <= 0){ squishY = 1.2; squishX = 0.85; squishTimer = 0.1; }
          }
        }
        // disappear countdown
        if(p.stepped && pd.disappear && p.disappearTimer > 0){
          p.disappearTimer -= dt;
          if(p.disappearTimer <= 0){ p.visible = false; }
        }
      }

      // ── fall into gap = death ─────────────────────────────────────────────
      if(playerY > GROUND_Y + 80){
        triggerDeath();
        return;
      }

      // ── star collection ───────────────────────────────────────────────────
      starState.forEach(s => {
        if(s.collected) return;
        const dx = playerX - s.def.x;
        const dy = (playerY + CUBE_SIZE/2) - s.def.y;
        if(Math.sqrt(dx*dx+dy*dy) < 30){
          s.collected = true;
          starsCollected++;
          onScore(starsCollected * 10);
          spawnParticles(k, s.def.x - cameraX, s.def.y, C.gold, 10);
          save = addStars(save, s.def.value * 5);
        }
      });

      // ── finish check ─────────────────────────────────────────────────────
      if(playerX >= finishX){ triggerFinish(); }
    });

    // ── drawing ──────────────────────────────────────────────────────────────
    k.onDraw(() => {
      const camX = cameraX;

      // ground / static blocks
      staticBlocks.forEach(obs => {
        const sx = obs.x - camX;
        if(sx > VW + 100 || sx + obs.w < -100) return;
        const col: [number,number,number] = obs.type === "block"
          ? levelDef.groundColor
          : levelDef.accentColor;
        drawRoundRect(k, sx, obs.y, obs.w, obs.h, 6, col);
        // top highlight
        k.drawRect({ pos: k.vec2(sx+4, obs.y+2), width: obs.w-8, height: 4,
          radius: 2, color: k.rgb(255,255,255), opacity: 0.15 });
      });

      // platforms
      platforms.forEach(p => {
        if(!p.visible) return;
        const pd = p.def;
        const sx = pd.x + (pd.moving ? p.offset : 0) - camX;
        if(sx > VW + 100 || sx + pd.w < -100) return;
        const alpha = pd.disappear && p.stepped ? Math.max(0.2, p.disappearTimer / 0.5) : 1;
        drawRoundRect(k, sx, pd.y, pd.w, pd.h, 6, levelDef.accentColor, alpha);
        k.drawRect({ pos: k.vec2(sx+4, pd.y+2), width: pd.w-8, height: 4,
          radius: 2, color: k.rgb(255,255,255), opacity: 0.25 * alpha });
      });

      // stars
      starState.forEach(s => {
        if(s.collected) return;
        const sx = s.def.x - camX;
        if(sx < -40 || sx > VW + 40) return;
        const bob = Math.sin(k.time()*3 + s.def.x)*5;
        k.drawText({ text: s.def.value > 1 ? "🌟" : "⭐",
          pos: k.vec2(sx, s.def.y + bob),
          size: 22, font:"sans-serif", anchor:"center", color: k.rgb(255,220,60) });
      });

      // finish flag
      const fx = finishX - camX;
      if(fx > -20 && fx < VW + 20){
        k.drawRect({ pos: k.vec2(fx, GROUND_Y - 120), width: 4, height: 120,
          color: k.rgb(...C.white) });
        k.drawRect({ pos: k.vec2(fx+4, GROUND_Y - 120), width: 32, height: 20,
          radius: 3, color: k.rgb(...C.green) });
        k.drawText({ text:"🏁", pos: k.vec2(fx+8, GROUND_Y-118),
          size: 16, font:"sans-serif", color: k.rgb(255,255,255) });
      }

      // cube
      if(!dead){
        const screenX = playerX - camX;
        drawCube(k, screenX, playerY + CUBE_SIZE/2, CUBE_SIZE,
          save.equippedColor, save.equippedFace, save.equippedCostume,
          squishY, squishX);
      }
    });

    // ── death ────────────────────────────────────────────────────────────────
    function triggerDeath(){
      if(dead) return;
      dead = true;
      save.totalDeaths++;
      writeSave(save);
      spawnParticles(k, playerX - cameraX, playerY, getColor(save.equippedColor).rgb, 16);
      k.wait(0.8, () => k.go("play", levelId));
    }

    // ── finish ───────────────────────────────────────────────────────────────
    function triggerFinish(){
      if(finished) return;
      finished = true;
      const elapsed = k.time() - startTime;
      const prevSave = save.levels[levelId] ?? { completed: false, stars: 0, bestTime: 999999 };
      const newStarCount = Math.min(3, starsCollected + (starsCollected >= levelDef.stars.length ? 1 : 0));
      const bonusStars = (newStarCount > (prevSave.stars ?? 0)) ? (newStarCount - (prevSave.stars ?? 0)) * 10 : 0;
      save = addStars(save, 20 + bonusStars + starsCollected * 5);
      save.levels[levelId] = {
        completed: true,
        stars: Math.max(prevSave.stars ?? 0, starsCollected),
        bestTime: Math.min(prevSave.bestTime ?? 999999, elapsed),
      };
      writeSave(save);
      onScore(starsCollected * 10 + 20);
      k.wait(0.3, () => k.go("levelcomplete", levelId, starsCollected, elapsed));
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE: LEVEL COMPLETE
  // ═══════════════════════════════════════════════════════════════════════════
  k.scene("levelcomplete", (levelId: string, starsGot: number, elapsed: number) => {
    save = loadSave();
    const lvl = LEVELS.find(l => l.id === levelId) ?? LEVELS[0]!;
    const nextIdx = LEVELS.findIndex(l => l.id === levelId) + 1;
    const nextLvl = nextIdx < LEVELS.length ? LEVELS[nextIdx] : null;

    addBgStars(k);
    spawnParticles(k, VW/2, VH/2, C.gold, 24);
    k.wait(0.3, () => spawnParticles(k, VW/3, VH/3, C.accent, 16));
    k.wait(0.6, () => spawnParticles(k, VW*2/3, VH*2/3, C.green, 16));

    k.add([k.text("Level Complete! 🎉", { size: 30, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 120)]);
    k.add([k.text(`${lvl.emoji} ${lvl.name}`, { size: 18, font:"sans-serif" }),
      k.color(...C.white), k.anchor("center"), k.pos(VW/2, 160)]);

    // star display
    const maxStars = lvl.stars.length;
    const starStr = Array.from({length: maxStars}, (_, i) => i < starsGot ? "⭐" : "☆").join(" ");
    k.add([k.text(starStr, { size: 32, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 210)]);

    k.add([k.text(`Time: ${elapsed.toFixed(1)}s`, { size: 16, font:"sans-serif" }),
      k.color(...C.dim), k.anchor("center"), k.pos(VW/2, 260)]);
    k.add([k.text(`Stars earned: +${20 + starsGot*5}`, { size: 16, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 290)]);
    k.add([k.text(`Total: ⭐ ${save.stars.toLocaleString()}`, { size: 18, font:"sans-serif" }),
      k.color(...C.gold), k.anchor("center"), k.pos(VW/2, 320)]);

    // cube preview
    k.onDraw(() => {
      drawCube(k, VW/2, 400, 60, save.equippedColor, save.equippedFace, save.equippedCostume,
        1 + Math.sin(k.time()*2)*0.06);
    });

    btn(k,"↩ Retry Level", VW/2, 490, 200, 44, C.panel, C.white,
      () => k.go("play", levelId));

    if(nextLvl){
      btn(k,`Next: ${nextLvl.emoji} ${nextLvl.name} →`, VW/2, 544, 240, 44, C.accent, C.white,
        () => k.go("play", nextLvl.id), 14);
    } else {
      k.add([k.text("🌈 You completed ALL levels! Amazing!", { size: 14, font:"sans-serif" }),
        k.color(...C.accent), k.anchor("center"), k.pos(VW/2, 544)]);
    }

    btn(k,"🏠 Menu", VW/2, 600, 160, 40, C.panel, C.dim, () => k.go("menu"), 13);
  });

  // ── start ──────────────────────────────────────────────────────────────────
  k.go("menu");
  return () => k.quit();
}

// ── utility ──────────────────────────────────────────────────────────────────
function flashMsg(k: K, msg: string){
  const t = k.add([k.text(msg, { size: 18, font:"sans-serif" }),
    k.color(255,255,255), k.anchor("center"), k.pos(VW/2, VH/2 - 40), k.opacity(1)]);
  const up = k.onUpdate(() => {
    t.opacity -= k.dt() * 1.5;
    t.pos.y -= k.dt() * 30;
    if(t.opacity <= 0){ k.destroy(t); up.cancel(); }
  });
}

function hexToRgb(hex: string): [number,number,number] {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r||0, g||0, b||0];
}
