import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { maxBy, minBy } from "lodash";

import { ChartWrapper } from "../styles/main";
import type { NextPage } from "next";
import { TradeData } from "../types/ftx";

interface Props {
  ticker: string;
  data: TradeData[];
}

const Chart: NextPage<Props> = ({ ticker, data }) => {
  const min = minBy(data, "price");
  const max = maxBy(data, "price");

  return (
    <ChartWrapper>
      <h2>{ticker}</h2>
      <LineChart
        width={730}
        height={250}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis
          type="number"
          domain={[
            min?.price ? min.price - 0.05 : 0,
            max?.price ? max.price + 0.05 : 1,
          ]}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#8884d8" />
      </LineChart>
    </ChartWrapper>
  );
};

export default Chart;
