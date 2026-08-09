import type { CubeColor, CubeFace, CubeCostume } from "../types";

export const COLORS: CubeColor[] = [
  { id: "pastel-blue",  name: "Pastel Blue",  rgb: [162, 210, 255], rarity: "common",    price: 0,    unlocked: true  },
  { id: "pink",         name: "Cotton Pink",  rgb: [255, 182, 213], rarity: "common",    price: 0,    unlocked: true  },
  { id: "lavender",     name: "Lavender",     rgb: [200, 162, 255], rarity: "common",    price: 100,  unlocked: false },
  { id: "mint",         name: "Mint",         rgb: [162, 240, 200], rarity: "common",    price: 100,  unlocked: false },
  { id: "yellow",       name: "Lemon Drop",   rgb: [255, 238, 130], rarity: "common",    price: 100,  unlocked: false },
  { id: "peach",        name: "Peachy",       rgb: [255, 200, 162], rarity: "common",    price: 100,  unlocked: false },
  { id: "sky",          name: "Sky Dream",    rgb: [130, 220, 255], rarity: "uncommon",  price: 200,  unlocked: false },
  { id: "lilac",        name: "Lilac Mist",   rgb: [220, 180, 255], rarity: "uncommon",  price: 200,  unlocked: false },
  { id: "rose",         name: "Rose Gold",    rgb: [255, 160, 180], rarity: "rare",      price: 350,  unlocked: false },
  { id: "aqua",         name: "Aqua Glow",    rgb: [100, 230, 220], rarity: "rare",      price: 350,  unlocked: false },
  { id: "sunset",       name: "Sunset",       rgb: [255, 140, 100], rarity: "epic",      price: 600,  unlocked: false },
  { id: "galaxy",       name: "Galaxy",       rgb: [100, 80,  200], rarity: "legendary", price: 1200, unlocked: false },
];

export const FACES: CubeFace[] = [
  { id: "happy",    name: "Happy",       emoji: "😊", rarity: "common",    price: 0,    unlocked: true  },
  { id: "cool",     name: "Cool",        emoji: "😎", rarity: "common",    price: 150,  unlocked: false },
  { id: "sleepy",   name: "Sleepy",      emoji: "😴", rarity: "common",    price: 150,  unlocked: false },
  { id: "crying",   name: "Crying",      emoji: "😭", rarity: "common",    price: 150,  unlocked: false },
  { id: "angry",    name: "Grumpy",      emoji: "😡", rarity: "uncommon",  price: 250,  unlocked: false },
  { id: "starry",   name: "Starry-Eyed", emoji: "🤩", rarity: "uncommon",  price: 250,  unlocked: false },
  { id: "cute",     name: "Puppy Eyes",  emoji: "🥺", rarity: "uncommon",  price: 250,  unlocked: false },
  { id: "mischief", name: "Mischievous", emoji: "😈", rarity: "rare",      price: 450,  unlocked: false },
  { id: "robot",    name: "Robot",       emoji: "🤖", rarity: "rare",      price: 450,  unlocked: false },
  { id: "ghost",    name: "Ghost",       emoji: "👻", rarity: "epic",      price: 600,  unlocked: false },
  { id: "flower",   name: "Blossom",     emoji: "🌸", rarity: "epic",      price: 600,  unlocked: false },
  { id: "star",     name: "Star Face",   emoji: "⭐", rarity: "legendary", price: 1200, unlocked: false },
];

export const COSTUMES: CubeCostume[] = [
  { id: "none",        name: "None",          emoji: "✕",  rarity: "common",    price: 0,    unlocked: true  },
  { id: "bunny",       name: "Bunny Ears",    emoji: "🐰", rarity: "uncommon",  price: 250,  unlocked: false },
  { id: "tophat",      name: "Top Hat",       emoji: "🎩", rarity: "uncommon",  price: 250,  unlocked: false },
  { id: "bow",         name: "Ribbon Bow",    emoji: "🎀", rarity: "uncommon",  price: 250,  unlocked: false },
  { id: "cap",         name: "Cute Cap",      emoji: "🧢", rarity: "uncommon",  price: 300,  unlocked: false },
  { id: "flowercrown", name: "Flower Crown",  emoji: "🌸", rarity: "rare",      price: 400,  unlocked: false },
  { id: "crown",       name: "Royal Crown",   emoji: "👑", rarity: "rare",      price: 400,  unlocked: false },
  { id: "catears",     name: "Cat Ears",      emoji: "🐱", rarity: "rare",      price: 400,  unlocked: false },
  { id: "froghat",     name: "Frog Hat",      emoji: "🐸", rarity: "rare",      price: 450,  unlocked: false },
  { id: "scarf",       name: "Cozy Scarf",    emoji: "🧣", rarity: "epic",      price: 600,  unlocked: false },
  { id: "starhalo",    name: "Star Halo",     emoji: "⭐", rarity: "epic",      price: 800,  unlocked: false },
  { id: "mushroom",    name: "Mushroom Hat",  emoji: "🍄", rarity: "legendary", price: 1200, unlocked: false },
];

export const RARITY_COLORS: Record<string, string> = {
  common:    "#9ca3af",
  uncommon:  "#34d399",
  rare:      "#60a5fa",
  epic:      "#a78bfa",
  legendary: "#fbbf24",
};

export const RARITY_LABELS: Record<string, string> = {
  common:    "🌱 Common",
  uncommon:  "🌸 Uncommon",
  rare:      "✨ Rare",
  epic:      "🌟 Epic",
  legendary: "💫 Legendary",
};

export function getColor(id: string): CubeColor {
  return COLORS.find(c => c.id === id) ?? COLORS[0]!;
}
export function getFace(id: string): CubeFace {
  return FACES.find(f => f.id === id) ?? FACES[0]!;
}
export function getCostume(id: string): CubeCostume {
  return COSTUMES.find(c => c.id === id) ?? COSTUMES[0]!;
}
