import { Download, ExternalLink, Upload } from "lucide-react";

export function Instructions() {
  return (
    <section data-ocid="instructions.section" className="card-glass p-6 md:p-8">
      <div className="mb-6">
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1">
          How to Get Started
        </h2>
        <p className="text-muted-foreground text-sm">
          Three simple steps to generate your smart EuroMillions numbers.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="font-display font-bold text-sm text-primary">
              1
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1">
              Visit National Lottery
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Go to the official EuroMillions draw history page.
            </p>
            <a
              href="https://www.national-lottery.co.uk/results/euromillions/draw-history"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              national-lottery.co.uk <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="flex gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="font-display font-bold text-sm text-primary">
              2
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Download CSV
            </p>
            <p className="text-xs text-muted-foreground">
              Click{" "}
              <span className="font-semibold text-foreground">
                &ldquo;Download draw history (CSV)&rdquo;
              </span>{" "}
              on that page.
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="w-3 h-3" />
              <span>EuroMillionsDraw.csv</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="font-display font-bold text-sm text-primary">
              3
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Upload &amp; Generate
            </p>
            <p className="text-xs text-muted-foreground">
              Upload the CSV below — we analyse the last 6 months of draws.
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Upload className="w-3 h-3" />
              <span>Drop or browse below</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
