import {
  CLASS_STARTER_SKILL,
  CLASSES,
  ENEMIES,
  HEXES,
  ITEMS,
  KITS,
  LAYER_META,
  LOOT_COMMON,
  LOOT_RARE,
  LOOT_UNCOMMON,
  QUESTS,
  RACES,
  SKILLS,
  CLASS_WEAPONS,
  WILD_TYPES,
} from "./data";
import type {
  Character,
  ClassId,
  CombatState,
  Dir,
  Equipment,
  Hex,
  HexType,
  Item,
  Quest,
  RaceId,
  ShopState,
  Stats,
  StatKey,
} from "./types";
import { INVENTORY_SIZE, DIE_SIDES } from "./types";

export function uid(): string {
  return `i-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function rollDie(): number {
  return 1 + Math.floor(Math.random() * DIE_SIDES);
}

/** @deprecated use rollDie — kept so старые вызовы не падают */
export function rollD16(): number {
  return rollDie();
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function makeItem(defId: string): Item {
  return { uid: uid(), defId };
}

export function itemDef(item: Item | null | undefined) {
  if (!item) return null;
  return ITEMS[item.defId] ?? null;
}

export function xpToNext(level: number): number {
  return 36 + level * 28;
}

export function maxHpOf(stats: Stats, level: number, race: RaceId): number {
  const extra = race === "kostyanoy" ? 8 : 0;
  return 18 + stats.end * 3 + level * 4 + extra;
}

export function maxMpOf(stats: Stats, level: number, race: RaceId): number {
  const extra = race === "vodyanoy" ? 6 : 0;
  return 6 + stats.int * 2 + level * 2 + extra;
}

export function mergeStats(base: Stats, bonus: Partial<Stats>): Stats {
  return {
    str: base.str + (bonus.str ?? 0),
    dex: base.dex + (bonus.dex ?? 0),
    int: base.int + (bonus.int ?? 0),
    end: base.end + (bonus.end ?? 0),
    luck: base.luck + (bonus.luck ?? 0),
    cha: base.cha + (bonus.cha ?? 0),
  };
}

export function equipmentBonuses(eq: Equipment): Partial<Stats> & { armor: number; attack: number } {
  const out: Partial<Stats> & { armor: number; attack: number } = { armor: 0, attack: 0 };
  for (const slot of Object.values(eq)) {
    const def = itemDef(slot);
    if (!def) continue;
    out.armor += def.bonuses.armor ?? 0;
    out.attack += def.bonuses.attack ?? 0;
    (["str", "dex", "int", "end", "luck", "cha"] as StatKey[]).forEach((k) => {
      const v = def.bonuses[k];
      if (typeof v === "number") out[k] = (out[k] ?? 0) + v;
    });
  }
  return out;
}

export function totalStats(c: Character): Stats {
  return mergeStats(c.stats, equipmentBonuses(c.equipment));
}

export function attackStat(c: Character): number {
  const t = totalStats(c);
  const key = CLASSES[c.class].attack;
  const eq = equipmentBonuses(c.equipment);
  return t[key] + eq.attack;
}

export function armorOf(c: Character): number {
  return equipmentBonuses(c.equipment).armor;
}

export function createCharacter(race: RaceId, cls: ClassId, kitId: string, name: string): Character {
  const mapped: ClassId = cls === "archer" ? "tracker" : cls;
  const r = RACES[race];
  const cl = CLASSES[mapped];
  const kit = KITS.find((k) => k.id === kitId) ?? KITS.find((k) => k.classId === mapped)!;
  const stats = mergeStats(r.stats, cl.bonus);
  const inventory: (Item | null)[] = Array.from({ length: INVENTORY_SIZE }, () => null);
  const equipment: Equipment = {
    head: null,
    body: null,
    hands: null,
    legs: null,
    rightHand: null,
    leftHand: null,
  };
  for (const id of kit.items) {
    const def = ITEMS[id];
    if (!def) continue;
    const it = makeItem(id);
    if (def.slot !== "none" && equipment[def.slot] === null) equipment[def.slot] = it;
    else {
      const empty = inventory.findIndex((x) => x === null);
      if (empty >= 0) inventory[empty] = it;
    }
  }
  const level = kit.startLevel ?? 1;
  const maxHp = maxHpOf(stats, level, race);
  const maxMp = maxMpOf(stats, level, race);
  const skills: Record<string, number> = { [CLASS_STARTER_SKILL[mapped]]: 1 };
  if (race === "lesovik") skills.leshy_step = 1;
  if (race === "vodyanoy") skills.river_breath = 1;
  if (race === "zharkrovny") skills.blood_heat = 1;
  if (race === "kostyanoy") skills.bone_shell = 1;
  if (mapped === "tracker") skills.mokosh_gaze = 1;
  return {
    name: name.trim() || "Безымянный",
    race,
    class: mapped,
    kitId: kit.id,
    level,
    xp: 0,
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    gold: kit.gold,
    stats,
    unspentStat: 0,
    unspentSkill: 0,
    skills,
    inventory,
    equipment,
    resists: { ...r.resists },
  };
}

export function recalcVitals(c: Character): Character {
  const maxHp = maxHpOf(c.stats, c.level, c.race);
  const maxMp = maxMpOf(c.stats, c.level, c.race);
  return {
    ...c,
    maxHp,
    maxMp,
    hp: Math.min(c.hp, maxHp),
    mp: Math.min(c.mp, maxMp),
  };
}

export function addXp(c: Character, amount: number): Character {
  const race = RACES[c.race];
  let xp = c.xp + Math.round(amount * race.xpMult);
  let level = c.level;
  let unspentStat = c.unspentStat;
  let unspentSkill = c.unspentSkill;
  let stats = { ...c.stats };
  while (xp >= xpToNext(level) && level < 20) {
    xp -= xpToNext(level);
    level += 1;
    unspentStat += 3;
    unspentSkill += 1;
    stats = { ...stats, end: stats.end + 0 };
  }
  return recalcVitals({ ...c, xp, level, unspentStat, unspentSkill, stats });
}

export function firstEmptyInv(inv: (Item | null)[]): number {
  return inv.findIndex((x) => x === null);
}

export function giveItem(c: Character, defId: string): Character {
  const inv = [...c.inventory];
  const i = firstEmptyInv(inv);
  if (i < 0) return c;
  inv[i] = makeItem(defId);
  return { ...c, inventory: inv };
}

export function randomLoot(luck: number, layer: number, cls?: ClassId): string {
  if (cls && Math.random() < 0.34) {
    const w = CLASS_WEAPONS[cls];
    if (w?.length) return pick(w);
  }
  const roll = Math.random() + luck * 0.01 + layer * 0.03;
  if (roll > 0.92) return pick(LOOT_RARE);
  if (roll > 0.62) return pick(LOOT_UNCOMMON);
  return pick(LOOT_COMMON);
}

export function generateHex(
  layer: number,
  hexesThisLayer: number,
  goal: HexType,
  inNav: boolean,
): Hex {
  let type: HexType;
  if (inNav) {
    if (hexesThisLayer >= 3 && Math.random() < 0.18 + hexesThisLayer * 0.04) type = "nav_gate";
    else type = "nav";
  } else {
    if (hexesThisLayer === 0) {
      type = "kapishche";
    } else {
      const goalChance = hexesThisLayer < 4 ? 0 : Math.min(0.28, 0.05 + hexesThisLayer * 0.018);
      const roll = Math.random();
      if (roll < goalChance) type = goal;
      else if (roll < goalChance + 0.07) type = "tavern";
      else if (roll < goalChance + 0.13) type = "market";
      else type = pick(WILD_TYPES);
    }
  }
  const def = HEXES[type];
  return { type, name: def.name, seed: Math.floor(Math.random() * 1e9) };
}

export function hexText(hex: Hex): string {
  const texts = HEXES[hex.type].texts;
  return texts[hex.seed % texts.length]!;
}

export function isShopHex(type: HexType): boolean {
  return HEXES[type].shop;
}

export function pickQuest(hex: Hex, flags: Record<string, number>): Quest | null {
  if (HEXES[hex.type].shop) return null;
  if (hex.type === "kapishche" || hex.type === "city" || hex.type === "eye" || hex.type === "nav_gate")
    return null;
  const pool = QUESTS.filter((q) => (flags[`quest_${q.id}`] ?? 0) < 2);
  if (pool.length === 0) return null;
  const q = pick(pool);
  return {
    id: q.id,
    title: q.title,
    intro: q.intro,
    hexesLeft: 3,
  };
}

export function makeShop(layer: number, cha: number): ShopState {
  const n = 5 + Math.min(3, layer);
  const stock: Item[] = [];
  for (let i = 0; i < n; i++) {
    const id = randomLoot(cha, layer);
    stock.push(makeItem(id));
  }
  stock.push(makeItem("root"), makeItem("wort"));
  return { stock, title: "Торг" };
}

export function priceOf(defId: string, cha: number, bargainRank: number, selling: boolean): number {
  const def = ITEMS[defId];
  if (!def) return 0;
  const mod = 1 - cha * 0.015 - bargainRank * 0.05;
  if (selling) return Math.max(1, Math.floor(def.value * 0.45 * (2 - mod)));
  return Math.max(1, Math.ceil(def.value * Math.max(0.6, mod)));
}

export function pickEnemy(level: number, inNav: boolean): CombatState {
  const scaled = Math.min(10, Math.max(1, level));
  const pool = ENEMIES.filter((e) => e.minLevel <= scaled && (inNav ? true : !e.navOnly));
  const usable = pool.length ? pool : ENEMIES.filter((e) => !e.navOnly);
  const total = usable.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  let def = usable[0]!;
  for (const e of usable) {
    r -= e.weight;
    if (r <= 0) {
      def = e;
      break;
    }
  }
  const enemyLevel = Math.max(1, scaled + (Math.random() < 0.3 ? 1 : 0));
  return {
    enemyId: def.id,
    enemyName: def.name,
    enemyPortrait: def.portrait,
    enemyLevel,
    enemySpecials: [...def.specials],
    enemyFlavor: def.description,
    round: 1,
    phase: "intro",
    enemyRolls: [],
    playerRolls: [],
    roundWinners: [],
    currentEnemyRoll: null,
    currentPlayerRoll: null,
    usedSkill: null,
    narrative: `${def.name} выходит из тумана. ${def.description}`,
    finished: false,
    victory: null,
  };
}

export function enemyRoundBonus(c: CombatState): number {
  return 3 + c.enemyLevel + (c.enemySpecials.includes("fogArmor") ? 1 : 0);
}

export function playerRoundTotal(
  c: Character,
  raw: number,
  skillId: string | null,
  specials: CombatState["enemySpecials"],
  skillRanks: Record<string, number>,
): { total: number; notes: string[] } {
  const notes: string[] = [];
  let total = raw + attackStat(c);
  const rank = skillId ? skillRanks[skillId] ?? 1 : 0;
  if (skillId === "power_strike") {
    total += 3 + rank;
    notes.push("Мощный удар");
  }
  if (skillId === "aimed_shot") {
    total += 2 + rank;
    notes.push("Прицел");
  }
  if (skillId === "black_word") {
    total += totalStats(c).int + rank;
    notes.push("Чёрное слово");
  }
  if (skillId === "blood_heat") {
    total += totalStats(c).str + rank;
    notes.push("Жар крови");
  }
  if (specials.includes("fear") && skillId !== "black_word") {
    total -= 2;
    notes.push("страх");
  }
  if (specials.includes("ignoreEven") && skillId !== "aimed_shot" && total % 2 === 0) {
    notes.push("чётный удар рассеялся");
    total = Math.floor(total / 2);
  }
  return { total, notes };
}

export function compareRound(
  playerTotal: number,
  enemyTotal: number,
): "player" | "enemy" | "tie" {
  if (playerTotal > enemyTotal) return "player";
  if (enemyTotal > playerTotal) return "enemy";
  return "tie";
}

export function resolveBattle(c: CombatState): { wins: number; losses: number } {
  let wins = 0;
  let losses = 0;
  for (const w of c.roundWinners) {
    if (w === "player") wins += 1;
    if (w === "enemy") losses += 1;
  }
  return { wins, losses };
}

export function searchOdds(c: Character, hex: Hex): { fight: number; loot: number } {
  const t = totalStats(c);
  const gaze = c.skills.mokosh_gaze ?? 0;
  const leshy = c.skills.leshy_step ?? 0;
  let fight = 0.38;
  let loot = 0.28;
  if (hex.type === "forest" && (c.race === "lesovik" || leshy)) {
    fight -= 0.1 + leshy * 0.04;
    loot += 0.08;
  }
  if (c.class === "tracker") loot += 0.06;
  loot += gaze * 0.05 + t.luck * 0.01;
  fight = Math.max(0.12, fight);
  loot = Math.min(0.5, loot);
  return { fight, loot };
}

export function digChance(c: Character): number {
  const t = totalStats(c);
  const grave = c.skills.grave_sense ?? 0;
  return Math.min(0.45, 0.1 + t.luck * 0.012 + grave * 0.06);
}

export const DIRS_ORDER: Dir[] = ["nw", "ne", "e", "se", "sw", "w"];

export function skillUnlocked(c: Character, id: string): boolean {
  const def = SKILLS.find((s) => s.id === id);
  if (!def) return false;
  if (def.classReq && def.classReq !== c.class && !(c.skills[id] > 0)) return false;
  if (def.raceReq && def.raceReq !== c.race && !(c.skills[id] > 0)) return false;
  return true;
}

export function layerGoal(layer: number) {
  return LAYER_META[layer] ?? { name: "Бескрайнее", goal: "fog" as HexType, goalName: "Край Забвения" };
}

export function clampHpMp(c: Character): Character {
  return {
    ...c,
    hp: Math.max(0, Math.min(c.maxHp, c.hp)),
    mp: Math.max(0, Math.min(c.maxMp, c.mp)),
  };
}

export function applyStat(c: Character, key: StatKey): Character {
  if (c.unspentStat <= 0) return c;
  const stats = { ...c.stats, [key]: c.stats[key] + 1 };
  return recalcVitals({ ...c, stats, unspentStat: c.unspentStat - 1 });
}

export function applySkillPoint(c: Character, id: string): Character {
  if (c.unspentSkill <= 0) return c;
  const def = SKILLS.find((s) => s.id === id);
  if (!def) return c;
  const cur = c.skills[id] ?? 0;
  if (cur >= def.maxRank) return c;
  if (cur === 0 && def.classReq && def.classReq !== c.class) return c;
  if (cur === 0 && def.raceReq && def.raceReq !== c.race) return c;
  return { ...c, unspentSkill: c.unspentSkill - 1, skills: { ...c.skills, [id]: cur + 1 } };
}

export function canEquip(item: Item, slot: keyof Equipment): boolean {
  const def = itemDef(item);
  if (!def || def.slot === "none") return false;
  return def.slot === slot;
}

export function useConsumable(c: Character, uid: string): { character: Character; message: string } | null {
  const idx = c.inventory.findIndex((x) => x?.uid === uid);
  if (idx < 0) return null;
  const it = c.inventory[idx]!;
  const def = itemDef(it);
  if (!def || def.kind !== "consumable") return null;
  const inv = [...c.inventory];
  inv[idx] = null;
  let hp = c.hp + (def.healHp ?? 0);
  let mp = c.mp + (def.healMp ?? 0);
  const next = clampHpMp({ ...c, inventory: inv, hp, mp });
  const bits = [];
  if (def.healHp) bits.push(`+${def.healHp} здоровья`);
  if (def.healMp) bits.push(`+${def.healMp} маны`);
  return { character: next, message: `${def.name}: ${bits.join(", ")}.` };
}
