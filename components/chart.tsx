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
import {
  linearRegression,
  linearRegressionLine,
  mean,
  standardDeviation,
} from "simple-statistics";
import { maxBy, minBy, round } from "lodash";

import { ChartWrapper } from "../styles/main";

interface Props<T> {
  ticker: string;
  data: T[];
  dataKey: string;
  property: keyof T;
}

const Chart = <T extends unknown>({
  ticker,
  data,
  dataKey,
  property,
}: Props<T>) => {
  const min = minBy(data, property);
  const max = maxBy(data, property);

  if (!min || !max) {
    return null;
  }

  const minProp: number = min[property] as unknown as number;
  const maxProp: number = max[property] as unknown as number;

  const linRegData = data.map((datum, idx) => [idx, datum.price]);
  const linRegSlopeAndIntercept = linearRegression(linRegData);

  const pricesOnly = data.map((datum) => datum.price);
  const stanDev = standardDeviation(pricesOnly);

  const newData = data.map((datum, idx) => {
    datum.linRegY = linearRegressionLine(linRegSlopeAndIntercept)(idx);
    datum.stanDevUpperBound = datum.linRegY + stanDev * 1;
    datum.stanDevLowerBound = datum.linRegY - stanDev * 1;
    return datum;
  });

  const meanOfData = mean(pricesOnly);
  const spread = stanDev * 2;

  return (
    <ChartWrapper>
      <h2>{ticker}</h2>
      <ResponsiveContainer width={"100%"} height={250}>
        <LineChart
          // data={data}
          data={newData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis type="number" domain={[minProp - 0.05, maxProp + 0.05]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
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

      <span>Mean: {round(meanOfData, 3)}</span>
      <span>Spread: {round(spread, 3)}</span>
    </ChartWrapper>
  );
};

export default Chart;
