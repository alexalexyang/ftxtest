import { Button, ButtonsWrapper } from "../styles/main";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ftxUnsubscribe, ftxWs, ftxWsKeepAlive } from "../helpers/ftx-ws";
import { useEffect, useState } from "react";

import type { NextPage } from "next";
import { TradeData } from "../types/ftx";
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
  const [data, setData] = useState<TradeData[]>();

  const [ws, setWs] = useState<WebSocket>();
  const [pingId, setPingId] = useState<NodeJS.Timer>();
  const [startPing, setStartPing] = useState<boolean>(false);
  const [plotId, setPlotId] = useState<NodeJS.Timer>();
  const [startPlot, setStartPlot] = useState<boolean>(false);

  useEffect(() => {
    if (startPlot === false) {
      plotId && clearInterval(plotId);
      setPlotId(undefined);
      return;
    }

    const startPlotId = setInterval(() => {
      setData(queryClient.getQueryData("SOL-PERP"));
    }, 2000);

    setPlotId(startPlotId);
  }, [startPlot]);

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
      setPingId(id);
    }
    if (!startPing && pingId) {
      clearInterval(pingId);
    }
  }, [startPing]);

  return (
    <>
      <LineChart
        width={730}
        height={250}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis type="number" domain={[159, 160.5]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#8884d8" />
      </LineChart>
      <ButtonsWrapper>
        <Button
          onClick={() => {
            setWs(new WebSocket("wss://ftx.com/ws/"));
            setStartPlot(true);
          }}
        >
          Connect
        </Button>
        <Button
          onClick={() => {
            const data = queryClient.getQueryData("SOL-PERP");
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
            setWs(undefined);
            setStartPing(false);
            setStartPlot(false);
          }}
        >
          Disconnect
        </Button>
      </ButtonsWrapper>
    </>
  );
};

export default ChartComponent;
