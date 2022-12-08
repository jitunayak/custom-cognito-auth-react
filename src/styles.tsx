import styled from "styled-components";
const theme = {
  primary: "blueviolet",
};

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: "white";
  padding: 1rem;
  border-radius: 0.4rem;
  border: 0.6px grey solid;
  box-shadow: 6px 8px;
`;

export const TabWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0.4rem;
`;

export const Title = styled.h2`
  color: ${theme.primary};
`;

export const Tab = styled.div<{ isActive?: boolean }>`
  font-size: 1.5em;
  text-align: center;
  cursor: pointer;
  border-radius: 0.2rem;
  margin: 1rem 0rem;
  padding: 0.6rem 1rem;
  transition: background-color 0.5s;
  :hover {
    animation: fade 2s infinite;
  }

  @media (prefers-color-scheme: dark) {
    color: ${(props) => (!props.isActive ? "white" : "black")};
    background-color: ${(props: { isActive?: boolean }) =>
      props.isActive ? "white" : "black"};
  }
  @media (prefers-color-scheme: light) {
    color: ${(props) => (!props.isActive ? "black" : "white")};
    background-color: ${(props) => (props.isActive ? "black" : "white")};
  }
`;

export const PrimaryButton = styled.button<{ isLoading: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.2rem;
  background-color: ${theme.primary};
  color: white;
  font-weight: 500;
  font-size: 1.2rem;
  margin: 0.6rem 0.5rem;
  cursor: pointer;
  opacity: ${(props) => (props.isLoading ? 0.8 : 1)};

  :hover {
    transition: opacity 0.25s;
    opacity: 0.8;
  }
`;

export const Link = styled.a`
  cursor: pointer;
`;

export const SignInWrapper = styled.form`
  display: flex;
  flex-direction: column;
  width: auto;
`;
export const RegisterWrapper = styled(SignInWrapper)``;
