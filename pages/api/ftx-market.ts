import type { NextApiRequest, NextApiResponse } from "next";

import Cors from "cors";
import axios from "axios";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await runMiddleware(req, res, cors);
    const { data } = await axios.get(`https://ftx.com/api/markets/SOL/USD`);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
}
