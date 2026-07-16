const skills = [
  { id: "seoha", label: "섬광 돌입", cost: 3 },
  { id: "rumi", label: "펄스 지원", cost: 4 },
  { id: "iden", label: "전술 분석", cost: 3 },
];

export function SkillDeck({ units, cost, paused, onSkill }) {
  const heroes = units.filter((unit) => unit.kind === "hero");

  return (
    <div className="skill-deck" aria-label="학생 스킬">
      {skills.map((skill, index) => {
        const hero = heroes[index];
        return (
          <button
            key={skill.id}
            className="skill-card"
            type="button"
            aria-label={`${skill.label}, 코스트 ${skill.cost}`}
            disabled={paused || cost < skill.cost}
            onClick={() => onSkill(skill)}
          >
            <img src={hero.portrait} alt="" />
            <span className="skill-card__cost">{skill.cost}</span>
          </button>
        );
      })}
    </div>
  );
}
