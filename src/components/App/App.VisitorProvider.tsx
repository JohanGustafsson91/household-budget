import { useAuth } from "api/auth";
import {
  AnonymousVisitor,
  Friend,
  getVisitor,
  RegisteredVisitor,
  Visitor,
} from "api/visitor";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useAsync } from "shared/useAsync";

export const VisitorProvider = ({ children }: PropsWithChildren<{}>) => {
  const [auth, authIsLoading] = useAuth();
  const { status, data, setData, setError } = useAsync<Visitor>();

  useEffect(
    function getVisitorData() {
      return !authIsLoading
        ? getVisitor(auth?.uid, setData, setError)
        : undefined;
    },
    [auth?.uid, authIsLoading, setData, setError]
  );

  const getFriendById = useCallback(
    (friendId: string) =>
      friendId === data?.id
        ? data
        : data?.friends.find(({ id }) => id === friendId),
    [data]
  );

  if (status === "rejected") {
    throw new Error("GET_VISITOR");
  }

  return (
    <VisitorContext.Provider
      value={data ? { ...data, getFriendById } : undefined}
    >
      {status === "resolved" ? children : null}
    </VisitorContext.Provider>
  );
};

const VisitorContext = createContext<ProviderProps | undefined>(undefined);

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
