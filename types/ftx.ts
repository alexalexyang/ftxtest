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

export interface Trade {
  name: string;
  baseCurrency: string;
  quoteCurrency: string;
  quoteVolume24h: number;
  change1h: number;
  change24h: number;
  changeBod: number;
  highLeverageFeeExempt: boolean;
  minProvideSize: number;
  type: string;
  underlying: string;
  enabled: boolean;
  ask: number;
  bid: number;
  last: number;
  postOnly: boolean;
  price: number;
  priceIncrement: number;
  sizeIncrement: number;
  restricted: boolean;
  volumeUsd24h: number;
}

export interface PricesWLinReg extends Trade {
  linRegY: number;
  stanDevUpperBound: number;
  stanDevLowerBound: number;
}

// export interface PricesWBuySell extends PricesWLinReg {
//   buy
// }

export interface RestTrade {
  data: {
    result: Trade;
  };
}
