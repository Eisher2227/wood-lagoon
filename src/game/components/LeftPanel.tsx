import { useEffect, useState } from "react";
import { EQUIP_SLOTS, type EquipSlot } from "../types";
import { itemDef, xpToNext } from "../systems";
import { useGame } from "../store";
import { sfxClick } from "../audio";
import { GoldCount } from "./GoldCount";

type DragSrc = { place: "inv" | EquipSlot; index?: number; uid: string };

export function LeftPanel() {
  const character = useGame((s) => s.character);
  const moveItem = useGame((s) => s.moveItem);
  const useItem = useGame((s) => s.useItem);
  const openOverlay = useGame((s) => s.openOverlay);
  const pulseUid = useGame((s) => s.pulseUid);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragSrc | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!pulseUid) return;
    setFlash(pulseUid);
    const t = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(t);
  }, [pulseUid]);

  if (!character) return null;
  const hero = character;
  const xpNeed = xpToNext(hero.level);
  const xpPct = Math.min(100, (hero.xp / xpNeed) * 100);
  const hpPct = Math.min(100, (hero.hp / hero.maxHp) * 100);
  const mpPct = Math.min(100, (hero.mp / hero.maxMp) * 100);

  const selectedItem =
    hero.inventory.find((x) => x?.uid === selected) ??
    Object.values(hero.equipment).find((x) => x?.uid === selected) ??
    null;
  const selDef = itemDef(selectedItem);

  const onDrop = (to: { place: "inv" | EquipSlot; index?: number }) => {
    if (!drag) return;
    if (drag.place === to.place && drag.index === to.index) return;
    moveItem(drag, to);
    setDrag(null);
  };

  const tap = (place: "inv" | EquipSlot, index: number | undefined, uid: string | undefined) => {
    if (selected && uid && selected !== uid) {
      const from = findPlace(selected);
      if (from) {
        moveItem(from, { place, index });
        setSelected(null);
        return;
      }
    }
    if (selected && !uid) {
      const from = findPlace(selected);
      if (from) {
        moveItem(from, { place, index });
        setSelected(null);
        return;
      }
    }
    setSelected(uid ?? null);
  };

  function findPlace(uid: string): DragSrc | null {
    const i = hero.inventory.findIndex((x) => x?.uid === uid);
    if (i >= 0) return { place: "inv", index: i, uid };
    for (const s of EQUIP_SLOTS) {
      if (hero.equipment[s.id]?.uid === uid) return { place: s.id, uid };
    }
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm uppercase tracking-[0.16em] text-fg-muted">Инвентарь</span>
          <GoldCount amount={character.gold} />
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1.5">
          {character.inventory.map((it, i) => {
            const def = itemDef(it);
            return (
              <button
                key={i}
                type="button"
                draggable={Boolean(it)}
                onDragStart={() => it && setDrag({ place: "inv", index: i, uid: it.uid })}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop({ place: "inv", index: i })}
                onClick={() => tap("inv", i, it?.uid)}
                data-filled={Boolean(it)}
                data-selected={selected === it?.uid}
                data-pulse={flash === it?.uid}
                title={def?.name}
                className="inv-cell"
              >
                {def ? def.name : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="font-sans text-sm uppercase tracking-[0.16em] text-fg-muted">Экипировка</span>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {EQUIP_SLOTS.map((s) => {
            const it = character.equipment[s.id];
            const def = itemDef(it);
            return (
              <button
                key={s.id}
                type="button"
                draggable={Boolean(it)}
                onDragStart={() => it && setDrag({ place: s.id, uid: it.uid })}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop({ place: s.id })}
                onClick={() => tap(s.id, undefined, it?.uid)}
                className="flex min-h-12 items-center justify-between rounded-sm border border-border bg-bg px-2 text-left"
              >
                <span className="text-sm uppercase tracking-wide text-fg-subtle">{s.label}</span>
                <span className="max-w-[55%] truncate text-base text-fg">{def?.name ?? "—"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selDef && selectedItem && (
        <div className="rounded-md border border-border bg-bg p-3">
          <div className="font-display text-xl font-semibold">{selDef.name}</div>
          <p className="mt-1 text-base leading-relaxed text-fg-muted">{selDef.description}</p>
          {selDef.kind === "consumable" && (
            <button
              type="button"
              className="btn-3d mt-2 min-h-11 rounded-sm bg-accent px-3 text-base font-semibold text-accent-fg"
              onClick={() => {
                sfxClick();
                useItem(selectedItem.uid);
                setSelected(null);
              }}
            >
              Использовать
            </button>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-2">
        <button
          type="button"
          className="btn-3d min-h-12 flex-1 rounded-md border border-border text-base font-medium"
          onClick={() => {
            sfxClick();
            openOverlay("stats");
          }}
        >
          Характеристики
        </button>
        <button
          type="button"
          className="btn-3d min-h-12 flex-1 rounded-md border border-border text-base font-medium"
          onClick={() => {
            sfxClick();
            openOverlay("skills");
          }}
        >
          Навыки
        </button>
      </div>

      <div className="space-y-1.5">
        <Bar label={`Здоровье ${character.hp}/${character.maxHp}`} pct={hpPct} color="bg-hp" />
        <Bar label={`Мана ${character.mp}/${character.maxMp}`} pct={mpPct} color="bg-mp" />
        <Bar label={`Опыт ${character.xp}/${xpNeed} · ур. ${character.level}`} pct={xpPct} color="bg-xp" />
      </div>
      <p className="truncate font-display text-lg text-fg-muted">
        {character.name} · ур. {character.level}
      </p>
      <button
        type="button"
        className="btn-3d min-h-12 rounded-md border border-border text-base"
        onClick={() => openOverlay("pause")}
      >
        Пауза
      </button>
    </div>
  );
}

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-0.5 font-sans text-sm tabular-nums text-fg-muted">{label}</div>
      <div className="stat-bar">
        <span className={color} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
