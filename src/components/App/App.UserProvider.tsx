import { getUser } from "api/getUser";
import { Loading } from "components/Loading";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AsyncState, Friend, User } from "shared";

export const UserContext = React.createContext<ProviderProps | undefined>(
  undefined
);

export const UserProvider = ({ children }: Props) => {
  const [state, setState] = useState<AsyncState<User>>({
    data: undefined,
    status: "pending",
  });

  useEffect(function getUserData() {
    const unsubscribe = getUser(
      function onCallback(data) {
        setState({ data, status: "resolved" });
      },
      function onError() {
        setState({ data: undefined, status: "rejected" });
      }
    );

    return unsubscribe;
  }, []);

  const getFriendById = useCallback(
    function findFriendName(friendId: string) {
      return friendId === state.data?.id
        ? state.data
        : state.data?.friends.find(({ id }) => id === friendId);
    },
    [state.data]
  );

  return {
    pending: () => <Loading fullPage>Hämtar användare...</Loading>,
    rejected: () => {
      throw new Error("FETCHING USER");
    },
    resolved: () => (
      <UserContext.Provider value={{ ...state, getFriendById }}>
        {children}
      </UserContext.Provider>
    ),
  }[state.status]();
};

export function useUser(): ProviderProps {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error(
      "[useUser]: You must wrap your component with <UserProvider />."
    );
  }

  return ctx;
}

type ProviderProps = AsyncState<User> & {
  getFriendById: (friendId: string) => Friend | undefined;
};

interface Props {
  children: React.ReactElement;
}
