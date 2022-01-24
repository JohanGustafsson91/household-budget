import { Login } from "components/Login";
import { Overview } from "components/Overview";
import { PageContent, PageHeader, PageWrapper } from "components/Page";
import { Period, PeriodCreate } from "components/Period";
import { signOut } from "firebase/auth";
import { PropsWithChildren } from "react";
import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import { auth } from "utils";
import { HandleAuth } from "./App.HandleAuth";
import { UserProvider } from "./App.UserProvider";

export const App = () => (
  <Router>
    <Routes>
      <Route path={ROUTES.login} element={pages.login} />
      <Route path={ROUTES.main} element={pages.home} />
      <Route path={ROUTES.createPeriod} element={pages.createPeriod} />
      <Route path={ROUTES.period} element={pages.period} />
    </Routes>
  </Router>
);

function AuthenticatedPage({ children }: PropsWithChildren<{}>) {
  return (
    <HandleAuth authenticationRequired={true}>
      <UserProvider>
        <PageWrapper>
          <PageHeader>
            <p>
              <Link to="/">Välkommen</Link>
            </p>
            <button onClick={() => signOut(auth)}>Logga ut</button>
          </PageHeader>
          <PageContent>{children}</PageContent>
        </PageWrapper>
      </UserProvider>
    </HandleAuth>
  );
}

const pages = {
  login: (
    <HandleAuth>
      <Login />
    </HandleAuth>
  ),
  home: (
    <AuthenticatedPage>
      <Overview />
    </AuthenticatedPage>
  ),
  createPeriod: (
    <AuthenticatedPage>
      <PeriodCreate />
    </AuthenticatedPage>
  ),
  period: (
    <AuthenticatedPage>
      <Period />
    </AuthenticatedPage>
  ),
};

export const ROUTES = {
  login: "/login",
  main: "/",
  createPeriod: "/period/add",
  period: "/period/:id",
};
