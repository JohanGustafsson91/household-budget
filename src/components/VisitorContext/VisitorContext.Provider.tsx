import { useAuth } from "api/auth";
import { Friend, Visitor, getVisitor } from "api/visitor";
import { PropsWithChildren, useEffect, useCallback } from "react";
import { useAsync } from "shared/useAsync";
import { VisitorContext } from "./VisitorContext";

export default function VisitorProvider({
  children,
}: PropsWithChildren<object>) {
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
}

export type ProviderProps = Visitor & {
  getFriendById: (friendId: string) => Friend | undefined;
};
