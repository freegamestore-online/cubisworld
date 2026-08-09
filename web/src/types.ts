export interface CubeColor {
  id: string;
  name: string;
  rgb: [number, number, number];
  rarity: Rarity;
  price: number;
  unlocked: boolean;
}

export interface CubeFace {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  price: number;
  unlocked: boolean;
}

export interface CubeCostume {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  price: number;
  unlocked: boolean;
  drawFn?: string; // key for custom draw
}

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface PlayerConfig {
  colorId: string;
  faceId: string;
  costumeId: string;
}

export interface LevelSave {
  completed: boolean;
  stars: number; // 0-3
  bestTime: number;
}

export interface SaveData {
  stars: number;
  unlockedColors: string[];
  unlockedFaces: string[];
  unlockedCostumes: string[];
  equippedColor: string;
  equippedFace: string;
  equippedCostume: string;
  levels: Record<string, LevelSave>;
  totalDeaths: number;
}

export interface ObstacleDef {
  type: "block" | "spike" | "gap" | "platform" | "bounce";
  x: number;
  y: number;
  w: number;
  h: number;
  moving?: boolean;
  moveRange?: number;
  moveSpeed?: number;
  disappear?: boolean;
}

export interface StarDef {
  x: number;
  y: number;
  value: number; // 1 = normal, 3 = secret
}

export interface LevelDef {
  id: string;
  name: string;
  emoji: string;
  bgColors: [[number,number,number],[number,number,number]]; // top, bottom gradient
  groundColor: [number,number,number];
  accentColor: [number,number,number];
  length: number; // total level width in pixels
  speed: number; // base player speed
  gravity: number;
  obstacles: ObstacleDef[];
  stars: StarDef[];
  bpm: number;
  description: string;
}
