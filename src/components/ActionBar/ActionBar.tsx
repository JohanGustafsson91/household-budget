import { logout } from "api/auth";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { fontSize, space } from "theme";
import backIcon from "./ActionBar.back.icon.svg";
import logoutIcon from "./ActionBar.logout.icon.svg";

const ActionBarContext = React.createContext<ProviderProps | undefined>(
  undefined
);

export const ActionBarProvider = ({ children }: Props) => {
  const [title, setTitle] = useState("");

  return (
    <ActionBarContext.Provider value={{ title, setTitle }}>
      {children}
    </ActionBarContext.Provider>
  );
};

const useActionBar = (): ProviderProps => {
  const ctx = React.useContext(ActionBarContext);

  if (!ctx) {
    throw new Error(
      "[useActionBar]: You must wrap your component with <ActionBarProvider />."
    );
  }

  return ctx;
};

export const ActionBar = () => {
  const { title } = useActionBar();
  const location = useLocation();

  return (
    <PageHeader>
      {location.pathname !== "/" && (
        <Link style={{ lineHeight: 0 }} to="/">
          <Icon src={backIcon} alt="back" />
        </Link>
      )}
      <Title>{title}</Title>
      <Icon src={logoutIcon} alt="logout" onClick={logout} noMargin />
    </PageHeader>
  );
};

export const ActionBarTitle = ({ title }: { title: string }) => {
  const { title: currentTitle, setTitle } = useActionBar();

  useEffect(
    function setActionBarTitle() {
      if (currentTitle !== title) {
        setTitle(title);
      }
    },
    [currentTitle, setTitle, title]
  );

  return null;
};

interface Props {
  children: React.ReactElement;
}

interface ProviderProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${space(3)};
  background-color: var(--color-background-action-bar);
  color: var(--color-text-action-bar);
  height: 44pt;
`;

const Icon = styled.img<{ noMargin?: boolean }>`
  width: ${space(3)};
  height: auto;
  margin-right: ${(props) => (props.noMargin ? 0 : space(3))};
`;

const Title = styled.span`
  flex: 1;
  font-weight: 700;
  font-size: ${fontSize(2)};
`;
