import type { Draw } from "../types";

function parseDrawDate(str: string): Date | null {
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const parts = str.trim().split("-");
  if (parts.length !== 3) return null;
  const day = Number.parseInt(parts[0], 10);
  const month = months[parts[1]];
  const year = Number.parseInt(parts[2], 10);
  if (Number.isNaN(day) || month === undefined || Number.isNaN(year))
    return null;
  return new Date(year, month, day);
}

export interface ParseResult {
  draws: Draw[];
  error?: string;
  totalRows: number;
  filteredRows: number;
}

function parseCSVRows(text: string): Array<Record<string, string>> {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

export function parseEuroMillionsCSV(text: string): ParseResult {
  const rows = parseCSVRows(text);
  if (rows.length === 0) {
    return {
      draws: [],
      error: "CSV file appears to be empty or malformed.",
      totalRows: 0,
      filteredRows: 0,
    };
  }

  const keys = Object.keys(rows[0]);
  const findCol = (candidates: string[]): string | undefined =>
    candidates.find((c) =>
      keys.some((k) => k.toLowerCase() === c.toLowerCase()),
    );

  const dateCol = findCol(["DrawDate", "Draw Date", "Date"]);
  const ball1Col = findCol(["Ball 1", "Ball1", "Main Ball 1"]);
  const ball2Col = findCol(["Ball 2", "Ball2", "Main Ball 2"]);
  const ball3Col = findCol(["Ball 3", "Ball3", "Main Ball 3"]);
  const ball4Col = findCol(["Ball 4", "Ball4", "Main Ball 4"]);
  const ball5Col = findCol(["Ball 5", "Ball5", "Main Ball 5"]);
  const star1Col = findCol(["Lucky Star 1", "Star1", "Lucky Star1"]);
  const star2Col = findCol(["Lucky Star 2", "Star2", "Lucky Star2"]);

  if (
    !dateCol ||
    !ball1Col ||
    !ball2Col ||
    !ball3Col ||
    !ball4Col ||
    !ball5Col ||
    !star1Col ||
    !star2Col
  ) {
    return {
      draws: [],
      error: `Missing required columns. Expected: DrawDate, Ball 1-5, Lucky Star 1-2. Found columns: ${keys.join(", ")}`,
      totalRows: rows.length,
      filteredRows: 0,
    };
  }

  const totalRows = rows.length;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

  const draws: Draw[] = [];
  for (const row of rows) {
    const drawDate = parseDrawDate(row[dateCol]);
    if (!drawDate || drawDate < sixMonthsAgo) continue;
    const b1 = Number.parseInt(row[ball1Col], 10);
    const b2 = Number.parseInt(row[ball2Col], 10);
    const b3 = Number.parseInt(row[ball3Col], 10);
    const b4 = Number.parseInt(row[ball4Col], 10);
    const b5 = Number.parseInt(row[ball5Col], 10);
    const s1 = Number.parseInt(row[star1Col], 10);
    const s2 = Number.parseInt(row[star2Col], 10);
    if ([b1, b2, b3, b4, b5, s1, s2].some((n) => Number.isNaN(n))) continue;
    draws.push({ drawDate, balls: [b1, b2, b3, b4, b5], stars: [s1, s2] });
  }

  if (draws.length === 0) {
    return {
      draws: [],
      error:
        "No valid draws found in the last 6 months. Please ensure your CSV contains recent draw data.",
      totalRows,
      filteredRows: 0,
    };
  }

  draws.sort((a, b) => b.drawDate.getTime() - a.drawDate.getTime());
  return { draws, totalRows, filteredRows: draws.length };
}
