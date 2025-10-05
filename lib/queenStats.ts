export const STAT_KEYS = ["Acting", "Dance", "Comedy", "Design", "Runway", "Singing"] as const;

export type StatKey = typeof STAT_KEYS[number];

export type QueenStats = Record<StatKey, number>;

type QueenLike = {
  id?: string;
  name?: string;
  stats?: Partial<Record<StatKey, number>> | null;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(Math.round(value), min), max);
};

const createSeedFromString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash >>> 0; // Ensure non-negative number
};

const createGenerator = (initialSeed: number) => {
  let state = initialSeed >>> 0;
  if (state === 0) {
    state = 0x6d2b79f5;
  }

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0; // Linear congruential generator
    return state / 0xffffffff;
  };
};

export const generateQueenStats = (queen: QueenLike): QueenStats => {
  const baseStats = queen.stats ?? {};
  const generator = createGenerator(createSeedFromString(`${queen.id ?? ""}|${queen.name ?? ""}`));

  const stats: Partial<QueenStats> = {};

  for (const key of STAT_KEYS) {
    const existingValue = baseStats[key];

    if (typeof existingValue === "number" && !Number.isNaN(existingValue)) {
      stats[key] = clamp(existingValue, 1, 100);
    } else {
      const generatedValue = Math.floor(generator() * 100) + 1;
      stats[key] = clamp(generatedValue, 1, 100);
    }
  }

  return stats as QueenStats;
};

export const withQueenStats = <T extends QueenLike>(queen: T): T & { stats: QueenStats } => ({
  ...queen,
  stats: generateQueenStats(queen),
});
