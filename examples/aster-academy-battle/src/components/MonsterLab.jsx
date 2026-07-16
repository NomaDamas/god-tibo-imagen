import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { getFirstBatchMonsters } from "../lib/monster-system.js";
import { MonsterActor } from "./MonsterActor.jsx";

const states = [
  ["idle", "대기"],
  ["move", "이동"],
  ["attack", "공격"],
  ["hit", "피격"],
  ["death", "사망"],
];

export function MonsterLab({ catalog, paused, speed, onPause, onSpeed }) {
  const monsters = useMemo(() => getFirstBatchMonsters(catalog), [catalog]);
  const [selectedId, setSelectedId] = useState(monsters[0]?.id);
  const [state, setState] = useState("idle");
  const [replayKey, setReplayKey] = useState(0);
  const selected = monsters.find((monster) => monster.id === selectedId) ?? monsters[0];

  function play(nextState) {
    setState(nextState);
    setReplayKey((value) => value + 1);
  }

  return (
    <section className="monster-lab" aria-label="몬스터 제작 검수실">
      <header className="monster-lab__header">
        <div>
          <small>PRODUCTION BATCH 01</small>
          <strong>중앙 광장 오류체 · 12/400</strong>
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

      <div className="monster-lab__catalog" aria-label="첫 생산 몬스터 목록">
        {monsters.map((monster) => (
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
    </section>
  );
}
