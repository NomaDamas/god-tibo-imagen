import { useEffect, useState } from "react";
import { BattleHud } from "./components/BattleHud.jsx";
import { BattleScene } from "./components/BattleScene.jsx";
import { MonsterLab } from "./components/MonsterLab.jsx";
import units from "./data/asset-manifest.json";
import monsterCatalog from "./data/monster-catalog.json";
import "@fontsource/noto-sans-kr/korean-400.css";
import "@fontsource/noto-sans-kr/korean-600.css";
import "@fontsource/noto-sans-kr/korean-700.css";
import "./styles/tokens.css";
import "./styles/battle.css";
import "./styles/monster-motion.css";
import "./styles/monster-lab.css";

export function App() {
  const [view, setView] = useState("battle");
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
        aria-label={view === "battle" ? "아스터 아카데미 자동 전투" : "아스터 아카데미 몬스터 제작 검수실"}
      >
        {view === "battle" ? (
          <>
            <BattleScene units={units.units} activeSkill={activeSkill} speed={speed} />
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
          </>
        ) : (
          <MonsterLab
            catalog={monsterCatalog}
            paused={paused}
            speed={speed}
            onPause={() => setPaused((value) => !value)}
            onSpeed={() => setSpeed((value) => (value === 1 ? 2 : 1))}
          />
        )}
        <nav className="view-switcher" aria-label="프로토타입 화면 전환">
          <button type="button" aria-pressed={view === "battle"} className={view === "battle" ? "is-active" : ""} onClick={() => setView("battle")}>BATTLE</button>
          <button type="button" aria-pressed={view === "monsters"} className={view === "monsters" ? "is-active" : ""} onClick={() => setView("monsters")}>MONSTER LAB</button>
        </nav>
      </section>
    </main>
  );
}
