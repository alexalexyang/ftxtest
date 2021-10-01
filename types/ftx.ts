export interface TradeData {
  id: number;
  price: number;
  size: number;
  side: string;
  liquidation: boolean;
  time: Date;
}

export interface WsResponse {
  type: "update";
  channel: "trades";
  market: string;
  data: TradeData[];
}
