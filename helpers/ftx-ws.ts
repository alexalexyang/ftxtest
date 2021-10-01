import { QueryClient } from "react-query";

interface TradeData {
  id: number;
  price: number;
  size: number;
  side: string;
  liquidation: boolean;
  time: Date;
}
interface WsResponse {
  type: "update";
  channel: "trades";
  market: string;
  data: TradeData[];
}

// const tickers = ["BTC-PERP", "BTC/USD", "ETH-PERP", "ETH/USD"];
const tickers = ["SOL-PERP"];

export const ftxWs = (ws: WebSocket, queryClient: QueryClient) => {
  console.log({ ws });

  ws.onopen = () => {
    tickers.forEach((ticker) => {
      // console.log(ticker);
      ws.send(
        `{"op": "subscribe", "channel": "trades", "market": "${ticker}"}`
      );
    });
  };

  ws.onmessage = (e) => {
    let res: WsResponse = JSON.parse(e.data);
    if (res.channel === "trades" && res.type === "update") {
      const { data } = res;

      // data.forEach((datum) => console.log(datum));

      queryClient.setQueryData(res.market, (state): TradeData[] => {
        const old = state ? (state as TradeData[]) : [];
        const current = [...old, ...data];

        if (current.length > 5) {
          return current.slice(2, 7);
        }

        return current;
      });
    }

    // if (data.type === "pong") {
    //   console.log(data);
    // }
  };
};

export const ftxUnsubscribe = (ws: WebSocket) => {
  tickers.forEach((ticker) =>
    ws.send(`{"op": "unsubscribe", "channel": "trades", "market": "${ticker}"}`)
  );
};

export const ftxWsKeepAlive = (ws: WebSocket) => {
  //   let counter = 0;
  return setInterval(() => {
    // counter++;
    // console.log(`ping ~ ${counter}`);
    ws.send(JSON.stringify({ op: "ping" }));
  }, 15000);
};
