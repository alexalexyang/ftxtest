import type { NextApiRequest, NextApiResponse } from "next";

import axios from "axios";

interface Request extends NextApiRequest {
  query: {
    ticker: string;
    startTime: string;
    endTime: string;
    resolution: string;
  };
}

interface Result {
  startTime: string;
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Data {
  data: { success: boolean; result: Result[] };
}

const toTimestamp = (strDate: string): number => {
  const dt = Date.parse(strDate);
  return dt / 1000;
};

export default async function handler(req: Request, res: NextApiResponse) {
  try {
    const {
      query: { ticker, startTime, endTime, resolution },
    } = req;

    const {
      data: { success, result },
    }: Data = await axios.get(
      `https://ftx.com/api/markets/${ticker}/candles?resolution=${resolution}&start_time=${toTimestamp(
        startTime
      )}&end_time=${toTimestamp(endTime)}`
    );

    const resultTransformed = result.map((item) => {
      var date = new Date(item.time);

      item.time = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "2-digit",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: "Europe/Stockholm",
      }).format(date);

      return item;
    });

    res.status(200).json({ success, prices: resultTransformed });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}
