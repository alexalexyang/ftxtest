import { Dispatch, SetStateAction } from "react";
import { TradeData, WsResponse } from "../types/ftx";

import { TickerData } from "../types/state-types";

interface FtxWsProps {
  ws: WebSocket;
  setTickerData: Dispatch<SetStateAction<TickerData>>;
}

export const ftxWs = ({ ws, setTickerData }: FtxWsProps) => {
  console.log("Connecting.");

  ws.onopen = () => {
    console.log("Connected.");
  };

  ws.onmessage = (e) => {
    let res: WsResponse = JSON.parse(e.data);
    if (res.channel === "trades" && res.type === "update") {
      const { data } = res;

      const incomingData = data
        .reduce<TradeData[]>((acc, item) => {
          if (item.side !== "buy") {
            return acc;
          }

          // 2021-10-08T21:58:09.361928+00:00
          item.time = new Date(item.time).toLocaleTimeString("en-GB", {
            timeStyle: "medium",
          });

          return acc.concat(item);
        }, [])
        .reverse();

      if (!incomingData.length) {
        return;
      }

      setTickerData((oldState) => {
        if (oldState[res.market] === undefined) {
          oldState[res.market] = {
            priceData: [],
          };
        }

        const newTickerState = [
          ...oldState[res.market].priceData,
          ...incomingData,
        ];

        const newTickerStateLength = newTickerState.length;
        if (newTickerStateLength > 31) {
          const newTickerStateSliced = newTickerState.slice(
            newTickerStateLength - 31,
            newTickerStateLength - 1
          );

          const newState = {
            ...oldState,
            [res.market]: {
              priceData: newTickerStateSliced,
            },
          };

          return newState;
        }

        return {
          ...oldState,
          [res.market]: {
            priceData: newTickerState,
          },
        };
      });
    }
  };
};

export const subscribeChannels = (ws: WebSocket, tickers: string[]) => {
  tickers.forEach((ticker) => {
    console.log(`Subscribing to ${ticker}.`);
    ws.send(`{"op": "subscribe", "channel": "trades", "market": "${ticker}"}`);
  });
};

export const unSubscribeChannels = (ws: WebSocket, tickers: string[]) => {
  tickers.forEach((ticker) =>
    ws.send(`{"op": "unsubscribe", "channel": "trades", "market": "${ticker}"}`)
  );
};

export const ftxWsKeepAlive = (ws: WebSocket) => {
  return setInterval(() => {
    ws.send(JSON.stringify({ op: "ping" }));
  }, 15000);
};
