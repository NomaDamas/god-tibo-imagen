export const tierDefinitions = [
  { tier: "basic", tierName: "기초형", scale: 1, changes: ["단일 센서 코어", "기본형 외장 프레임"] },
  { tier: "advanced", tierName: "강화형", scale: 1.1, changes: ["보조 방호판", "이중 상태 센서"] },
  { tier: "glitched", tierName: "오류형", scale: 1.18, changes: ["비대칭 분리 파츠", "과부하 균열 코어"] },
  { tier: "overdrive", tierName: "초월형", scale: 1.3, changes: ["부유 지휘 링", "대형 다중 코어"] },
];

export function expandCatalog(source) {
  return source.archetypes.flatMap((archetype) =>
    tierDefinitions.map((tier) => ({
      id: `${archetype.zoneId}-${archetype.slug}-${tier.tier}`,
      zoneId: archetype.zoneId,
      zoneSlug: archetype.zoneSlug,
      zoneName: archetype.zoneName,
      archetypeId: archetype.archetypeId,
      slug: archetype.slug,
      name: archetype.name,
      role: archetype.role,
      identity: archetype.identity,
      palette: archetype.palette,
      motionProfile: archetype.motionProfile,
      tier: tier.tier,
      tierName: tier.tierName,
      scale: tier.scale,
      structuralChanges: tier.changes,
      asset: `/assets/monsters/${archetype.zoneId}-${archetype.zoneSlug}/${archetype.slug}/${tier.tier}.png`,
    })),
  );
}
