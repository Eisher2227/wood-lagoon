import { useGame } from "../store";
import { sfxClick } from "../audio";

const STEPS = [
  {
    title: "Ты на клетке мира",
    text: "Шестигранник в центре — одно место. Картинка внутри: лес, деревня, река. Других клеток пока не видно.",
  },
  {
    title: "Стрелки — это шаг",
    text: "Шесть стрелок вокруг клетки — шесть дорог. Каждый ход нужно выбрать одну. Куда придёшь, узнаешь после шага.",
  },
  {
    title: "Два дела за ход",
    text: "Можно сделать два дела: поискать, копнуть, отдохнуть или закрыть квест. На компьютере список справа, на телефоне — кнопка «Дела». Потом обязателен шаг.",
  },
  {
    title: "Как закрыть квест",
    text: "Откроется отдельное окно. Сначала способ: проверить характеристику, заплатить золотом, бросить кубик на удачу (нужно 18+) или поговорить.",
  },
  {
    title: "Разговор",
    text: "Если говоришь — откроется окно с тремя репликами. Они не подсказывают, какая сработает. Выбирай по чутью.",
  },
  {
    title: "Бой",
    text: "Слева ты, справа враг. Нажми на кубик — он покажет число. У кого больше, тот выиграл раунд. Три раунда решают бой.",
  },
  {
    title: "Сумка и жизнь",
    text: "Вещи, золото, здоровье и мана — слева на компьютере и в меню (кнопка сверху слева) на телефоне. Если здоровье кончится, попадёшь в Навь. Выход — Врата Яви.",
  },
];

export function Tutorial() {
  const open = useGame((s) => s.tutorialOpen);
  const step = useGame((s) => s.tutorialStep);
  const next = useGame((s) => s.tutorialNext);
  const skip = useGame((s) => s.closeTutorial);
  if (!open) return null;
  const cur = STEPS[step] ?? STEPS[0]!;
  const last = step >= STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-3 pb-28 backdrop-blur-[2px] sm:items-center sm:p-6 sm:pb-6">
      <div className="panel-3d w-full max-w-xl p-5 sm:p-8">
        <p className="font-sans text-sm uppercase tracking-[0.18em] text-accent">
          Обучение · {step + 1} из {STEPS.length}
        </p>
        <h3 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">{cur.title}</h3>
        <p className="mt-3 font-display text-xl leading-relaxed text-fg sm:text-2xl">{cur.text}</p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            className="btn-3d min-h-12 rounded-md border border-border bg-bg-elevated px-5 text-base"
            onClick={() => {
              sfxClick();
              skip();
            }}
          >
            Пропустить
          </button>
          <button
            type="button"
            className="btn-3d min-h-12 flex-1 rounded-md bg-accent px-5 text-lg font-semibold text-accent-fg"
            onClick={() => {
              sfxClick();
              next();
            }}
          >
            {last ? "Понятно, в путь" : "Дальше"}
          </button>
        </div>
      </div>
    </div>
  );
}
