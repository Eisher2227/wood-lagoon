import { RACES, SKILLS, SPECIAL_LABEL } from "../data";
import { useGame } from "../store";
import { sfxClick } from "../audio";

export function CombatScreen() {
  const combat = useGame((s) => s.combat);
  const character = useGame((s) => s.character);
  const combatSkill = useGame((s) => s.combatSkill);
  const selectSkill = useGame((s) => s.selectCombatSkill);
  const ack = useGame((s) => s.combatAckRound);
  const finish = useGame((s) => s.combatFinish);

  if (!combat || !character) return null;
  const wins = combat.roundWinners.filter((w) => w === "player").length;
  const losses = combat.roundWinners.filter((w) => w === "enemy").length;
  const combatSkills = SKILLS.filter(
    (sk) => sk.combat && (character.skills[sk.id] ?? 0) > 0 && character.mp >= sk.mp,
  );
  const race = RACES[character.race];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_oklab,var(--color-bg)_72%,transparent)] p-2 backdrop-blur-[2px] sm:p-4">
      <div className="panel relative grid max-h-[96dvh] w-full max-w-5xl grid-cols-2 overflow-y-auto pb-28 lg:grid-cols-[1fr_1.15fr_1fr] lg:pb-0">
        <figure className="frame-3d relative min-h-28 overflow-hidden border-b border-border sm:min-h-40 lg:min-h-56 lg:border-b-0 lg:border-r">
          <img
            src={race.portrait}
            alt={character.name}
            className={`h-full w-full object-cover object-[center_18%] ${character.race === "zharkrovny" ? "portrait-zharkrovny" : ""}`}
            crossOrigin="anonymous"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-elevated to-transparent p-2 sm:p-4">
            <div className="font-display text-lg sm:text-2xl">{character.name}</div>
            <div className="text-sm tabular-nums text-fg-muted sm:text-base">
              HP {character.hp}/{character.maxHp} · MP {character.mp}/{character.maxMp}
            </div>
            <div className="mt-0.5 font-display text-xl tabular-nums text-accent sm:text-2xl">
              {combat.currentPlayerRoll ?? "—"}
            </div>
          </figcaption>
        </figure>

        <figure className="frame-3d frame-3d-right relative min-h-28 overflow-hidden border-b border-l border-border sm:min-h-40 lg:col-start-3 lg:min-h-56 lg:border-b-0">
          <img
            src={combat.enemyPortrait}
            alt={combat.enemyName}
            className="h-full w-full object-cover object-[center_12%]"
            crossOrigin="anonymous"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-elevated to-transparent p-2 sm:p-4">
            <div className="font-display text-lg sm:text-2xl">{combat.enemyName}</div>
            <div className="text-sm text-fg-muted sm:text-base">Уровень {combat.enemyLevel}</div>
            <div className="mt-0.5 font-display text-xl tabular-nums text-accent sm:text-2xl">
              {combat.currentEnemyRoll ?? "—"}
            </div>
          </figcaption>
        </figure>

        <div className="col-span-2 flex flex-col p-3 sm:p-5 lg:col-span-1 lg:col-start-2 lg:row-start-1">
          <p className="font-sans text-sm uppercase tracking-[0.18em] text-accent">
            Бой · раунд {Math.min(combat.round, 3)} из 3 · {wins}:{losses}
          </p>
          <p className="mt-2 font-display text-lg leading-relaxed text-fg sm:text-xl">{combat.narrative}</p>
          {combat.enemySpecials.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-fg-muted sm:text-base">
              {combat.enemySpecials.map((sp) => (
                <li key={sp}>· {SPECIAL_LABEL[sp]}</li>
              ))}
            </ul>
          )}

          {combat.phase === "enemy_roll" && (
            <p className="mt-4 font-display text-lg text-accent sm:text-xl">Нажми кубик врага справа.</p>
          )}
          {combat.phase === "player_act" && (
            <div className="mt-3 flex flex-col gap-2">
              <p className="font-display text-lg text-accent sm:text-xl">
                Нажми свой кубик слева. Можно сначала выбрать навык.
              </p>
              {combatSkills.map((sk) => (
                <button
                  key={sk.id}
                  type="button"
                  className={`btn-3d min-h-12 rounded-md border px-3 text-left text-base sm:text-lg ${
                    combatSkill === sk.id ? "border-accent bg-accent/15" : "border-border"
                  }`}
                  onClick={() => {
                    sfxClick();
                    selectSkill(combatSkill === sk.id ? null : sk.id);
                  }}
                >
                  {sk.name} · {sk.mp} маны
                </button>
              ))}
            </div>
          )}
          {combat.phase === "round_result" && (
            <button
              type="button"
              className="btn-3d mt-4 min-h-12 rounded-md bg-accent text-lg font-semibold text-accent-fg"
              onClick={ack}
            >
              Следующий раунд
            </button>
          )}
          {combat.phase === "battle_end" && (
            <button
              type="button"
              className="btn-3d mt-4 min-h-12 rounded-md bg-accent text-lg font-semibold text-accent-fg"
              onClick={finish}
            >
              Итог боя
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
