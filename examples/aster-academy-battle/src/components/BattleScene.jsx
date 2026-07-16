import { CharacterUnit } from "./CharacterUnit.jsx";

export function BattleScene({ units, activeSkill, speed }) {
  return (
    <div className="battlefield" data-testid="battlefield">
      <img
        className="battlefield__background"
        src="/assets/backgrounds/campus-plaza.png"
        alt="햇빛이 비치는 아스터 아카데미 중앙 광장"
      />
      <div className="battlefield__wash" />
      <div className="battlefield__units">
        {units.map((unit) => (
          <CharacterUnit key={unit.id} unit={unit} speed={speed} />
        ))}
      </div>
      <div className={`skill-effect ${activeSkill ? "is-active" : ""}`}>
        <img src="/assets/effects/team-skill-flare.png" alt="" />
      </div>
      <div className={`projectile ${activeSkill ? "is-active" : ""}`}>
        <img src="/assets/effects/cyan-projectile.png" alt="" />
      </div>
      <div className={`hit-effect ${activeSkill ? "is-active" : ""}`}>
        <img src="/assets/effects/orange-hit-burst.png" alt="" />
      </div>
      <span className={`damage-number ${activeSkill ? "is-active" : ""}`}>
        WEAK 2,408
      </span>
    </div>
  );
}
