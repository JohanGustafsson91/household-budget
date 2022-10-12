import {
  collection,
  FirestoreError,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { Friend, Gender, User } from "shared";
import { COLLECTION, db } from "utils";
import { getAuth } from "./auth";

export const getUser = (
  callbackOnSnapshot: (value: User) => void,
  callbackOnError: (error: FirestoreError) => void
) => {
  const userId = getAuth().currentUser?.uid;

  if (!userId) {
    return;
  }

  return onSnapshot(
    userQuery(userId),
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

      callbackOnSnapshot({
        id: id as string,
        name: name as string,
        gender: gender as Gender,
        friends: friendsData,
      });
    },
    callbackOnError
  );
};

const userQuery = (id: string) =>
  query(collection(db, COLLECTION["users"]), where("id", "==", id));
