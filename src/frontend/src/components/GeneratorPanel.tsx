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
import { ChevronDown, RefreshCw, Sparkles, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Draw, GeneratedLine, NumberFrequency } from "../types";
import { generateLines } from "../utils/generator";

const LINE_COUNTS = [1, 3, 5, 10] as const;
type LineCount = (typeof LINE_COUNTS)[number];

const STRATEGY_COLORS: Record<string, string> = {
  "Hot Number Strategy": "text-orange-400",
  "Cold Number Strategy": "text-blue-400",
  "Balanced Strategy": "text-green-400",
  "Trend Strategy": "text-purple-400",
  "Weighted Random Strategy": "text-cyan-400",
  "Gap Strategy": "text-pink-400",
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

function ResultCard({ line, index }: { line: GeneratedLine; index: number }) {
  const colorClass = STRATEGY_COLORS[line.strategy] ?? "text-primary";
  const description = STRATEGY_DESCRIPTIONS[line.strategy];
  return (
    <div
      data-ocid={`generator.result.item.${index}`}
      className="result-card card-glass p-4 md:p-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={`w-3.5 h-3.5 ${colorClass}`} />
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
              className="max-w-[220px] text-xs text-center"
            >
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-xs text-muted-foreground ml-auto">
          Line {index}
        </span>
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

  const handleGenerate = () => {
    setIsAnimating(true);
    setResults([]);
    setTimeout(() => {
      const lines = generateLines(draws, mainFreq, starFreq, lineCount);
      setResults(lines);
      setHasGenerated(true);
      setIsAnimating(false);
    }, 50);
  };

  return (
    <section data-ocid="generator.section" className="space-y-4">
      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
        Generate Numbers
      </h2>
      <div className="card-glass p-5 md:p-6 space-y-5">
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

        {/* Strategy Guide collapsible */}
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
              {Object.entries(STRATEGY_DESCRIPTIONS).map(([name, desc]) => {
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

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            data-ocid="generator.primary_button"
            onClick={handleGenerate}
            disabled={isAnimating}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold flex-1 sm:flex-none"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate EuroMillions Numbers
          </Button>
          {hasGenerated && (
            <Button
              data-ocid="generator.secondary_button"
              onClick={handleGenerate}
              disabled={isAnimating}
              variant="outline"
              size="lg"
              className="border-primary/30 text-primary hover:bg-primary/10 font-display font-semibold"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isAnimating ? "animate-spin" : ""}`}
              />
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
      </div>

      {results.length > 0 && (
        <div data-ocid="generator.results.section" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Generated {results.length} line{results.length !== 1 ? "s" : ""}{" "}
            using smart analysis of your draw history
          </p>
          {results.map((line, i) => (
            <ResultCard key={line.id} line={line} index={i + 1} />
          ))}
        </div>
      )}
    </section>
  );
}
