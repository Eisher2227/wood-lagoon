import { useEffect, type ReactNode } from "react";
import { CLASSES, ITEMS, SKILLS } from "../data";
import { STAT_LABEL, type StatKey } from "../types";
import { itemDef, priceOf, totalStats, xpToNext } from "../systems";
import { useGame } from "../store";
import { sfxClick } from "../audio";
import { GoldCount, GoldIcon } from "./GoldCount";

export function Overlays() {
  const overlay = useGame((s) => s.overlay);
  const fx = useGame((s) => s.fx);
  const clearFx = useGame((s) => s.clearFx);
  const open = useGame((s) => s.openOverlay);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-10 z-[90] flex flex-col items-center gap-3">
        {fx.map((f) => (
          <FxBanner key={f.id} id={f.id} kind={f.kind} text={f.text} onDone={clearFx} />
        ))}
      </div>
      {overlay === "stats" && <StatsModal />}
      {overlay === "skills" && <SkillsModal />}
      {overlay === "levelup" && <LevelUpModal />}
      {overlay === "shop" && <ShopModal />}
      {overlay === "pause" && <PauseModal />}
      {overlay === "ending" && <EndingModal />}
      {overlay !== "none" && overlay !== "ending" && (
        <button type="button" className="sr-only" onClick={() => open("none")}>
          close
        </button>
      )}
    </>
  );
}

function FxBanner({
  id,
  kind,
  text,
  onDone,
}: {
  id: string;
  kind: string;
  text: string;
  onDone: (id: string) => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(() => onDone(id), 2400);
    return () => window.clearTimeout(t);
  }, [id, onDone]);
  return (
    <div className={`fx-banner fx-${kind}`}>
      {kind === "gold" ? <span className="coin-3d" /> : null}
      <span>{text}</span>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-3 sm:items-center" onClick={onClose}>
      <div className="panel max-h-[88dvh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-3xl font-semibold">{title}</h3>
          <button type="button" className="min-h-11 px-2 text-base text-fg-muted" onClick={onClose}>
            Закрыть
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function StatsModal() {
  const c = useGame((s) => s.character);
  const spend = useGame((s) => s.spendStat);
  const open = useGame((s) => s.openOverlay);
  if (!c) return null;
  const tot = totalStats(c);
  const keys = Object.keys(STAT_LABEL) as StatKey[];
  return (
    <Modal title="Характеристики" onClose={() => open("none")}>
      <p className="text-base text-fg-muted">
        {CLASSES[c.class].name} · уровень {c.level} · до следующего {xpToNext(c.level) - c.xp} опыта
      </p>
      {c.unspentStat > 0 && <p className="mt-2 text-base text-accent">Нераспределено: {c.unspentStat}</p>}
      <ul className="mt-4 space-y-2">
        {keys.map((k) => (
          <li key={k} className="flex items-center justify-between gap-3 border-b border-border py-2">
            <span className="text-lg">{STAT_LABEL[k]}</span>
            <span className="flex items-center gap-3 tabular-nums text-lg">
              <span>
                {c.stats[k]}
                {tot[k] !== c.stats[k] ? <span className="text-accent"> → {tot[k]}</span> : null}
              </span>
              <button
                type="button"
                disabled={c.unspentStat <= 0}
                className="min-h-11 min-w-11 rounded-sm border border-border disabled:opacity-30"
                onClick={() => spend(k)}
              >
                +
              </button>
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function SkillsModal() {
  const c = useGame((s) => s.character);
  const spend = useGame((s) => s.spendSkill);
  const open = useGame((s) => s.openOverlay);
  if (!c) return null;
  return (
    <Modal title="Навыки" onClose={() => open("none")}>
      {c.unspentSkill > 0 && <p className="text-base text-accent">Очков: {c.unspentSkill}</p>}
      <ul className="mt-3 space-y-3">
        {SKILLS.map((sk) => {
          const rank = c.skills[sk.id] ?? 0;
          const locked =
            rank === 0 && ((sk.classReq && sk.classReq !== c.class) || (sk.raceReq && sk.raceReq !== c.race));
          if (locked) return null;
          return (
            <li key={sk.id} className="rounded-md border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-lg font-medium">
                    {sk.name} · {rank}/{sk.maxRank}
                  </div>
                  <p className="mt-1 text-base leading-relaxed text-fg-muted">{sk.description}</p>
                </div>
                <button
                  type="button"
                  disabled={c.unspentSkill <= 0 || rank >= sk.maxRank}
                  className="min-h-11 min-w-11 rounded-sm border border-border disabled:opacity-30"
                  onClick={() => spend(sk.id)}
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

function LevelUpModal() {
  const c = useGame((s) => s.character);
  const open = useGame((s) => s.openOverlay);
  if (!c) return null;
  return (
    <Modal title="Память крепнет" onClose={() => open(c.unspentStat || c.unspentSkill ? "stats" : "none")}>
      <p className="font-display text-xl leading-relaxed text-fg-muted">
        Уровень {c.level}. Есть очки характеристик и навыков — распредели, пока не забыл.
      </p>
      <button
        type="button"
        className="btn-3d mt-4 min-h-12 rounded-md bg-accent px-4 text-lg font-semibold text-accent-fg"
        onClick={() => open("stats")}
      >
        Распределить
      </button>
    </Modal>
  );
}

function ShopModal() {
  const c = useGame((s) => s.character);
  const shop = useGame((s) => s.shop);
  const buy = useGame((s) => s.buy);
  const sell = useGame((s) => s.sell);
  const open = useGame((s) => s.openOverlay);
  if (!c || !shop) return null;
  return (
    <Modal title={shop.title} onClose={() => open("none")}>
      <div className="mb-1">
        <GoldCount amount={c.gold} />
      </div>
      <ul className="mt-3 space-y-2">
        {shop.stock.map((it) => {
          const def = itemDef(it);
          const price = priceOf(it.defId, c.stats.cha, c.skills.bargain ?? 0, false);
          return (
            <li key={it.uid} className="flex items-center justify-between gap-2 rounded-sm border border-border px-3 py-2">
              <div>
                <div className="text-lg">{def?.name}</div>
                <div className="flex items-center gap-1 text-sm text-fg-muted">
                  <GoldIcon className="size-4" /> {price}
                </div>
              </div>
              <button
                type="button"
                className="btn-3d min-h-11 rounded-sm bg-accent px-3 text-base font-semibold text-accent-fg"
                onClick={() => {
                  sfxClick();
                  buy(it.uid);
                }}
              >
                Купить
              </button>
            </li>
          );
        })}
      </ul>
      <h4 className="mt-5 text-sm uppercase tracking-[0.16em] text-fg-muted">Продать из сумки</h4>
      <ul className="mt-2 space-y-2">
        {c.inventory.filter(Boolean).map((it) => {
          if (!it) return null;
          const def = ITEMS[it.defId];
          const price = priceOf(it.defId, c.stats.cha, c.skills.bargain ?? 0, true);
          return (
            <li key={it.uid} className="flex items-center justify-between gap-2 rounded-sm border border-border px-3 py-2">
              <div className="text-lg">{def?.name}</div>
              <button
                type="button"
                className="min-h-11 rounded-sm border border-border px-3 text-base"
                onClick={() => {
                  sfxClick();
                  sell(it.uid);
                }}
              >
                <span className="inline-flex items-center gap-1">
                  <GoldIcon className="size-4" />
                  {price}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

function PauseModal() {
  const open = useGame((s) => s.openOverlay);
  const toMenu = useGame((s) => s.toMenu);
  const persist = useGame((s) => s.persist);
  const tutorial = useGame((s) => s.openTutorial);
  return (
    <Modal title="Пауза" onClose={() => open("none")}>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="btn-3d min-h-12 rounded-md bg-accent text-lg font-semibold text-accent-fg"
          onClick={() => open("none")}
        >
          Продолжить
        </button>
        <button
          type="button"
          className="btn-3d min-h-12 rounded-md border border-border text-lg"
          onClick={() => {
            persist();
            open("none");
          }}
        >
          Сохранить
        </button>
        <button
          type="button"
          className="btn-3d min-h-12 rounded-md border border-border text-lg"
          onClick={() => {
            open("none");
            tutorial();
          }}
        >
          Как играть
        </button>
        <button type="button" className="btn-3d min-h-12 rounded-md border border-border text-lg" onClick={toMenu}>
          В меню
        </button>
      </div>
    </Modal>
  );
}

function EndingModal() {
  const open = useGame((s) => s.openOverlay);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 p-6">
      <div className="max-w-lg text-center">
        <p className="font-sans text-sm uppercase tracking-[0.22em] text-accent">Конец слоя</p>
        <h3 className="font-display mt-3 text-4xl font-semibold">Око Забвения</h3>
        <p className="font-display mt-4 text-2xl leading-relaxed text-fg-muted">
          Ты дошёл до сердца осколка. Мир не стал целым. Он стал увиденным. Этого довольно.
        </p>
        <p className="mt-3 font-display text-xl text-fg-muted">Можно идти дальше. Приключение не кончается.</p>
        <button
          type="button"
          className="btn-3d mt-8 min-h-12 rounded-md bg-accent px-6 text-lg font-semibold text-accent-fg"
          onClick={() => open("none")}
        >
          Остаться на осколках
        </button>
      </div>
    </div>
  );
}
