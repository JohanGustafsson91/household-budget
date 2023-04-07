import { PropsWithChildren, useRef } from "react";
import { useOnClickOutside } from "shared/useClickOutside";
import styled from "styled-components";
import { breakpoint, space__deprecated } from "theme";

export const Modal = ({
  children,
  onClose,
}: PropsWithChildren<{ onClose: () => void }>) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, onClose);

  return (
    <Overlay>
      <Wrapper ref={modalRef}>
        <CloseButton title="Close" onClick={onClose}>
          X
        </CloseButton>
        {children}
      </Wrapper>
    </Overlay>
  );
};

const Overlay = styled.div`
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  ${breakpoint(1)} {
    background-color: rgba(0, 0, 0, 0.85);
  }
`;

const Wrapper = styled.div`
  background-color: var(--color-form-element-background);
  padding: ${space__deprecated(3)} ${space__deprecated(3)};
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

const CloseButton = styled.button`
  outline: 0;
  border: 0;
  position: absolute;
  right: ${space__deprecated(2)};
  top: ${space__deprecated(2)};
  background-color: inherit;
  border-radius: 50%;
  height: 25px;
  width: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
