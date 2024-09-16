import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { BudgetPeriod } from "shared/BudgetPeriod";
import shortid from "shortid";
import { auth, COLLECTION, db, getDocument } from "./firebase";
import { getAuth } from "./auth";

export const getBudgetPeriods = (
  callbackOnSnapshot: (value: BudgetPeriod[]) => void,
  callbackOnError: (error: string) => void,
  fromDate?: Date
) => {
  const filter = fromDate
    ? [where("fromDate", ">=", fromDate ? new Date(fromDate.getTime()) : -1)]
    : [];

  onSnapshot(
    query(
      collection(db, COLLECTION["budgetPeriods"]),
      where("members", "array-contains", auth.currentUser?.uid ?? ""),
      ...filter
    ),
    function onSnapshot(querySnapshot) {
      const periods = querySnapshot.docs
        .map((doc) => toBudgetPeriod({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.toDate.getTime() - a.toDate.getTime());

      callbackOnSnapshot(periods);
    },
    (e) => callbackOnError(e.message)
  );
};

export const getBudgetPeriodById = (id: string) =>
  getDocument(COLLECTION["budgetPeriods"], id).then((data) =>
    toBudgetPeriod({ id, ...data })
  );

const toBudgetPeriod = (data: DocumentData): BudgetPeriod => ({
  id: data.id,
  fromDate: data.fromDate.toDate(),
  toDate: data.toDate.toDate(),
  createdAt: data.createdAt.toDate(),
  lastUpdated: data.lastUpdated.toDate(),
  author: data.author,
  members: data.members,
  totalIncome: data.totalIncome ?? 0,
  totalExpenses: data.totalExpenses ?? 0,
  categoryExpenseTotals: data.categoryExpenseTotals ?? {
    INCOME: 0,
    CLOTHES: 0,
    FOOD: 0,
    LIVING: 0,
    LOAN: 0,
    OTHER: 0,
    SAVINGS: 0,
    TRANSPORT: 0,
  },
});

export const postBudgetPeriod = (data: Form) =>
  addDoc(collection(db, COLLECTION["budgetPeriods"]), {
    ...data,
    members: [...data.members, getAuth().currentUser?.uid],
    author: getAuth()?.currentUser?.uid,
    createdAt: new Date(),
    lastUpdated: new Date(),
    key: shortid(),
  });

export const deleteBudgetPeriod = (periodId: string) =>
  Promise.all([
    deleteDoc(doc(db, COLLECTION["budgetPeriods"], periodId)),
    getDocs(
      query(
        collection(db, COLLECTION["transactions"]),
        where("periodId", "==", periodId)
      )
    ).then((document) => {
      const batch = writeBatch(db);
      document.forEach((d) => batch.delete(d.ref));
      return batch.commit();
    }),
  ]);

export const putBudgetPeriod = ({
  id,
  data,
}: {
  id: string;
  data: Partial<BudgetPeriod>;
}) =>
  setDoc(
    doc(db, COLLECTION["budgetPeriods"], id),
    { ...data },
    { merge: true }
  );

interface Form {
  fromDate: BudgetPeriod["fromDate"] | null;
  toDate: BudgetPeriod["toDate"] | null;
  members: BudgetPeriod["members"];
}
