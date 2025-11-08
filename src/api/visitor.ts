import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, COLLECTION, db } from "./firebase";

const chunkArray = <T>(array: T[], size: number): T[][] =>
  array.length === 0
    ? []
    : [array.slice(0, size), ...chunkArray(array.slice(size), size)];

const fetchFriendsInBatches = async (
  friendIds: string[],
): Promise<Friend[]> => {
  const batches = chunkArray(friendIds, 10);

  const batchQueries = batches.map((batch) =>
    getDocs(
      query(collection(db, COLLECTION["users"]), where("id", "in", batch)),
    ),
  );

  const results = await Promise.all(batchQueries);

  return results.flatMap((result) =>
    result.docs.map((doc) => {
      const { name, id, gender } = doc.data();
      return { name, id, gender } as Friend;
    }),
  );
};

const visitorQuery = (id: string) =>
  query(collection(db, COLLECTION["users"]), where("id", "==", id));

export const getVisitor = (
  id: string | undefined,
  callbackOnSnapshot: (value: Visitor) => void,
  callbackOnError: (error: string) => void,
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

      const friendsData =
        friends.length === 0 ? [] : await fetchFriendsInBatches(friends);

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
    (e) => callbackOnError(e.message),
  );
};

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
