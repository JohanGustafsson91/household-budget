import styled from "styled-components";
import { fontSize, space } from "theme";

export const ActionButton = styled.button`
  position: fixed;
  bottom: ${space(3)};
  right: ${space(3)};
  border-radius: 50%;
  height: ${fontSize(6)};
  width: ${fontSize(6)};
  outline: 0;
  border: 0;
  background-color: var(--color-background-action-bar);
  color: var(--color-text-action-bar);
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
  font-size: ${fontSize(4)};
  font-weight: bold;
`;
