import { PropsWithChildren, RefObject, useEffect, useRef } from "react";
import styled from "styled-components";
import { breakpoint, space } from "theme";

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

type Event = MouseEvent | TouchEvent;

const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      if (!ref.current?.contains(event?.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
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
  background-color: rgba(0, 0, 0, 0.5);
`;

const Wrapper = styled.div`
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

const CloseButton = styled.button`
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
