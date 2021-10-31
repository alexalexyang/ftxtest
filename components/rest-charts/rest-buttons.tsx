import { Button, ButtonsWrapper } from "../../styles/main";
import { useQuery, useQueryClient } from "react-query";

import { NextPage } from "next";
import axios from "axios";
import { useState } from "react";

interface Props {
  tickers: string[];
}
let counter = 0;
const RestButtons: NextPage<Props> = ({ tickers }) => {
  // const queryClient = useQueryClient();

  const [interval, setInterval] = useState<number | false>();

  const { status, data, error, isFetching } = useQuery(
    ["ticker", "SOL/USD"],
    async () => {
      counter++;
      const res = await axios(`/api/ftx-market`);

      return res;
    },
    {
      refetchInterval: interval,
    }
  );

  console.log(counter, interval);
  console.log(data);
  return (
    <ButtonsWrapper>
      <Button
        onClick={() => {
          setInterval(5000);
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
