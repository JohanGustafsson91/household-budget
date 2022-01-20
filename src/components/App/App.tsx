import { Login } from "components/Login";
import { Overview } from "components/Overview";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { HandleAuth } from "./App.HandleAuth";

export const App = () => (
  <Router>
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.main} element={<HomePage />} />
    </Routes>
  </Router>
);

const LoginPage = () => (
  <HandleAuth>
    <Login />
  </HandleAuth>
);

const HomePage = () => (
  <HandleAuth authenticationRequired={true}>
    <Overview />
  </HandleAuth>
);

export const ROUTES = {
  login: "/login",
  main: "/",
};
