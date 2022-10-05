import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { AsyncState } from "shared";
import { auth, COLLECTION, db } from "utils";

export const UserContext = React.createContext<ProviderProps | undefined>(
  undefined
);

export const UserProvider = ({ children }: Props) => {
  const [state, setState] = useState<AsyncState<User>>({
    data: undefined,
    status: "pending",
  });

  useEffect(function getUserData() {
    if (!auth.currentUser?.uid) {
      return;
    }

    const userQuery = (id: string) =>
      query(collection(db, COLLECTION["users"]), where("id", "==", id));

    const unsubscribe = onSnapshot(
      userQuery(auth.currentUser?.uid),
      async function onSnapshot(querySnapshot) {
        const [doc] = querySnapshot.docs;
        const { id, name, friends } = doc.data();

        const friendsData: Friend[] = await Promise.all(
          friends.map(async (friendId: string) => {
            const doc = await getDocs(userQuery(friendId));
            const [friendDoc] = doc.docs;
            const { name, id } = friendDoc.data();
            return { name, id } as Friend;
          })
        );

        setState({
          data: {
            id: id as string,
            name: name as string,
            friends: friendsData,
          },
          status: "resolved",
        });
      },
      function onError(e) {
        console.log(e);
      }
    );

    return unsubscribe;
  }, []);

  const getFriendNameById = useCallback(
    function findFriendName(friendId: string) {
      if (state.status !== "resolved") return "";

      return friendId === state.data.id
        ? state.data.name
        : state.data.friends.find(({ id }) => id === friendId)?.name ?? "";
    },
    [state.data?.friends, state.data?.id, state.data?.name, state.status]
  );

  return (
    <UserContext.Provider value={{ ...state, getFriendNameById }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): ProviderProps => {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error(
      "[useUser]: You must wrap your component with <UserProvider />."
    );
  }

  return ctx;
};

type ProviderProps = AsyncState<User> & {
  getFriendNameById: (friendId: string) => string;
};

interface User {
  name: string;
  id: string;
  friends: Friend[];
}

interface Friend {
  id: string;
  name: string;
}

interface Props {
  children: React.ReactElement;
}
