import { PropsWithChildren, Suspense, lazy, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import styled from "styled-components";
import { space } from "shared/theme";
const VisitorProvider = lazy(
  () => import("components/VisitorContext/VisitorContext.Provider"),
);
const OverviewBudgetPeriods = lazy(
  () => import("components/OverviewBudgetPeriods/OverviewBudgetPeriods"),
);
const LoginForm = lazy(() => import("components/LoginForm"));
const BudgetPeriod = lazy(() => import("components/BudgetPeriod/BudgetPeriod"));
const CreateBudgetPeriod = lazy(() => import("components/CreateBudgetPeriod"));
import { useVisitor } from "components/VisitorContext/VisitorContext.useVisitor";
import type { AnonymousVisitor, RegisteredVisitor } from "api/visitor";
import { Button } from "components/FormElements";

export const App = () => (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      <PageWrapper>
        <PageContent>
          <h1>Någonting gick fel...</h1>
          <pre>Felkod: {error.message}</pre>
          <Button onClick={resetErrorBoundary}>Försök igen</Button>
        </PageContent>
      </PageWrapper>
    )}
  >
    <Suspense fallback={<div />}>
      <VisitorProvider>
        <Router>
          <Routes>
            <Route
              path={ROUTES.LOGIN}
              element={
                <Page
                  visitorTypes={["anonymous"]}
                  navigateToPageIfNotAllowed={ROUTES.OVERVIEW_BUDGET_PERIODS}
                >
                  <Suspense fallback={<div />}>
                    <LoginForm />
                  </Suspense>
                </Page>
              }
            />
            <Route
              path={ROUTES.OVERVIEW_BUDGET_PERIODS}
              element={
                <RegisteredVisitorPage>
                  <Suspense fallback={<div />}>
                    <OverviewBudgetPeriods />
                  </Suspense>
                </RegisteredVisitorPage>
              }
            />
            <Route
              path={ROUTES.CREATE_BUDGET_PERIOD}
              element={
                <RegisteredVisitorPage>
                  <Suspense fallback={<div />}>
                    <CreateBudgetPeriod />
                  </Suspense>
                </RegisteredVisitorPage>
              }
            />
            <Route
              path={ROUTES.BUDGET_PERIOD}
              element={
                <RegisteredVisitorPage>
                  <Suspense fallback={<div />}>
                    <BudgetPeriod />
                  </Suspense>
                </RegisteredVisitorPage>
              }
            />
          </Routes>
        </Router>
      </VisitorProvider>
    </Suspense>
  </ErrorBoundary>
);

const Page = ({
  visitorTypes,
  navigateToPageIfNotAllowed = ROUTES.LOGIN,
  children,
}: PropsWithChildren<{
  visitorTypes: VisitorType[];
  navigateToPageIfNotAllowed?: ValueOf<typeof ROUTES>;
}>) => {
  const { type } = useVisitor();
  const navigate = useNavigate();

  const visitorAllowed = visitorTypes.includes(type);

  useEffect(
    function protectPage() {
      if (!visitorAllowed) {
        navigate(navigateToPageIfNotAllowed);
      }
    },
    [navigate, navigateToPageIfNotAllowed, visitorAllowed],
  );

  return <>{children}</>;
};

const RegisteredVisitorPage = ({ children }: PropsWithChildren<object>) => (
  <Page visitorTypes={["registered"]}>
    <PageWrapper>
      <PageContent>{children}</PageContent>
    </PageWrapper>
  </Page>
);

const ROUTES = Object.freeze({
  LOGIN: "/login",
  OVERVIEW_BUDGET_PERIODS: "/",
  CREATE_BUDGET_PERIOD: "/period/add",
  BUDGET_PERIOD: "/period/:id",
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

type VisitorType = AnonymousVisitor["type"] | RegisteredVisitor["type"];
