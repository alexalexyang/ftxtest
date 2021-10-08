export interface TradeData {
  id: number;
  price: number;
  size: number;
  side: string;
  liquidation: boolean;
  time: string;
}

export interface WsResponse {
  type: "update";
  channel: "trades";
  market: string;
  data: TradeData[];
}
