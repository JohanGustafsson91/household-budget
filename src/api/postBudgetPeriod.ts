import { addDoc, collection } from "firebase/firestore";
import { Period } from "shared";
import shortid from "shortid";
import { db, COLLECTION } from "utils";
import { getAuth } from "./auth";

export const postBudgetPeriod = (data: Form) =>
  addDoc(collection(db, COLLECTION["budgetPeriods"]), {
    ...data,
    members: [...data.members, getAuth().currentUser?.uid],
    author: getAuth()?.currentUser?.uid,
    createdAt: new Date(),
    lastUpdated: new Date(),
    key: shortid(),
  });

interface Form {
  fromDate: Period["fromDate"] | null;
  toDate: Period["toDate"] | null;
  members: Period["members"];
}
