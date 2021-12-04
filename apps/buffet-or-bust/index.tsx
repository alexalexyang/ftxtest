import { Button, Main } from "../../styles/main";
import { useContext, useEffect, useState } from "react";

import Chart from "./chart";
import type { NextPage } from "next";
import axios from "axios";
import styled from "styled-components";

const BuffetOrBust: NextPage = () => {
  const [data, setData] = useState();

  const getData = async () => {
    const res = await axios.get(`/api/ftx-historical`, {
      params: {
        ticker: "SOL/USD",
        startTime: "2021-12-02T17:15:00+00:00",
        endTime: "2021-12-03T17:15:00+00:00",
        resolution: 15,
      },
    });

    setData(res.data.prices);
  };

  return (
    <>
      <Main>
        <h1>Buffet or Bust!</h1>
        <Button onClick={getData}>I am a button</Button>
        <Chart
          ticker={"SOL/USD"}
          data={data}
          dataKey={"close"}
          mean={undefined}
          spread={undefined}
          property={"close"}
        />
      </Main>
    </>
  );
};

export default BuffetOrBust;
