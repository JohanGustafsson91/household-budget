import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { BudgetPeriod } from "shared/BudgetPeriod";
import shortid from "shortid";
import { auth, COLLECTION, db, getDocument } from "./firebase";
import { getAuth } from "./auth";

export const getBudgetPeriods = (
  callbackOnSnapshot: (value: BudgetPeriod[]) => void,
  callbackOnError: (error: string) => void
) =>
  onSnapshot(
    query(
      collection(db, COLLECTION["budgetPeriods"]),
      where("members", "array-contains", auth.currentUser?.uid ?? "")
    ),
    function onSnapshot(querySnapshot) {
      const periods = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();

          return {
            ...data,
            id: doc.id,
            fromDate: data.fromDate.toDate(),
            toDate: data.toDate.toDate(),
            createdAt: data.createdAt.toDate(),
            lastUpdated: data.lastUpdated.toDate(),
          };
        })
        .sort((a, b) => b.toDate - a.toDate);

      callbackOnSnapshot(periods as BudgetPeriod[]);
    },
    (e) => callbackOnError(e.message)
  );

export const getBudgetPeriodById = (id: string) =>
  getDocument(COLLECTION["budgetPeriods"], id).then(
    (data) =>
      ({
        ...data,
        id,
        fromDate: data.fromDate.toDate(),
        toDate: data.toDate.toDate(),
        createdAt: data.createdAt.toDate(),
        lastUpdated: data.lastUpdated.toDate(),
      } as BudgetPeriod)
  );

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

interface Form {
  fromDate: BudgetPeriod["fromDate"] | null;
  toDate: BudgetPeriod["toDate"] | null;
  members: BudgetPeriod["members"];
}
