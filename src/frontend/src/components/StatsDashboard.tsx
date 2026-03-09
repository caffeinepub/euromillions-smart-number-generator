import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { NumberFrequency } from "../types";

interface Props {
  mainFreq: NumberFrequency[];
  starFreq: NumberFrequency[];
}

function MiniLotteryBall({ number, freq }: { number: number; freq: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="ball-mini-main">{number}</div>
      <span className="text-[10px] text-muted-foreground font-mono">
        {freq}x
      </span>
    </div>
  );
}

export function StatsDashboard({ mainFreq, starFreq }: Props) {
  const sorted = useMemo(
    () => [...mainFreq].sort((a, b) => b.frequency - a.frequency),
    [mainFreq],
  );
  const hot = sorted.slice(0, 10);
  const cold = [...sorted].reverse().slice(0, 10);

  const starData = useMemo(
    () =>
      [...starFreq]
        .sort((a, b) => a.number - b.number)
        .map((f) => ({ name: `★${f.number}`, value: f.frequency })),
    [starFreq],
  );
  const maxStarFreq = Math.max(...starData.map((d) => d.value), 1);

  return (
    <section data-ocid="stats.section" className="space-y-4">
      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
        Historical Analysis
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div data-ocid="stats.hot_numbers.card" className="card-glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-2 h-2 rounded-full bg-orange-400"
              style={{ boxShadow: "0 0 6px rgba(251,146,60,0.8)" }}
            />
            <h3 className="font-display font-bold text-base text-foreground">
              Hot Numbers
            </h3>
            <span className="text-xs text-muted-foreground ml-auto">
              Most frequent
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hot.map((n) => (
              <MiniLotteryBall
                key={n.number}
                number={n.number}
                freq={n.frequency}
              />
            ))}
          </div>
        </div>
        <div data-ocid="stats.cold_numbers.card" className="card-glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-2 h-2 rounded-full bg-blue-400"
              style={{ boxShadow: "0 0 6px rgba(96,165,250,0.8)" }}
            />
            <h3 className="font-display font-bold text-base text-foreground">
              Cold Numbers
            </h3>
            <span className="text-xs text-muted-foreground ml-auto">
              Least frequent
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cold.map((n) => (
              <MiniLotteryBall
                key={n.number}
                number={n.number}
                freq={n.frequency}
              />
            ))}
          </div>
        </div>
        <div
          data-ocid="stats.lucky_stars.card"
          className="card-glass p-5 md:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-2 h-2 rounded-full bg-yellow-400"
              style={{ boxShadow: "0 0 6px rgba(250,204,21,0.8)" }}
            />
            <h3 className="font-display font-bold text-base text-foreground">
              Lucky Stars
            </h3>
            <span className="text-xs text-muted-foreground ml-auto">
              Frequency (1–12)
            </span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={starData}
                margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#888", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#888", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReTooltip
                  contentStyle={{
                    background: "#0f1117",
                    border: "1px solid #2a2f3e",
                    borderRadius: "8px",
                    color: "#f5f5f0",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {starData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.value === maxStarFreq
                          ? "#f5c842"
                          : `hsl(47, ${50 + (entry.value / maxStarFreq) * 50}%, ${40 + (entry.value / maxStarFreq) * 20}%)`
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
