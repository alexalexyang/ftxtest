import { TradeData, WsResponse } from "../types/ftx";

import { QueryClient } from "react-query";

// const tickers = ["SOL-PERP", "HNT-PERP"];
const tickers = ["SOL-PERP"];

export const ftxWs = (ws: WebSocket, queryClient: QueryClient) => {
  console.log("Connecting.");

  ws.onopen = () => {
    console.log("Connected.");
    tickers.forEach((ticker) => {
      console.log(`Subscribing to ${ticker}.`);
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
        const incomingData = data.filter((datum) => datum.side === "buy");
        const old = state ? (state as TradeData[]) : [];

        if (!incomingData.length) {
          return old;
        }

        const newState = [...old, ...incomingData];

        const newStateLength = newState.length;
        if (newStateLength > 30) {
          const newStateSliced = newState.slice(
            newStateLength - 32,
            newStateLength - 1
          );
          // console.log(newStateSliced);
          return newStateSliced;
        }

        return newState;
      });
    }
  };
};

export const ftxUnsubscribe = (ws: WebSocket) => {
  tickers.forEach((ticker) =>
    ws.send(`{"op": "unsubscribe", "channel": "trades", "market": "${ticker}"}`)
  );
};

export const ftxWsKeepAlive = (ws: WebSocket) => {
  return setInterval(() => {
    ws.send(JSON.stringify({ op: "ping" }));
  }, 15000);
};
