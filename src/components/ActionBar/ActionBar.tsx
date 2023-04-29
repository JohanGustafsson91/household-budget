import { logout } from "api/auth";
import { useState, useRef, PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import { useOnClickOutside } from "shared/useClickOutside";
import styled from "styled-components";
import { fontSize, space } from "theme";
import backIcon from "./back.icon.svg";

interface ActionBarProps {
  title?: string;
  renderMenu?: ({ closeMenu }: { closeMenu: () => void }) => JSX.Element;
}

export const ActionBar = ({
  title,
  renderMenu,
  children,
}: PropsWithChildren<ActionBarProps>) => {
  const { pathname } = useLocation();
  const popupMenuRef = useRef<HTMLDivElement | null>(null);
  const [menu, setMenu] = useState<"open" | "closed">("closed");

  useOnClickOutside(popupMenuRef, () => setMenu("closed"));

  return (
    <>
      <Container>
        {pathname !== "/" ? (
          <MenuItem>
            <Link style={{ lineHeight: 0 }} to="/">
              <Icon src={backIcon} alt="back" />
            </Link>
          </MenuItem>
        ) : null}
        <MenuItem flex={1}>
          <span>{title ?? ""}</span>
        </MenuItem>
        <MenuItem>{children}</MenuItem>
        <Avatar onClick={() => setMenu("open")}>
          <img
            src="https://st3.depositphotos.com/9998432/13335/v/600/depositphotos_133352010-stock-illustration-default-placeholder-man-and-woman.jpg"
            alt="profile"
          />
        </Avatar>
      </Container>
      {menu === "open" ? (
        <PopupMenu>
          <PopupMenuContent ref={popupMenuRef}>
            {renderMenu?.({ closeMenu: () => setMenu("closed") })}
            <PopupMenuItem onClick={logout}>Logga ut</PopupMenuItem>
          </PopupMenuContent>
        </PopupMenu>
      ) : null}
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${space({ py: 3, mb: 3 })};
`;

const MenuItem = styled.div<{ flex?: number }>`
  flex: ${(props) => props.flex ?? 0};
  ${space({ mr: 3 })}
  width: auto;
`;

const Icon = styled.img`
  width: 24px;
  height: 100%;
`;

const Avatar = styled.div`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  border: 1px solid #e4e4e4;
  overflow: hidden;

  img {
    height: 100%;
    width: 100%;
  }
`;

const PopupMenu = styled.div`
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: fixed;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  cursor: pointer;
  z-index: 1;
  justify-content: center;

  background-color: rgba(0, 0, 0, 0.85);
`;

const PopupMenuContent = styled.div`
  background-color: var(--color-background);
  text-align: center;
  ${space({ py: 5 })};
`;

export const PopupMenuSection = styled.div`
  ${space({ mb: 5 })};
`;

export const PopupMenuTitle = styled.div`
  ${space({ p: 2 })};
  font-size: ${fontSize(2)};
`;

export const PopupMenuItem = styled.div<{ active?: boolean }>`
  ${space({ p: 2 })};
  font-size: ${fontSize(4)};
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  text-transform: capitalize;
`;
