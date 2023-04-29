export interface Category {
  type:
    | "LIVING"
    | "FOOD"
    | "TRANSPORT"
    | "CLOTHES"
    | "SAVINGS"
    | "OTHER"
    | "LOAN"
    | "INCOME";
  text: string;
}

export interface Transaction {
  label: string;
  id: string;
  amount: number;
  author: string;
  category: Category["type"];
  date: Date;
  key: string;
  shared: boolean;
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
}
