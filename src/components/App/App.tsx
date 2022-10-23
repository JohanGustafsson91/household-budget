import { ActionBar, ActionBarProvider } from "components/ActionBar";
import { Login } from "components/Login";
import { Overview } from "components/Overview";
import { PageContent, PageWrapper } from "components/Page";
import { BudgetPeriod, CreateBudgetPeriod } from "components/BudgetPeriod";
import { PropsWithChildren, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  useVisitor,
  VisitorProvider,
  VisitorType,
} from "./App.VisitorProvider";

export const App = () => (
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
    <VisitorProvider>
      <Router>
        <Routes>
          <Route
            path={ROUTES.login}
            element={
              <Page
                visitorTypes={["anonymous"]}
                navigateToPageIfNotAllowed={ROUTES.main}
              >
                <Login />
              </Page>
            }
          />
          <Route
            path={ROUTES.main}
            element={
              <RegisteredVisitorPage>
                <Overview />
              </RegisteredVisitorPage>
            }
          />
          <Route
            path={ROUTES.createPeriod}
            element={
              <RegisteredVisitorPage>
                <CreateBudgetPeriod />
              </RegisteredVisitorPage>
            }
          />
          <Route
            path={ROUTES.period}
            element={
              <RegisteredVisitorPage>
                <BudgetPeriod />
              </RegisteredVisitorPage>
            }
          />
        </Routes>
      </Router>
    </VisitorProvider>
  </ErrorBoundary>
);

function RegisteredVisitorPage({ children }: PropsWithChildren<{}>) {
  return (
    <Page visitorTypes={["registered"]}>
      <ActionBarProvider>
        <PageWrapper>
          <ActionBar />
          <PageContent>{children}</PageContent>
        </PageWrapper>
      </ActionBarProvider>
    </Page>
  );
}

function Page({
  visitorTypes,
  navigateToPageIfNotAllowed = ROUTES.login,
  children,
}: PropsWithChildren<{
  visitorTypes: VisitorType[];
  navigateToPageIfNotAllowed?: ValueOf<typeof ROUTES>;
}>) {
  const { type } = useVisitor();
  const navigate = useNavigate();

  const visitorAllowed = visitorTypes.includes(type);

  useEffect(
    function protectPage() {
      if (!visitorAllowed) {
        return navigate(navigateToPageIfNotAllowed);
      }
    },
    [navigate, navigateToPageIfNotAllowed, visitorAllowed]
  );

  return <>{children}</>;
}

export const ROUTES = {
  login: "/login",
  main: "/",
  createPeriod: "/period/add",
  period: "/period/:id",
};

type ValueOf<T> = T[keyof T];
