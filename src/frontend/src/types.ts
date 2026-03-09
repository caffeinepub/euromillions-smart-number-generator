export interface Draw {
  drawDate: Date;
  balls: number[];
  stars: number[];
}

export interface NumberFrequency {
  number: number;
  frequency: number;
  lastSeen?: Date;
  gapDraws?: number;
}

export interface GeneratedLine {
  balls: number[];
  stars: number[];
  strategy: string;
  id: string;
}

export type Strategy =
  | "Hot Number Strategy"
  | "Cold Number Strategy"
  | "Balanced Strategy"
  | "Trend Strategy"
  | "Weighted Random Strategy"
  | "Gap Strategy";
