import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "utils";

export const getAuth = () => auth;

export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(getAuth(), email, password);

export const useAuth = () => useAuthState(getAuth());

export const logout = () => signOut(getAuth());
