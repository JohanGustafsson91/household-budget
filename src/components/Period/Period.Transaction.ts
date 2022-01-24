import { Category } from "./Period.categories";

export interface Transaction {
  label: string;
  id: string;
  amount: number;
  author: string;
  category: Category["type"];
  date: Date;
  key: string;
}
