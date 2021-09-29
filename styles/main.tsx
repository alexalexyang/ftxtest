import styled from "styled-components";

export const Main = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
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
