import { createContext } from "react";
import { ProviderProps } from "./VisitorContext.Provider";

export const VisitorContext = createContext<ProviderProps | undefined>(
  undefined
);
