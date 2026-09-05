import { useEffect, useState } from "react";
import { useGame } from "../store";
import { sfxDice } from "../audio";

export function DiceLayer() {
  const combat = useGame((s) => s.combat);
  const luckPending = useGame((s) => s.luckPending);
  const character = useGame((s) => s.character);
  const enemyRolled = useGame((s) => s.combatEnemyRolled);
  const playerAct = useGame((s) => s.combatPlayerAct);
  const combatSkill = useGame((s) => s.combatSkill);
  const finishLuck = useGame((s) => s.finishLuck);

  if (!combat && !luckPending) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      {combat ? (
        <>
          <Die3D
            side="left"
            label="Ты"
            value={combat.currentPlayerRoll}
            active={combat.phase === "player_act"}
            onRoll={(raw) => {
              if (combat.phase !== "player_act") return;
              playerAct(combatSkill, raw);
            }}
          />
          <Die3D
            side="right"
            label="Враг"
            value={combat.currentEnemyRoll}
            active={combat.phase === "enemy_roll"}
            onRoll={(raw) => {
              if (combat.phase !== "enemy_roll") return;
              enemyRolled(raw);
            }}
          />
        </>
      ) : null}
      {luckPending && character ? (
        <Die3D
          side="center"
          label={`Удача ${character.stats.luck}. Нужно 18+`}
          value={null}
          active
          hold
          onRoll={(raw) => {
            window.setTimeout(() => finishLuck(raw), 800);
          }}
        />
      ) : null}
    </div>
  );
}

function Die3D({
  side,
  label,
  value,
  active,
  onRoll,
  hold,
}: {
  side: "left" | "right" | "center";
  label: string;
  value: number | null;
  active: boolean;
  onRoll: (raw: number) => void;
  hold?: boolean;
}) {
  const [rolling, setRolling] = useState(false);
  const [shown, setShown] = useState<number | null>(value);
  const [flick, setFlick] = useState<number | null>(null);

  useEffect(() => {
    if (!rolling && !hold) setShown(value);
  }, [value, rolling, hold]);

  const pos =
    side === "left"
      ? "left-3 bottom-24 lg:left-[12%] lg:bottom-[10%]"
      : side === "right"
        ? "right-3 bottom-24 lg:right-[12%] lg:bottom-[10%]"
        : "left-1/2 bottom-24 -translate-x-1/2 lg:bottom-[16%]";

  const display = rolling ? (flick ?? "?") : (shown ?? "?");

  return (
    <div className={`pointer-events-auto absolute ${pos} flex flex-col items-center gap-3`}>
      <button
        type="button"
        disabled={!active || rolling}
        aria-label={label}
        onClick={() => {
          if (!active || rolling) return;
          sfxDice();
          setRolling(true);
          let n = 0;
          const id = window.setInterval(() => {
            setFlick(1 + Math.floor(Math.random() * 16));
            n += 1;
            if (n > 10) {
              window.clearInterval(id);
              const raw = 1 + Math.floor(Math.random() * 16);
              setFlick(null);
              setShown(raw);
              setRolling(false);
              onRoll(raw);
            }
          }, 70);
        }}
        className={`die-scene ${active && !rolling ? "die-wrap is-active" : "die-wrap"}`}
      >
        <div className={`die-cube ${rolling ? "is-rolling" : ""}`}>
          <div className="die-face die-front">{display}</div>
          <div className="die-face die-back">·</div>
          <div className="die-face die-right">·</div>
          <div className="die-face die-left">·</div>
          <div className="die-face die-top">·</div>
          <div className="die-face die-bottom">·</div>
        </div>
      </button>
      <div className="rounded-full bg-bg-elevated/90 px-3 py-1 font-sans text-base font-semibold shadow-sm">
        {label}
        {shown != null && !rolling ? ` · ${shown}` : active ? " · нажми" : ""}
      </div>
    </div>
  );
}
