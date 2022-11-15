import { ActionBar, ActionBarProvider } from "components/ActionBar";
import { Login } from "components/Login";
import { Overview } from "components/Overview";
import { BudgetPeriod } from "components/BudgetPeriod";
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
                <BudgetPeriod />
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
        <ActionBar />
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
  width: 100%;
  height: 100vh;
  float: left;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PageContent = styled.div<{ overflowHidden?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${space(3)};
  overflow: auto;

  ${(props) =>
    props.overflowHidden &&
    `
  overflow: hidden;
`}
`;

type ValueOf<T> = T[keyof T];
