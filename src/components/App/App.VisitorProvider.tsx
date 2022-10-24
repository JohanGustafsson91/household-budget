import { useAuth } from "api/auth";
import {
  AnonymousVisitor,
  Friend,
  getVisitor,
  RegisteredVisitor,
  Visitor,
} from "api/visitor";
import { Loading } from "components/Loading";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AsyncState } from "shared";

const VisitorContext = createContext<ProviderProps | undefined>(undefined);

export const VisitorProvider = ({ children }: PropsWithChildren<{}>) => {
  const [auth, authIsLoading] = useAuth();

  const [state, setState] = useState<AsyncState<Visitor>>({
    data: undefined,
    status: "pending",
  });

  useEffect(
    function getVisitorData() {
      if (authIsLoading) {
        return;
      }

      const unsubscribe = getVisitor(
        auth?.uid,
        function onCallback(data) {
          return setState({
            data,
            status: "resolved",
          });
        },
        function onError() {
          setState({ data: undefined, status: "rejected" });
        }
      );

      return unsubscribe;
    },
    [auth, authIsLoading]
  );

  const getFriendById = useCallback(
    function findFriendName(friendId: string) {
      return friendId === state.data?.id
        ? state.data
        : state.data?.friends.find(({ id }) => id === friendId);
    },
    [state.data]
  );

  if (state.status === "rejected") {
    throw new Error("GET_VISITOR");
  }

  return (
    <VisitorContext.Provider
      value={state.data ? { ...state.data, getFriendById } : undefined}
    >
      {state.status === "pending" ? (
        <Loading fullPage>Hämtar besökare...</Loading>
      ) : (
        children
      )}
    </VisitorContext.Provider>
  );
};

export function useVisitor(): ProviderProps {
  const ctx = useContext(VisitorContext);

  if (!ctx) {
    throw new Error(
      "[useVisitor]: You must wrap your component with <VisitorProvider />."
    );
  }

  return ctx;
}

type ProviderProps = Visitor & {
  getFriendById: (friendId: string) => Friend | undefined;
};

export type VisitorType = AnonymousVisitor["type"] | RegisteredVisitor["type"];
