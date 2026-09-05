import { useState } from "react";
import { CLASSES, RACES, LAYER_META, SETTLEMENT_TYPES } from "../data";
import { useGame } from "../store";
import { sfxClick } from "../audio";
import { HexField } from "./HexField";
import { LeftPanel } from "./LeftPanel";
import { GoldCount } from "./GoldCount";
import { Menu } from "lucide-react";

export function GameScreen() {
  const character = useGame((s) => s.character);
  const narrative = useGame((s) => s.narrative);
  const choices = useGame((s) => s.choices);
  const pendingQuest = useGame((s) => s.pendingQuest);
  const actionsUsed = useGame((s) => s.actionsUsed);
  const doAction = useGame((s) => s.doAction);
  const resolveChoice = useGame((s) => s.resolveChoice);
  const shop = useGame((s) => s.shop);
  const openOverlay = useGame((s) => s.openOverlay);
  const layer = useGame((s) => s.layer);
  const inNav = useGame((s) => s.inNav);
  const hexesThisLayer = useGame((s) => s.hexesThisLayer);
  const combat = useGame((s) => s.combat);
  const talkOpen = useGame((s) => s.talkOpen);
  const luckPending = useGame((s) => s.luckPending);
  const hexType = useGame((s) => s.hex.type);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  if (!character) return null;
  const meta = inNav
    ? { name: "Навь", goalName: "Врата Яви" }
    : (LAYER_META[layer] ?? { name: "Бескрайнее", goalName: "Край Забвения" });
  const left = 2 - actionsUsed.length;
  const busy = Boolean(combat || choices || luckPending);

  const settle = SETTLEMENT_TYPES.includes(hexType);
  const actions: { id: "search" | "dig" | "rest" | "quest"; label: string; hint: string; disabled?: boolean }[] = [
    { id: "search", label: "Поискать приключений", hint: "Враг, находка или тишина" },
    { id: "dig", label: "Выкопать клад", hint: "Шанс 1 к 10, удача помогает" },
    { id: "rest", label: "Отдохнуть", hint: "Здоровье и мана. Мана восстанавливается слабее" },
  ];
  if (!settle) {
    actions.push({
      id: "quest",
      label: "Выполнить квест",
      hint: pendingQuest ? pendingQuest.title : "Нет активного квеста",
      disabled: !pendingQuest,
    });
  }

  const ActionList = (
    <div className="flex flex-col gap-2 p-4">
      <div className="font-sans text-sm uppercase tracking-[0.16em] text-fg-muted">
        Действия · осталось {left}
      </div>
      {actions.map((a) => {
        const used = actionsUsed.includes(a.id);
        const off = busy || used || left <= 0 || a.disabled;
        return (
          <button
            key={a.id}
            type="button"
            disabled={off}
            onClick={() => {
              sfxClick();
              doAction(a.id);
              setRightOpen(false);
            }}
            className="btn-3d min-h-14 rounded-md border border-border bg-bg-subtle px-3 py-2 text-left disabled:opacity-35"
          >
            <div className="text-lg font-medium">{a.label}</div>
            <div className="text-sm text-fg-muted">{used ? "Уже сделано в этот ход" : a.hint}</div>
          </button>
        );
      })}
      {shop && (
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            sfxClick();
            openOverlay("shop");
          }}
          className="btn-3d min-h-14 rounded-md border border-accent/40 bg-bg-elevated px-3 text-left text-lg"
        >
          Открыть торг
        </button>
      )}
      <p className="mt-2 font-display text-base leading-relaxed text-fg-muted lg:text-lg">
        Цель слоя: {meta.goalName}. Клеток пройдено: {hexesThisLayer}. После двух дел выбери стрелку и иди.
      </p>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-28 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <header className="flex flex-col border-b border-border lg:hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border"
            aria-label="Инвентарь"
            onClick={() => setLeftOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <div className="truncate font-display text-lg font-semibold">{character.name}</div>
            <div className="truncate text-xs uppercase tracking-[0.12em] text-fg-muted">
              {RACES[character.race].name} · {CLASSES[character.class].name}
            </div>
          </div>
          <GoldCount amount={character.gold} compact />
          <button
            type="button"
            className="min-h-11 rounded-md border border-border px-2.5 text-sm"
            onClick={() => setRightOpen(true)}
          >
            Дела
          </button>
        </div>
        <div className="flex gap-1 px-3 pb-2">
          <div className="stat-bar flex-1">
            <span className="bg-hp" style={{ width: `${(character.hp / character.maxHp) * 100}%` }} />
          </div>
          <div className="stat-bar flex-1">
            <span className="bg-mp" style={{ width: `${(character.mp / character.maxMp) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 lg:h-full lg:grid-cols-[300px_minmax(0,1fr)_280px] lg:grid-rows-[minmax(180px,0.32fr)_minmax(0,1fr)] lg:overflow-hidden">
        <aside className="hidden min-h-0 overflow-y-auto border-r border-border lg:row-span-2 lg:block">
          <LeftPanel />
        </aside>

        <section className="border-b border-border px-3 py-3 lg:col-start-2 lg:p-5">
          <div className="mb-2 hidden items-center justify-between lg:flex">
            <h2 className="font-display text-2xl font-semibold">
              {character.name}
              <span className="ml-2 font-sans text-sm font-normal uppercase tracking-[0.14em] text-fg-muted">
                {RACES[character.race].name} · {CLASSES[character.class].name} · {meta.name}
              </span>
            </h2>
            <div className="flex items-center gap-4">
              <GoldCount amount={character.gold} />
              <button
                type="button"
                className="text-sm uppercase tracking-[0.14em] text-fg-subtle"
                onClick={() => openOverlay("pause")}
              >
                Меню
              </button>
            </div>
          </div>
          <div className="scroll-thin max-h-24 overflow-y-auto font-display text-lg leading-relaxed text-fg sm:max-h-36 lg:max-h-[28vh] lg:text-2xl">
            {narrative.split("\n").map((p, i) => (
              <p key={i} className={i ? "mt-2" : ""}>
                {p}
              </p>
            ))}
            {pendingQuest && !choices && (
              <p className="mt-2 text-base text-accent lg:text-lg">Квест: {pendingQuest.title}</p>
            )}
          </div>
        </section>

        <aside className="hidden overflow-y-auto border-l border-border lg:row-span-2 lg:block">{ActionList}</aside>

        <section className="flex min-h-0 flex-1 items-center justify-center px-2 py-3 lg:col-start-2 lg:row-start-2 lg:p-4">
          <HexField />
        </section>
      </div>

      {choices && (
        <div className="fixed inset-0 z-[55] flex items-end justify-center bg-[color-mix(in_oklab,var(--color-bg)_62%,transparent)] p-3 pb-28 backdrop-blur-[2px] sm:items-center sm:pb-6">
          <div className="panel-3d max-h-[78dvh] w-full max-w-xl overflow-y-auto p-5 sm:p-7">
            <p className="font-sans text-sm uppercase tracking-[0.16em] text-accent">
              {talkOpen ? "Разговор" : "Квест"}
            </p>
            <h3 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">{pendingQuest?.title}</h3>
            <p className="mt-3 font-display text-lg leading-relaxed sm:text-xl">{pendingQuest?.intro}</p>
            <div className="mt-5 flex flex-col gap-2">
              {choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    sfxClick();
                    resolveChoice(c.id);
                  }}
                  className="btn-3d min-h-14 rounded-md border border-border bg-bg-elevated px-4 py-3 text-left font-display text-lg hover:border-accent sm:text-xl"
                >
                  {c.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {leftOpen && (
        <div className="fixed inset-0 z-40 bg-bg/70 lg:hidden" onClick={() => setLeftOpen(false)}>
          <div
            className="absolute inset-y-0 left-0 w-[min(100%,340px)] overflow-y-auto border-r border-border bg-bg-elevated pb-28"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2">
              <button type="button" className="min-h-11 px-3 text-base" onClick={() => setLeftOpen(false)}>
                Закрыть
              </button>
            </div>
            <LeftPanel />
          </div>
        </div>
      )}
      {rightOpen && (
        <div className="fixed inset-0 z-40 bg-bg/70 lg:hidden" onClick={() => setRightOpen(false)}>
          <div
            className="absolute inset-y-0 right-0 w-[min(100%,320px)] overflow-y-auto border-l border-border bg-bg-elevated pb-28"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-2">
              <button type="button" className="min-h-11 px-3 text-base" onClick={() => setRightOpen(false)}>
                Закрыть
              </button>
            </div>
            {ActionList}
          </div>
        </div>
      )}
    </div>
  );
}
