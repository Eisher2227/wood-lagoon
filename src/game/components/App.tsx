import { useEffect, useState } from "react";
import { hasSave, useGame } from "../store";
import { unlockAudio } from "../audio";
import { MainMenu } from "./MainMenu";
import { CharacterCreate } from "./CharacterCreate";
import { GameScreen } from "./GameScreen";
import { CombatScreen } from "./CombatScreen";
import { Overlays } from "./Overlays";
import { DiceLayer } from "./Dice3D";
import { Tutorial } from "./Tutorial";

export function GameApp() {
  const screen = useGame((s) => s.screen);
  const hydrate = useGame((s) => s.hydrate);
  const persist = useGame((s) => s.persist);
  const combat = useGame((s) => s.combat);
  const [saveExists, setSaveExists] = useState(false);

  useEffect(() => {
    hydrate();
    setSaveExists(hasSave());
  }, [hydrate]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") persist();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", persist);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", persist);
    };
  }, [persist]);

  return (
    <div className="min-h-dvh bg-bg text-fg" onPointerDown={() => unlockAudio()}>
      {screen === "menu" || screen === "lore" ? <MainMenu hasSave={saveExists} /> : null}
      {screen === "create" ? <CharacterCreate /> : null}
      {screen === "game" ? <GameScreen /> : null}
      {combat ? <CombatScreen /> : null}
      <Overlays />
      <DiceLayer />
      <Tutorial />
    </div>
  );
}
