import { create } from "zustand";
import { QUESTS, HEXES, ITEMS, RACES } from "./data";
import type { QuestOutcome } from "./data";
import { sfxDice, sfxHit, sfxLose, sfxMove, sfxWin } from "./audio";
import {
  addXp,
  applySkillPoint,
  applyStat,
  armorOf,
  attackStat,
  canEquip,
  clampHpMp,
  compareRound,
  createCharacter,
  digChance,
  enemyRoundBonus,
  generateHex,
  giveItem,
  hexText,
  isShopHex,
  itemDef,
  layerGoal,
  makeShop,
  pick,
  pickEnemy,
  pickQuest,
  playerRoundTotal,
  priceOf,
  randomLoot,
  recalcVitals,
  resolveBattle,
  rollD16,
  searchOdds,
  totalStats,
  useConsumable,
} from "./systems";
import type {
  Character,
  Choice,
  ClassId,
  CombatState,
  Dir,
  EquipSlot,
  FxItem,
  FxKind,
  Hex,
  Item,
  Overlay,
  Quest,
  RaceId,
  Screen,
  ShopState,
  StatKey,
} from "./types";
import { STAT_LABEL, INVENTORY_SIZE } from "./types";

const SAVE_KEY = "tumannaya-zastava-v1";
const SAVE_KEYS = [SAVE_KEY, "oskолки-zabveniya-v1"];
const SAVE_VERSION = 1;
const TUTORIAL_KEY = "oz-tutorial-v2";

export interface PersistShape {
  version: number;
  screen: Screen;
  character: Character | null;
  hex: Hex;
  layer: number;
  returnLayer: number;
  hexesThisLayer: number;
  turn: number;
  actionsUsed: string[];
  narrative: string;
  choices: Choice[] | null;
  pendingQuest: Quest | null;
  flags: Record<string, number>;
  log: string[];
  shop: ShopState | null;
  inNav: boolean;
  endingSeen: boolean;
}

export interface GameStore extends PersistShape {
  overlay: Overlay;
  combat: CombatState | null;
  create: { race: RaceId | null; class: ClassId | null; kitId: string | null; name: string; step: number };
  hydrated: boolean;
  toast: string | null;
  fx: FxItem[];
  pulseUid: string | null;
  tutorialOpen: boolean;
  tutorialStep: number;
  luckPending: boolean;
  talkOpen: boolean;
  combatSkill: string | null;
  setScreen: (s: Screen) => void;
  setCreate: (p: Partial<GameStore["create"]>) => void;
  startNew: () => void;
  continueSave: () => void;
  persist: () => void;
  hydrate: () => void;
  toMenu: () => void;
  move: (dir: Dir) => void;
  doAction: (id: "search" | "dig" | "rest" | "quest") => void;
  resolveChoice: (id: string) => void;
  openOverlay: (o: Overlay) => void;
  spendStat: (k: StatKey) => void;
  spendSkill: (id: string) => void;
  moveItem: (from: { place: "inv" | EquipSlot; index?: number }, to: { place: "inv" | EquipSlot; index?: number }) => void;
  useItem: (uid: string) => void;
  buy: (uid: string) => void;
  sell: (uid: string) => void;
  startCombat: (forced?: CombatState) => void;
  combatEnemyRolled: (raw?: number) => void;
  combatPlayerAct: (skillId: string | null, raw?: number) => void;
  combatAckRound: () => void;
  combatFinish: () => void;
  selectCombatSkill: (id: string | null) => void;
  enterNav: () => void;
  leaveNav: () => void;
  setToast: (t: string | null) => void;
  pushFx: (kind: FxKind, text: string) => void;
  clearFx: (id: string) => void;
  finishLuck: (raw: number) => void;
  openTutorial: () => void;
  closeTutorial: () => void;
  tutorialNext: () => void;
}

function emptyHex(): Hex {
  return generateHex(0, 0, "kapishche", false);
}

function startNarrative(): string {
  return "Ты стоишь на клетке мира. Края пьёт туман. Шесть стрелок — шесть дорог. Выбери, куда идти.";
}

function fxId(): string {
  return `fx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeFx(kind: FxKind, text: string): FxItem {
  return { id: fxId(), kind, text };
}

function giveTracked(c: Character, defId: string): { character: Character; uid: string | null } {
  const before = new Set(c.inventory.filter(Boolean).map((i) => i!.uid));
  const character = giveItem(c, defId);
  const gained = character.inventory.find((i) => i && !before.has(i.uid));
  return { character, uid: gained?.uid ?? null };
}

const defaults = (): Omit<
  GameStore,
  | "setScreen"
  | "setCreate"
  | "startNew"
  | "continueSave"
  | "persist"
  | "hydrate"
  | "toMenu"
  | "move"
  | "doAction"
  | "resolveChoice"
  | "openOverlay"
  | "spendStat"
  | "spendSkill"
  | "moveItem"
  | "useItem"
  | "buy"
  | "sell"
  | "startCombat"
  | "combatEnemyRolled"
  | "combatPlayerAct"
  | "combatAckRound"
  | "combatFinish"
  | "selectCombatSkill"
  | "enterNav"
  | "leaveNav"
  | "setToast"
  | "pushFx"
  | "clearFx"
  | "finishLuck"
  | "openTutorial"
  | "closeTutorial"
  | "tutorialNext"
> => ({
  version: SAVE_VERSION,
  screen: "menu",
  character: null,
  hex: emptyHex(),
  layer: 0,
  returnLayer: 0,
  hexesThisLayer: 0,
  turn: 1,
  actionsUsed: [],
  narrative: startNarrative(),
  choices: null,
  pendingQuest: null,
  flags: {},
  log: [],
  shop: null,
  inNav: false,
  endingSeen: false,
  overlay: "none",
  combat: null,
  create: { race: null, class: null, kitId: null, name: "", step: 0 },
  hydrated: false,
  toast: null,
  fx: [],
  pulseUid: null,
  tutorialOpen: false,
  tutorialStep: 0,
  luckPending: false,
  talkOpen: false,
  combatSkill: null,
});

function fitInventory(inv: (Item | null)[] | undefined): (Item | null)[] {
  const kept = (inv ?? []).filter((x): x is Item => Boolean(x));
  const out: (Item | null)[] = Array.from({ length: INVENTORY_SIZE }, () => null);
  for (let i = 0; i < Math.min(kept.length, INVENTORY_SIZE); i++) out[i] = kept[i]!;
  return out;
}

function snapshot(s: GameStore): PersistShape {
  return {
    version: s.version,
    screen: s.screen === "create" ? "menu" : s.screen,
    character: s.character,
    hex: s.hex,
    layer: s.layer,
    returnLayer: s.returnLayer,
    hexesThisLayer: s.hexesThisLayer,
    turn: s.turn,
    actionsUsed: s.actionsUsed,
    narrative: s.narrative,
    choices: s.choices,
    pendingQuest: s.pendingQuest,
    flags: s.flags,
    log: s.log.slice(-40),
    shop: s.shop,
    inNav: s.inNav,
    endingSeen: s.endingSeen,
  };
}

function pushLog(log: string[], line: string): string[] {
  return [...log, line].slice(-40);
}

function delayedFlagText(flags: Record<string, number>, hexType: string): string {
  if (flags.helped_crone && hexType === "river" && !flags.crone_paid) {
    return " На отмели тебя ждут следы старухи и флакон. Слёзы водяного холодные, как обещание.";
  }
  if (flags.spared_warrior && hexType === "ruins" && !flags.warrior_return) {
    return " Из-за колонны выходит тот раненый — живой, почти. Кланяется и оставляет кольчугу. «Долг тяжелее раны.»";
  }
  if (flags.mocked_god && hexType === "field" && !flags.god_wrath) {
    return " Гром без туч бьёт в десяти шагах. Нищий бог напоминает о себе. Здоровье садится.";
  }
  if (flags.fed_child && hexType === "village" && !flags.child_gift) {
    return " На колодце — лента и хлеб, которого ты не оставлял. Кто-то помнит, что его кормили.";
  }
  if (flags.two_shadows && hexType === "fog") {
    return " Вторая тень уходит вперёд и возвращается: «Туда пока нельзя.»";
  }
  return "";
}

export const useGame = create<GameStore>((set, get) => {
  const addFx = (list: { kind: FxKind; text: string }[]) => {
    if (!list.length) return;
    set({ fx: [...get().fx, ...list.map((x) => makeFx(x.kind, x.text))] });
  };

  const applyOutcome = (outcome: QuestOutcome, extraGold = 0) => {
    const s = get();
    if (!s.pendingQuest || !s.character) return;
    let character = s.character;
    const flags = { ...s.flags, [`quest_${s.pendingQuest.id}`]: 1 };
    if (outcome.flag) flags[outcome.flag] = outcome.flagVal ?? 1;
    const goldDelta = (outcome.gold ?? 0) + extraGold;
    const fx: { kind: FxKind; text: string }[] = [];
    let pulseUid: string | null = s.pulseUid;
    if (goldDelta) {
      character = { ...character, gold: Math.max(0, character.gold + goldDelta) };
      fx.push({
        kind: "gold",
        text: goldDelta > 0 ? `Получено золото +${goldDelta}` : `Потрачено золото ${-goldDelta}`,
      });
    }
    if (outcome.hp) {
      character = clampHpMp({ ...character, hp: character.hp + outcome.hp });
      fx.push({ kind: "hp", text: outcome.hp > 0 ? `Здоровье +${outcome.hp}` : `Здоровье ${outcome.hp}` });
    }
    if (outcome.mp) character = clampHpMp({ ...character, mp: character.mp + outcome.mp });
    if (outcome.item) {
      const g = giveTracked(character, outcome.item);
      character = g.character;
      pulseUid = g.uid;
      fx.push({ kind: "item", text: `Получено: ${ITEMS[outcome.item]?.name ?? "вещь"}` });
    }
    if (outcome.xp) {
      character = addXp(character, outcome.xp);
      fx.push({ kind: "xp", text: `Опыт +${outcome.xp}` });
    }
    if (outcome.luck) character = { ...character, stats: { ...character.stats, luck: character.stats.luck + outcome.luck } };
    if (outcome.cha) character = { ...character, stats: { ...character.stats, cha: character.stats.cha + outcome.cha } };
    if (outcome.dex) character = { ...character, stats: { ...character.stats, dex: character.stats.dex + outcome.dex } };
    character = recalcVitals(character);
    set({
      character,
      flags,
      narrative: outcome.text,
      choices: null,
      pendingQuest: null,
      talkOpen: false,
      luckPending: false,
      pulseUid,
      fx: [...s.fx, ...fx.map((x) => makeFx(x.kind, x.text))],
      log: pushLog(s.log, s.pendingQuest.title),
    });
    if (character.hp <= 0) get().enterNav();
    else get().persist();
  };

  return {
    ...defaults(),

    setToast: (t) => {
      if (!t) {
        set({ toast: null });
        return;
      }
      set({ toast: t, fx: [...get().fx, makeFx("info", t)] });
    },
    pushFx: (kind, text) => set({ fx: [...get().fx, makeFx(kind, text)] }),
    clearFx: (id) => set({ fx: get().fx.filter((x) => x.id !== id) }),
    setScreen: (screen) => set({ screen }),
    setCreate: (p) => set({ create: { ...get().create, ...p } }),
    openOverlay: (overlay) => set({ overlay }),
    selectCombatSkill: (id) => set({ combatSkill: id }),
    openTutorial: () => set({ tutorialOpen: true, tutorialStep: 0 }),
    closeTutorial: () => {
      try {
        localStorage.setItem(TUTORIAL_KEY, "1");
      } catch {
        /* ignore */
      }
      set({ tutorialOpen: false });
    },
    tutorialNext: () => {
      const step = get().tutorialStep;
      if (step >= 6) {
        get().closeTutorial();
        return;
      }
      set({ tutorialStep: step + 1 });
    },

    persist: () => {
      try {
        const s = get();
        if (!s.character) return;
        localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot(s)));
        localStorage.setItem(SAVE_KEY + ":bak", JSON.stringify(snapshot(s)));
      } catch {
        /* ignore quota */
      }
    },

    hydrate: () => {
      if (get().hydrated) return;
      try {
        let raw: string | null = null;
        for (const k of SAVE_KEYS) {
          raw = localStorage.getItem(k);
          if (raw) break;
        }
        if (raw) {
          const data = JSON.parse(raw) as PersistShape;
          if (data?.version === SAVE_VERSION && data.character) {
            const cls = data.character.class === "archer" ? "tracker" : data.character.class;
            const character = {
              ...data.character,
              class: cls,
              inventory: fitInventory(data.character.inventory),
            };
            set({
              ...data,
              character,
              overlay: "none",
              combat: null,
              hydrated: true,
              screen: "menu",
              create: defaults().create,
              toast: null,
              fx: [],
              pulseUid: null,
              luckPending: false,
              talkOpen: false,
              combatSkill: null,
              tutorialOpen: false,
              tutorialStep: 0,
            });
            return;
          }
        }
      } catch {
        /* corrupt */
      }
      set({ hydrated: true });
    },

    continueSave: () => {
      const s = get();
      if (!s.character) return;
      set({ screen: "game", overlay: "none", combat: null });
    },

    toMenu: () => {
      get().persist();
      set({ screen: "menu", overlay: "none", combat: null });
    },

    startNew: () => {
      const { create } = get();
      if (!create.race || !create.class || !create.kitId) return;
      const character = createCharacter(create.race, create.class, create.kitId, create.name);
      const hex = generateHex(0, 0, "kapishche", false);
      const intro = `${hexText(hex)}\n\n${character.name}, ${RACES[character.race].name}. Цель слоя — Капище. Два действия, потом шаг стрелкой.`;
      const pending = Math.random() < 0.75 ? pickQuest(hex, {}) : null;
      let seen = true;
      try {
        seen = localStorage.getItem(TUTORIAL_KEY) === "1";
      } catch {
        seen = true;
      }
      set({
        ...defaults(),
        hydrated: true,
        screen: "game",
        character,
        hex,
        narrative: intro + (pending ? `\n\nКвест: ${pending.title}. ${pending.intro}` : ""),
        pendingQuest: pending,
        log: ["Путь начат."],
        tutorialOpen: !seen,
        tutorialStep: 0,
      });
      get().persist();
    },

    move: (dir: Dir) => {
      const s = get();
      if (!s.character || s.combat || s.choices || s.luckPending) return;
      sfxMove();
      const inNav = s.inNav;
      const goal = inNav ? "nav_gate" : layerGoal(s.layer).goal;
      const hexes = s.hexesThisLayer + 1;
      const hex = generateHex(s.layer, hexes, goal, inNav);
      let pending = s.pendingQuest
        ? { ...s.pendingQuest, hexesLeft: s.pendingQuest.hexesLeft - 1 }
        : null;
      if (pending && pending.hexesLeft <= 0) pending = null;
      if (!pending && Math.random() < 0.72) pending = pickQuest(hex, s.flags);

      let narrative = hexText(hex);
      const extra = delayedFlagText(s.flags, hex.type);
      const flags = { ...s.flags };
      let character = s.character;
      const fx: { kind: FxKind; text: string }[] = [];
      let pulseUid = s.pulseUid;

      if (extra.includes("Слёзы") && !flags.crone_paid) {
        flags.crone_paid = 1;
        const g = giveTracked(character, "tears");
        character = g.character;
        pulseUid = g.uid;
        fx.push({ kind: "item", text: "Получено: Слёзы водяного" });
      }
      if (extra.includes("кольчугу") && !flags.warrior_return) {
        flags.warrior_return = 1;
        const g = giveTracked(character, "mail_shard");
        character = g.character;
        pulseUid = g.uid;
        fx.push({ kind: "item", text: "Получено: Кольчужный обрывок" });
      }
      if (extra.includes("здоровье садится") && !flags.god_wrath) {
        flags.god_wrath = 1;
        character = clampHpMp({ ...character, hp: character.hp - 6 });
        fx.push({ kind: "fail", text: "Гнев бога: −6 здоровья" });
      }
      if (extra.includes("лента и хлеб") && !flags.child_gift) {
        flags.child_gift = 1;
        const g = giveTracked(character, "ribbon");
        character = g.character;
        pulseUid = g.uid;
        character = { ...character, gold: character.gold + 6 };
        fx.push({ kind: "item", text: "Получено: Выцветшая лента" }, { kind: "gold", text: "Получено золото +6" });
      }

      narrative += extra;
      if (pending) narrative += `\n\nКвест: ${pending.title}. ${pending.intro}`;

      let overlay: Overlay = "none";
      let layer = s.layer;
      let endingSeen = s.endingSeen;
      let shop: ShopState | null = isShopHex(hex.type) ? makeShop(layer, character.stats.cha) : null;

      if (hex.type === goal && !inNav) {
        const meta = layerGoal(layer);
        narrative += `\n\nТы находишь ${meta.goalName}. Слой «${meta.name}» пройден.`;
        if (layer >= 2) {
          overlay = "ending";
          endingSeen = true;
          narrative += " Око смотрит. Ты смотришь в ответ. Мир не стал целым — но его увидели. Этого хватает.";
          fx.push({ kind: "win", text: "Слой пройден" });
        } else {
          layer += 1;
          const next = layerGoal(layer);
          narrative += ` Дальше — ${next.goalName} (${next.name}).`;
          fx.push({ kind: "ok", text: `Цель: ${next.goalName}` });
        }
        character = clampHpMp({
          ...character,
          hp: character.hp + Math.floor(character.maxHp * 0.35),
          mp: character.mp + Math.floor(character.maxMp * 0.25),
        });
      }

      if (hex.type === "nav_gate" && inNav) {
        narrative += "\n\nВрата Яви открыты. Ты возвращаешься туда, откуда упал.";
        set({
          hex,
          narrative,
          inNav: false,
          layer: s.returnLayer,
          hexesThisLayer: 0,
          turn: s.turn + 1,
          actionsUsed: [],
          pendingQuest: null,
          choices: null,
          shop: null,
          talkOpen: false,
          luckPending: false,
          character: clampHpMp({
            ...character,
            hp: Math.max(1, Math.floor(character.maxHp * 0.45)),
            mp: Math.floor(character.maxMp * 0.4),
          }),
          fx: [...s.fx, makeFx("ok", "Возвращение из Нави"), ...fx.map((x) => makeFx(x.kind, x.text))],
          log: pushLog(s.log, "Возвращение из Нави."),
        });
        get().persist();
        return;
      }

      const log = pushLog(s.log, `${HEXES[hex.type].name}`);
      set({
        hex,
        hexesThisLayer: hex.type === goal && !inNav ? 0 : hexes,
        layer,
        turn: s.turn + 1,
        actionsUsed: [],
        narrative,
        pendingQuest: pending,
        choices: null,
        talkOpen: false,
        luckPending: false,
        flags,
        character,
        shop,
        overlay,
        endingSeen,
        log,
        pulseUid,
        fx: [...s.fx, ...fx.map((x) => makeFx(x.kind, x.text))],
      });
      get().persist();
    },

    doAction: (id) => {
      const s = get();
      if (!s.character || s.combat || s.choices || s.luckPending) return;
      if (s.actionsUsed.includes(id)) return;
      if (s.actionsUsed.length >= 2) return;
      if (id === "quest" && !s.pendingQuest) return;

      let character = s.character;
      let narrative = s.narrative;
      const flags = { ...s.flags };
      let combat: CombatState | null = null;
      const used = [...s.actionsUsed, id];
      const fx: { kind: FxKind; text: string }[] = [];
      let pulseUid = s.pulseUid;

      if (id === "search") {
        const odds = searchOdds(character, s.hex);
        const r = Math.random();
        if (r < odds.fight) {
          combat = { ...pickEnemy(character.level, s.inNav), phase: "enemy_roll" };
          narrative = "Поиск приводит не к кладу — к тому, кто тоже искал.";
        } else if (r < odds.fight + odds.loot) {
          const loot = randomLoot(character.stats.luck, s.layer);
          const g = giveTracked(character, loot);
          character = g.character;
          pulseUid = g.uid;
          const def = ITEMS[loot];
          narrative = `Нашёл: ${def?.name ?? "вещь"}.`;
          fx.push({ kind: "item", text: `Получено: ${def?.name ?? "вещь"}` });
        } else {
          narrative = pick([
            "Ничего. Только ветер.",
            "Следы есть, но чьи — уже не сказать.",
            "Клетка пуста. Можно идти дальше.",
          ]);
        }
      }

      if (id === "dig") {
        const chance = digChance(character);
        if (Math.random() < chance) {
          const loot = randomLoot(character.stats.luck + 2, s.layer);
          const gold = 4 + Math.floor(Math.random() * 12) + s.layer * 3;
          const g = giveTracked(character, loot);
          character = g.character;
          pulseUid = g.uid;
          character = { ...character, gold: character.gold + gold };
          narrative = `Клад: ${ITEMS[loot]?.name ?? "вещь"} и ${gold} золота.`;
          fx.push(
            { kind: "gold", text: `Получено золото +${gold}` },
            { kind: "item", text: `Получено: ${ITEMS[loot]?.name ?? "вещь"}` },
          );
        } else {
          narrative = pick(["Камни и земля. Клад не здесь.", "Яма по локоть. Пусто.", "Не повезло: 1 из 10 не выпало."]);
          fx.push({ kind: "fail", text: "Провал" });
          if (Math.random() < 0.12) {
            combat = { ...pickEnemy(character.level, s.inNav), phase: "enemy_roll" };
            narrative += " Из ямы поднимается то, что ты потревожил.";
          }
        }
      }

      if (id === "rest") {
        const hpGain = Math.max(4, Math.floor(character.maxHp * 0.3));
        const mpGain = Math.max(2, Math.floor(character.maxMp * 0.15));
        character = clampHpMp({ ...character, hp: character.hp + hpGain, mp: character.mp + mpGain });
        narrative = `Отдых. Здоровье +${hpGain}, мана +${mpGain}. Мана восстанавливается медленнее.`;
        fx.push({ kind: "hp", text: `Здоровье +${hpGain}` });
        if (Math.random() < 0.1) {
          combat = { ...pickEnemy(character.level, s.inNav), phase: "enemy_roll" };
          narrative += " Сон прерван: кто-то решил, что спящий — лёгкая добыча.";
        }
      }

      if (id === "quest" && s.pendingQuest) {
        const def = QUESTS.find((q) => q.id === s.pendingQuest?.id);
        if (!def) return;
        const tot = totalStats(s.character);
        const val = tot[def.checkStat];
        set({
          choices: [
            {
              id: "method_stat",
              text: `Проверить ${STAT_LABEL[def.checkStat]}: нужно ${def.checkDC}+ (у тебя ${val})`,
            },
            { id: "method_bribe", text: `Подкупить — ${def.bribeCost} золота` },
            { id: "method_luck", text: "Бросить кубик на удачу (нужно 21+)" },
            { id: "method_talk", text: "Поговорить" },
          ],
          narrative: `${s.pendingQuest.title}\n\n${s.pendingQuest.intro}\n\nКак поступишь?`,
          actionsUsed: used,
          talkOpen: false,
        });
        return;
      }

      set({
        character,
        narrative,
        flags,
        actionsUsed: used,
        combat,
        pulseUid,
        fx: [...s.fx, ...fx.map((x) => makeFx(x.kind, x.text))],
        log: pushLog(s.log, narrative.slice(0, 80)),
      });
      get().persist();
    },

    resolveChoice: (id: string) => {
      const s = get();
      if (!s.pendingQuest || !s.character) return;
      const def = QUESTS.find((q) => q.id === s.pendingQuest?.id);
      if (!def) return;

      if (id === "method_talk") {
        set({
          talkOpen: true,
          choices: def.talk.map((t) => ({ id: t.id, text: t.text })),
          narrative: `${def.title}\n\n${def.intro}\n\nЧто скажешь?`,
        });
        return;
      }

      if (id === "method_luck") {
        set({ luckPending: true, choices: null, talkOpen: false });
        addFx([{ kind: "info", text: "Нажми на кубик" }]);
        return;
      }

      if (id === "method_bribe") {
        if (s.character.gold < def.bribeCost) {
          addFx([{ kind: "fail", text: "Не хватает золота" }]);
          return;
        }
        addFx([{ kind: "ok", text: "Успех" }]);
        applyOutcome(def.outcomes.bribe, -def.bribeCost);
        return;
      }

      if (id === "method_stat") {
        const tot = totalStats(s.character);
        const ok = tot[def.checkStat] >= def.checkDC;
        addFx([{ kind: ok ? "ok" : "fail", text: ok ? "Успех" : "Провал" }]);
        applyOutcome(ok ? def.outcomes.statOk : def.outcomes.statFail);
        return;
      }

      const talk = def.outcomes.talk[id];
      if (talk) {
        applyOutcome(talk);
      }
    },

    finishLuck: (raw: number) => {
      const s = get();
      if (!s.pendingQuest || !s.character || !s.luckPending) return;
      const def = QUESTS.find((q) => q.id === s.pendingQuest?.id);
      if (!def) return;
      const total = raw + s.character.stats.luck;
      const ok = total >= 21;
      addFx([
        { kind: ok ? "ok" : "fail", text: ok ? `Успех: ${raw}+${s.character.stats.luck}=${total}` : `Провал: ${raw}+${s.character.stats.luck}=${total}` },
      ]);
      applyOutcome(ok ? def.outcomes.luckOk : def.outcomes.luckFail);
    },

    spendStat: (k) => {
      const c = get().character;
      if (!c) return;
      set({ character: applyStat(c, k) });
      get().persist();
    },

    spendSkill: (id) => {
      const c = get().character;
      if (!c) return;
      set({ character: applySkillPoint(c, id) });
      get().persist();
    },

    moveItem: (from, to) => {
      const c = get().character;
      if (!c) return;
      const inv = [...c.inventory];
      const eq = { ...c.equipment };
      const getAt = (ref: { place: "inv" | EquipSlot; index?: number }): Item | null => {
        if (ref.place === "inv") return inv[ref.index ?? -1] ?? null;
        return eq[ref.place];
      };
      const setAt = (ref: { place: "inv" | EquipSlot; index?: number }, it: Item | null) => {
        if (ref.place === "inv") {
          if (ref.index === undefined) return;
          inv[ref.index] = it;
        } else eq[ref.place] = it;
      };
      const dest =
        to.place === "inv" && (to.index === undefined || to.index < 0)
          ? to
          : to;
      if (dest.place === "inv" && (dest.index === undefined || dest.index < 0)) return;
      const a = getAt(from);
      const b = getAt(dest);
      if (!a) return;
      if (dest.place !== "inv" && !canEquip(a, dest.place)) return;
      if (b && from.place !== "inv" && !canEquip(b, from.place)) return;
      setAt(from, b);
      setAt(dest, a);
      set({ character: { ...c, inventory: inv, equipment: eq } });
      get().persist();
    },

    useItem: (itemUid: string) => {
      const c = get().character;
      if (!c) return;
      const r = useConsumable(c, itemUid);
      if (!r) return;
      set({
        character: r.character,
        toast: r.message,
        narrative: r.message,
        fx: [...get().fx, makeFx("ok", r.message)],
      });
      get().persist();
    },

    buy: (itemUid: string) => {
      const s = get();
      if (!s.character || !s.shop) return;
      const it = s.shop.stock.find((x) => x.uid === itemUid);
      if (!it) return;
      const price = priceOf(it.defId, s.character.stats.cha, s.character.skills.bargain ?? 0, false);
      if (s.character.gold < price) {
        addFx([{ kind: "fail", text: "Не хватает золота" }]);
        return;
      }
      let character = { ...s.character, gold: s.character.gold - price };
      const g = giveTracked(character, it.defId);
      character = g.character;
      const name = itemDef(it)?.name ?? "вещь";
      set({
        character,
        shop: { ...s.shop, stock: s.shop.stock.filter((x) => x.uid !== itemUid) },
        pulseUid: g.uid,
        fx: [...s.fx, makeFx("item", `Куплено: ${name}`), makeFx("gold", `Потрачено золото ${price}`)],
      });
      get().persist();
    },

    sell: (itemUid: string) => {
      const s = get();
      if (!s.character || !s.shop) return;
      const idx = s.character.inventory.findIndex((x) => x?.uid === itemUid);
      if (idx < 0) return;
      const it = s.character.inventory[idx]!;
      const price = priceOf(it.defId, s.character.stats.cha, s.character.skills.bargain ?? 0, true);
      const inv = [...s.character.inventory];
      inv[idx] = null;
      set({
        character: { ...s.character, inventory: inv, gold: s.character.gold + price },
        fx: [...s.fx, makeFx("gold", `Продано за ${price}`)],
      });
      get().persist();
    },

    startCombat: (forced) => {
      const s = get();
      if (!s.character) return;
      const combat = forced ?? pickEnemy(s.character.level, s.inNav);
      set({ combat: { ...combat, phase: "enemy_roll" }, overlay: "none", combatSkill: null });
    },

    combatEnemyRolled: (rawRoll) => {
      const s = get();
      if (!s.combat || s.combat.phase !== "enemy_roll") return;
      sfxDice();
      const raw = rawRoll ?? rollD16();
      const total = raw + enemyRoundBonus(s.combat);
      set({
        combat: {
          ...s.combat,
          currentEnemyRoll: total,
          enemyRolls: [...s.combat.enemyRolls, total],
          phase: "player_act",
          narrative: `${s.combat.enemyName} бросает кубик: ${raw}. С учётом силы — ${total}. Нажми свой кубик слева.`,
        },
      });
    },

    combatPlayerAct: (skillId, rawRoll) => {
      const s = get();
      if (!s.combat || !s.character || s.combat.phase !== "player_act") return;
      let character = s.character;
      if (skillId) {
        const from = character.skills[skillId] ?? 0;
        const defMp =
          skillId === "power_strike"
            ? 4
            : skillId === "aimed_shot"
              ? 4
              : skillId === "black_word"
                ? 6
                : skillId === "forest_shadow"
                  ? 3
                  : skillId === "bone_shell"
                    ? 5
                    : skillId === "ancestors_luck"
                      ? 4
                      : skillId === "blood_heat"
                        ? 4
                        : skillId === "river_breath"
                          ? 4
                          : 0;
        if (from <= 0 || character.mp < defMp) return;
        character = { ...character, mp: character.mp - defMp };
      }
      sfxDice();
      let raw = rawRoll ?? rollD16();
      if (skillId === "ancestors_luck") {
        const b = rollD16();
        raw = Math.max(raw, b);
      }
      const { total, notes } = playerRoundTotal(
        character,
        raw,
        skillId,
        s.combat.enemySpecials,
        character.skills,
      );
      const enemyTotal = s.combat.currentEnemyRoll ?? 0;
      let eTotal = enemyTotal;
      if (skillId === "black_word") eTotal = Math.max(1, eTotal - 2 - (character.skills.black_word ?? 1));
      const winner = compareRound(total, eTotal);
      const roundWinners = [...s.combat.roundWinners, winner] as CombatState["roundWinners"];
      const playerRolls = [...s.combat.playerRolls, total];
      let narrative = `Твой кубик: ${raw}. Итог ${total}`;
      if (notes.length) narrative += ` (${notes.join(", ")})`;
      narrative += ` против ${eTotal}. `;
      if (winner === "player") narrative += "Раунд за тобой.";
      else if (winner === "enemy") narrative += "Раунд за врагом.";
      else narrative += "Ничья.";

      if (s.combat.enemySpecials.includes("drain") && winner === "enemy") {
        character = { ...character, mp: Math.max(0, character.mp - 2) };
        narrative += " Тень пьёт ману.";
      }
      if (s.combat.enemySpecials.includes("reflect1") && winner === "player") {
        character = clampHpMp({ ...character, hp: character.hp - 1 });
        narrative += " Отражённый укол: −1.";
      }
      if (skillId === "river_breath") {
        const heal = 3 * (character.skills.river_breath ?? 1);
        character = clampHpMp({ ...character, hp: character.hp + heal });
        narrative += ` Река возвращает ${heal} здоровья.`;
      }

      sfxHit();
      const finished = roundWinners.length >= 3;
      const fx: FxItem[] = [];
      if (winner === "player") fx.push(makeFx("ok", "Раунд за тобой"));
      if (winner === "enemy") fx.push(makeFx("fail", "Раунд за врагом"));
      if (winner === "tie") fx.push(makeFx("info", "Ничья"));
      set({
        character,
        combatSkill: null,
        combat: {
          ...s.combat,
          currentPlayerRoll: total,
          playerRolls,
          roundWinners,
          usedSkill: skillId,
          phase: finished ? "battle_end" : "round_result",
          finished,
          narrative,
        },
        fx: [...s.fx, ...fx],
      });
    },

    combatAckRound: () => {
      const s = get();
      if (!s.combat || s.combat.phase !== "round_result") return;
      set({
        combatSkill: null,
        combat: {
          ...s.combat,
          round: s.combat.round + 1,
          phase: "enemy_roll",
          currentEnemyRoll: null,
          currentPlayerRoll: null,
          usedSkill: null,
          narrative: `Раунд ${s.combat.round + 1}. Нажми кубик врага справа.`,
        },
      });
    },

    combatFinish: () => {
      const s = get();
      if (!s.combat || !s.character) return;
      const { wins, losses } = resolveBattle(s.combat);
      const enemyLevel = s.combat.enemyLevel;
      let character = s.character;
      const shadow = (character.skills.forest_shadow ?? 0) > 0 && s.combat.usedSkill === "forest_shadow";
      let dmg = losses * enemyLevel;
      if (s.combat.enemySpecials.includes("poison")) {
        const resist = character.resists.poison;
        dmg += Math.max(0, losses - resist);
      }
      if (shadow) dmg = Math.ceil(dmg / 2);
      const shell = character.skills.bone_shell ?? 0;
      if (shell && s.combat.roundWinners.length) dmg = Math.max(0, dmg - shell);
      dmg = Math.max(0, dmg - Math.floor(armorOf(character) / 3));
      character = clampHpMp({ ...character, hp: character.hp - dmg });
      const victory = wins > losses;
      let narrative = "";
      const fx: { kind: FxKind; text: string }[] = [];
      let pulseUid = s.pulseUid;
      if (victory) {
        sfxWin();
        const xp = enemyLevel * 12;
        const gold = 2 + enemyLevel * 3 + Math.floor(Math.random() * 6);
        character = addXp(character, xp);
        fx.push({ kind: "win", text: "Победа" }, { kind: "xp", text: `Опыт +${xp}` }, { kind: "gold", text: `Получено золото +${gold}` });
        if (Math.random() < 0.55) {
          const loot = randomLoot(character.stats.luck, s.layer);
          const g = giveTracked(character, loot);
          character = g.character;
          pulseUid = g.uid;
          character = { ...character, gold: character.gold + gold };
          narrative = `Победа. Опыт +${xp}, золото +${gold}, добыча: ${ITEMS[loot]?.name}. Урон за проигранные раунды: ${dmg}.`;
          fx.push({ kind: "item", text: `Получено: ${ITEMS[loot]?.name ?? "вещь"}` });
        } else {
          character = { ...character, gold: character.gold + gold + 4 };
          narrative = `Победа. Опыт +${xp}, золото +${gold + 4}. Урон ${dmg}.`;
          fx[2] = { kind: "gold", text: `Получено золото +${gold + 4}` };
        }
      } else {
        sfxLose();
        narrative = `Поражение (${wins}:${losses}). Урон ${dmg}. Враг уходит.`;
        fx.push({ kind: "lose", text: "Поражение" });
      }
      const unspent = character.unspentStat > 0 || character.unspentSkill > 0;
      set({
        character,
        combat: null,
        combatSkill: null,
        narrative,
        overlay: unspent ? "levelup" : "none",
        pulseUid,
        fx: [...s.fx, ...fx.map((x) => makeFx(x.kind, x.text))],
        log: pushLog(s.log, victory ? "Победа" : "Поражение"),
      });
      if (character.hp <= 0) get().enterNav();
      else get().persist();
    },

    enterNav: () => {
      const s = get();
      if (!s.character) return;
      const hex = generateHex(-1, 0, "nav_gate", true);
      const character = clampHpMp({
        ...s.character,
        hp: Math.max(1, Math.floor(s.character.maxHp * 0.35)),
        mp: Math.floor(s.character.maxMp * 0.3),
      });
      set({
        inNav: true,
        returnLayer: s.layer,
        layer: -1,
        hexesThisLayer: 0,
        hex,
        character,
        combat: null,
        overlay: "none",
        choices: null,
        pendingQuest: null,
        shop: null,
        talkOpen: false,
        luckPending: false,
        narrative: `Смерть — дверь вниз. Навь принимает без церемоний. ${hexText(hex)} Найди Врата Яви стрелками.`,
        fx: [...s.fx, makeFx("lose", "Падение в Навь")],
        log: pushLog(s.log, "Падение в Навь."),
      });
      get().persist();
    },

    leaveNav: () => {
      /* handled in move */
    },
  };
});

export function hasSave(): boolean {
  try {
    for (const k of SAVE_KEYS) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const d = JSON.parse(raw) as PersistShape;
      if (d?.character) return true;
    }
    return false;
  } catch {
    return false;
  }
}
