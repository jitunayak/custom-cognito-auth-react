import styled from "styled-components";

type Props = {};

export default function Loader({}: Props) {
  return <OuterCircle></OuterCircle>;
}

const OuterCircle = styled.div`
  width: 1rem;
  height: 1rem;
  border: 0.15rem solid #f3f3f3; /* Light grey */
  border-top: 0.1rem solid blueviolet; /* Black */
  border-radius: 50%;
  animation: spinner 1.5s linear infinite;
  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
