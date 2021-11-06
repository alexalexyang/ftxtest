import styled from "styled-components";

export const TickerSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const PanelsBox = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: space-evenly;
  height: 20rem;
  width: calc(100% - 2rem);
`;

export const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
`;

export const BidAskPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1rem;
  overflow-y: auto;
  background-color: aliceblue;
  border-radius: 0.5rem;
  border: 1px solid lightskyblue;
`;

export const H2 = styled.h2`
  align-self: center;
`;

export const Row = styled.div`
  font-weight: 300;
  display: flex;
  gap: 1rem;
  margin-top: 0.3rem;
`;

export const RowItem = styled.span`
  width: 7rem;
`;

export const ButtonWrappers = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;
