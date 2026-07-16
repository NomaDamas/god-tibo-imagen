import { useEffect, useState } from "react";
import { BattleHud } from "./components/BattleHud.jsx";
import { BattleScene } from "./components/BattleScene.jsx";
import units from "./data/asset-manifest.json";
import "@fontsource/noto-sans-kr/korean-400.css";
import "@fontsource/noto-sans-kr/korean-600.css";
import "@fontsource/noto-sans-kr/korean-700.css";
import "./styles/tokens.css";
import "./styles/battle.css";

export function App() {
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [auto, setAuto] = useState(true);
  const [cost, setCost] = useState(8);
  const [timeLeft, setTimeLeft] = useState(88);
  const [activeSkill, setActiveSkill] = useState(null);
  const [rewardOpen, setRewardOpen] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(
      () => setCost((value) => Math.min(10, value + 1)),
      1100 / speed,
    );
    return () => window.clearInterval(timer);
  }, [paused, speed]);

  useEffect(() => {
    if (paused || timeLeft === 0) return undefined;
    const timer = window.setInterval(
      () => setTimeLeft((value) => Math.max(0, value - 1)),
      1000 / speed,
    );
    return () => window.clearInterval(timer);
  }, [paused, speed, timeLeft]);

  function triggerSkill(skill) {
    if (paused || cost < skill.cost) return;
    setCost((value) => value - skill.cost);
    setActiveSkill(skill.id);
    window.setTimeout(() => setActiveSkill(null), 720 / speed);
  }

  return (
    <main className="prototype-stage">
      <section
        className={`game-shell ${paused ? "is-paused" : ""}`}
        aria-label="아스터 아카데미 자동 전투"
      >
        <BattleScene
          units={units.units}
          activeSkill={activeSkill}
          speed={speed}
        />
        <BattleHud
          units={units.units}
          paused={paused}
          speed={speed}
          auto={auto}
          cost={cost}
          timeLeft={timeLeft}
          rewardOpen={rewardOpen}
          onPause={() => setPaused((value) => !value)}
          onSpeed={() => setSpeed((value) => (value === 1 ? 2 : 1))}
          onAuto={() => setAuto((value) => !value)}
          onReward={() => setRewardOpen((value) => !value)}
          onSkill={triggerSkill}
        />
      </section>
    </main>
  );
}
