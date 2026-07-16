export function getProducedMonsters(catalog, production) {
  const produced = new Set(
    production.archetypes.map(({ zoneId, slug }) => `${zoneId}:${slug}`),
  );
  return catalog.filter((monster) => produced.has(`${monster.zoneId}:${monster.slug}`));
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
