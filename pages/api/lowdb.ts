import { JSONFile, Low } from "lowdb";
import { NextApiRequest, NextApiResponse } from "next";

const file = "/Users/alex.yang@futurice.com/Desktop/db.json";
const adapter = new JSONFile(file);
const db = new Low<any>(adapter);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await db.read();
  db.data ||= { trades: [] };

  try {
    db.data.trades.push(req.body);
    await db.write();

    res.status(200);
  } catch (err) {
    res.status(500).json(err);
  }
}
