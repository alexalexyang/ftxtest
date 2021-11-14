import { PricesWLinReg, RestTrade, TradeWTime } from "../../types/ftx-types";
import {
  linearRegression,
  linearRegressionLine,
  mean,
  standardDeviation,
} from "simple-statistics";
import { useQuery, useQueryClient } from "react-query";

import { DataWLinReg } from ".";
import axios from "axios";

export const useTickerData = () => {
  const queryClient = useQueryClient();
  return useQuery(
    ["ticker", "SOL/USD"],
    async () => {
      const res: RestTrade = await axios(`/api/ftx-market`);

      const oldState: TradeWTime[] =
        queryClient.getQueryData(["ticker", "SOL/USD"]) || [];

      const currentStateRaw = [
        ...(oldState ? oldState : []),
        {
          ...res.data.result,
          time: new Date().toLocaleString("en-GB", {
            timeStyle: "medium",
          }),
        },
      ];

      axios.post(`/api/lowdb`, {
        ...res.data.result,
        time: new Date().toLocaleString("en-GB", {
          timeStyle: "medium",
        }),
      });

      const ArrLength = currentStateRaw.length - 60;

      const currentState = currentStateRaw.slice(
        ArrLength <= 0 ? 0 : ArrLength,
        currentStateRaw.length
      );

      return currentState;
    },
    {
      refetchInterval: 2000,
    }
  );
};

export const addLinReg = (data: TradeWTime[]): DataWLinReg => {
  const linRegData = data.map((datum, idx) => [idx, datum.price]);
  const linRegSlopeAndIntercept = linearRegression(linRegData);

  const pricesOnly = data.map((datum) => datum.price);
  const stanDev = standardDeviation(pricesOnly);

  const pricesWLinReg: PricesWLinReg[] = data.map((datum, idx) => {
    const linRegY = linearRegressionLine(linRegSlopeAndIntercept)(idx);

    const newDatum: PricesWLinReg = {
      ...datum,
      linRegY,
      stanDevUpperBound: linRegY + stanDev * 1,
      stanDevLowerBound: linRegY - stanDev * 1,
    };

    return newDatum;
  });

  return {
    data: pricesWLinReg,
    mean: mean(pricesOnly),
    spread: stanDev * 2,
    slope: linRegSlopeAndIntercept.m,
    stanDev,
  };
};
