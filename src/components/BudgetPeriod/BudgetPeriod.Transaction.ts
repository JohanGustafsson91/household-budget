import { Category } from "shared/BudgetPeriod";

export interface Transaction {
  label: string;
  id: string;
  amount: number;
  author: string;
  category: Category["type"];
  date: Date;
  key: string;
  shared: boolean;
  optional: boolean;
}

export interface NewTransaction {
  label: string;
  category: Transaction["category"];
  date: Date;
  amount: number;
  author: string | undefined;
  createdAt: Date;
  lastUpdated: Date;
  periodId: string;
  id: string;
  shared: boolean;
  optional: boolean;
}
