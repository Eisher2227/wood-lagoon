import { createFileRoute } from "@tanstack/react-router";
import { GameApp } from "@/game/components/App";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <GameApp />;
}
