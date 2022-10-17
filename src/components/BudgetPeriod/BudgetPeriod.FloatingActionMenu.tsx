import { Button } from "components/Form";
import { useState } from "react";
import styled from "styled-components";
import { fontSize } from "theme";

export const FloatingActionMenu = ({
  children,
}: {
  children: (arg: { closeMenu: () => void }) => JSX.Element;
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <Wrapper>
      {menuVisible
        ? children({ closeMenu: () => setMenuVisible(false) })
        : null}
      <Button onClick={() => setMenuVisible((prev) => !prev)}>+</Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: transparent;
  position: absolute;
  bottom: 25px;
  right: 25px;

  ${Button} {
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
    float: right;
  }
`;
