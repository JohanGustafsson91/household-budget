import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, COLLECTION, db } from "./firebase";

export const getVisitor = (
  id: string | undefined,
  callbackOnSnapshot: (value: Visitor) => void,
  callbackOnError: (error: string) => void
) => {
  const currentVisitorId = auth.currentUser?.uid;

  if (currentVisitorId !== id) {
    return callbackOnError("Invalid id");
  }

  if (!currentVisitorId) {
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
    visitorQuery(currentVisitorId),
    async function onSnapshot(querySnapshot) {
      const [doc] = querySnapshot.docs;
      const { id, name, gender, friends } = doc.data();

      // Fix N+1 query: batch fetch all friends in one query
      let friendsData: Friend[] = [];
      if (friends.length > 0) {
        // Firestore 'in' query supports up to 10 items, batch if needed
        const batchSize = 10;
        const batches = [];
        for (let i = 0; i < friends.length; i += batchSize) {
          const batch = friends.slice(i, i + batchSize);
          batches.push(
            getDocs(
              query(
                collection(db, COLLECTION["users"]),
                where("id", "in", batch)
              )
            )
          );
        }

        const results = await Promise.all(batches);
        friendsData = results.flatMap((result) =>
          result.docs.map((doc) => {
            const { name, id, gender } = doc.data();
            return { name, id, gender } as Friend;
          })
        );
      }

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
    (e) => callbackOnError(e.message)
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
