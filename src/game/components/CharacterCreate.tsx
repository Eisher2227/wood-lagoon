import { CLASSES, CREATE_CLASS_IDS, KITS, RACES } from "../data";
import { useGame } from "../store";
import { sfxClick } from "../audio";
import type { ClassId, RaceId } from "../types";
import { GoldCount } from "./GoldCount";

const RACE_IDS = Object.keys(RACES) as RaceId[];
const CLASS_IDS = CREATE_CLASS_IDS;

export function CharacterCreate() {
  const create = useGame((s) => s.create);
  const setCreate = useGame((s) => s.setCreate);
  const setScreen = useGame((s) => s.setScreen);
  const startNew = useGame((s) => s.startNew);
  const kits = KITS.filter((k) => k.classId === create.class && !k.hidden);

  const next = () => {
    sfxClick();
    if (create.step === 0 && create.race) setCreate({ step: 1 });
    else if (create.step === 1 && create.class) setCreate({ step: 2 });
    else if (create.step === 2 && create.kitId) setCreate({ step: 3 });
    else if (create.step === 3) startNew();
  };

  const back = () => {
    sfxClick();
    if (create.step === 0) setScreen("menu");
    else setCreate({ step: create.step - 1 });
  };

  const canNext =
    (create.step === 0 && create.race) ||
    (create.step === 1 && create.class) ||
    (create.step === 2 && create.kitId) ||
    create.step === 3;

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-3 py-5 pb-28 sm:px-8">
      <p className="font-sans text-sm uppercase tracking-[0.2em] text-accent">
        Создание · шаг {create.step + 1} из 4
      </p>
      <h2 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">
        {create.step === 0 && "Раса"}
        {create.step === 1 && "Класс"}
        {create.step === 2 && "Снаряжение"}
        {create.step === 3 && "Имя"}
      </h2>
      <p className="mt-2 font-display text-xl text-fg-muted">
        {create.step === 0 && "Кем ты будешь на осколках."}
        {create.step === 1 && "Как дерёшься и выживаешь."}
        {create.step === 2 && "Стартовый набор. Потом найдёшь лучше."}
        {create.step === 3 && "Имя нужно помнить. Пока помнишь — существуешь."}
      </p>

      {create.step === 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          {RACE_IDS.map((id) => {
            const r = RACES[id];
            const on = create.race === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sfxClick();
                  setCreate({ race: id });
                }}
                className={`frame-3d overflow-hidden rounded-lg border text-left transition-transform duration-150 active:scale-[0.99] ${
                  on ? "border-accent" : "border-border"
                }`}
              >
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={r.portrait}
                    alt=""
                    className={`h-full w-full object-cover ${id === "zharkrovny" ? "portrait-zharkrovny" : ""}`}
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="bg-bg-elevated p-3">
                  <div className="font-display text-xl font-semibold">{r.name}</div>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">{r.bonus}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {create.step === 0 && create.race && (
        <p className="mt-4 max-w-2xl font-display text-xl leading-relaxed text-fg-muted">
          {RACES[create.race].blurb}
        </p>
      )}

      {create.step === 1 && (
        <div className="kit-grid mt-6">
          {CLASS_IDS.map((id) => {
            const c = CLASSES[id];
            const on = create.class === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sfxClick();
                  setCreate({ class: id, kitId: null });
                }}
                className={`rounded-lg border p-5 text-left ${on ? "border-accent bg-bg-elevated" : "border-border bg-bg-subtle"}`}
              >
                <div className="font-display text-3xl font-semibold">{c.name}</div>
                <p className="mt-2 font-display text-lg leading-relaxed text-fg-muted">{c.blurb}</p>
              </button>
            );
          })}
        </div>
      )}

      {create.step === 2 && (
        <div className="kit-grid mt-6">
          {kits.map((k) => {
            const on = create.kitId === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => {
                  sfxClick();
                  setCreate({ kitId: k.id });
                }}
                className={`overflow-hidden rounded-lg border text-left ${on ? "border-accent bg-bg-elevated" : "border-border bg-bg-subtle"}`}
              >
                {k.image ? (
                  <div className="aspect-[3/2] overflow-hidden">
                    <img src={k.image} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
                  </div>
                ) : null}
                <div className="p-4">
                  <div className="font-display text-2xl font-semibold">{k.name}</div>
                  <p className="mt-2 text-lg leading-relaxed text-fg-muted">{k.blurb}</p>
                  <div className="mt-3 flex items-center gap-2 text-fg-muted">
                    <GoldCount amount={k.gold} />
                    <span className="text-base">· {k.items.length} вещей</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {create.step === 3 && (
        <div className="mt-8 max-w-md">
          <label className="text-sm uppercase tracking-[0.16em] text-fg-muted" htmlFor="hero-name">
            Как тебя зовут
          </label>
          <input
            id="hero-name"
            value={create.name}
            maxLength={24}
            onChange={(e) => setCreate({ name: e.target.value })}
            placeholder="Безымянный"
            className="mt-2 h-14 w-full rounded-md border border-border bg-bg-elevated px-3 font-display text-2xl text-fg outline-none focus:border-accent"
          />
          {create.race && create.class && (
            <p className="mt-4 font-display text-xl text-fg-muted">
              {RACES[create.race].name} · {CLASSES[create.class].name}
              {create.kitId ? ` · ${kits.find((k) => k.id === create.kitId)?.name ?? ""}` : ""}
            </p>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-3 pt-8">
        <button
          type="button"
          onClick={back}
          className="btn-3d min-h-14 min-w-28 rounded-md border border-border px-4 text-lg"
        >
          Назад
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={next}
          className="btn-3d min-h-14 min-w-40 rounded-md bg-accent px-5 text-lg font-semibold text-accent-fg disabled:opacity-40"
        >
          {create.step === 3 ? "В путь" : "Далее"}
        </button>
      </div>
    </div>
  );
}
