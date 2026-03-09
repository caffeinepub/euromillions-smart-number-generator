import type { Draw, GeneratedLine, NumberFrequency, Strategy } from "../types";

export function buildFrequencies(draws: Draw[]): {
  mainFreq: NumberFrequency[];
  starFreq: NumberFrequency[];
} {
  const mainCount: Record<number, number> = {};
  const starCount: Record<number, number> = {};
  for (let n = 1; n <= 50; n++) mainCount[n] = 0;
  for (let n = 1; n <= 12; n++) starCount[n] = 0;

  for (const draw of draws) {
    for (const b of draw.balls) mainCount[b]++;
    for (const s of draw.stars) starCount[s]++;
  }

  const mainGap: Record<number, number> = {};
  const starGap: Record<number, number> = {};
  for (let n = 1; n <= 50; n++) {
    const idx = draws.findIndex((d) => d.balls.includes(n));
    mainGap[n] = idx === -1 ? draws.length : idx;
  }
  for (let n = 1; n <= 12; n++) {
    const idx = draws.findIndex((d) => d.stars.includes(n));
    starGap[n] = idx === -1 ? draws.length : idx;
  }

  const mainFreq: NumberFrequency[] = Array.from({ length: 50 }, (_, i) => ({
    number: i + 1,
    frequency: mainCount[i + 1],
    gapDraws: mainGap[i + 1],
  }));

  const starFreq: NumberFrequency[] = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    frequency: starCount[i + 1],
    gapDraws: starGap[i + 1],
  }));

  return { mainFreq, starFreq };
}

function weightedSample(
  pool: number[],
  weights: number[],
  count: number,
): number[] {
  const result: number[] = [];
  const w = weights.map((wt) => wt * (0.7 + Math.random() * 0.6));
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    let totalWeight = 0;
    for (let j = 0; j < pool.length; j++) {
      if (!used.has(j)) totalWeight += w[j];
    }
    let rand = Math.random() * totalWeight;
    let picked = false;
    for (let j = 0; j < pool.length; j++) {
      if (used.has(j)) continue;
      rand -= w[j];
      if (rand <= 0) {
        result.push(pool[j]);
        used.add(j);
        picked = true;
        break;
      }
    }
    if (!picked) {
      for (let j = 0; j < pool.length; j++) {
        if (!used.has(j)) {
          result.push(pool[j]);
          used.add(j);
          break;
        }
      }
    }
  }
  return result.sort((a, b) => a - b);
}

const STRATEGIES: Strategy[] = [
  "Hot Number Strategy",
  "Cold Number Strategy",
  "Balanced Strategy",
  "Trend Strategy",
  "Weighted Random Strategy",
  "Gap Strategy",
];

function generateLine(
  draws: Draw[],
  mainFreq: NumberFrequency[],
  starFreq: NumberFrequency[],
  strategy: Strategy,
): GeneratedLine {
  const mainSorted = [...mainFreq].sort((a, b) => b.frequency - a.frequency);
  const mainNumbers = mainSorted.map((f) => f.number);
  const recentNumbers = new Set(draws.slice(0, 10).flatMap((d) => d.balls));

  let mainWeights: number[];
  switch (strategy) {
    case "Hot Number Strategy":
      mainWeights = mainSorted.map((f, i) =>
        i < 20 ? f.frequency * 3 + 5 : f.frequency + 1,
      );
      break;
    case "Cold Number Strategy":
      mainWeights = mainSorted.map((_, i) =>
        i >= mainSorted.length - 20 ? (mainSorted.length - i) * 3 + 5 : 1,
      );
      break;
    case "Balanced Strategy":
      mainWeights = mainSorted.map((f, i) =>
        i < 10
          ? f.frequency * 3 + 5
          : i < 30
            ? f.frequency * 2 + 3
            : f.frequency + 1,
      );
      break;
    case "Trend Strategy":
      mainWeights = mainSorted.map((f) =>
        recentNumbers.has(f.number) ? f.frequency * 4 + 10 : f.frequency + 1,
      );
      break;
    case "Weighted Random Strategy":
      mainWeights = mainSorted.map((f) => f.frequency + 1);
      break;
    case "Gap Strategy": {
      const maxGap = Math.max(...mainFreq.map((f) => f.gapDraws ?? 0));
      mainWeights = mainSorted.map((f) => (f.gapDraws ?? maxGap) + 1);
      break;
    }
  }

  const selectedBalls = weightedSample(mainNumbers, mainWeights, 5);
  const starSorted = [...starFreq].sort((a, b) => a.number - b.number);
  const selectedStars = weightedSample(
    starSorted.map((f) => f.number),
    starSorted.map((f) => f.frequency + 1),
    2,
  );

  return {
    balls: selectedBalls,
    stars: selectedStars,
    strategy,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

export function generateLines(
  draws: Draw[],
  mainFreq: NumberFrequency[],
  starFreq: NumberFrequency[],
  count: number,
): GeneratedLine[] {
  return Array.from({ length: count }, () => {
    const strategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
    return generateLine(draws, mainFreq, starFreq, strategy);
  });
}
