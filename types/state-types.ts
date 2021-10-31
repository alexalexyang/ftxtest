import { Ask, Bid } from "./ftx";

export interface TickerData {
  [key: string]: { bids: Bid[]; asks: Ask[] };
}
