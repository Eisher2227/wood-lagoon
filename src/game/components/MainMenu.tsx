import { useGame } from "../store";
import { setMuted, isMuted, sfxClick } from "../audio";
import { useState } from "react";

export function MainMenu({ hasSave }: { hasSave: boolean }) {
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  const continueSave = useGame((s) => s.continueSave);
  const [mute, setMute] = useState(isMuted());

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <img
        src="/menu-bg.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,244,228,0.28)_0%,rgba(251,247,236,0.62)_48%,rgba(251,247,236,0.92)_100%)]" />
      <div className="fog-layer absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(238,244,228,0.25)_80%)]" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col justify-end px-6 pb-28 pt-20 sm:justify-center sm:pb-16">
        <p className="rise-in font-sans text-sm font-medium uppercase tracking-[0.24em] text-accent">
          После Конца Времён
        </p>
        <h1 className="font-display mt-3 text-5xl font-semibold leading-[0.95] tracking-tight text-fg sm:text-6xl">
          Туманная
          <br />
          застава
        </h1>
        {screen === "lore" ? (
          <div className="rise-in mt-6 space-y-3 font-display text-xl leading-relaxed text-fg">
            <p>Боги спят. Мир рассыпался на шестигранные клетки. Туман съедает края.</p>
            <p>
              Ты видишь только ту клетку, на которой стоишь. Каждый ход — шаг в неизвестное. Смерть не конец: она
              открывает Навь, откуда можно вернуться.
            </p>
            <p>Пока помнишь своё имя — существуешь. Приключение ещё живо.</p>
            <button
              type="button"
              className="btn-3d mt-4 min-h-12 rounded-md border border-border px-4 text-base text-fg"
              onClick={() => setScreen("menu")}
            >
              Назад
            </button>
          </div>
        ) : (
          <>
            <p className="rise-in mt-5 max-w-md font-display text-2xl leading-relaxed text-fg">
              Туман стирает нехоженое. Иди, пока клетка ещё земля.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                className="btn-3d min-h-14 rounded-md bg-accent px-5 font-sans text-lg font-semibold tracking-wide text-accent-fg transition-transform duration-150 hover:brightness-110"
                onClick={() => {
                  sfxClick();
                  useGame.setState({
                    create: { race: null, class: null, kitId: null, name: "", step: 0 },
                    screen: "create",
                  });
                }}
              >
                Новая игра
              </button>
              <button
                type="button"
                disabled={!hasSave}
                className="btn-3d min-h-14 rounded-md border border-border-strong bg-bg-elevated px-5 font-sans text-lg font-medium text-fg disabled:opacity-35"
                onClick={() => {
                  sfxClick();
                  continueSave();
                }}
              >
                Продолжить
              </button>
              <button
                type="button"
                className="btn-3d min-h-14 rounded-md border border-border bg-bg-elevated px-5 text-lg"
                onClick={() => {
                  sfxClick();
                  setScreen("lore");
                }}
              >
                О мире
              </button>
              <button
                type="button"
                className="min-h-12 text-left text-base text-fg-muted"
                onClick={() => {
                  const next = !mute;
                  setMuted(next);
                  setMute(next);
                }}
              >
                Звук: {mute ? "выкл" : "вкл"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
