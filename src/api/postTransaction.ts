import { NewTransaction } from "components/Period/Period.Transaction";
import { addDoc, collection } from "firebase/firestore";
import { COLLECTION, db } from "utils";

export const postTransaction = (transaction: NewTransaction) =>
  addDoc(collection(db, COLLECTION["transactions"]), {
    ...transaction,
  });
