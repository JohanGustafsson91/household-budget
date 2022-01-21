export const categories: Category[] = [
  {
    type: "LIVING",
    text: "Boende",
  },
  {
    type: "FOOD",
    text: "Mat",
  },
  {
    type: "TRANSPORT",
    text: "Transport",
  },
  {
    type: "CLOTHES",
    text: "Kläder",
  },
  {
    type: "SAVINGS",
    text: "Sparande",
  },
  {
    type: "OTHER",
    text: "Övrigt",
  },
  {
    type: "LOAN",
    text: "Lån",
  },
  {
    type: "INCOME",
    text: "Inkomst",
  },
];

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
