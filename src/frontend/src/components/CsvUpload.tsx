import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { Draw } from "../types";
import { parseEuroMillionsCSV } from "../utils/csvParser";

interface Props {
  onDrawsParsed: (draws: Draw[]) => void;
  onClear: () => void;
  hasData: boolean;
  drawCount: number;
}

export function CsvUpload({
  onDrawsParsed,
  onClear,
  hasData,
  drawCount,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (
        !file.name.toLowerCase().endsWith(".csv") &&
        file.type !== "text/csv"
      ) {
        setError(
          "Please upload a CSV file. Other file types are not supported.",
        );
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const result = parseEuroMillionsCSV(text);
        if (result.error) {
          setError(result.error);
          return;
        }
        onDrawsParsed(result.draws);
      };
      reader.readAsText(file);
    },
    [onDrawsParsed],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleClear = () => {
    setError(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  };

  return (
    <div className="card-glass p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">
          Upload Draw History
        </h2>
        {hasData && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4 mr-1" /> Clear Data
          </Button>
        )}
      </div>

      {/* Using label as the drop zone — semantically associates with the file input */}
      <label
        data-ocid="upload.dropzone"
        htmlFor="csv-file-input"
        className={`relative block border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all cursor-pointer ${
          isDragOver
            ? "border-primary bg-primary/5"
            : hasData
              ? "border-green-500/40 bg-green-500/5"
              : "border-border/50 hover:border-primary/40 hover:bg-muted/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id="csv-file-input"
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleChange}
        />
        {hasData ? (
          <div
            data-ocid="upload.success_state"
            className="flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-green-400">
                {drawCount} draws loaded
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {fileName && (
                  <span className="inline-flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {fileName}
                  </span>
                )}
                {" · Last 6 months analysed"}
              </p>
            </div>
            <span
              data-ocid="upload.upload_button"
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted/40 transition-colors"
            >
              Upload Different File
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isDragOver ? "bg-primary/20 border-2 border-primary" : "bg-muted border border-border"}`}
            >
              <Upload
                className={`w-7 h-7 transition-colors ${isDragOver ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">
                {isDragOver
                  ? "Drop your CSV here"
                  : "Drag & drop your CSV file"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <span
              data-ocid="upload.upload_button"
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-sm text-primary hover:bg-primary/10 transition-colors"
            >
              Choose CSV File
            </span>
            <p className="text-xs text-muted-foreground">
              Accepts .csv files only — processed entirely in your browser
            </p>
          </div>
        )}
      </label>

      {error && (
        <div
          data-ocid="upload.error_state"
          className="mt-4 flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Upload Error
            </p>
            <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-destructive/60 hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
