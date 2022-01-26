export const categories: Category[] = [
  {
    type: "INCOME",
    text: "Inkomst",
  },
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
];

export const categoriesForBoard = categories.filter(
  ({ type }) => type !== "INCOME"
);

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
