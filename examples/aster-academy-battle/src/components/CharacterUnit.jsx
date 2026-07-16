export function CharacterUnit({ unit, speed }) {
  return (
    <div
      className={`unit unit--${unit.kind} motion--${unit.motion}`}
      data-unit-id={unit.id}
      aria-label={unit.label}
      style={{
        "--unit-x": `${unit.x}%`,
        "--unit-y": `${unit.y}%`,
        "--unit-depth": Math.round(unit.y),
        "--unit-width": `${unit.width}%`,
        "--unit-facing": unit.facing,
        "--motion-speed": `${1 / speed}s`,
      }}
    >
      <span className="unit__health" aria-hidden="true">
        <span style={{ width: `${unit.health}%` }} />
      </span>
      <img src={unit.asset} alt="" draggable="false" />
    </div>
  );
}
