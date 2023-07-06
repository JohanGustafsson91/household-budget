import { useContext } from "react";
import { VisitorContext } from "./VisitorContext";
import { ProviderProps } from "./VisitorContext.Provider";

export function useVisitor(): ProviderProps {
  const ctx = useContext(VisitorContext);

  if (!ctx) {
    throw new Error(
      "[useVisitor]: You must wrap your component with <VisitorProvider />."
    );
  }

  return ctx;
}
