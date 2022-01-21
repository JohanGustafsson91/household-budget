export type AsyncState<Data> =
  | {
      status: "pending";
      data: undefined;
    }
  | {
      status: "resolved";
      data: Data;
    }
  | {
      status: "rejected";
      data: undefined;
    };
