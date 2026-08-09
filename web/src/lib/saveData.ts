import type { SaveData } from "../types";

const KEY = "cubiworld_save";

export const DEFAULT_SAVE: SaveData = {
  stars: 0,
  unlockedColors: ["pastel-blue", "pink"],
  unlockedFaces: ["happy"],
  unlockedCostumes: ["none"],
  equippedColor: "pastel-blue",
  equippedFace: "happy",
  equippedCostume: "none",
  levels: {},
  totalDeaths: 0,
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return { ...DEFAULT_SAVE, ...parsed };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full — ignore
  }
}

export function addStars(data: SaveData, amount: number): SaveData {
  const next = { ...data, stars: data.stars + amount };
  writeSave(next);
  return next;
}

export function spendStars(data: SaveData, amount: number): SaveData | null {
  if (data.stars < amount) return null;
  const next = { ...data, stars: data.stars - amount };
  writeSave(next);
  return next;
}

export function unlockItem(
  data: SaveData,
  category: "colors" | "faces" | "costumes",
  id: string
): SaveData {
  const key =
    category === "colors"
      ? "unlockedColors"
      : category === "faces"
      ? "unlockedFaces"
      : "unlockedCostumes";
  if (data[key].includes(id)) return data;
  const next = { ...data, [key]: [...data[key], id] };
  writeSave(next);
  return next;
}
