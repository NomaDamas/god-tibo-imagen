import motionProfiles from "../data/motion-profiles.json";
import { actorClassNames } from "../lib/monster-system.js";

export function MonsterActor({ monster, state, paused, speed, replayKey = 0, compact = false }) {
  const profile = motionProfiles[monster.motionProfile] ?? motionProfiles.bob;
  const duration = profile[state] ?? profile.idle;

  return (
    <div
      className={actorClassNames({
        profile: monster.motionProfile,
        state,
        paused,
        replayKey,
      })}
      role="img"
      aria-label={`${monster.name} ${monster.tierName}, ${state}`}
      style={{
        "--monster-duration": `${duration / speed}ms`,
        "--monster-scale": compact ? 1 : monster.scale,
      }}
    >
      <img src={monster.asset} alt="" draggable="false" />
    </div>
  );
}
