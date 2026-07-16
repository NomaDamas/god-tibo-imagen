import {
  IconBox,
  IconGift,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { SkillDeck } from "./SkillDeck.jsx";

export function BattleHud({
  units,
  paused,
  speed,
  auto,
  cost,
  timeLeft,
  rewardOpen,
  onPause,
  onSpeed,
  onAuto,
  onReward,
  onSkill,
}) {
  const timerLabel = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  return (
    <div className="hud">
      <div className="mission-banner">
        <span>캠퍼스 순찰</span>
        <strong>2-4</strong>
      </div>

      <div className="battle-controls">
        <span className="timer">{timerLabel}</span>
        <button type="button" onClick={onSpeed} aria-label="전투 속도 변경">
          ×{speed}
        </button>
        <button type="button" onClick={onPause} aria-label={paused ? "재생" : "일시정지"}>
          {paused ? <IconPlayerPlayFilled /> : <IconPlayerPauseFilled />}
        </button>
      </div>

      <button
        type="button"
        className={`reward-chip ${rewardOpen ? "is-open" : ""}`}
        onClick={onReward}
        aria-expanded={rewardOpen}
      >
        {rewardOpen ? <IconGift /> : <IconBox />}
        <span>{rewardOpen ? "크레딧 4,280 · 경험치 860" : "방치 보상 02:18:40"}</span>
      </button>

      <div className="combat-deck">
        <span className="cost-badge">
          <small>COST</small>
          <strong>{cost}</strong>
        </span>
        <SkillDeck units={units} cost={cost} paused={paused} onSkill={onSkill} />
        <div className="cost-gauge" aria-label={`코스트 ${cost} / 10`}>
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} className={index < cost ? "is-filled" : ""} />
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`auto-toggle ${auto ? "is-active" : ""}`}
        onClick={onAuto}
        aria-pressed={auto}
      >
        AUTO
      </button>
    </div>
  );
}
