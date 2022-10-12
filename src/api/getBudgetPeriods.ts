import {
  collection,
  FirestoreError,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { Period } from "shared";
import { auth, COLLECTION, db, getDocument } from "utils";

export const getBudgetPeriods = (
  callbackOnSnapshot: (value: Period[]) => void,
  callbackOnError: (error: FirestoreError) => void
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

      callbackOnSnapshot(periods as Period[]);
    },
    callbackOnError
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
      } as Period)
  );
