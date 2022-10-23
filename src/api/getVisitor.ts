import {
  collection,
  FirestoreError,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { COLLECTION, db } from "utils";
import { getAuth } from "./auth";

export const getVisitor = (
  callbackOnSnapshot: (value: Visitor) => void,
  callbackOnError: (error: FirestoreError) => void
) => {
  const userId = getAuth().currentUser?.uid;

  if (!userId) {
    return callbackOnSnapshot({
      type: "anonymous",
      id: undefined,
      name: undefined,
      email: undefined,
      photo: undefined,
      gender: undefined,
      friends: [],
    });
  }

  return onSnapshot(
    visitorQuery(userId),
    async function onSnapshot(querySnapshot) {
      const [doc] = querySnapshot.docs;
      const { id, name, gender, friends } = doc.data();

      const friendsData: Friend[] = await Promise.all(
        friends.map(async (friendId: string) => {
          const doc = await getDocs(visitorQuery(friendId));
          const [friendDoc] = doc.docs;
          const { name, id, gender } = friendDoc.data();
          const friend: Friend = { name, id, gender };
          return friend;
        })
      );

      callbackOnSnapshot({
        type: "registered",
        id,
        name,
        email: "",
        photo: "",
        gender,
        friends: friendsData,
      });
    },
    callbackOnError
  );
};

const visitorQuery = (id: string) =>
  query(collection(db, COLLECTION["users"]), where("id", "==", id));

export type Visitor = AnonymousVisitor | RegisteredVisitor;

export interface AnonymousVisitor {
  type: "anonymous";
  id: undefined;
  name: undefined;
  email: undefined;
  photo: undefined;
  gender: undefined;
  friends: Friend[];
}

export interface RegisteredVisitor {
  type: "registered";
  id: string;
  name: string;
  email: string;
  photo: string;
  gender: Gender;
  friends: Friend[];
}

export interface Friend {
  id: string;
  name: string;
  gender: Gender;
}

type Gender = "male" | "female";
