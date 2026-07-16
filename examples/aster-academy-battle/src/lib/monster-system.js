const firstBatchArchetypes = new Set(["guide-orb", "banner-hound", "patrol-kite"]);

export function getFirstBatchMonsters(catalog) {
  return catalog.filter(
    (monster) => monster.zoneId === "01" && firstBatchArchetypes.has(monster.slug),
  );
}

export function actorClassNames({ profile, state, paused, replayKey }) {
  return [
    "monster-actor",
    `profile--${profile}`,
    `state--${state}`,
    paused ? "is-paused" : null,
    `replay--${replayKey}`,
  ].filter(Boolean).join(" ");
}
