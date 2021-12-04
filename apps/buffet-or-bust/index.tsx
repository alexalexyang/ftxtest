import { Button, Main } from "../../styles/main";
import { useContext, useEffect, useState } from "react";

import Chart from "../../components/chart";
import type { NextPage } from "next";
import axios from "axios";
import styled from "styled-components";

const Index: NextPage = () => {
  const [data, setData] = useState();

  const getData = async () => {
    const res = await axios.get(`/api/ftx-historical`, {
      params: { ticker: "SOL/USD" },
    });

    console.log(res.data);
  };

  return (
    <>
      <Main>
        <h1>Buffet or Bust!</h1>
        <Button onClick={getData}>I am a button</Button>
      </Main>
    </>
  );
};

export default Index;
