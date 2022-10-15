import { useAuth } from "api/auth";
import { Loading } from "components/Loading";
import { PropsWithChildren, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "./App";

export const HandleAuth = ({
  children,
  authenticationRequired = false,
  loadingElement = <Loading fullPage>Laddar...</Loading>,
}: PropsWithChildren<{
  authenticationRequired?: boolean;
  loadingElement?: JSX.Element;
}>) => {
  const [user, loading] = useAuth();
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
