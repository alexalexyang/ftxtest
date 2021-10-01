import { Button, ButtonsWrapper } from "../styles/main";
import { ftxUnsubscribe, ftxWs, ftxWsKeepAlive } from "../helpers/ftx-ws";
import { useEffect, useState } from "react";

import type { NextPage } from "next";
import { useQueryClient } from "react-query";

// {
//     "id": 2029150108,
//     "price": 47600,
//     "size": 0.1,
//     "side": "sell",
//     "liquidation": false,
//     "time": "2021-10-01T17:38:51.183096+00:00"
// }

const ChartComponent: NextPage = () => {
  const queryClient = useQueryClient();

  const [ws, setWs] = useState<WebSocket>();
  const [intervalId, setintervalId] = useState<NodeJS.Timer>();
  const [startPing, setStartPing] = useState<boolean>(false);

  useEffect(() => {
    if (!ws) {
      return;
    }

    ftxWs(ws, queryClient);
    setStartPing(true);
  }, [ws]);

  useEffect(() => {
    if (startPing && ws) {
      const id = ftxWsKeepAlive(ws);
      setintervalId(id);
    }
    if (!startPing && intervalId) {
      clearInterval(intervalId);
    }
  }, [startPing]);

  return (
    <>
      <ButtonsWrapper>
        <Button onClick={() => setWs(new WebSocket("wss://ftx.com/ws/"))}>
          Connect
        </Button>
        <Button
          onClick={() => {
            const data = queryClient.getQueryData("BTC-PERP");
            console.log(data);
          }}
        >
          Data
        </Button>
        <Button
          onClick={() => {
            if (!ws) {
              return;
            }

            ftxUnsubscribe(ws);
            ws.close();
            setStartPing(false);
          }}
        >
          Disconnect
        </Button>
      </ButtonsWrapper>
    </>
  );
};

export default ChartComponent;
