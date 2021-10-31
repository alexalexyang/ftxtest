export interface WsBidAsk {
  type: "update";
  channel: "ticker";
  market: string;
  data: BidAsk;
}
export interface BidAsk extends Bid, Ask {
  last: string;
  time: string;
}

export interface Bid {
  bid: number;
  bidSize: number;
  time: string;
}

export interface Ask {
  ask: number;
  askSize: number;
  time: string;
}

// export interface TradeData {
//   id: number;
//   price: number;
//   size: number;
//   side: string;
//   liquidation: boolean;
//   time: string;
// }

// export interface WsTradesResponse {
//   type: "update";
//   channel: "trades";
//   market: string;
//   data: TradeData[];
// }
