import { NewTransaction } from "components/BudgetPeriod/BudgetPeriod.Transaction";
import { addDoc, collection } from "firebase/firestore";
import { COLLECTION, db } from "utils";

export const postTransaction = (transaction: NewTransaction) =>
  addDoc(collection(db, COLLECTION["transactions"]), {
    ...transaction,
  });
