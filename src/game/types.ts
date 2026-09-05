export type RaceId = "human" | "lesovik" | "vodyanoy" | "kostyanoy" | "zharkrovny";
export type ClassId = "warrior" | "volkhv" | "archer" | "tracker" | "rogue" | "bonesetter";
export type EquipSlot = "head" | "body" | "hands" | "legs" | "rightHand" | "leftHand";
export type HexType =
  | "forest"
  | "swamp"
  | "ruins"
  | "village"
  | "field"
  | "mound"
  | "river"
  | "tavern"
  | "market"
  | "kapishche"
  | "city"
  | "fog"
  | "nav"
  | "nav_gate"
  | "bonefield"
  | "eye"
  | "mill"
  | "sluice"
  | "forge"
  | "banya"
  | "trestle"
  | "dymoles"
  | "peat"
  | "shrine";
export type Dir = "nw" | "ne" | "e" | "se" | "sw" | "w";
export type Screen = "menu" | "create" | "lore" | "game";
export type Overlay = "none" | "stats" | "skills" | "levelup" | "shop" | "pause" | "ending";
export type EnemySpecial = "ignoreEven" | "reflect1" | "fogArmor" | "drain" | "poison" | "fear";
export type CombatPhase = "intro" | "enemy_roll" | "player_act" | "round_result" | "battle_end";
export type FxKind = "gold" | "item" | "win" | "lose" | "ok" | "fail" | "xp" | "hp" | "info";

export interface Stats {
  str: number;
  dex: number;
  int: number;
  end: number;
  luck: number;
  cha: number;
}

export type StatKey = keyof Stats;

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  slot: EquipSlot | "none";
  kind: "weapon" | "armor" | "consumable" | "treasure" | "quest";
  bonuses: Partial<Stats> & { armor?: number; attack?: number };
  value: number;
  healHp?: number;
  healMp?: number;
}

export interface Item {
  uid: string;
  defId: string;
}

export interface Equipment {
  head: Item | null;
  body: Item | null;
  hands: Item | null;
  legs: Item | null;
  rightHand: Item | null;
  leftHand: Item | null;
}

export interface SkillDef {
  id: string;
  name: string;
  description: string;
  mp: number;
  maxRank: number;
  combat: boolean;
  classReq?: ClassId;
  raceReq?: RaceId;
}

export interface Character {
  name: string;
  race: RaceId;
  class: ClassId;
  kitId: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  stats: Stats;
  unspentStat: number;
  unspentSkill: number;
  skills: Record<string, number>;
  inventory: (Item | null)[];
  equipment: Equipment;
  resists: { poison: number; fire: number };
}

export interface Hex {
  type: HexType;
  name: string;
  seed: number;
}

export interface Choice {
  id: string;
  text: string;
}

export interface Quest {
  id: string;
  title: string;
  intro: string;
  hexesLeft: number;
}

export interface FxItem {
  id: string;
  kind: FxKind;
  text: string;
}

export interface EnemyDef {
  id: string;
  name: string;
  description: string;
  portrait: string;
  specials: EnemySpecial[];
  minLevel: number;
  weight: number;
  navOnly?: boolean;
}

export interface CombatState {
  enemyId: string;
  enemyName: string;
  enemyPortrait: string;
  enemyLevel: number;
  enemySpecials: EnemySpecial[];
  enemyFlavor: string;
  round: number;
  phase: CombatPhase;
  enemyRolls: number[];
  playerRolls: number[];
  roundWinners: Array<"player" | "enemy" | "tie">;
  currentEnemyRoll: number | null;
  currentPlayerRoll: number | null;
  usedSkill: string | null;
  narrative: string;
  finished: boolean;
  victory: boolean | null;
}

export interface ShopState {
  stock: Item[];
  title: string;
}

export interface LogLine {
  id: string;
  text: string;
}

export const EQUIP_SLOTS: { id: EquipSlot; label: string }[] = [
  { id: "head", label: "Голова" },
  { id: "body", label: "Тело" },
  { id: "hands", label: "Руки" },
  { id: "legs", label: "Ноги" },
  { id: "rightHand", label: "Правая рука" },
  { id: "leftHand", label: "Левая рука" },
];

export const DIRS: { id: Dir; label: string; rotate: number }[] = [
  { id: "nw", label: "Вперёд-влево", rotate: -60 },
  { id: "ne", label: "Вперёд-вправо", rotate: 60 },
  { id: "e", label: "Вправо", rotate: 90 },
  { id: "se", label: "Назад-вправо", rotate: 120 },
  { id: "sw", label: "Назад-влево", rotate: -120 },
  { id: "w", label: "Влево", rotate: -90 },
];

export const STAT_LABEL: Record<StatKey, string> = {
  str: "Сила",
  dex: "Ловкость",
  int: "Интеллект",
  end: "Выносливость",
  luck: "Удача",
  cha: "Харизма",
};

export const INVENTORY_SIZE = 30;
export const DIE_SIDES = 30;
export const LUCK_DC = 21;
export const ACTIONS_PER_HEX = 2;
export const MIN_LAYER_HEXES = 50;
