import { RestTrade, Trade } from "../../types/ftx";
import { useQuery, useQueryClient } from "react-query";

import axios from "axios";

interface TradeProps extends Trade {
  time: string;
}

export const useTickerData = () => {
  const queryClient = useQueryClient();
  return useQuery(
    ["ticker", "SOL/USD"],
    async () => {
      const res: RestTrade = await axios(`/api/ftx-market`);

      const oldState: TradeProps[] =
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

      const ArrLength = currentStateRaw.length - 30;

      const currentState = currentStateRaw.slice(
        ArrLength <= 0 ? 0 : ArrLength,
        currentStateRaw.length
      );

      return currentState;
    },
    {
      refetchInterval: 5000,
    }
  );
};
