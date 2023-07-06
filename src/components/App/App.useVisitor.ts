import { useContext } from "react";
import { ProviderProps, VisitorContext } from "./App.VisitorProvider";

export function useVisitor(): ProviderProps {
  const ctx = useContext(VisitorContext);

  if (!ctx) {
    throw new Error(
      "[useVisitor]: You must wrap your component with <VisitorProvider />."
    );
  }

  return ctx;
}
