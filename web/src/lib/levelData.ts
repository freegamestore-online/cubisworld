import type { LevelDef } from "../types";

// Helper to generate ground tiles for a level of given length
// Ground is at y=520 (out of 720 virtual height), 40px thick
// Returns obstacle defs for the ground + any gaps

function ground(length: number, gaps: Array<{x:number,w:number}> = []) {
  // We'll represent ground as a series of blocks
  const blocks = [];
  let cursor = 0;
  const sorted = [...gaps].sort((a,b) => a.x - b.x);
  for (const gap of sorted) {
    if (gap.x > cursor) {
      blocks.push({ type: "block" as const, x: cursor, y: 520, w: gap.x - cursor, h: 80 });
    }
    cursor = gap.x + gap.w;
  }
  if (cursor < length + 200) {
    blocks.push({ type: "block" as const, x: cursor, y: 520, w: length + 200 - cursor, h: 80 });
  }
  return blocks;
}

export const LEVELS: LevelDef[] = [
  // ─────────────────────────────────────────────
  // 1. Meadow Morning — tutorial, very easy
  // ─────────────────────────────────────────────
  {
    id: "meadow",
    name: "Meadow Morning",
    emoji: "🌱",
    bgColors: [[210, 240, 255], [180, 230, 200]],
    groundColor: [134, 195, 120],
    accentColor: [255, 220, 150],
    length: 3000,
    speed: 140,
    gravity: 900,
    bpm: 90,
    description: "A gentle meadow to learn the ropes. Jump over small obstacles!",
    stars: [
      { x: 500, y: 460, value: 1 },
      { x: 1200, y: 460, value: 1 },
      { x: 2100, y: 380, value: 3 },
    ],
    obstacles: [
      ...ground(3000, []),
      // small blocks to jump over
      { type: "block", x: 600, y: 480, w: 40, h: 40 },
      { type: "block", x: 900, y: 480, w: 40, h: 40 },
      { type: "block", x: 1300, y: 460, w: 40, h: 60 },
      { type: "block", x: 1700, y: 480, w: 40, h: 40 },
      { type: "block", x: 2000, y: 480, w: 40, h: 40 },
      { type: "block", x: 2000, y: 440, w: 40, h: 40 }, // stacked
      { type: "block", x: 2400, y: 480, w: 40, h: 40 },
      { type: "block", x: 2700, y: 480, w: 40, h: 40 },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. Flower Path — basic obstacles + tiny gaps
  // ─────────────────────────────────────────────
  {
    id: "flower",
    name: "Flower Path",
    emoji: "🌼",
    bgColors: [[255, 240, 220], [255, 210, 180]],
    groundColor: [210, 180, 120],
    accentColor: [255, 160, 200],
    length: 3500,
    speed: 155,
    gravity: 920,
    bpm: 100,
    description: "Flowers line the path. Watch for small gaps!",
    stars: [
      { x: 700, y: 460, value: 1 },
      { x: 1600, y: 460, value: 1 },
      { x: 2800, y: 340, value: 3 },
    ],
    obstacles: [
      ...ground(3500, [
        { x: 800, w: 80 },
        { x: 1800, w: 80 },
        { x: 2600, w: 100 },
      ]),
      { type: "block", x: 500, y: 480, w: 40, h: 40 },
      { type: "block", x: 1100, y: 480, w: 40, h: 40 },
      { type: "block", x: 1400, y: 460, w: 40, h: 60 },
      { type: "block", x: 2100, y: 480, w: 40, h: 40 },
      { type: "block", x: 2300, y: 480, w: 40, h: 40 },
      { type: "block", x: 2900, y: 440, w: 40, h: 80 },
      { type: "block", x: 3100, y: 480, w: 40, h: 40 },
      // platform for secret star
      { type: "platform", x: 2700, y: 360, w: 120, h: 20 },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. Forest Breeze — faster speed
  // ─────────────────────────────────────────────
  {
    id: "forest",
    name: "Forest Breeze",
    emoji: "🌳",
    bgColors: [[140, 200, 140], [80, 150, 100]],
    groundColor: [90, 130, 70],
    accentColor: [200, 240, 180],
    length: 4000,
    speed: 175,
    gravity: 940,
    bpm: 110,
    description: "The forest speeds you up! Tighter timing needed.",
    stars: [
      { x: 600, y: 460, value: 1 },
      { x: 1800, y: 460, value: 1 },
      { x: 3200, y: 320, value: 3 },
    ],
    obstacles: [
      ...ground(4000, [
        { x: 700, w: 100 },
        { x: 1500, w: 100 },
        { x: 2500, w: 120 },
        { x: 3400, w: 100 },
      ]),
      { type: "block", x: 450, y: 480, w: 40, h: 40 },
      { type: "block", x: 900, y: 460, w: 40, h: 60 },
      { type: "block", x: 1200, y: 480, w: 40, h: 40 },
      { type: "block", x: 1700, y: 480, w: 40, h: 40 },
      { type: "block", x: 2100, y: 460, w: 40, h: 60 },
      { type: "block", x: 2300, y: 480, w: 40, h: 40 },
      { type: "block", x: 2800, y: 480, w: 40, h: 40 },
      { type: "block", x: 3000, y: 460, w: 40, h: 60 },
      { type: "block", x: 3600, y: 480, w: 40, h: 40 },
      { type: "block", x: 3800, y: 480, w: 40, h: 40 },
      { type: "platform", x: 3100, y: 340, w: 100, h: 20 },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. Mushroom Hollow — moving platforms
  // ─────────────────────────────────────────────
  {
    id: "mushroom",
    name: "Mushroom Hollow",
    emoji: "🍄",
    bgColors: [[80, 60, 120], [140, 80, 160]],
    groundColor: [160, 100, 60],
    accentColor: [255, 180, 100],
    length: 4500,
    speed: 170,
    gravity: 950,
    bpm: 108,
    description: "Platforms drift through the hollow. Time your leaps!",
    stars: [
      { x: 800, y: 420, value: 1 },
      { x: 2200, y: 380, value: 1 },
      { x: 3800, y: 300, value: 3 },
    ],
    obstacles: [
      ...ground(4500, [
        { x: 600, w: 160 },
        { x: 1200, w: 160 },
        { x: 2000, w: 180 },
        { x: 3000, w: 200 },
        { x: 3800, w: 160 },
      ]),
      // moving platforms over gaps
      { type: "platform", x: 640, y: 440, w: 100, h: 20, moving: true, moveRange: 60, moveSpeed: 60 },
      { type: "platform", x: 1240, y: 420, w: 100, h: 20, moving: true, moveRange: 70, moveSpeed: 65 },
      { type: "platform", x: 2040, y: 400, w: 100, h: 20, moving: true, moveRange: 80, moveSpeed: 70 },
      { type: "platform", x: 3040, y: 380, w: 100, h: 20, moving: true, moveRange: 90, moveSpeed: 75 },
      { type: "platform", x: 3840, y: 420, w: 100, h: 20, moving: true, moveRange: 60, moveSpeed: 80 },
      { type: "block", x: 400, y: 480, w: 40, h: 40 },
      { type: "block", x: 900, y: 460, w: 40, h: 60 },
      { type: "block", x: 1600, y: 480, w: 40, h: 40 },
      { type: "block", x: 2600, y: 460, w: 40, h: 60 },
      { type: "block", x: 4200, y: 480, w: 40, h: 40 },
      { type: "platform", x: 3700, y: 320, w: 80, h: 20 },
    ],
  },

  // ─────────────────────────────────────────────
  // 5. Moonlit Garden — gravity shifts
  // ─────────────────────────────────────────────
  {
    id: "moonlit",
    name: "Moonlit Garden",
    emoji: "🌙",
    bgColors: [[20, 30, 80], [60, 20, 100]],
    groundColor: [50, 40, 90],
    accentColor: [180, 160, 255],
    length: 5000,
    speed: 180,
    gravity: 700, // lower gravity = floatier jumps
    bpm: 105,
    description: "The moon's magic makes you float. Adjust to lighter gravity!",
    stars: [
      { x: 900, y: 400, value: 1 },
      { x: 2500, y: 340, value: 1 },
      { x: 4200, y: 280, value: 3 },
    ],
    obstacles: [
      ...ground(5000, [
        { x: 700, w: 140 },
        { x: 1400, w: 160 },
        { x: 2200, w: 180 },
        { x: 3100, w: 200 },
        { x: 4000, w: 180 },
        { x: 4600, w: 140 },
      ]),
      { type: "platform", x: 740, y: 460, w: 80, h: 20, moving: true, moveRange: 50, moveSpeed: 55 },
      { type: "platform", x: 1440, y: 440, w: 80, h: 20, moving: true, moveRange: 60, moveSpeed: 60 },
      { type: "platform", x: 2240, y: 420, w: 80, h: 20, moving: true, moveRange: 70, moveSpeed: 65 },
      { type: "platform", x: 3140, y: 400, w: 80, h: 20, moving: true, moveRange: 80, moveSpeed: 70 },
      { type: "platform", x: 4040, y: 380, w: 80, h: 20, moving: true, moveRange: 70, moveSpeed: 65 },
      { type: "platform", x: 4640, y: 440, w: 80, h: 20, moving: true, moveRange: 50, moveSpeed: 60 },
      { type: "block", x: 500, y: 480, w: 40, h: 40 },
      { type: "block", x: 1100, y: 460, w: 40, h: 60 },
      { type: "block", x: 1800, y: 480, w: 40, h: 40 },
      { type: "block", x: 2700, y: 460, w: 40, h: 60 },
      { type: "block", x: 3500, y: 480, w: 40, h: 40 },
      { type: "block", x: 4800, y: 480, w: 40, h: 40 },
      { type: "platform", x: 4100, y: 300, w: 80, h: 20 },
    ],
  },

  // ─────────────────────────────────────────────
  // 6. Cloudy Skies — disappearing platforms
  // ─────────────────────────────────────────────
  {
    id: "cloudy",
    name: "Cloudy Skies",
    emoji: "☁️",
    bgColors: [[200, 220, 255], [160, 200, 240]],
    groundColor: [180, 200, 230],
    accentColor: [255, 255, 255],
    length: 5500,
    speed: 185,
    gravity: 960,
    bpm: 115,
    description: "Clouds vanish beneath your feet — don't linger!",
    stars: [
      { x: 1000, y: 420, value: 1 },
      { x: 2800, y: 360, value: 1 },
      { x: 4800, y: 280, value: 3 },
    ],
    obstacles: [
      ...ground(5500, [
        { x: 500, w: 200 },
        { x: 1000, w: 200 },
        { x: 1600, w: 200 },
        { x: 2400, w: 220 },
        { x: 3200, w: 220 },
        { x: 4000, w: 240 },
        { x: 4800, w: 200 },
      ]),
      // disappearing platforms
      { type: "platform", x: 540, y: 450, w: 120, h: 20, disappear: true },
      { type: "platform", x: 1040, y: 440, w: 120, h: 20, disappear: true },
      { type: "platform", x: 1640, y: 430, w: 120, h: 20, disappear: true },
      { type: "platform", x: 2440, y: 420, w: 120, h: 20, disappear: true },
      { type: "platform", x: 3240, y: 410, w: 120, h: 20, disappear: true },
      { type: "platform", x: 4040, y: 400, w: 120, h: 20, disappear: true },
      { type: "platform", x: 4840, y: 420, w: 120, h: 20, disappear: true },
      { type: "block", x: 400, y: 480, w: 40, h: 40 },
      { type: "block", x: 1300, y: 460, w: 40, h: 60 },
      { type: "block", x: 2100, y: 480, w: 40, h: 40 },
      { type: "block", x: 3000, y: 460, w: 40, h: 60 },
      { type: "block", x: 3700, y: 480, w: 40, h: 40 },
      { type: "block", x: 5100, y: 480, w: 40, h: 40 },
      { type: "platform", x: 4700, y: 300, w: 80, h: 20 },
    ],
  },

  // ─────────────────────────────────────────────
  // 7. Cozy Snowfall — fast sections
  // ─────────────────────────────────────────────
  {
    id: "snowfall",
    name: "Cozy Snowfall",
    emoji: "❄️",
    bgColors: [[200, 230, 255], [240, 248, 255]],
    groundColor: [220, 235, 255],
    accentColor: [180, 210, 255],
    length: 6000,
    speed: 200,
    gravity: 980,
    bpm: 125,
    description: "Snow speeds everything up! Fast reflexes required.",
    stars: [
      { x: 1100, y: 440, value: 1 },
      { x: 3000, y: 380, value: 1 },
      { x: 5200, y: 300, value: 3 },
    ],
    obstacles: [
      ...ground(6000, [
        { x: 600, w: 120 },
        { x: 1000, w: 140 },
        { x: 1600, w: 160 },
        { x: 2200, w: 160 },
        { x: 2900, w: 180 },
        { x: 3700, w: 180 },
        { x: 4500, w: 200 },
        { x: 5300, w: 180 },
      ]),
      { type: "platform", x: 640, y: 460, w: 80, h: 20, moving: true, moveRange: 40, moveSpeed: 90 },
      { type: "platform", x: 1040, y: 450, w: 80, h: 20, moving: true, moveRange: 50, moveSpeed: 95 },
      { type: "platform", x: 1640, y: 440, w: 80, h: 20, moving: true, moveRange: 60, moveSpeed: 100 },
      { type: "platform", x: 2240, y: 430, w: 80, h: 20, moving: true, moveRange: 70, moveSpeed: 100 },
      { type: "platform", x: 2940, y: 420, w: 80, h: 20, disappear: true },
      { type: "platform", x: 3740, y: 410, w: 80, h: 20, disappear: true },
      { type: "platform", x: 4540, y: 400, w: 80, h: 20, disappear: true },
      { type: "platform", x: 5340, y: 420, w: 80, h: 20, moving: true, moveRange: 60, moveSpeed: 110 },
      { type: "block", x: 400, y: 480, w: 40, h: 40 },
      { type: "block", x: 800, y: 460, w: 40, h: 60 },
      { type: "block", x: 1300, y: 480, w: 40, h: 40 },
      { type: "block", x: 1900, y: 460, w: 40, h: 60 },
      { type: "block", x: 2600, y: 480, w: 40, h: 40 },
      { type: "block", x: 3400, y: 460, w: 40, h: 60 },
      { type: "block", x: 4200, y: 480, w: 40, h: 40 },
      { type: "block", x: 5000, y: 460, w: 40, h: 60 },
      { type: "block", x: 5700, y: 480, w: 40, h: 40 },
      { type: "platform", x: 5100, y: 320, w: 80, h: 20 },
    ],
  },

  // ─────────────────────────────────────────────
  // 8. Starry Night — precise timing
  // ─────────────────────────────────────────────
  {
    id: "starry",
    name: "Starry Night",
    emoji: "🌌",
    bgColors: [[10, 10, 50], [30, 10, 80]],
    groundColor: [30, 30, 80],
    accentColor: [255, 240, 100],
    length: 6500,
    speed: 210,
    gravity: 1000,
    bpm: 128,
    description: "Stars guide your path. Pixel-perfect jumps needed!",
    stars: [
      { x: 1200, y: 420, value: 1 },
      { x: 3400, y: 360, value: 1 },
      { x: 5800, y: 280, value: 3 },
    ],
    obstacles: [
      ...ground(6500, [
        { x: 500, w: 180 },
        { x: 900, w: 180 },
        { x: 1400, w: 200 },
        { x: 2000, w: 200 },
        { x: 2700, w: 220 },
        { x: 3500, w: 220 },
        { x: 4300, w: 240 },
        { x: 5100, w: 220 },
        { x: 5900, w: 200 },
      ]),
      { type: "platform", x: 540, y: 460, w: 80, h: 20, moving: true, moveRange: 40, moveSpeed: 100 },
      { type: "platform", x: 940, y: 450, w: 70, h: 20, moving: true, moveRange: 50, moveSpeed: 110 },
      { type: "platform", x: 1440, y: 440, w: 70, h: 20, disappear: true },
      { type: "platform", x: 2040, y: 430, w: 70, h: 20, disappear: true },
      { type: "platform", x: 2740, y: 420, w: 70, h: 20, moving: true, moveRange: 60, moveSpeed: 115 },
      { type: "platform", x: 3540, y: 410, w: 70, h: 20, disappear: true },
      { type: "platform", x: 4340, y: 400, w: 70, h: 20, moving: true, moveRange: 70, moveSpeed: 120 },
      { type: "platform", x: 5140, y: 410, w: 70, h: 20, disappear: true },
      { type: "platform", x: 5940, y: 420, w: 70, h: 20, moving: true, moveRange: 60, moveSpeed: 115 },
      { type: "block", x: 350, y: 480, w: 40, h: 40 },
      { type: "block", x: 700, y: 460, w: 40, h: 60 },
      { type: "block", x: 1150, y: 480, w: 40, h: 40 },
      { type: "block", x: 1700, y: 460, w: 40, h: 60 },
      { type: "block", x: 2400, y: 480, w: 40, h: 40 },
      { type: "block", x: 3100, y: 460, w: 40, h: 60 },
      { type: "block", x: 3900, y: 480, w: 40, h: 40 },
      { type: "block", x: 4700, y: 460, w: 40, h: 60 },
      { type: "block", x: 5500, y: 480, w: 40, h: 40 },
      { type: "block", x: 6200, y: 460, w: 40, h: 60 },
      { type: "platform", x: 5700, y: 300, w: 80, h: 20 },
    ],
  },

  // ─────────────────────────────────────────────
  // 9. Dreamland — very difficult combos
  // ─────────────────────────────────────────────
  {
    id: "dreamland",
    name: "Dreamland",
    emoji: "✨",
    bgColors: [[80, 40, 120], [200, 100, 200]],
    groundColor: [100, 60, 140],
    accentColor: [255, 200, 255],
    length: 7000,
    speed: 220,
    gravity: 1020,
    bpm: 132,
    description: "Dreams twist reality. Master everything you've learned!",
    stars: [
      { x: 1300, y: 400, value: 1 },
      { x: 3800, y: 340, value: 1 },
      { x: 6200, y: 260, value: 3 },
    ],
    obstacles: [
      ...ground(7000, [
        { x: 450, w: 200 },
        { x: 850, w: 200 },
        { x: 1350, w: 220 },
        { x: 1900, w: 220 },
        { x: 2600, w: 240 },
        { x: 3400, w: 240 },
        { x: 4200, w: 260 },
        { x: 5000, w: 240 },
        { x: 5800, w: 220 },
        { x: 6400, w: 220 },
      ]),
      { type: "platform", x: 490, y: 460, w: 70, h: 20, moving: true, moveRange: 50, moveSpeed: 110 },
      { type: "platform", x: 890, y: 450, w: 65, h: 20, disappear: true },
      { type: "platform", x: 1390, y: 440, w: 65, h: 20, moving: true, moveRange: 60, moveSpeed: 120 },
      { type: "platform", x: 1940, y: 430, w: 65, h: 20, disappear: true },
      { type: "platform", x: 2640, y: 420, w: 65, h: 20, moving: true, moveRange: 70, moveSpeed: 125 },
      { type: "platform", x: 3440, y: 410, w: 65, h: 20, disappear: true },
      { type: "platform", x: 4240, y: 400, w: 65, h: 20, moving: true, moveRange: 80, moveSpeed: 130 },
      { type: "platform", x: 5040, y: 410, w: 65, h: 20, disappear: true },
      { type: "platform", x: 5840, y: 420, w: 65, h: 20, moving: true, moveRange: 70, moveSpeed: 125 },
      { type: "platform", x: 6440, y: 430, w: 65, h: 20, disappear: true },
      { type: "block", x: 300, y: 480, w: 40, h: 40 },
      { type: "block", x: 650, y: 460, w: 40, h: 60 },
      { type: "block", x: 1100, y: 480, w: 40, h: 40 },
      { type: "block", x: 1600, y: 460, w: 40, h: 60 },
      { type: "block", x: 2200, y: 480, w: 40, h: 40 },
      { type: "block", x: 3000, y: 460, w: 40, h: 60 },
      { type: "block", x: 3700, y: 480, w: 40, h: 40 },
      { type: "block", x: 4500, y: 460, w: 40, h: 60 },
      { type: "block", x: 5300, y: 480, w: 40, h: 40 },
      { type: "block", x: 6100, y: 460, w: 40, h: 60 },
      { type: "block", x: 6700, y: 480, w: 40, h: 40 },
      { type: "platform", x: 6100, y: 280, w: 80, h: 20 },
    ],
  },

  // ─────────────────────────────────────────────
  // 10. Cozy Chaos — hardest level
  // ─────────────────────────────────────────────
  {
    id: "chaos",
    name: "Cozy Chaos",
    emoji: "🌈",
    bgColors: [[255, 100, 150], [100, 150, 255]],
    groundColor: [200, 100, 200],
    accentColor: [255, 255, 100],
    length: 8000,
    speed: 235,
    gravity: 1040,
    bpm: 140,
    description: "Pure cozy chaos. Only the best make it through!",
    stars: [
      { x: 1500, y: 380, value: 1 },
      { x: 4200, y: 320, value: 1 },
      { x: 7200, y: 240, value: 3 },
    ],
    obstacles: [
      ...ground(8000, [
        { x: 400, w: 220 },
        { x: 800, w: 220 },
        { x: 1300, w: 240 },
        { x: 1900, w: 240 },
        { x: 2600, w: 260 },
        { x: 3400, w: 260 },
        { x: 4200, w: 280 },
        { x: 5000, w: 260 },
        { x: 5800, w: 240 },
        { x: 6500, w: 240 },
        { x: 7200, w: 220 },
        { x: 7700, w: 220 },
      ]),
      { type: "platform", x: 440, y: 460, w: 60, h: 20, moving: true, moveRange: 60, moveSpeed: 130 },
      { type: "platform", x: 840, y: 450, w: 60, h: 20, disappear: true },
      { type: "platform", x: 1340, y: 440, w: 60, h: 20, moving: true, moveRange: 70, moveSpeed: 135 },
      { type: "platform", x: 1940, y: 430, w: 60, h: 20, disappear: true },
      { type: "platform", x: 2640, y: 420, w: 60, h: 20, moving: true, moveRange: 80, moveSpeed: 140 },
      { type: "platform", x: 3440, y: 410, w: 60, h: 20, disappear: true },
      { type: "platform", x: 4240, y: 400, w: 60, h: 20, moving: true, moveRange: 90, moveSpeed: 145 },
      { type: "platform", x: 5040, y: 410, w: 60, h: 20, disappear: true },
      { type: "platform", x: 5840, y: 420, w: 60, h: 20, moving: true, moveRange: 80, moveSpeed: 140 },
      { type: "platform", x: 6540, y: 430, w: 60, h: 20, disappear: true },
      { type: "platform", x: 7240, y: 440, w: 60, h: 20, moving: true, moveRange: 70, moveSpeed: 135 },
      { type: "platform", x: 7740, y: 450, w: 60, h: 20, disappear: true },
      { type: "block", x: 250, y: 480, w: 40, h: 40 },
      { type: "block", x: 600, y: 460, w: 40, h: 60 },
      { type: "block", x: 1050, y: 480, w: 40, h: 40 },
      { type: "block", x: 1600, y: 460, w: 40, h: 60 },
      { type: "block", x: 2200, y: 480, w: 40, h: 40 },
      { type: "block", x: 3000, y: 460, w: 40, h: 60 },
      { type: "block", x: 3700, y: 480, w: 40, h: 40 },
      { type: "block", x: 4500, y: 460, w: 40, h: 60 },
      { type: "block", x: 5300, y: 480, w: 40, h: 40 },
      { type: "block", x: 6100, y: 460, w: 40, h: 60 },
      { type: "block", x: 6800, y: 480, w: 40, h: 40 },
      { type: "block", x: 7500, y: 460, w: 40, h: 60 },
      { type: "platform", x: 7100, y: 260, w: 80, h: 20 },
    ],
  },
];
