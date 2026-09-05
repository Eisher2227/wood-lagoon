import type {
  RaceId,
  ClassId,
  HexType,
  ItemDef,
  SkillDef,
  EnemyDef,
  Stats,
  StatKey,
} from "./types";

export const RACES: Record<
  RaceId,
  {
    id: RaceId;
    name: string;
    portrait: string;
    blurb: string;
    bonus: string;
    stats: Stats;
    xpMult: number;
    resists: { poison: number; fire: number };
  }
> = {
  human: {
    id: "human",
    name: "Человек",
    portrait: "/portraits/human.jpg",
    blurb: "Обычные люди. Нет особой крови — зато быстрее учатся.",
    bonus: "+10% опыта",
    stats: { str: 6, dex: 6, int: 6, end: 6, luck: 6, cha: 6 },
    xpMult: 1.1,
    resists: { poison: 0, fire: 0 },
  },
  lesovik: {
    id: "lesovik",
    name: "Дымолес",
    portrait: "/portraits/lesovik.jpg",
    blurb: "Родня леса. Ловкие и удачливые среди деревьев.",
    bonus: "+ловкость",
    stats: { str: 5, dex: 8, int: 5, end: 6, luck: 7, cha: 5 },
    xpMult: 1,
    resists: { poison: 1, fire: 0 },
  },
  vodyanoy: {
    id: "vodyanoy",
    name: "Шлюзник",
    portrait: "/portraits/vodyanoy.jpg",
    blurb: "Речная кровь. Больше маны, яды слабее действуют.",
    bonus: "+дар",
    stats: { str: 5, dex: 5, int: 8, end: 6, luck: 5, cha: 6 },
    xpMult: 1,
    resists: { poison: 3, fire: 0 },
  },
  kostyanoy: {
    id: "kostyanoy",
    name: "Костерёв",
    portrait: "/portraits/kostyanoy.jpg",
    blurb: "Вышли из Нави. Крепкое здоровье, людям они не по душе.",
    bonus: "+здоровье",
    stats: { str: 6, dex: 5, int: 5, end: 9, luck: 5, cha: 3 },
    xpMult: 1,
    resists: { poison: 2, fire: 0 },
  },
  zharkrovny: {
    id: "zharkrovny",
    name: "Горныч",
    portrait: "/portraits/zharkrovny.jpg",
    blurb: "В жилах тлеет огонь. Сильные и почти не боятся пламени.",
    bonus: "+сила",
    stats: { str: 9, dex: 5, int: 4, end: 7, luck: 5, cha: 5 },
    xpMult: 1,
    resists: { poison: 0, fire: 3 },
  },
};

export const CLASSES: Record<
  ClassId,
  { id: ClassId; name: string; blurb: string; bonus: Partial<Stats>; attack: keyof Stats }
> = {
  warrior: {
    id: "warrior",
    name: "Работяга",
    blurb: "Бьёт сильно и держит удар. Секира или меч — как привык.",
    bonus: { str: 3, end: 2 },
    attack: "str",
  },
  volkhv: {
    id: "volkhv",
    name: "Парослов",
    blurb: "Слова и пар. Удары идут от ума.",
    bonus: { int: 3, cha: 2 },
    attack: "int",
  },
  archer: {
    id: "archer",
    name: "Путевой",
    blurb: "Скрытый путь. Сохраняется для старых записей.",
    bonus: { dex: 3, luck: 1 },
    attack: "dex",
  },
  tracker: {
    id: "tracker",
    name: "Путевой",
    blurb: "Читает следы и находит дорогу сквозь туман.",
    bonus: { dex: 2, luck: 2, end: 1 },
    attack: "dex",
  },
  rogue: {
    id: "rogue",
    name: "Бандит",
    blurb: "Тихий карман, быстрый нож. Чужие пояса — его лес.",
    bonus: { dex: 3, luck: 2 },
    attack: "dex",
  },
  bonesetter: {
    id: "bonesetter",
    name: "Костоправ",
    blurb: "Ставит кости на место — свои и чужие. Посох и нож.",
    bonus: { int: 2, end: 2, cha: 1 },
    attack: "int",
  },
};

export const CREATE_CLASS_IDS: ClassId[] = ["warrior", "volkhv", "tracker", "rogue", "bonesetter"];

export interface KitDef {
  id: string;
  classId: ClassId;
  name: string;
  blurb: string;
  items: string[];
  gold: number;
  image?: string;
  startLevel?: number;
  hidden?: boolean;
}

export const KITS: KitDef[] = [
  {
    id: "w_axe",
    classId: "warrior",
    name: "Секира ополченца",
    blurb: "Тяжёлый замах. Для тех, кто начинает с удара.",
    items: ["rusty_axe", "padded", "wraps", "boots_plain", "root"],
    gold: 18,
    image: "/kits/w_axe.jpg",
  },
  {
    id: "w_sword",
    classId: "warrior",
    name: "Меч дозорного",
    blurb: "Проще секиры — клинок быстрый.",
    items: ["short_sword", "padded", "wraps", "boots_plain", "root"],
    gold: 16,
    image: "/kits/w_sword.jpg",
  },
  {
    id: "w_mail",
    classId: "warrior",
    name: "Клепаный дозор",
    blurb: "Меньше удара, больше железа на груди.",
    items: ["short_sword", "mail_shard", "wraps", "boots_plain", "root"],
    gold: 12,
    image: "/kits/w_mail.jpg",
  },
  {
    id: "w_helm",
    classId: "warrior",
    name: "Шлем караула",
    blurb: "Голова цела — уже победа.",
    items: ["rusty_axe", "iron_helm", "padded", "wraps", "root"],
    gold: 10,
    image: "/kits/w_helm.jpg",
  },
  {
    id: "w_hammer",
    classId: "warrior",
    name: "Молот пути",
    blurb: "Тяжёлый, честный, для гвоздей и черепов.",
    items: ["rusty_axe", "padded", "boots_plain", "root", "wort"],
    gold: 14,
    image: "/kits/w_hammer.jpg",
  },
  {
    id: "v_staff",
    classId: "volkhv",
    name: "Посох капища",
    blurb: "Слова ещё жгут, если их не жалеть.",
    items: ["ash_staff", "robe", "wraps", "boots_plain", "wort"],
    gold: 14,
    image: "/kits/v_staff.jpg",
  },
  {
    id: "v_bone",
    classId: "volkhv",
    name: "Костяная чаша",
    blurb: "Меньше удара, больше шёпота предков.",
    items: ["bone_knife", "robe", "wraps", "boots_plain", "wort", "tears"],
    gold: 12,
    image: "/kits/v_bone.jpg",
  },
  {
    id: "v_wort",
    classId: "volkhv",
    name: "Травник",
    blurb: "Полынь, корень, роба. Лечит, пока не кончится.",
    items: ["ash_staff", "robe", "wort", "root", "boots_plain"],
    gold: 16,
    image: "/kits/v_wort.jpg",
  },
  {
    id: "v_clock",
    classId: "volkhv",
    name: "Часовой шёпот",
    blurb: "Пар и слово. Удача чуть выше обычного.",
    items: ["ash_staff", "robe", "ribbon", "wort", "boots_plain"],
    gold: 13,
    image: "/kits/v_clock.jpg",
  },
  {
    id: "v_cup",
    classId: "volkhv",
    name: "Чаша пара",
    blurb: "Пить осторожно. Пар помнит имена.",
    items: ["bone_knife", "robe", "tears", "wort", "wraps"],
    gold: 15,
    image: "/kits/v_cup.jpg",
  },
  {
    id: "t_pack",
    classId: "tracker",
    name: "Сумка путевого",
    blurb: "Верёвка, корень, зоркий глаз.",
    items: ["short_sword", "padded", "wraps", "boots_bog", "root", "wort"],
    gold: 14,
    image: "/kits/t_pack.jpg",
  },
  {
    id: "t_light",
    classId: "tracker",
    name: "Лёгкий ход",
    blurb: "Мало железа — много удачи.",
    items: ["bone_knife", "wraps", "boots_bog", "root", "ribbon"],
    gold: 20,
    image: "/kits/t_light.jpg",
  },
  {
    id: "t_bow",
    classId: "tracker",
    name: "Лук охотника",
    blurb: "Тихий выстрел. Хорош, пока тебя не заметили.",
    items: ["hunter_bow", "padded", "wraps", "boots_plain", "root"],
    gold: 15,
    image: "/kits/t_bow.jpg",
  },
  {
    id: "t_boot",
    classId: "tracker",
    name: "Болотные сапоги",
    blurb: "Ноги сухие — голова ясная.",
    items: ["bone_knife", "padded", "boots_bog", "wort", "root"],
    gold: 16,
    image: "/kits/t_boot.jpg",
  },
  {
    id: "t_root",
    classId: "tracker",
    name: "Корень тропы",
    blurb: "Еда, нож, удача. Остальное найдёшь.",
    items: ["hunter_bow", "wraps", "boots_bog", "root", "ribbon"],
    gold: 12,
    image: "/kits/t_root.jpg",
  },
  {
    id: "a_bow",
    classId: "archer",
    name: "Лук охотника",
    blurb: "Старый набор. Для записей.",
    items: ["hunter_bow", "padded", "wraps", "boots_plain", "root"],
    gold: 15,
    hidden: true,
  },
  {
    id: "a_knife",
    classId: "archer",
    name: "Нож и тетива",
    blurb: "Старый набор. Для записей.",
    items: ["hunter_bow", "bone_knife", "padded", "wraps", "boots_plain"],
    gold: 13,
    hidden: true,
  },
  {
    id: "r_knife",
    classId: "rogue",
    name: "Нож кармана",
    blurb: "Тихо вошёл, тихо вышел, пояс легче.",
    items: ["bone_knife", "padded", "wraps", "boots_plain", "ribbon"],
    gold: 16,
    image: "/kits/r_knife.jpg",
  },
  {
    id: "r_sword",
    classId: "rogue",
    name: "Короткий клинок",
    blurb: "Если карман пуст — клинок не пуст.",
    items: ["short_sword", "padded", "wraps", "boots_plain", "root"],
    gold: 14,
    image: "/kits/r_sword.jpg",
  },
  {
    id: "r_cloak",
    classId: "rogue",
    name: "Плащ без имени",
    blurb: "Лицо не помнят. Руки помнят.",
    items: ["bone_knife", "robe", "wraps", "boots_bog", "ribbon"],
    gold: 18,
    image: "/kits/r_cloak.jpg",
  },
  {
    id: "r_silk",
    classId: "rogue",
    name: "Лента и нож",
    blurb: "Красиво лгать, быстро резать.",
    items: ["bone_knife", "padded", "ribbon", "boots_plain", "wort"],
    gold: 15,
    image: "/kits/r_silk.jpg",
  },
  {
    id: "r_luck",
    classId: "rogue",
    name: "Счастливый карман",
    blurb: "Монет мало, удачи — в обрез хватает.",
    items: ["short_sword", "wraps", "boots_plain", "ribbon", "root"],
    gold: 22,
    image: "/kits/r_luck.jpg",
  },
  {
    id: "b_staff",
    classId: "bonesetter",
    name: "Посох костоправа",
    blurb: "Ставит суставы. И иногда — чужие планы.",
    items: ["ash_staff", "robe", "wraps", "boots_plain", "root"],
    gold: 14,
    image: "/kits/b_staff.jpg",
  },
  {
    id: "b_splint",
    classId: "bonesetter",
    name: "Шина и нож",
    blurb: "Сначала режет, потом сращивает.",
    items: ["bone_knife", "padded", "wraps", "boots_plain", "wort"],
    gold: 13,
    image: "/kits/b_splint.jpg",
  },
  {
    id: "b_cup",
    classId: "bonesetter",
    name: "Чаша живицы",
    blurb: "Пьют после удара. Не все встают.",
    items: ["ash_staff", "robe", "tears", "root", "wraps"],
    gold: 12,
    image: "/kits/b_cup.jpg",
  },
  {
    id: "b_root",
    classId: "bonesetter",
    name: "Корень живых",
    blurb: "Травы впереди железа.",
    items: ["bone_knife", "robe", "root", "wort", "boots_plain"],
    gold: 16,
    image: "/kits/b_root.jpg",
  },
  {
    id: "b_wrap",
    classId: "bonesetter",
    name: "Обмотки мастера",
    blurb: "Руки в бинте — значит, работали.",
    items: ["ash_staff", "padded", "wraps", "boots_plain", "wort"],
    gold: 15,
    image: "/kits/b_wrap.jpg",
  },
];

export const ITEMS: Record<string, ItemDef> = {
  rusty_axe: {
    id: "rusty_axe",
    name: "Ржавая секира",
    description: "Тяжёлая. Ржавчина не мешает рубить.",
    slot: "rightHand",
    kind: "weapon",
    bonuses: { attack: 3, str: 1 },
    value: 14,
  },
  short_sword: {
    id: "short_sword",
    name: "Короткий меч",
    description: "Лёгкий клинок. Удобно в тесноте.",
    slot: "rightHand",
    kind: "weapon",
    bonuses: { attack: 2, dex: 1 },
    value: 16,
  },
  ash_staff: {
    id: "ash_staff",
    name: "Ясеневый посох",
    description: "Тёплый от старых молитв.",
    slot: "rightHand",
    kind: "weapon",
    bonuses: { attack: 1, int: 2 },
    value: 15,
  },
  bone_knife: {
    id: "bone_knife",
    name: "Костяной нож",
    description: "Кость помнит, куда резать.",
    slot: "rightHand",
    kind: "weapon",
    bonuses: { attack: 2, luck: 1 },
    value: 12,
  },
  hunter_bow: {
    id: "hunter_bow",
    name: "Лук охотника",
    description: "Тетива ещё поёт.",
    slot: "rightHand",
    kind: "weapon",
    bonuses: { attack: 3, dex: 1 },
    value: 18,
  },
  padded: {
    id: "padded",
    name: "Стёганка",
    description: "Держит удар лучше, чем кажется.",
    slot: "body",
    kind: "armor",
    bonuses: { armor: 2 },
    value: 12,
  },
  robe: {
    id: "robe",
    name: "Роба волхва",
    description: "Пахнет дымом и травами.",
    slot: "body",
    kind: "armor",
    bonuses: { armor: 1, int: 1 },
    value: 14,
  },
  mail_shard: {
    id: "mail_shard",
    name: "Кольчужный обрывок",
    description: "Несколько колец ещё держат.",
    slot: "body",
    kind: "armor",
    bonuses: { armor: 3 },
    value: 28,
  },
  wraps: {
    id: "wraps",
    name: "Обмотки",
    description: "Ткань на запястьях. Не мешают работать.",
    slot: "hands",
    kind: "armor",
    bonuses: { armor: 1 },
    value: 5,
  },
  boots_plain: {
    id: "boots_plain",
    name: "Путные сапоги",
    description: "Протоптали много дорог.",
    slot: "legs",
    kind: "armor",
    bonuses: { armor: 1 },
    value: 8,
  },
  boots_bog: {
    id: "boots_bog",
    name: "Сапоги болотника",
    description: "Не пропускают воду. Холод — пропускают.",
    slot: "legs",
    kind: "armor",
    bonuses: { armor: 1, luck: 1 },
    value: 14,
  },
  iron_helm: {
    id: "iron_helm",
    name: "Железный шлем",
    description: "Вмятина над виском. Кто-то уже проверил его.",
    slot: "head",
    kind: "armor",
    bonuses: { armor: 3, str: 1 },
    value: 36,
  },
  root: {
    id: "root",
    name: "Корень живучки",
    description: "Горький. Лечит, если прожевать.",
    slot: "none",
    kind: "consumable",
    bonuses: {},
    value: 8,
    healHp: 12,
  },
  wort: {
    id: "wort",
    name: "Настой полыни",
    description: "Горький. Возвращает ману.",
    slot: "none",
    kind: "consumable",
    bonuses: {},
    value: 10,
    healMp: 10,
  },
  tears: {
    id: "tears",
    name: "Слёзы водяного",
    description: "Холодный флакон. Лечит рану и усталость.",
    slot: "none",
    kind: "consumable",
    bonuses: {},
    value: 22,
    healHp: 18,
    healMp: 8,
  },
  ember: {
    id: "ember",
    name: "Жаровень",
    description: "Уголь, который не гаснет.",
    slot: "none",
    kind: "consumable",
    bonuses: {},
    value: 16,
    healHp: 8,
    healMp: 12,
  },
  silver_bit: {
    id: "silver_bit",
    name: "Серебро предков",
    description: "Монета без чекана. Её ещё принимают.",
    slot: "none",
    kind: "treasure",
    bonuses: {},
    value: 20,
  },
  amber: {
    id: "amber",
    name: "Янтарь",
    description: "Тёплый камень. За него дают золото.",
    slot: "none",
    kind: "treasure",
    bonuses: {},
    value: 18,
  },
  ribbon: {
    id: "ribbon",
    name: "Выцветшая лента",
    description: "Кто-то завязал её на удачу.",
    slot: "none",
    kind: "treasure",
    bonuses: { luck: 1 },
    value: 9,
  },
  black_apple: {
    id: "black_apple",
    name: "Чёрное яблоко",
    description: "Не гниёт. Лучше не есть сразу.",
    slot: "none",
    kind: "quest",
    bonuses: {},
    value: 4,
  },
  key_ring: {
    id: "key_ring",
    name: "Мокрый ключ",
    description: "От двери, которой нет.",
    slot: "none",
    kind: "quest",
    bonuses: {},
    value: 6,
  },
  bone_cup: {
    id: "bone_cup",
    name: "Костяная чаша",
    description: "Холодная. Честная.",
    slot: "none",
    kind: "treasure",
    bonuses: {},
    value: 16,
  },
  memory_shard: {
    id: "memory_shard",
    name: "Осколок памяти",
    description: "Тёплый камень. Чужое воспоминание внутри.",
    slot: "none",
    kind: "treasure",
    bonuses: { int: 1 },
    value: 24,
  },
};

export const LOOT_COMMON = ["root", "wort", "wraps", "silver_bit", "ribbon"];
export const LOOT_UNCOMMON = ["boots_bog", "bone_knife", "padded", "ember", "amber", "tears"];
export const LOOT_RARE = ["iron_helm", "mail_shard", "short_sword", "memory_shard", "bone_cup"];

export const SKILLS: SkillDef[] = [
  {
    id: "power_strike",
    name: "Мощный удар",
    description: "Сильный замах. +к броску в бою.",
    mp: 4,
    maxRank: 3,
    combat: true,
    classReq: "warrior",
  },
  {
    id: "aimed_shot",
    name: "Прицельный выстрел",
    description: "Бьёт точнее. Чётные удары не рассеиваются.",
    mp: 4,
    maxRank: 3,
    combat: true,
    classReq: "archer",
  },
  {
    id: "black_word",
    name: "Чёрное слово",
    description: "Слово бьёт по врагу и снижает его бросок.",
    mp: 6,
    maxRank: 3,
    combat: true,
    classReq: "volkhv",
  },
  {
    id: "forest_shadow",
    name: "Тень чащи",
    description: "После боя получаешь вдвое меньше урона.",
    mp: 3,
    maxRank: 3,
    combat: true,
    classReq: "tracker",
  },
  {
    id: "ancestors_luck",
    name: "Удача предков",
    description: "Бросаешь кубик дважды, берёшь лучший.",
    mp: 4,
    maxRank: 3,
    combat: true,
  },
  {
    id: "blood_heat",
    name: "Жар крови",
    description: "Огонь в жилах. Сила идёт в удар.",
    mp: 4,
    maxRank: 3,
    combat: true,
    raceReq: "zharkrovny",
  },
  {
    id: "river_breath",
    name: "Дыхание реки",
    description: "После удара немного лечит.",
    mp: 4,
    maxRank: 3,
    combat: true,
    raceReq: "vodyanoy",
  },
  {
    id: "bone_shell",
    name: "Костяной панцирь",
    description: "Снимает часть урона после боя.",
    mp: 5,
    maxRank: 3,
    combat: true,
    raceReq: "kostyanoy",
  },
  {
    id: "leshy_step",
    name: "Шаг Лешего",
    description: "В лесу меньше боёв и больше находок.",
    mp: 0,
    maxRank: 3,
    combat: false,
    raceReq: "lesovik",
  },
  {
    id: "mokosh_gaze",
    name: "Взгляд Мокоши",
    description: "Чаще находишь вещи при поиске.",
    mp: 0,
    maxRank: 3,
    combat: false,
    classReq: "tracker",
  },
  {
    id: "grave_sense",
    name: "Чутьё могил",
    description: "Выше шанс выкопать клад.",
    mp: 0,
    maxRank: 3,
    combat: false,
  },
  {
    id: "bargain",
    name: "Торг",
    description: "Покупаешь дешевле, продаёшь дороже.",
    mp: 0,
    maxRank: 3,
    combat: false,
  },
  {
    id: "quick_cut",
    name: "Быстрый рез",
    description: "Нож опережает чужой бросок. +к атаке в раунде.",
    mp: 3,
    maxRank: 3,
    combat: true,
    classReq: "rogue",
  },
  {
    id: "mark_pockets",
    name: "Метка карманов",
    description: "В поселении легче украсть. Покупается отдельно.",
    mp: 0,
    maxRank: 3,
    combat: false,
    classReq: "rogue",
  },
  {
    id: "set_bone",
    name: "Вправить кость",
    description: "После раунда чуть лечит. Свои кости слушаются.",
    mp: 5,
    maxRank: 3,
    combat: true,
    classReq: "bonesetter",
  },
  {
    id: "false_path",
    name: "Ложный след",
    description: "Враги чаще промахиваются, пока ты в лесу.",
    mp: 0,
    maxRank: 3,
    combat: false,
    classReq: "tracker",
  },
];

export const ENEMIES: EnemyDef[] = [
  {
    id: "utopelnik",
    name: "Утопленник",
    description: "Мокрый, медленный, злой.",
    portrait: "/portraits/utopelnik.jpg",
    specials: ["poison"],
    minLevel: 1,
    weight: 8,
  },
  {
    id: "kikimora",
    name: "Кикимора",
    description: "Шепчет и путает руки.",
    portrait: "/portraits/kikimora.jpg",
    specials: ["fear"],
    minLevel: 1,
    weight: 7,
  },
  {
    id: "bone_hound",
    name: "Костяной пёс",
    description: "Лает без горла. Кусает крепко.",
    portrait: "/portraits/bone_hound.jpg",
    specials: ["ignoreEven"],
    minLevel: 1,
    weight: 7,
  },
  {
    id: "upyr",
    name: "Упырь",
    description: "Пьёт тепло. После удара хочется сесть.",
    portrait: "/portraits/upyr.jpg",
    specials: ["drain"],
    minLevel: 2,
    weight: 6,
  },
  {
    id: "nav_shade",
    name: "Навья тень",
    description: "Ходит там, где тебя уже нет.",
    portrait: "/portraits/nav_shade.jpg",
    specials: ["drain", "fear"],
    minLevel: 2,
    weight: 5,
    navOnly: true,
  },
  {
    id: "ognevik",
    name: "Огневик",
    description: "Уголь, который научился ходить.",
    portrait: "/portraits/ognevik.jpg",
    specials: ["fogArmor"],
    minLevel: 3,
    weight: 5,
  },
  {
    id: "leshy_shard",
    name: "Осколок Лешего",
    description: "Лес без хозяина. Кора вместо лица.",
    portrait: "/portraits/leshy_shard.jpg",
    specials: ["fear", "fogArmor"],
    minLevel: 4,
    weight: 4,
  },
  {
    id: "koshchei",
    name: "Эхо Кощея",
    description: "Не он. Его привычка не умирать.",
    portrait: "/portraits/koshchei.jpg",
    specials: ["reflect1", "ignoreEven"],
    minLevel: 7,
    weight: 2,
  },
];

export interface HexDef {
  type: HexType;
  name: string;
  image: string;
  shop: boolean;
  nav: boolean;
  texts: string[];
}

export const HEXES: Record<HexType, HexDef> = {
  forest: {
    type: "forest",
    name: "Чаща",
    image: "/locations/forest.jpg",
    shop: false,
    nav: false,
    texts: [
      "Деревья стоят тесно. Между стволами — тропа, и непонятно, кто её протоптал.",
      "Пахнет хвоей и дымом. Где-то щёлкнула ветка — не от ветра.",
      "Поляна круглая, как стол. Хорошее место перевести дух.",
    ],
  },
  swamp: {
    type: "swamp",
    name: "Трясина",
    image: "/locations/swamp.jpg",
    shop: false,
    nav: false,
    texts: [
      "Вода чёрная, камыш выше головы. Ступай по кочкам — и пройдёшь.",
      "Из жижи торчат корни. На одном висит старая лента.",
      "Пузыри поднимаются редко. Трясина сегодня спокойная.",
    ],
  },
  ruins: {
    type: "ruins",
    name: "Руины",
    image: "/locations/ruins.jpg",
    shop: false,
    nav: false,
    texts: [
      "Каменные стены без крыши. Между плит растёт трава.",
      "Колонны лежат на боку. В нише — черепок чаши.",
      "Эхо шагов чуть запаздывает. Камень ещё помнит, что здесь жили.",
    ],
  },
  village: {
    type: "village",
    name: "Осколок деревни",
    image: "/locations/village.jpg",
    shop: false,
    nav: false,
    texts: [
      "Избы стоят, улица короткая. Колодец открыт, верёвка сухая.",
      "На пороге — миска с кашей. Кто-то ушёл, не доев.",
      "Крыши целые. Петух молчит, но дома ещё держатся.",
    ],
  },
  field: {
    type: "field",
    name: "Пустошь",
    image: "/locations/field.jpg",
    shop: false,
    nav: false,
    texts: [
      "Серое поле до тумана. Мельница вдалеке без крыльев.",
      "Вороны сидят ровно. Пашня вскрыта — сеять уже некому.",
      "На меже крест без имени. Земля вокруг мягкая.",
    ],
  },
  mound: {
    type: "mound",
    name: "Курган",
    image: "/locations/mound.jpg",
    shop: false,
    nav: false,
    texts: [
      "Холм с лентами на жердях. Камни стоят кругом.",
      "Под дёрном гул, как от далёкой песни.",
      "На вершине чаша с дождевой водой. Тихо и ясно.",
    ],
  },
  river: {
    type: "river",
    name: "Берег реки",
    image: "/locations/river.jpg",
    shop: false,
    nav: false,
    texts: [
      "Река идёт медленно. Лодка на боку, вёсла сложены аккуратно.",
      "Ивы пьют тёмную воду. На том берегу — стена тумана.",
      "На отмели блестит галька. Река сегодня не злится.",
    ],
  },
  tavern: {
    type: "tavern",
    name: "Таверна «Последний Огонь»",
    image: "/locations/tavern.jpg",
    shop: true,
    nav: false,
    texts: [
      "Окна горят. Внутри пахнет квасом и дымом. Хозяин кивает, как старому гостю.",
      "За стойкой двое молчат. Огонь в очаге ровный. Здесь ещё считают золото.",
      "Над дверью вывеска почти стёрлась. Внутри тепло — редкая удача.",
    ],
  },
  market: {
    type: "market",
    name: "Странствующий торг",
    image: "/locations/market.jpg",
    shop: true,
    nav: false,
    texts: [
      "Повозка, сукно, лоток с кореньями. Торговец улыбается: «Спрашивай цену, не происхождение.»",
      "На лотке — лента, звено кольчуги, настой. Цены углем, но торговаться можно.",
      "Фонарь качается. Вещи в его свете выглядят дороже. Или лучше.",
    ],
  },
  kapishche: {
    type: "kapishche",
    name: "Капище",
    image: "/locations/kapishche.jpg",
    shop: false,
    nav: false,
    texts: [
      "Идолы стоят в роще. Воздух густой, как перед грозой.",
      "У подножия зола и горсть зерна. Кто-то кормил богов недавно.",
      "Здесь слой мира тоньше. Если остаться, можно услышать старые имена.",
    ],
  },
  city: {
    type: "city",
    name: "Город",
    image: "/locations/city.jpg",
    shop: false,
    nav: false,
    texts: [
      "Улицы обрываются туманом. Купола целы, рынок пуст — но город ещё стоит.",
      "В переулке часы без стрелок. Мостовая хранит тепло чужих шагов.",
      "Над воротами герб стёрт. Стражи нет. Войти можно свободно.",
    ],
  },
  fog: {
    type: "fog",
    name: "Край Забвения",
    image: "/locations/fog.jpg",
    shop: false,
    nav: false,
    texts: [
      "Земли почти нет — только привычка земли быть. Держись тропы.",
      "Шёпот: «Останься, так легче.» Вежливый. Не слушай.",
      "Под ногами угадывается шестигранник. Осколок ещё держится.",
    ],
  },
  nav: {
    type: "nav",
    name: "Пепельный двор",
    image: "/locations/nav.jpg",
    shop: false,
    nav: true,
    texts: [
      "Небо — потолок из пепла. Деревья без листьев. Здесь ты слабее, это честно.",
      "Тени ходят медленно. Выход ищут ногами, не молитвой.",
      "Холодно, но терпимо. Врата Яви где-то рядом — ищи стрелками.",
    ],
  },
  nav_gate: {
    type: "nav_gate",
    name: "Врата Яви",
    image: "/locations/nav_gate.jpg",
    shop: false,
    nav: true,
    texts: [
      "Каменная щель. За ней — право быть живым. Холод отступает на шаг.",
      "На косяке зарубки. Кто-то уже возвращался. Можно и тебе.",
    ],
  },
  bonefield: {
    type: "bonefield",
    name: "Костяное поле",
    image: "/locations/bonefield.jpg",
    shop: false,
    nav: false,
    texts: [
      "Земля усеяна белым. Ветер перебирает рёбра, как струны.",
      "Череп у ноги без челюсти. Он всё равно как будто улыбается.",
    ],
  },
  eye: {
    type: "eye",
    name: "Око Забвения",
    image: "/locations/eye.jpg",
    shop: false,
    nav: false,
    texts: [
      "Центр осколка. Туман смотрит в ответ. Мир держится на том, что ты ещё здесь.",
      "Нет алтаря и нет врага. Есть только выбор остаться свидетелем.",
    ],
  },
  mill: {
    type: "mill",
    name: "Мельница пара",
    image: "/locations/mill.jpg",
    shop: false,
    nav: false,
    texts: [
      "Крылья стоят, жернова стучат сами. Пар пахнет мукой и старой молитвой.",
      "В закромах пусто, но тепло. Кто-то топил недавно.",
    ],
  },
  sluice: {
    type: "sluice",
    name: "Шлюз",
    image: "/locations/sluice.jpg",
    shop: false,
    nav: false,
    texts: [
      "Ворота воды скрипят. Уровень реки слушается чужого колеса.",
      "На перилах мох и латунь. Здесь река работает, не течёт.",
    ],
  },
  forge: {
    type: "forge",
    name: "Горн",
    image: "/locations/forge.jpg",
    shop: false,
    nav: false,
    texts: [
      "Угли ещё красные. На наковальне остывает чужая подкова.",
      "Дым идёт ровно. Горн помнит удары лучше, чем имена.",
    ],
  },
  banya: {
    type: "banya",
    name: "Баня",
    image: "/locations/banya.jpg",
    shop: false,
    nav: false,
    texts: [
      "Пар густой, веник на гвозде. Здесь моются даже те, кто уже не жив.",
      "Каменка щёлкает. После бани туман кажется вежливее.",
    ],
  },
  trestle: {
    type: "trestle",
    name: "Эстакада",
    image: "/locations/trestle.jpg",
    shop: false,
    nav: false,
    texts: [
      "Рельсы в никуда. Мост держится на привычке быть мостом.",
      "Под балками ветер. Идти по шпалам — считать шаги вслух.",
    ],
  },
  dymoles: {
    type: "dymoles",
    name: "Дымолес",
    image: "/locations/dymoles.jpg",
    shop: false,
    nav: false,
    texts: [
      "Стволы дымятся без огня. Тропа знает тебя лучше, чем ты её.",
      "Хвоя пахнет машинным маслом. Лес здесь — родственник трубы.",
    ],
  },
  peat: {
    type: "peat",
    name: "Торфяник",
    image: "/locations/peat.jpg",
    shop: false,
    nav: false,
    texts: [
      "Земля пружинит. Под ней тепло, как под одеялом.",
      "Копать легко и страшно: торф помнит всех, кого унёс.",
    ],
  },
  shrine: {
    type: "shrine",
    name: "Малое капище",
    image: "/locations/shrine.jpg",
    shop: false,
    nav: false,
    texts: [
      "Идол ростом с ребёнка. Ему оставляют гайки и зерно.",
      "Ленты на трубе. Боги здесь не спят — дремлют в скобах.",
    ],
  },
};

export const LAYER_META: Record<number, { name: string; goal: HexType; goalName: string }> = {
  0: { name: "Явь-осколок", goal: "kapishche", goalName: "Капище" },
  1: { name: "Сон богов", goal: "city", goalName: "Город" },
  2: { name: "Сердце осколка", goal: "eye", goalName: "Око Забвения" },
};

export const WILD_TYPES: HexType[] = [
  "forest",
  "swamp",
  "ruins",
  "village",
  "field",
  "mound",
  "river",
  "fog",
  "bonefield",
  "mill",
  "sluice",
  "forge",
  "banya",
  "trestle",
  "dymoles",
  "peat",
  "shrine",
];

export const FOREST_TYPES: HexType[] = ["forest", "dymoles", "swamp", "peat", "mound", "ruins"];
export const SETTLEMENT_TYPES: HexType[] = ["village", "tavern", "market", "city"];
export const CLASS_WEAPONS: Record<ClassId, string[]> = {
  warrior: ["rusty_axe", "short_sword"],
  volkhv: ["ash_staff", "bone_knife"],
  tracker: ["hunter_bow", "bone_knife", "short_sword"],
  archer: ["hunter_bow", "bone_knife"],
  rogue: ["bone_knife", "short_sword"],
  bonesetter: ["ash_staff", "bone_knife"],
};

export interface QuestOutcome {
  text: string;
  gold?: number;
  hp?: number;
  mp?: number;
  item?: string;
  flag?: string;
  flagVal?: number;
  xp?: number;
  luck?: number;
  cha?: number;
  dex?: number;
}

export interface QuestDef {
  id: string;
  title: string;
  intro: string;
  checkStat: StatKey;
  checkDC: number;
  bribeCost: number;
  talk: { id: string; text: string }[];
  outcomes: {
    statOk: QuestOutcome;
    statFail: QuestOutcome;
    bribe: QuestOutcome;
    luckOk: QuestOutcome;
    luckFail: QuestOutcome;
    talk: Record<string, QuestOutcome>;
  };
}

export const QUESTS: QuestDef[] = [
  {
    id: "old_woman",
    title: "Старуха у воды",
    intro: "У корней сидит старуха. Просит проводить её к воде. Рука лёгкая, как у птицы.",
    checkStat: "cha",
    checkDC: 12,
    bribeCost: 10,
    talk: [
      { id: "t1", text: "«Я сам едва помню берег. Пойдём вместе.»" },
      { id: "t2", text: "«Вода здесь чужая. Лучше не пить.»" },
      { id: "t3", text: "«Скажи имя — тогда решу.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты говоришь спокойно. Старуха кивает и доходит сама. На ладони остаётся корень.",
        item: "root",
        flag: "helped_crone",
        xp: 8,
      },
      statFail: {
        text: "Слова выходят грубо. Она уходит в камыш. На месте — мокрый след.",
        luck: 1,
      },
      bribe: {
        text: "Монеты звякают. Старуха прячет их в холст и оставляет корень «за дорогу».",
        item: "root",
        flag: "helped_crone",
        xp: 6,
      },
      luckOk: {
        text: "Кубик лягает удачно. На тропе к воде уже лежит флакон — как будто ждал.",
        item: "tears",
        xp: 8,
      },
      luckFail: {
        text: "Не вышло. Старуха качает головой и растворяется в камыше.",
      },
      talk: {
        t1: {
          text: "Вы доходите до лужи. Она пьёт и благодарит. В руке — корень живучки.",
          item: "root",
          flag: "helped_crone",
          xp: 8,
        },
        t2: {
          text: "Она кивает без обиды. «Правильно.» Уходит. На месте остаётся удача — странный подарок.",
          luck: 1,
        },
        t3: {
          text: "Имя сразу выпадает из головы. За звон она отдаёт серебро. Голова гудит.",
          gold: 12,
          hp: -3,
        },
      },
    },
  },
  {
    id: "black_apple",
    title: "Ребёнок с яблоком",
    intro: "Мальчик протягивает чёрное яблоко. «Возьми, а то оно само берёт.»",
    checkStat: "luck",
    checkDC: 12,
    bribeCost: 8,
    talk: [
      { id: "t1", text: "«Чьё оно было до тебя?»" },
      { id: "t2", text: "«Давай лучше хлеб. Яблоки подождут.»" },
      { id: "t3", text: "«Держи сам. Мне хватает своей ноши.»" },
    ],
    outcomes: {
      statOk: {
        text: "Яблоко само катится в траву и гаснет. Мальчик смеётся по-человечески и отдаёт ленту.",
        item: "ribbon",
        xp: 6,
      },
      statFail: {
        text: "Ты берёшь не то. Яблоко тёплое. Мальчик исчезает.",
        item: "black_apple",
      },
      bribe: {
        text: "Монеты ему важнее яблока. Он прячет их и оставляет ленту.",
        item: "ribbon",
        xp: 6,
        flag: "fed_child",
      },
      luckOk: {
        text: "Кубик падает удачно. Яблоко трескается — внутри серебро.",
        gold: 14,
        xp: 6,
      },
      luckFail: {
        text: "За спиной хрустит яблоко — кто-то всё же его взял. Не ты.",
        luck: -1,
      },
      talk: {
        t1: {
          text: "Он не отвечает. Яблоко остаётся у тебя. Тяжёлое, не гниёт.",
          item: "black_apple",
        },
        t2: {
          text: "Ест жадно и плачет обыкновенными слезами. Оставляет ленту.",
          item: "ribbon",
          hp: -2,
          xp: 6,
          flag: "fed_child",
        },
        t3: {
          text: "Кивает. За спиной всё равно кто-то берёт яблоко. Удача чуть садится.",
          luck: -1,
        },
      },
    },
  },
  {
    id: "wounded",
    title: "Раненый у межи",
    intro: "Воин держит живот. «Добей. Или вытащи. Только не оставляй так.»",
    checkStat: "str",
    checkDC: 13,
    bribeCost: 14,
    talk: [
      { id: "t1", text: "«Где болит сильнее? Молчи и дыши.»" },
      { id: "t2", text: "«Клинок мне нужнее, чем тебе.»" },
      { id: "t3", text: "«Скажи место клада — и перевяжу.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты тащишь его к камню и перевязываешь крепко. Он шепчет, где «в земле звенит».",
        hp: -4,
        flag: "spared_warrior",
        xp: 10,
      },
      statFail: {
        text: "Сил не хватает. Он благодарит взглядом и затихает. В сумке остаётся его нож.",
        item: "short_sword",
        flag: "mercy_kill",
        xp: 8,
      },
      bribe: {
        text: "Золото на воду и бинты. Он доходит до деревни сам. Долг записан.",
        flag: "spared_warrior",
        xp: 8,
      },
      luckOk: {
        text: "Ране не так глубока, как казалось. Он встаёт и отдаёт секиру «за жизнь».",
        item: "rusty_axe",
        xp: 10,
      },
      luckFail: {
        text: "Не повезло. Кровь не остановить. Он устало закрывает глаза.",
        cha: -1,
      },
      talk: {
        t1: {
          text: "Перевязка держит. Он шепчет про землю, где звенит. Ты теряешь немного крови — редкий жест.",
          hp: -4,
          flag: "spared_warrior",
          xp: 8,
        },
        t2: {
          text: "Секира снимается легко. Он не проклинает — он устал. В поясе тёплое золото.",
          item: "rusty_axe",
          gold: 11,
          cha: -1,
          flag: "robbed_dying",
        },
        t3: {
          text: "Он смотрит долго, потом говорит правду. Перевязка держит. Клад — может, ловушка.",
          hp: -2,
          flag: "spared_warrior",
          xp: 8,
        },
      },
    },
  },
  {
    id: "idol_blood",
    title: "Идол просит",
    intro: "Деревянный бог без имени. В груди выемка. Голос без рта: «Капля. Любая.»",
    checkStat: "end",
    checkDC: 13,
    bribeCost: 16,
    talk: [
      { id: "t1", text: "«Возьми воду. Сегодня она дороже крови.»" },
      { id: "t2", text: "«Держи клетку сам. Я ещё живой.»" },
      { id: "t3", text: "«Скажи, кого ты помнишь — и решу.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты терпишь и даёшь кровь. Клетка вокруг становится чётче. Рука ноет.",
        hp: -6,
        flag: "blood_idol",
        xp: 12,
      },
      statFail: {
        text: "Голова кружится. Идол молчит. Туман подходит ближе.",
        flag: "refused_idol",
      },
      bribe: {
        text: "Монеты падают в выемку, как капли. Идол принимает замену. Туман чуть отступает.",
        xp: 8,
        flag: "blood_idol",
      },
      luckOk: {
        text: "Из выемки сами сыплются монеты. Идол сыт без тебя.",
        gold: 12,
        xp: 8,
      },
      luckFail: {
        text: "Дерево не отвечает. Где-то падает ветка — слишком вовремя.",
      },
      talk: {
        t1: {
          text: "Вода темнеет, притворяясь кровью. Идол принимает. Удача ёжится.",
          luck: -1,
          gold: 7,
          flag: "lied_idol",
        },
        t2: {
          text: "Идол молчит так, будто ты подтвердил то, что он думал о людях.",
          flag: "refused_idol",
        },
        t3: {
          text: "Он называет имя, которого ты не знаешь. Клетка на миг становится чётче.",
          hp: -3,
          flag: "blood_idol",
          xp: 10,
        },
      },
    },
  },
  {
    id: "well",
    title: "Голос из колодца",
    intro: "Колодец без сруба. Голос снизу — твой, только моложе: «Вытащи. Я помню лето.»",
    checkStat: "int",
    checkDC: 12,
    bribeCost: 10,
    talk: [
      { id: "t1", text: "«Какое лето? Назови реку.»" },
      { id: "t2", text: "«Сиди. Камни честнее верёвки.»" },
      { id: "t3", text: "«Поговорим. Рук не дам.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты понимаешь: это не ты. Говоришь об этом вслух. Голос стихает. В груди теплеет.",
        mp: 6,
        xp: 8,
      },
      statFail: {
        text: "Верёвка рвётся. Снизу смеются. На краю остаётся мокрый ключ.",
        item: "key_ring",
        hp: -2,
      },
      bribe: {
        text: "Монеты падают вниз. Звон долго не кончается. Сверху выкатывается ключ.",
        item: "key_ring",
        xp: 6,
      },
      luckOk: {
        text: "Верёвка держит. Снизу — только ведро с чистой водой. Мана возвращается.",
        mp: 8,
        xp: 6,
      },
      luckFail: {
        text: "Камни срываются сами. Голос становится тише, как разговор за стеной.",
        flag: "sealed_well",
      },
      talk: {
        t1: {
          text: "Он путается. Верёвка рвётся на середине. На краю — мокрый ключ.",
          item: "key_ring",
          hp: -2,
          mp: -2,
        },
        t2: {
          text: "Камни падают долго. Сон сегодня будет без колодцев. Это уже плата.",
          flag: "sealed_well",
          xp: 6,
        },
        t3: {
          text: "Говорите о поле, которого не было. К концу неясно, кто кого утешал. Мана капает обратно.",
          mp: 6,
          xp: 5,
        },
      },
    },
  },
  {
    id: "two_travelers",
    title: "Двое у тропы",
    intro: "Двое у костра. Один: «Он тень, не корми.» Другой: «Он лжёт, чтобы съесть твой хлеб первым.»",
    checkStat: "cha",
    checkDC: 13,
    bribeCost: 12,
    talk: [
      { id: "t1", text: "«Еда посередине. Ешьте, если можете.»" },
      { id: "t2", text: "«Мне всё равно, кто из вас врёт.»" },
      { id: "t3", text: "«Покажите руки. У тени их не бывает.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты говоришь так, что оба замолкают. На земле остаётся янтарь — плата за мир.",
        item: "amber",
        xp: 10,
      },
      statFail: {
        text: "Слова путаются. Один режет другого. Платит серебром, которое пахнет пеплом.",
        gold: 15,
        flag: "trusted_liar",
      },
      bribe: {
        text: "Хлеб и монеты между ними. Никто не ест. Когда отходишь, костёр вспыхивает сам. В следе — янтарь.",
        item: "amber",
        xp: 10,
      },
      luckOk: {
        text: "Оба оказываются живыми. Отдают кольчужное звено «за то, что не выбрал».",
        item: "padded",
        xp: 8,
      },
      luckFail: {
        text: "Один исчезает, улыбаясь. Второй плачет. Ты не знаешь, кого спас.",
        xp: 4,
      },
      talk: {
        t1: {
          text: "Они смотрят на еду, потом друг на друга. Никто не ест. В следе — янтарь.",
          item: "amber",
          xp: 10,
        },
        t2: {
          text: "Первый кивает и режет второго без спешки. Платит серебром.",
          gold: 15,
          flag: "trusted_liar",
        },
        t3: {
          text: "Второй показывает ладони. Первый растворяется. Звено тёплое — почти броня.",
          item: "padded",
          xp: 8,
        },
      },
    },
  },
  {
    id: "eyed_bird",
    title: "Птица с человеческим глазом",
    intro: "Ворон сидит близко. Правый глаз — серо-зелёный, чей-то. Каркает словом «останься».",
    checkStat: "dex",
    checkDC: 12,
    bribeCost: 9,
    talk: [
      { id: "t1", text: "«Чей глаз, ворон?»" },
      { id: "t2", text: "«Не останусь. Проводи десять шагов — и волен.»" },
      { id: "t3", text: "«Возьми хлеб. Глаз оставь себе.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты кланяешься ловко, не спугнув. Туман перед тобой редеет на десять шагов.",
        xp: 7,
        flag: "honored_bird",
      },
      statFail: {
        text: "Рука дёргается к глазу. Клюв бьёт в кисть. Рука будет ныть в сырую погоду.",
        hp: -5,
        luck: 1,
      },
      bribe: {
        text: "Монеты блесят. Ворон клюёт одну и уносит. С пера падает настой.",
        item: "wort",
      },
      luckOk: {
        text: "Перо падает само. В нём — пузырёк настоя.",
        item: "wort",
        xp: 6,
      },
      luckFail: {
        text: "Ворон уносит твою удачу на десять взмахов и возвращает половину.",
        luck: -1,
      },
      talk: {
        t1: {
          text: "Клюёт кисть. Глаз остаётся у птицы. Твоя кровь — ему весть.",
          hp: -5,
          luck: 1,
        },
        t2: {
          text: "Клонит голову слишком по-человечески. Туман редеет. Это почти дорога.",
          xp: 7,
          flag: "honored_bird",
        },
        t3: {
          text: "Клюёт аккуратно. Улетает. С пера падает настой — будто нёс его для кого-то.",
          item: "wort",
        },
      },
    },
  },
  {
    id: "pyre",
    title: "Тлеющий костёр",
    intro: "Погребальный костёр ещё дышит. В углях кольцо. Голос из жара: «Не туши. Или туши.»",
    checkStat: "int",
    checkDC: 13,
    bribeCost: 11,
    talk: [
      { id: "t1", text: "«Вам нужен хворост или тишина?»" },
      { id: "t2", text: "«Кольцо — плата живым. Угли — вам.»" },
      { id: "t3", text: "«Горите, пока сами не устанете.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты понимаешь обряд и подбрасываешь хворост правильно. Дышать легче. Мана приходит.",
        mp: 8,
        xp: 8,
        flag: "fed_pyre",
      },
      statFail: {
        text: "Обряд путается. Из мокрых углей выкатывается костяная чаша.",
        item: "bone_cup",
        flag: "doused_pyre",
      },
      bribe: {
        text: "Монеты в жар. Пламя встаёт столбом без боли. Пепел ложится на плечи как плащ.",
        mp: 6,
        xp: 6,
        flag: "fed_pyre",
      },
      luckOk: {
        text: "Кольцо само становится монетами в кулаке. Жар не обижается.",
        gold: 18,
        xp: 6,
      },
      luckFail: {
        text: "Палец обжигает. Монеты есть, но рука помнит цену.",
        gold: 10,
        hp: -3,
      },
      talk: {
        t1: {
          text: "Пламя встаёт. В нём лица кивают. Пепел на плечах. Дышать легче.",
          mp: 8,
          xp: 8,
          flag: "fed_pyre",
        },
        t2: {
          text: "Кольцо обжигает и сыплется монетами. Жадный жест — но мир его понимает.",
          gold: 22,
          hp: -3,
        },
        t3: {
          text: "Шипит обиженно, потом отпускает. Из углей — костяная чаша. Холодная. Честная.",
          item: "bone_cup",
          flag: "doused_pyre",
        },
      },
    },
  },
  {
    id: "mirror",
    title: "Зеркало в тумане",
    intro: "Рама без стены. В стекле ты, только старше. Отражение поднимает руку не в такт.",
    checkStat: "int",
    checkDC: 14,
    bribeCost: 16,
    talk: [
      { id: "t1", text: "«Моргни первым. Тогда пойду.»" },
      { id: "t2", text: "«Забери ленту. Мне она путает шаг.»" },
      { id: "t3", text: "«Стекло врёт. Я это знаю.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты смотришь, пока не моргнёт. В голове становится просторно. Мана возвращается.",
        mp: 10,
        xp: 6,
      },
      statFail: {
        text: "Осколки поют. Один врезается в ладонь. В ране — камень памяти.",
        hp: -4,
        item: "memory_shard",
      },
      bribe: {
        text: "Монета к раме. Отражение кланяется. На стекле карта из инея — не успеваешь запомнить.",
        luck: 1,
        xp: 5,
      },
      luckOk: {
        text: "Стекло само даёт осколок — тёплый, без раны.",
        item: "memory_shard",
        xp: 8,
      },
      luckFail: {
        text: "Рама пустая. Туман смеётся без зла.",
      },
      talk: {
        t1: {
          text: "Моргает вторым. Ты помнишь своё имя громче. Мана приходит, будто из ломбарда.",
          mp: 10,
          xp: 6,
        },
        t2: {
          text: "Отражение кланяется. Туман обходит зеркало. Удача чуть встаёт.",
          luck: 1,
          gold: -4,
          xp: 5,
        },
        t3: {
          text: "Стекло трескается. Осколок в ладони тёплый. Ты почти жалеешь о раме.",
          hp: -4,
          item: "memory_shard",
        },
      },
    },
  },
  {
    id: "beggar_god",
    title: "Нищий бог",
    intro: "Сидит у камня в лохмотьях. Просит не золота — воспоминание о громе.",
    checkStat: "cha",
    checkDC: 12,
    bribeCost: 8,
    talk: [
      { id: "t1", text: "«Гром был в детстве. Забирай, если слышишь.»" },
      { id: "t2", text: "«Возьми монету. Гром мне ещё нужен.»" },
      { id: "t3", text: "«Боги сами себя доели. Мне идти.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты рассказываешь о буре. Он распрямляется и кланяется до земли. В руке — жар.",
        mp: -4,
        item: "ember",
        flag: "shared_storm",
        xp: 12,
      },
      statFail: {
        text: "Слова мелкие. Он не обижается. За спиной коротко гремит, без туч.",
        flag: "mocked_god",
      },
      bribe: {
        text: "Ловит монету и смеётся. «Вы всё ещё думаете, что нас покупают.» Выплёвывает корень.",
        item: "root",
      },
      luckOk: {
        text: "Гром случается сам — маленький, добрый. Уголь в ладони.",
        item: "ember",
        xp: 8,
      },
      luckFail: {
        text: "Тишина. Он кивает: долг записан без процентов.",
        flag: "mocked_god",
      },
      talk: {
        t1: {
          text: "В голове на миг пусто, где была гроза. Он кланяется. В руке тепло, как от угля.",
          mp: -4,
          item: "ember",
          flag: "shared_storm",
          xp: 12,
        },
        t2: {
          text: "Монету глотает. Выплёвывает корень. Обмен странный и сытный.",
          gold: -5,
          item: "root",
        },
        t3: {
          text: "Не обижается. За спиной гремит. Волосы встают. Мир фиксирует долг.",
          flag: "mocked_god",
        },
      },
    },
  },
  {
    id: "shadow_woman",
    title: "Женщина без тени",
    intro: "Стоит на светлом песке. Тени нет. Просит провести через клетку.",
    checkStat: "dex",
    checkDC: 13,
    bribeCost: 12,
    talk: [
      { id: "t1", text: "«Иди следом. Не говори, пока не кончится песок.»" },
      { id: "t2", text: "«Тень нужна, чтобы не потерять себя. Иди одна.»" },
      { id: "t3", text: "«Как тебя звать? Имена здесь держат дорогу.»" },
    ],
    outcomes: {
      statOk: {
        text: "Вы идёте молча. У края она касается запястья — холодно. Шаг становится легче.",
        dex: 1,
        flag: "two_shadows",
        xp: 9,
      },
      statFail: {
        text: "Сбиваешься. Она смотрит с жалостью. Голос садится.",
        cha: -1,
      },
      bribe: {
        text: "Монеты на песок. Она берёт их как хлеб и уходит. Песок остаётся пустым и честным.",
        cha: 1,
        xp: 5,
      },
      luckOk: {
        text: "Песок сам складывается в тропу. Она кланяется. У тебя две тени до следующего гекса.",
        dex: 1,
        flag: "two_shadows",
        xp: 8,
      },
      luckFail: {
        text: "Песок кончается сразу. Она исчезает, не обижаясь.",
      },
      talk: {
        t1: {
          text: "Идёте молча. «Теперь у тебя две тени. Одна врёт.» Шаг легче. Сон — тяжелее.",
          dex: 1,
          flag: "two_shadows",
          xp: 9,
        },
        t2: {
          text: "Кивает. «Мудро и жестоко.» Уходит. На песке остаётся её отсутствие.",
          cha: 1,
        },
        t3: {
          text: "Имя обжигает язык и выскальзывает. Харизма — дыра, в которую дует. Мана чуть встаёт.",
          cha: -2,
          mp: 4,
        },
      },
    },
  },
  {
    id: "speaking_wolf",
    title: "Волк человечьим голосом",
    intro: "Серый, рёбра как гриф. Говорит из груди: «Дай еды или дай работу.»",
    checkStat: "str",
    checkDC: 13,
    bribeCost: 10,
    talk: [
      { id: "t1", text: "«Ешь. Потом решай, пёс ты или волк.»" },
      { id: "t2", text: "«Иди рядом до края клетки. Плачу.»" },
      { id: "t3", text: "«Охота — тоже работа. Покажи.»" },
    ],
    outcomes: {
      statOk: {
        text: "Ты не боишься. Волк это чувствует и оставляет клык — почти клинок.",
        item: "bone_knife",
        xp: 8,
      },
      statFail: {
        text: "Он не впечатлён. Исчезает в траве. Позже смех повторяется за спиной.",
        flag: "wolf_laugh",
      },
      bribe: {
        text: "Монеты ему не нужны, но он понимает цену. Берёт и уходит. След отпугивает мелочь.",
        flag: "fed_wolf",
        xp: 6,
      },
      luckOk: {
        text: "Волк оказывается сыт сам. Оставляет клык «на память о хорошем дне».",
        item: "bone_knife",
        xp: 8,
      },
      luckFail: {
        text: "Голодный взгляд. Уходит без подарка.",
      },
      talk: {
        t1: {
          text: "Ест медленно, стыдясь. Трётся о голень. След отпугивает меньшую нечисть.",
          hp: -3,
          flag: "fed_wolf",
          xp: 7,
        },
        t2: {
          text: "Идёт сбоку, не дыша. У тумана останавливается. Оставляет клык. Клык тёплый.",
          item: "bone_knife",
          gold: -8,
          xp: 8,
        },
        t3: {
          text: "Смеётся грудью и исчезает. Позже смех повторяется, когда на тебя смотрит голодное.",
          flag: "wolf_laugh",
        },
      },
    },
  },
  {
    id: "black_cup",
    title: "Чаша с чёрной водой",
    intro: "На камне чаша. Вода не плещется. Надпись внутри: «Пей, если готов отдать лишнее.»",
    checkStat: "end",
    checkDC: 12,
    bribeCost: 9,
    talk: [
      { id: "t1", text: "«Лишнее — обида. Забирай её.»" },
      { id: "t2", text: "«Земле виднее. Выливаю.»" },
      { id: "t3", text: "«Чашу возьму сухой. Вода подождёт.»" },
    ],
    outcomes: {
      statOk: {
        text: "Пьёшь. На вкус — колодец и медь. Тело легчает. Рана забывает глубину.",
        hp: 14,
        mp: -3,
        xp: 6,
      },
      statFail: {
        text: "Вода злее, чем казалась. Горло дерёт. Чаша остаётся на камне.",
        hp: -4,
      },
      bribe: {
        text: "Монета в чашу. Вода светлеет. Можно выпить без цены — почти.",
        hp: 8,
        xp: 4,
      },
      luckOk: {
        text: "Вода сама выплёскивается. Из травы — корень толще запястья.",
        item: "root",
        flag: "poured_cup",
      },
      luckFail: {
        text: "Чаша пустеет без подарка. Камень просто камень.",
      },
      talk: {
        t1: {
          text: "На вкус — колодец и медь. Обида уходит. Рана на ребре мелеет.",
          hp: 14,
          mp: -3,
          xp: 6,
        },
        t2: {
          text: "Земля принимает чёрное. Из травы вылезает корень. Он стучит по ладони, живой.",
          item: "root",
          flag: "poured_cup",
        },
        t3: {
          text: "Чаша в сумке звенит без повода. Пока не пьёшь, она считает это обещанием.",
          item: "bone_cup",
        },
      },
    },
  },
  {
    id: "lullaby",
    title: "Колыбельная из-под земли",
    intro: "Женский голос поёт ребёнку, которого нет. Трава качается в такт.",
    checkStat: "cha",
    checkDC: 13,
    bribeCost: 11,
    talk: [
      { id: "t1", text: "«Я знаю куплет. Давай вместе.»" },
      { id: "t2", text: "«Спите. Мне рано.»" },
      { id: "t3", text: "«Дослушаю. Потом уйду, как из чужого дома.»" },
    ],
    outcomes: {
      statOk: {
        text: "Голос крепнет, радуясь компании. К концу — слёзы без причины и полная мана.",
        mp: 12,
        cha: 1,
        xp: 8,
      },
      statFail: {
        text: "Песня обрывается. Из земли — серебро, чтобы ты ушёл и не портил лад.",
        gold: 14,
        mp: -2,
      },
      bribe: {
        text: "Монеты в траву, как плата няньке. Голос становится добрее. Здоровье собирается.",
        hp: 8,
        flag: "heard_lullaby",
      },
      luckOk: {
        text: "Песня сама кончается на доброй ноте. Сон будет глубоким. Здоровье встаёт.",
        hp: 10,
        xp: 6,
      },
      luckFail: {
        text: "Куплет сбивается. Горло дерёт. Лучше идти дальше.",
        mp: -2,
      },
      talk: {
        t1: {
          text: "Рот знает куплет, хотя ты не помнишь. Слёзы без причины. Мана как после сна.",
          mp: 12,
          cha: 1,
          xp: 8,
        },
        t2: {
          text: "Песня обижается. Из земли — серебро. Карман тяжелеет. Горло — тоже.",
          gold: 14,
          mp: -2,
        },
        t3: {
          text: "Конца нет. Уходишь сам. Сон будет глубоким. Здоровье собирается в кучу.",
          hp: 8,
          flag: "heard_lullaby",
        },
      },
    },
  },
];

export const SPECIAL_LABEL: Record<string, string> = {
  ignoreEven: "Чётные удары проходят сквозь",
  reflect1: "Отражает 1 урон",
  fogArmor: "Туманный доспех (−2 к тебе)",
  drain: "Пьёт ману, если ты проиграл раунд",
  poison: "Яд: проигранный раунд бьёт сильнее",
  fear: "Страх (−2 к броску)",
};

export const CLASS_STARTER_SKILL: Record<ClassId, string> = {
  warrior: "power_strike",
  volkhv: "black_word",
  archer: "aimed_shot",
  tracker: "forest_shadow",
  rogue: "quick_cut",
  bonesetter: "set_bone",
};
