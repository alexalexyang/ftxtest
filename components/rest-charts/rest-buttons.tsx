import { Button, ButtonsWrapper } from "../../styles/main";
import { QueryCache, QueryClient, useQuery, useQueryClient } from "react-query";
import { RestTrade, Trade } from "../../types/ftx";

import { NextPage } from "next";
import axios from "axios";
import { useState } from "react";

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

      const ArrLength = currentStateRaw.length - 30;

      const currentState = currentStateRaw.slice(
        ArrLength <= 0 ? 0 : ArrLength,
        currentStateRaw.length
      );

      return currentState;
    },
    {
      refetchInterval: 60000,
    }
  );
};

interface Props {
  tickers: string[];
}

let counter = 0;

const RestButtons: NextPage<Props> = ({ tickers }) => {
  const [interval, setInterval] = useState<number | false>();

  const { status, data, error, isFetching } = useTickerData();

  return (
    <ButtonsWrapper>
      <Button
        onClick={() => {
          setInterval(2000);
        }}
      >
        Connect
      </Button>
      {/* <Button onClick={() => {}}>Subscribe</Button> */}
      <Button
        onClick={() => {
          setInterval(false);
        }}
      >
        Disconnect
      </Button>
    </ButtonsWrapper>
  );
};

export default RestButtons;
