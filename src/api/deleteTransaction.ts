import { deleteDoc, doc } from "firebase/firestore";
import { db, COLLECTION } from "utils";

export const deleteTransaction = (id: string) =>
  deleteDoc(doc(db, COLLECTION["transactions"], id));
