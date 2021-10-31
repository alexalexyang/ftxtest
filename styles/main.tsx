import styled from "styled-components";

export const Main = styled.div`
  /* height: 100%; */
  width: 100%;
  display: flex;
  padding-bottom: 10rem;
  flex-direction: column;
  align-items: center;
  padding-top: 5rem;
  background-color: ghostwhite;

  > :not(:last-child) {
    margin-bottom: 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    :hover {
      color: pink;
    }
  }
`;

export const Button = styled.button`
  border-radius: 50%;
  height: 6rem;
  width: 6rem;
  border: 1px solid gold;
  background-color: lemonchiffon;
  box-shadow: 2px 2px 4px lightgray;

  :active {
    transform: scale(1.1);
    background-color: papayawhip;
  }
`;

export const ButtonsWrapper = styled.div`
  > :not(:last-child) {
    margin-right: 1rem;
  }
`;

export const ChartWrapper = styled.div`
  width: calc(100% - 2rem);
  border-radius: 1.5rem;
  border: 1px solid tan;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
  gap: 1.5rem;
  background-color: lightgoldenrodyellow;
`;
