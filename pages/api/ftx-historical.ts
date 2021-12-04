import type { NextApiRequest, NextApiResponse } from "next";

import axios from "axios";

const toTimestamp = (strDate: string): number => {
  const dt = Date.parse(strDate);
  return dt / 1000;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { query } = req;

    const resolution = 3600;
    const startTime = toTimestamp("2021-12-02T17:15:00+00:00");
    const endTime = toTimestamp("2021-12-03T17:15:00+00:00");

    const { data } = await axios.get(
      `https://ftx.com/api/markets/${query.ticker}/candles?resolution=${resolution}&start_time=${startTime}&end_time=${endTime}`
    );

    // console.log({ data });

    data.result.forEach((d) => console.log(d));

    res.status(200).json({ msg: "hello" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}
