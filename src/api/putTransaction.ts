import { NewTransaction } from "components/Period/Period.Transaction";
import { setDoc, doc } from "firebase/firestore";
import { db, COLLECTION } from "utils";

export const putTransaction = (id: string, data: Partial<NewTransaction>) =>
  setDoc(doc(db, COLLECTION["transactions"], id), { ...data }, { merge: true });
