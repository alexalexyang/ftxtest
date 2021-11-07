import { Ask, Bid } from "./ftx-types";

export interface TickerData {
  [key: string]: { bids: Bid[]; asks: Ask[] };
}
