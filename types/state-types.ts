import { TradeData } from "./ftx";

export interface TickerData {
  [key: string]: { priceData: TradeData[] };
}
