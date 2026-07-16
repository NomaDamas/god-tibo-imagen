import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import production from "../data/monster-production.json";
import { getProducedMonsters } from "../lib/monster-system.js";
import { MonsterActor } from "./MonsterActor.jsx";

const states = [
  ["idle", "대기"],
  ["move", "이동"],
  ["attack", "공격"],
  ["hit", "피격"],
  ["death", "사망"],
];

export function MonsterLab({ catalog, paused, speed, onPause, onSpeed }) {
  const monsters = useMemo(() => getProducedMonsters(catalog, production), [catalog]);
  const archetypes = useMemo(
    () => [...new Map(monsters.map((monster) => [monster.slug, monster])).values()],
    [monsters],
  );
  const [selectedId, setSelectedId] = useState(monsters[0]?.id);
  const [state, setState] = useState("idle");
  const [replayKey, setReplayKey] = useState(0);
  const selected = monsters.find((monster) => monster.id === selectedId) ?? monsters[0];
  const family = monsters.filter((monster) => monster.slug === selected.slug);

  function play(nextState) {
    setState(nextState);
    setReplayKey((value) => value + 1);
  }

  return (
    <section className="monster-lab" aria-label="몬스터 제작 검수실">
      <header className="monster-lab__header">
        <div>
          <small>PRODUCTION BATCH 01</small>
          <strong>중앙 광장 오류체 · {monsters.length}/400</strong>
        </div>
        <div className="monster-lab__runtime">
          <button type="button" onClick={onSpeed} aria-label="몬스터 애니메이션 속도 변경">×{speed}</button>
          <button type="button" onClick={onPause} aria-label={paused ? "재생" : "일시정지"}>
            {paused ? <IconPlayerPlayFilled /> : <IconPlayerPauseFilled />}
          </button>
        </div>
      </header>

      <div className="monster-lab__preview">
        <div className="monster-lab__identity">
          <span>{selected.archetypeId}</span>
          <h2>{selected.name}</h2>
          <p>{selected.tierName} · {selected.motionProfile.toUpperCase()}</p>
        </div>
        <div className="monster-lab__stage">
          <MonsterActor
            key={`${selected.id}-${replayKey}`}
            monster={selected}
            state={state}
            paused={paused}
            speed={speed}
            replayKey={replayKey}
          />
        </div>
        <div className="monster-lab__states" aria-label="애니메이션 상태 선택">
          {states.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={state === value ? "is-active" : ""}
              onClick={() => play(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="monster-lab__browser">
        <nav className="monster-lab__families" aria-label="몬스터 계열 선택">
          {archetypes.map((archetype) => (
            <button
              key={archetype.slug}
              type="button"
              aria-pressed={selected.slug === archetype.slug}
              className={selected.slug === archetype.slug ? "is-active" : ""}
              onClick={() => {
                const next = monsters.find(
                  (monster) => monster.slug === archetype.slug && monster.tier === selected.tier,
                ) ?? archetype;
                setSelectedId(next.id);
                play("idle");
              }}
            >
              {archetype.name}
            </button>
          ))}
        </nav>
        <div className="monster-lab__catalog" aria-label={`${selected.name} 티어 목록`}>
          {family.map((monster) => (
            <button
              key={monster.id}
              type="button"
              className={selected.id === monster.id ? "is-selected" : ""}
              onClick={() => {
                setSelectedId(monster.id);
                play("idle");
              }}
            >
              <img src={monster.asset} alt="" />
              <span>{monster.name}</span>
              <small>{monster.tierName}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
