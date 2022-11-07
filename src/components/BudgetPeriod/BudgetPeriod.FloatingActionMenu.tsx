import { Button } from "components/Form";
import { useRef, useState } from "react";
import { useOnClickOutside } from "shared/useClickOutside";
import styled from "styled-components";
import { fontSize, space } from "theme";

export const FloatingActionMenu = ({
  children,
}: {
  children: (arg: { closeMenu: () => void }) => JSX.Element;
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(contentRef, () => setMenuVisible(() => false));

  return (
    <Wrapper open={menuVisible}>
      <Content ref={contentRef}>
        {menuVisible ? (
          <Menu>{children({ closeMenu: () => setMenuVisible(false) })}</Menu>
        ) : null}
        <FloatingButton
          open={menuVisible}
          onClick={() => setMenuVisible((prev) => !prev)}
        >
          {menuVisible ? "x" : "+"}
        </FloatingButton>
      </Content>
    </Wrapper>
  );
};

export const FloatingMenuItem = ({ onClick, icon, text }: any) => (
  <MenuItem onClick={onClick}>
    <MenuItemText>{text}</MenuItemText>
    <MenuItemIcon src={icon} />
  </MenuItem>
);

const Wrapper = styled.div<{ open: boolean }>`
  background-color: ${(props) =>
    props.open ? "rgba(0, 0, 0, 0.85)" : "transparent"};
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;

  width: ${(props) => (props.open ? "100%" : "auto")};
  height: ${(props) => (props.open ? "100vh" : "auto")};

  padding-right: ${space(3)};
  padding-bottom: ${space(3)};

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  cursor: ${(props) => (props.open ? "pointer" : "default")};
`;

const Content = styled.div``;

const FloatingButton = styled(Button)<{ open: boolean }>`
  border-radius: 50%;
  height: ${(props) => fontSize(props.open ? 6 : 6)};
  width: ${(props) => fontSize(props.open ? 6 : 6)};
  outline: 0;
  border: 0;
  background-color: ${(props) =>
    props.open ? "#A5A5A8" : "var(--color-background-action-bar)"};
  color: ${(props) =>
    props.open ? "#57575A" : "var(--color-text-action-bar)"};
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
  font-size: ${(props) => fontSize(props.open ? 3 : 4)};
  font-weight: bold;
  float: right;
  z-index: 10;
`;

export const Menu = styled.div`
  background-color: transparent;
  margin-bottom: ${space(1)};
`;

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
  padding: ${space(2)} ${space(0)} ${space(2)} ${space(2)};
  color: #a5a5a8;

  margin-bottom: ${space(2)};

  &:hover {
    color: #fff;
  }
`;

const MenuItemIcon = styled.img`
  border-radius: 50%;
  height: ${fontSize(6)};
  width: ${fontSize(6)};
  background-color: #28e4c4;
  padding: ${fontSize(0)};
`;

const MenuItemText = styled.span`
  margin-right: ${space(3)};
`;
