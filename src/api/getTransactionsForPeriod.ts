import { Transaction } from "components/BudgetPeriod/BudgetPeriod.Transaction";
import {
  collection,
  FirestoreError,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { Period } from "shared";
import { COLLECTION, db } from "utils";

export const getTransactionsForPeriod = (
  period: Period,
  callbackOnSnapshot: (value: Transaction[]) => void,
  callbackOnError: (error: FirestoreError) => void
) => {
  return onSnapshot(
    query(
      collection(db, COLLECTION["transactions"]),
      where("periodId", "==", period.id),
      where("author", "in", period.members)
    ),
    function onSnapshot(querySnapshot) {
      const transactions = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const docId = doc.id;

          return {
            ...data,
            id: docId,
            date: data.date.toDate(),
          };
        })
        .sort((a, b) => a.date - b.date);

      callbackOnSnapshot(transactions as Transaction[]);
    },
    callbackOnError
  );
};
