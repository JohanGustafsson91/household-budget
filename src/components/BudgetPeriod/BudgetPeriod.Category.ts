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
