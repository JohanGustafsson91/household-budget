import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, COLLECTION } from "utils";

export const deleteBudgetPeriod = (periodId: string) => {
  return Promise.all([
    deleteDoc(doc(db, COLLECTION["budgetPeriods"], periodId)),
    getDocs(
      query(
        collection(db, COLLECTION["transactions"]),
        where("periodId", "==", periodId)
      )
    ).then(function (document) {
      const batch = writeBatch(db);
      document.forEach((d) => batch.delete(d.ref));
      return batch.commit();
    }),
  ]);
};
