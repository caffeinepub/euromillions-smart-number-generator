import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  FlaskConical,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Draw, GeneratedLine, NumberFrequency } from "../types";
import { generateLines, runMonteCarloSimulation } from "../utils/generator";

const LINE_COUNTS = [1, 3, 5, 10] as const;
type LineCount = (typeof LINE_COUNTS)[number];

type GenerationMode = "smart" | "montecarlo";

const SIM_DRAW_PRESETS = [
  { label: "10K", value: 10_000 },
  { label: "50K", value: 50_000 },
  { label: "100K", value: 100_000 },
  { label: "500K", value: 500_000 },
  { label: "1M", value: 1_000_000 },
] as const;

const STRATEGY_COLORS: Record<string, string> = {
  "Hot Number Strategy": "text-orange-400",
  "Cold Number Strategy": "text-blue-400",
  "Balanced Strategy": "text-green-400",
  "Trend Strategy": "text-purple-400",
  "Weighted Random Strategy": "text-cyan-400",
  "Gap Strategy": "text-pink-400",
  "Monte Carlo Simulation": "text-amber-400",
};

const STRATEGY_DESCRIPTIONS: Record<string, string> = {
  "Hot Number Strategy":
    "Favours numbers that have appeared most frequently in recent draws — riding the hot streak.",
  "Cold Number Strategy":
    "Favours numbers that have appeared least often, betting they are overdue for a comeback.",
  "Balanced Strategy":
    "Mixes the most frequent and least frequent numbers for a blend of hot and cold picks.",
  "Trend Strategy":
    "Prioritises numbers that appeared in the last 10 draws, riding recent momentum.",
  "Weighted Random Strategy":
    "Picks numbers randomly but weighted by historical frequency — common numbers appear more often.",
  "Gap Strategy":
    "Favours numbers that haven't appeared for the longest stretch, on the theory they are due.",
  "Monte Carlo Simulation":
    "Runs thousands of simulated EuroMillions draws using historical probability distributions, then surfaces the combinations that emerged most frequently — the statistically 'richest' picks.",
};

function LotteryBall({
  number,
  type,
  delay,
}: { number: number; type: "main" | "star"; delay: number }) {
  return (
    <div
      className={`ball-animate ${type === "main" ? "ball-main" : "ball-star"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {number}
    </div>
  );
}

interface ResultCardProps {
  line: GeneratedLine;
  index: number;
  maxFrequency?: number;
}

function ResultCard({ line, index, maxFrequency }: ResultCardProps) {
  const colorClass = STRATEGY_COLORS[line.strategy] ?? "text-primary";
  const description = STRATEGY_DESCRIPTIONS[line.strategy];
  const isMonteCarlo = line.strategy === "Monte Carlo Simulation";

  // Confidence bar calculations
  const hasConfidence =
    isMonteCarlo &&
    line.comboFrequency != null &&
    line.simulationCount != null &&
    line.simulationCount > 0;
  const confidencePct = hasConfidence
    ? ((line.comboFrequency! / line.simulationCount!) * 100).toFixed(4)
    : null;
  const barFill =
    hasConfidence && maxFrequency && maxFrequency > 0
      ? Math.min(100, Math.max(2, (line.comboFrequency! / maxFrequency) * 100))
      : 2;

  const simLabel =
    hasConfidence && line.simulationCount!
      ? line.simulationCount! >= 1_000_000
        ? `${(line.simulationCount! / 1_000_000).toFixed(0)}M`
        : `${(line.simulationCount! / 1_000).toFixed(0)}K`
      : "100K";

  const handleCopy = () => {
    const text = `${line.balls.join(", ")} | Stars: ${line.stars.join(", ")}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div
      data-ocid={`generator.result.item.${index}`}
      className="result-card card-glass p-4 md:p-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {isMonteCarlo ? (
          <FlaskConical className={`w-3.5 h-3.5 ${colorClass}`} />
        ) : (
          <Sparkles className={`w-3.5 h-3.5 ${colorClass}`} />
        )}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`text-xs font-semibold ${colorClass} cursor-help underline decoration-dotted underline-offset-2`}
              >
                {line.strategy}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[240px] text-xs text-center"
            >
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-xs text-muted-foreground ml-auto">
          Line {index}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          data-ocid={`generator.result.copy_button.${index}`}
          className="text-[10px] text-muted-foreground hover:text-foreground border border-border/40 hover:border-border rounded px-2 py-0.5 transition-colors"
        >
          Copy
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {line.balls.map((n) => (
          <LotteryBall
            key={`b-${n}`}
            number={n}
            type="main"
            delay={line.balls.indexOf(n) * 80}
          />
        ))}
        <div className="w-px h-8 bg-border/60 mx-1" />
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/30" />
        {line.stars.map((s) => (
          <LotteryBall
            key={`s-${s}`}
            number={s}
            type="star"
            delay={(line.balls.length + line.stars.indexOf(s)) * 80}
          />
        ))}
      </div>

      {/* Confidence bar — Monte Carlo only */}
      {hasConfidence && (
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-400 font-semibold">
              {confidencePct}% confidence
            </span>
            <span className="text-muted-foreground">
              {line.comboFrequency}× / {simLabel}
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
              style={{ width: `${barFill}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  draws: Draw[];
  mainFreq: NumberFrequency[];
  starFreq: NumberFrequency[];
  onClearAll: () => void;
}

export function GeneratorPanel({
  draws,
  mainFreq,
  starFreq,
  onClearAll,
}: Props) {
  const [lineCount, setLineCount] = useState<LineCount>(1);
  const [results, setResults] = useState<GeneratedLine[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [mode, setMode] = useState<GenerationMode>("smart");
  const [mcProgress, setMcProgress] = useState<string | null>(null);
  const [simDraws, setSimDraws] = useState(100_000);

  const handleSimDrawsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(raw)) {
      setSimDraws(Math.min(2_000_000, Math.max(1_000, raw)));
    }
  };

  const handleGenerate = () => {
    setIsAnimating(true);
    setResults([]);

    if (mode === "montecarlo") {
      setMcProgress("Building probability distributions…");
      setTimeout(() => {
        setMcProgress(`Simulating ${simDraws.toLocaleString()} draws…`);
        setTimeout(() => {
          const lines = runMonteCarloSimulation(
            mainFreq,
            starFreq,
            lineCount,
            simDraws,
          );
          setMcProgress("Ranking combinations…");
          setTimeout(() => {
            setResults(lines);
            setHasGenerated(true);
            setIsAnimating(false);
            setMcProgress(null);
          }, 200);
        }, 50);
      }, 50);
    } else {
      setTimeout(() => {
        const lines = generateLines(draws, mainFreq, starFreq, lineCount);
        setResults(lines);
        setHasGenerated(true);
        setIsAnimating(false);
      }, 50);
    }
  };

  const maxFreq =
    results.length > 0
      ? Math.max(
          ...results
            .filter((r) => r.comboFrequency != null)
            .map((r) => r.comboFrequency!),
        )
      : 1;

  return (
    <section data-ocid="generator.section" className="space-y-4">
      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
        Generate Numbers
      </h2>
      <div className="card-glass p-5 md:p-6 space-y-5">
        {/* Mode toggle */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Generation mode
          </p>
          <div
            data-ocid="generator.mode.select"
            className="flex gap-2 flex-wrap"
          >
            <button
              type="button"
              data-ocid="generator.mode.smart_toggle"
              onClick={() => setMode("smart")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-150 border-2 ${
                mode === "smart"
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.35)] scale-105"
                  : "bg-muted/40 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Smart Strategies
            </button>
            <button
              type="button"
              data-ocid="generator.mode.montecarlo_toggle"
              onClick={() => setMode("montecarlo")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-150 border-2 ${
                mode === "montecarlo"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_0_3px_hsl(38_92%_50%/0.25)] scale-105"
                  : "bg-muted/40 text-muted-foreground border-border/50 hover:border-amber-500/50 hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Monte Carlo
            </button>
          </div>
          {mode === "montecarlo" && (
            <p className="mt-2 text-xs text-amber-400/80 leading-relaxed">
              Runs simulated draws using your historical data and returns the
              combinations that appeared most often.
            </p>
          )}
        </div>

        {/* Simulation draw count — Monte Carlo only */}
        {mode === "montecarlo" && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Number of simulation draws
            </p>
            <div className="flex gap-2 flex-wrap mb-3">
              {SIM_DRAW_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  data-ocid={`generator.montecarlo.sim_draws.button.${preset.label.toLowerCase()}`}
                  onClick={() => setSimDraws(preset.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-150 border-2 ${
                    simDraws === preset.value
                      ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_0_3px_hsl(38_92%_50%/0.25)] scale-105"
                      : "bg-muted/40 text-muted-foreground border-border/50 hover:border-amber-500/50 hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              data-ocid="generator.montecarlo.sim_draws.input"
              value={simDraws}
              min={1000}
              max={2000000}
              onChange={handleSimDrawsInput}
              className="w-full rounded-lg bg-muted/30 border border-border/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors font-mono"
              placeholder="Custom draw count (1,000 – 2,000,000)"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Higher values give more accurate results but take longer to run.
            </p>
          </div>
        )}

        {/* Line count selector */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            How many lines?
          </p>
          <div
            data-ocid="generator.line_count.select"
            className="flex gap-2 flex-wrap"
          >
            {LINE_COUNTS.map((count) => (
              <button
                type="button"
                key={count}
                data-ocid={`generator.line_count.toggle.${count}`}
                onClick={() => setLineCount(count)}
                className={`px-5 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-150 border-2 ${
                  lineCount === count
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.35)] scale-105"
                    : "bg-muted/40 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {count} {count === 1 ? "line" : "lines"}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Guide collapsible — only in smart mode */}
        {mode === "smart" && (
          <Collapsible open={guideOpen} onOpenChange={setGuideOpen}>
            <CollapsibleTrigger
              data-ocid="generator.strategy_guide.toggle"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group w-full"
            >
              <span className="text-primary/70 group-hover:text-primary transition-colors">
                ✦
              </span>
              Strategy Guide
              <ChevronDown
                className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                  guideOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(STRATEGY_DESCRIPTIONS)
                  .filter(([name]) => name !== "Monte Carlo Simulation")
                  .map(([name, desc]) => {
                    const colorClass = STRATEGY_COLORS[name] ?? "text-primary";
                    return (
                      <div
                        key={name}
                        className="rounded-lg bg-muted/20 border border-border/30 p-3 space-y-1"
                      >
                        <p className={`text-xs font-semibold ${colorClass}`}>
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            data-ocid="generator.primary_button"
            onClick={handleGenerate}
            disabled={isAnimating}
            size="lg"
            className={`font-display font-bold flex-1 sm:flex-none ${
              mode === "montecarlo"
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {mode === "montecarlo" ? (
              <>
                <FlaskConical
                  className={`w-4 h-4 mr-2 ${isAnimating ? "animate-pulse" : ""}`}
                />
                {isAnimating ? "Simulating…" : "Run Monte Carlo"}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate EuroMillions Numbers
              </>
            )}
          </Button>
          {hasGenerated && !isAnimating && (
            <Button
              data-ocid="generator.secondary_button"
              onClick={handleGenerate}
              disabled={isAnimating}
              variant="outline"
              size="lg"
              className="border-primary/30 text-primary hover:bg-primary/10 font-display font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Again
            </Button>
          )}
          <Button
            data-ocid="generator.clear_button"
            onClick={() => {
              setResults([]);
              setHasGenerated(false);
              onClearAll();
            }}
            variant="ghost"
            size="lg"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear Data
          </Button>
        </div>

        {/* Monte Carlo progress indicator */}
        {isAnimating && mode === "montecarlo" && mcProgress && (
          <div
            data-ocid="generator.montecarlo.loading_state"
            className="flex items-center gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3"
          >
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-amber-300 font-mono">
              {mcProgress}
            </span>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div data-ocid="generator.results.section" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {mode === "montecarlo"
              ? `Top ${results.length} combination${
                  results.length !== 1 ? "s" : ""
                } from ${simDraws.toLocaleString()} simulated draws`
              : `Generated ${results.length} line${
                  results.length !== 1 ? "s" : ""
                } using smart analysis of your draw history`}
          </p>
          {results.map((line, i) => (
            <ResultCard
              key={line.id}
              line={line}
              index={i + 1}
              maxFrequency={maxFreq}
            />
          ))}
        </div>
      )}
    </section>
  );
}
