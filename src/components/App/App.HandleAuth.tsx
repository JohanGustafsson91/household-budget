import { PropsWithChildren, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "utils/firebase";
import { ROUTES } from "./App";

export const HandleAuth = ({
  children,
  authenticationRequired = false,
  loadingElement = <Loading>Loading...</Loading>,
}: PropsWithChildren<{
  authenticationRequired?: boolean;
  loadingElement?: JSX.Element;
}>) => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const userState = loading ? "pending" : user ? "logged in" : "not logged in";

  useEffect(
    function protectAuthenticatedPage() {
      if (userState === "not logged in" && authenticationRequired) {
        return navigate(ROUTES.login);
      }
    },
    [authenticationRequired, navigate, userState]
  );

  useEffect(
    function protectLoginPage() {
      if (userState === "logged in" && pathname === ROUTES.login) {
        return navigate(ROUTES.main);
      }
    },
    [navigate, pathname, userState]
  );

  return <>{loading ? loadingElement : children}</>;
};

const Loading = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
