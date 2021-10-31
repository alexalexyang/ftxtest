import { Ask, Bid } from "../types/ftx";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { maxBy, minBy } from "lodash";

import { ChartWrapper } from "../styles/main";
import type { NextPage } from "next";

interface Props<T> {
  ticker: string;
  data: T[];
  property: keyof T;
}

const Chart = <T extends unknown>({ ticker, data, property }: Props<T>) => {
  const min = minBy(data, property);
  const max = maxBy(data, property);

  if (!min || !max) {
    return null;
  }

  const minProp: number = min[property] as unknown as number;
  const maxProp: number = max[property] as unknown as number;

  return (
    <ChartWrapper>
      <h2>{ticker}</h2>
      <ResponsiveContainer width={"100%"} height={250}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis type="number" domain={[minProp - 0.05, maxProp + 0.05]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default Chart;
