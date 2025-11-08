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
  DocumentData,
} from "firebase/firestore";
import { BudgetPeriod } from "shared/BudgetPeriod";
import { COLLECTION, db } from "./firebase";

// Transform Firestore document to Transaction
const toTransaction = (doc: { id: string; data: () => DocumentData }): Transaction => {
  const data = doc.data();
  
  return {
    ...data,
    id: doc.id,
    date: data.date.toDate(),
    optional: Boolean(data.optional),
  } as Transaction;
};

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
        .map(toTransaction)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      callbackOnSnapshot(transactions);
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
