import { PropsWithChildren, Suspense, lazy, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import styled from "styled-components";
import { space } from "theme";
const VisitorProvider = lazy(
  () => import("components/VisitorContext/VisitorContext.Provider")
);
const Overview = lazy(() => import("components/Overview"));
const Login = lazy(() => import("components/Login"));
const BudgetPeriod = lazy(() => import("components/BudgetPeriod/BudgetPeriod"));
const CreateBudgetPeriod = lazy(() => import("components/CreateBudgetPeriod"));
import { useVisitor } from "components/VisitorContext/VisitorContext.useVisitor";
import { AnonymousVisitor, RegisteredVisitor } from "api/visitor";

export const App = () => (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      <PageWrapper>
        <PageContent>
          <h1>Någonting gick fel...</h1>
          <pre>Felkod: {error.message}</pre>
          <button onClick={resetErrorBoundary}>Försök igen</button>
        </PageContent>
      </PageWrapper>
    )}
  >
    <Suspense fallback={<div />}>
      <VisitorProvider>
        <Router>
          <Routes>
            {[
              {
                path: routes.login,
                element: (
                  <Page
                    visitorTypes={["anonymous"]}
                    navigateToPageIfNotAllowed={routes.main}
                  >
                    <Suspense fallback={<div />}>
                      <Login />
                    </Suspense>
                  </Page>
                ),
              },
              {
                path: routes.main,
                element: (
                  <RegisteredVisitorPage>
                    <Suspense fallback={<div />}>
                      <Overview />
                    </Suspense>
                  </RegisteredVisitorPage>
                ),
              },
              {
                path: routes.createPeriod,
                element: (
                  <RegisteredVisitorPage>
                    <Suspense fallback={<div />}>
                      <CreateBudgetPeriod />
                    </Suspense>
                  </RegisteredVisitorPage>
                ),
              },
              {
                path: routes.period,
                element: (
                  <RegisteredVisitorPage>
                    <Suspense fallback={<div />}>
                      <BudgetPeriod />
                    </Suspense>
                  </RegisteredVisitorPage>
                ),
              },
            ].map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </Router>
      </VisitorProvider>
    </Suspense>
  </ErrorBoundary>
);

const routes = Object.freeze({
  login: "/login",
  main: "/",
  createPeriod: "/period/add",
  period: "/period/:id",
});

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

const RegisteredVisitorPage = ({ children }: PropsWithChildren<object>) => (
  <Page visitorTypes={["registered"]}>
    <PageWrapper>
      <PageContent>{children}</PageContent>
    </PageWrapper>
  </Page>
);

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
