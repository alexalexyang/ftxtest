import { Ask, Bid, BidAsk, WsBidAsk } from "../types/ftx";
import { Dispatch, SetStateAction } from "react";
import { isEqual, uniq, uniqWith } from "lodash";

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
    let res: WsBidAsk = JSON.parse(e.data);
    const ticker = res.market;

    const { data } = res;
    if (!data) {
      return;
    }

    const dateObj = new Date(parseInt(data.time, 10) * 1000);
    data.time = dateObj.toLocaleString("en-GB", {
      timeStyle: "medium",
    });

    setTickerData((state) => {
      const oldState = { ...state };

      if (!oldState[ticker]) {
        oldState[ticker] = {
          bids: [],
          asks: [],
        };
      }

      const oldBids = oldState[ticker].bids;
      const oldAsks = oldState[ticker].asks;

      let newBids: Bid[] = [];
      let newAsks: Ask[] = [];

      if (data.bid) {
        const newBidAdded: Bid[] = [
          ...oldBids,
          { bid: data.bid, bidSize: data.bidSize, time: data.time },
        ];

        const ArrLength = newBidAdded.length - 30;

        newBids = newBidAdded.slice(
          ArrLength <= 0 ? 0 : ArrLength,
          newBidAdded.length
        );

        // newBids = uniqWith(sliced, isEqual);
      }

      if (data.ask) {
        const newAskAdded: Ask[] = [
          ...oldAsks,
          { ask: data.ask, askSize: data.askSize, time: data.time },
        ];
        const ArrLength = newAskAdded.length - 30;

        newAsks = newAskAdded.slice(
          ArrLength <= 0 ? 0 : ArrLength,
          newAskAdded.length
        );
      }

      return {
        ...oldState,
        [ticker]: {
          bids: data.bid ? newBids : oldBids,
          asks: data.ask ? newAsks : oldAsks,
        },
      };
    });
  };
};

export const subscribeChannels = (ws: WebSocket, tickers: string[]) => {
  tickers.forEach((ticker) => {
    console.log(`Subscribing to ${ticker}.`);
    ws.send(`{"op": "subscribe", "channel": "ticker", "market": "${ticker}"}`);
  });
};

export const unSubscribeChannels = (ws: WebSocket, tickers: string[]) => {
  tickers.forEach((ticker) =>
    ws.send(`{"op": "unsubscribe", "channel": "ticker", "market": "${ticker}"}`)
  );
};

export const ftxWsKeepAlive = (ws: WebSocket) => {
  return setInterval(() => {
    ws.send(JSON.stringify({ op: "ping" }));
  }, 15000);
};
