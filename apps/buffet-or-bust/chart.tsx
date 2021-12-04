import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { maxBy, minBy, round } from "lodash";

import { ChartWrapper } from "../../styles/main";

interface Props<T> {
  ticker: string;
  data?: T[];
  dataKey: string;
  mean?: number;
  spread?: number;
  property: keyof T;
}

const Chart = <T extends unknown>({
  ticker,
  data,
  dataKey,
  mean,
  spread,
  property,
}: Props<T>) => {
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
      <ResponsiveContainer width={"100%"} height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" angle={-45} textAnchor="end" interval={35} />
          <YAxis type="number" domain={[minProp - 0.05, maxProp + 0.05]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#8884d8"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey={"linRegY"}
            stroke="#d2c849"
            dot={false}
            tooltipType="none"
          />
          <Line
            type="monotone"
            dataKey={"stanDevUpperBound"}
            stroke="#97d74e"
            dot={false}
            tooltipType="none"
          />
          <Line
            type="monotone"
            dataKey={"stanDevLowerBound"}
            stroke="#97d74e"
            dot={false}
            tooltipType="none"
          />
        </LineChart>
      </ResponsiveContainer>

      {mean && <span>Mean: {round(mean, 3)}</span>}
      {spread && <span>Spread: {round(spread, 3)}</span>}
    </ChartWrapper>
  );
};

export default Chart;
