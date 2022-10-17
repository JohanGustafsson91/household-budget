import { ActionBar, ActionBarProvider } from "components/ActionBar";
import { Login } from "components/Login";
import { Overview } from "components/Overview";
import { PageContent, PageWrapper } from "components/Page";
import { BudgetPeriod, CreateBudgetPeriod } from "components/BudgetPeriod";
import { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <PageWrapper>
          <PageContent>
            <h1>Vi har lite problem just nu</h1>
            <pre>Felkod: {error.message}</pre>
            <button onClick={resetErrorBoundary}>Försök igen</button>
          </PageContent>
        </PageWrapper>
      )}
    >
      <HandleAuth authenticationRequired={true}>
        <UserProvider>
          <ActionBarProvider>
            <PageWrapper>
              <ActionBar />
              <PageContent>{children}</PageContent>
            </PageWrapper>
          </ActionBarProvider>
        </UserProvider>
      </HandleAuth>
    </ErrorBoundary>
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
      <CreateBudgetPeriod />
    </AuthenticatedPage>
  ),
  period: (
    <AuthenticatedPage>
      <BudgetPeriod />
    </AuthenticatedPage>
  ),
};

export const ROUTES = {
  login: "/login",
  main: "/",
  createPeriod: "/period/add",
  period: "/period/:id",
};
