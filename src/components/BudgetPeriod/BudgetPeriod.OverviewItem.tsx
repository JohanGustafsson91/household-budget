import styled from "styled-components";
import { fontSize } from "theme";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
`;

export const Value = styled.div<{ highlight?: boolean }>`
  color: var(--color-text-action-bar);
  font-weight: 500;
  align-items: center;
  font-size: ${(props) => (props.highlight ? fontSize(5) : fontSize(3))};
  justify-self: flex-start;
`;

export const Label = styled.div`
  color: var(--color-money-label);
`;
