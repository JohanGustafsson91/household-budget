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
        const { id, name, gender, friends } = doc.data();

        const friendsData: Friend[] = await Promise.all(
          friends.map(async (friendId: string) => {
            const doc = await getDocs(userQuery(friendId));
            const [friendDoc] = doc.docs;
            const { name, id, gender } = friendDoc.data();
            const friend: Friend = { name, id, gender };
            return friend;
          })
        );

        setState({
          data: {
            id: id as string,
            name: name as string,
            gender: gender as Gender,
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

  const getFriendById = useCallback(
    function findFriendName(friendId: string) {
      if (state.status !== "resolved") return undefined;

      return friendId === state.data.id
        ? state.data
        : state.data.friends.find(({ id }) => id === friendId);
    },
    [state.data, state.status]
  );

  return (
    <UserContext.Provider value={{ ...state, getFriendById }}>
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
  getFriendById: (friendId: string) => Friend | undefined;
};

interface User {
  name: string;
  id: string;
  gender: Gender;
  friends: Friend[];
}

interface Friend {
  id: string;
  name: string;
  gender: Gender;
}

type Gender = "male" | "female";

interface Props {
  children: React.ReactElement;
}
