import styled from "styled-components";
import { fontSize, space } from "theme";

export const Wrapper = styled.div<{ columns: number }>`
  flex: 1;
  display: grid;
  grid-template-columns: ${(props) => `repeat(${props.columns}, 200px)`};
  overflow-y: hidden;
  overflow-x: scroll;
  height: 100%;
`;

export const LaneContent = styled.div`
  flex: 1;
  border-top: 2px solid var(--color-border);
  padding: ${space(2)};
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
`;

export const Lane = styled.div<{ noBorders?: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  ${LaneContent} {
    border-bottom: 2px solid var(--color-border);
    border-left: 2px solid var(--color-border);
  }
  &:first-child {
    ${LaneContent} {
      border-left: none;
    }
  }
`;

export const LaneHeader = styled.div`
  color: var(--color-text);
  text-align: center;
  text-transform: uppercase;
  font-size: ${fontSize(0)};
`;
