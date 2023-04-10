import { ActionBarProvider } from "components/ActionBar";
import { Login } from "components/Login";
import { Overview } from "components/Overview";
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
import styled from "styled-components";
import { space } from "theme";
import { CreateBudgetPeriod } from "components/CreateBudgetPeriod";
import { BudgetPeriodNew } from "components/BudgetPeriodNew";

export const App = () => (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      <PageWrapper>
        <PageContent>
          <h1>Vi har lite problem just nu :/</h1>
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
            path={routes.login}
            element={
              <Page
                visitorTypes={["anonymous"]}
                navigateToPageIfNotAllowed={routes.main}
              >
                <Login />
              </Page>
            }
          />
          <Route
            path={routes.main}
            element={
              <RegisteredVisitorPage>
                <Overview />
              </RegisteredVisitorPage>
            }
          />
          <Route
            path={routes.createPeriod}
            element={
              <RegisteredVisitorPage>
                <CreateBudgetPeriod />
              </RegisteredVisitorPage>
            }
          />
          <Route
            path={routes.period}
            element={
              <RegisteredVisitorPage>
                <BudgetPeriodNew />
              </RegisteredVisitorPage>
            }
          />
        </Routes>
      </Router>
    </VisitorProvider>
  </ErrorBoundary>
);

const Page = ({
  visitorTypes,
  navigateToPageIfNotAllowed = routes.login,
  children,
}: PropsWithChildren<{
  visitorTypes: VisitorType[];
  navigateToPageIfNotAllowed?: ValueOf<typeof routes>;
}>) => {
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
};

const RegisteredVisitorPage = ({ children }: PropsWithChildren<{}>) => (
  <Page visitorTypes={["registered"]}>
    <ActionBarProvider>
      <PageWrapper>
        <PageContent>{children}</PageContent>
      </PageWrapper>
    </ActionBarProvider>
  </Page>
);

const routes = Object.freeze({
  login: "/login",
  main: "/",
  createPeriod: "/period/add",
  period: "/period/:id",
});

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  ${space({ px: 3 })};
  flex: 1;
  overflow: hidden;
`;

type ValueOf<T> = T[keyof T];
