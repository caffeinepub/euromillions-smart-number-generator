import { Toaster } from "@/components/ui/sonner";
import { useMemo, useState } from "react";
import { CsvUpload } from "./components/CsvUpload";
import { GeneratorPanel } from "./components/GeneratorPanel";
import { Instructions } from "./components/Instructions";
import { StatsDashboard } from "./components/StatsDashboard";
import type { Draw } from "./types";
import { buildFrequencies } from "./utils/generator";

export default function App() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const hasData = draws.length > 0;

  const { mainFreq, starFreq } = useMemo(
    () => (hasData ? buildFrequencies(draws) : { mainFreq: [], starFreq: [] }),
    [draws, hasData],
  );

  const handleClearAll = () => setDraws([]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #fff8d6 0%, #f5c842 35%, #d4980a 65%, #a8730a 100%)",
                boxShadow: "0 2px 8px rgba(212,152,10,0.5)",
              }}
            >
              <span className="text-xs font-bold text-amber-900 font-display">
                €
              </span>
            </div>
            <div>
              <h1 className="font-display font-bold text-base md:text-lg text-foreground leading-none">
                EuroMillions
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Smart Number Generator
              </p>
            </div>
          </div>
          {hasData && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {draws.length} draws loaded
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        <Instructions />
        <CsvUpload
          onDrawsParsed={setDraws}
          onClear={handleClearAll}
          hasData={hasData}
          drawCount={draws.length}
        />
        {hasData && (
          <>
            <StatsDashboard mainFreq={mainFreq} starFreq={starFreq} />
            <GeneratorPanel
              draws={draws}
              mainFreq={mainFreq}
              starFreq={starFreq}
              onClearAll={handleClearAll}
            />
          </>
        )}
      </main>

      <footer className="border-t border-border/30 py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>{" "}
            — All processing happens locally in your browser.
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
