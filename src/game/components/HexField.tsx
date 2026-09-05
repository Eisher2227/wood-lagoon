import { ArrowUp } from "lucide-react";
import { HEXES } from "../data";
import { useGame } from "../store";
import { DIRS } from "../types";
import type { Dir } from "../types";

const DEPTH = 20;

const DIR_POS: Record<Dir, string> = {
  ne: "right-[6%] top-[16%]",
  e: "right-[-2%] top-1/2",
  se: "right-[6%] bottom-[16%]",
  sw: "left-[6%] bottom-[16%]",
  w: "left-[-2%] top-1/2",
  nw: "left-[6%] top-[16%]",
};

export function HexField() {
  const hex = useGame((s) => s.hex);
  const move = useGame((s) => s.move);
  const combat = useGame((s) => s.combat);
  const choices = useGame((s) => s.choices);
  const luckPending = useGame((s) => s.luckPending);
  const inNav = useGame((s) => s.inNav);
  const layer = useGame((s) => s.layer);
  const actionsUsed = useGame((s) => s.actionsUsed);
  const locked = Boolean(combat || choices || luckPending);
  const def = HEXES[hex.type];
  const showCamp = actionsUsed.includes("rest");

  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-sm lg:max-w-lg">
      <div className="hex-scene">
        <div className="hex-world">
          <div className="hex-ground" />
          <div className="hex-tile">
            {Array.from({ length: DEPTH }, (_, i) => (
              <div
                key={i}
                className="hex-slice"
                style={{ transform: `translateZ(${i}px)` }}
              />
            ))}
            <div className="hex-top" style={{ transform: `translateZ(${DEPTH}px)` }}>
              <img src={def.image} alt={def.name} className="h-full w-full object-cover" />
              {showCamp ? (
                <img src="/ui/campfire_lit.png" alt="" className="camp-art" />
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_46%,rgba(255,250,240,0.08)_72%,rgba(36,52,40,0.22)_100%)]" />
              <svg viewBox="0 0 86.6 100" className="pointer-events-none absolute inset-0 h-full w-full">
                <polygon
                  points="43.3,1.2 85.2,25.5 85.2,74.5 43.3,98.8 1.4,74.5 1.4,25.5"
                  fill="none"
                  stroke="rgba(255,250,240,0.9)"
                  strokeWidth="1.6"
                />
                <polygon
                  points="43.3,1.2 85.2,25.5 85.2,74.5 43.3,98.8 1.4,74.5 1.4,25.5"
                  fill="none"
                  stroke="rgb(47,154,98)"
                  strokeOpacity="0.55"
                  strokeWidth="0.7"
                />
              </svg>
            </div>
            {DIRS.map((d) => (
              <button
                key={d.id}
                type="button"
                disabled={locked}
                aria-label={d.label}
                onClick={() => move(d.id)}
                className={`dir-btn absolute z-10 flex items-center justify-center ${DIR_POS[d.id]}`}
                style={{
                  transform: `translateZ(${DEPTH + 8}px)${d.id === "e" || d.id === "w" ? " translateY(-50%)" : ""}`,
                }}
              >
                <ArrowUp className="size-5 lg:size-7" style={{ transform: `rotate(${d.rotate}deg)` }} strokeWidth={2.6} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 text-center">
        <div className="font-display text-2xl font-semibold lg:text-3xl">{def.name}</div>
        <div className="mt-1 font-sans text-sm uppercase tracking-[0.16em] text-fg-muted">
          {inNav ? "Навь" : layer === 0 ? "Явь-осколок" : layer === 1 ? "Сон богов" : "Сердце осколка"}
        </div>
      </div>
    </div>
  );
}
