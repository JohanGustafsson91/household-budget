import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();

export async function getDocument(coll: string, id: string) {
  const snap = await getDoc(doc(db, coll, id));
  if (snap.exists()) return snap.data();
  else return Promise.reject(Error(`No such document: ${coll}.${id}`));
}

export const COLLECTION: Readonly<Record<Collection, Collection>> = {
  budgetPeriods: "budgetPeriods",
  transactions: "transactions",
  users: "users",
};

type Collection = "budgetPeriods" | "transactions" | "users";
