import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { NextPage } from "next";
import { PriceContext } from "../../pages/_app";
import { useContext } from "react";

interface Props {
  ticker: string;
}

const WsChart: NextPage<Props> = ({ ticker }) => {
  const { tickerData } = useContext(PriceContext);

  return (
    <LineChart
      width={730}
      height={250}
      data={tickerData[ticker]?.priceData}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis type="number" domain={[163.9, 164.5]} />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="price" stroke="#8884d8" />
    </LineChart>
  );
};

export default WsChart;
