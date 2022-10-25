import styled from "styled-components";
import { breakpoint, space } from "theme";

export const Overlay = styled.div`
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

// todo add click outside
export const Wrapper = styled.div`
  background-color: var(--color-form-element-background);
  padding: ${space(3)} ${space(3)};
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  bottom: 0;
  overflow: auto;

  ${breakpoint(1)} {
    position: relative;
    top: unset;
    min-width: 800px;
    max-width: 800px;
    min-height: 80vh;
    max-height: 80vh;
  }
`;

export const CloseButton = styled.button`
  outline: 0;
  border: 0;
  position: absolute;
  right: ${space(2)};
  top: ${space(2)};
  background-color: inherit;
  border-radius: 50%;
  height: 25px;
  width: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
