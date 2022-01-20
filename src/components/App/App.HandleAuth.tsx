import { PropsWithChildren, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "utils/firebase";
import { ROUTES } from "./App";

export const HandleAuth = ({
  children,
  authenticationRequired = false,
}: PropsWithChildren<{ authenticationRequired?: boolean }>) => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(
    function protectAuthenticatedPage() {
      const hasNoAccess = [!user, authenticationRequired, !loading].every(
        Boolean
      );
      hasNoAccess && navigate(ROUTES.login);
    },
    [authenticationRequired, loading, navigate, user]
  );

  useEffect(
    function protectLoginPage() {
      const shouldNotAccessLoginPage = [
        user,
        pathname === ROUTES.login,
        !loading,
      ].every(Boolean);

      shouldNotAccessLoginPage && navigate(ROUTES.main);
    },
    [loading, navigate, pathname, user]
  );

  return loading ? <Loading>Loading...</Loading> : <>{children}</>;
};

const Loading = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
