import {
  NewTransaction,
  Transaction,
} from "components/BudgetPeriod/BudgetPeriod.Transaction";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { BudgetPeriod } from "shared/BudgetPeriod";
import { COLLECTION, db } from "utils";

export const getTransactionsForPeriod = (
  period: BudgetPeriod,
  callbackOnSnapshot: (value: Transaction[]) => void,
  callbackOnError: (error: string) => void
) =>
  onSnapshot(
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
        .sort((a, b) => b.date - a.date);

      callbackOnSnapshot(transactions as Transaction[]);
    },
    (e) => callbackOnError(e.message)
  );

export const postTransaction = (transaction: NewTransaction) =>
  addDoc(collection(db, COLLECTION["transactions"]), {
    ...transaction,
  });

export const deleteTransaction = (id: string) =>
  deleteDoc(doc(db, COLLECTION["transactions"], id));

export const putTransaction = (id: string, data: Partial<NewTransaction>) =>
  setDoc(doc(db, COLLECTION["transactions"], id), { ...data }, { merge: true });
