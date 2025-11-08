import {
  useReducer,
  useCallback,
  Reducer,
  useRef,
  useLayoutEffect,
} from "react";

export function useAsync<Data>(initialState?: State<Data>) {
  const [state, unsafeDispatch] = useReducer<
    Reducer<State<Data>, Action<Data>>
  >(asyncReducer, {
    status: "idle",
    data: undefined,
    error: undefined,
    ...initialState,
  });

  const dispatch = useSafeDispatch(unsafeDispatch);

  const run = useCallback(
    (promise: Promise<WARNING_ANY>) => {
      dispatch({ type: "pending" });

      return promise.then(
        (data: Data) => {
          dispatch({ type: "resolved", data });
        },
        (error: Error) => {
          dispatch({ type: "rejected", error: error.message });
        }
      );
    },
    [dispatch]
  );

  const setData = useCallback(
    (data: Data) => dispatch({ type: "resolved", data }),
    [dispatch]
  );

  const setIdle = useCallback(() => dispatch({ type: "idle" }), [dispatch]);

  const setError = useCallback(
    (error: string) => dispatch({ type: "rejected", error }),
    [dispatch]
  );

  return {
    setData,
    setError,
    setIdle,
    run,
    ...state,
  } as WithStateFunctions<Data, State<Data>>;
}

function asyncReducer<Data>(
  state: State<Data>,
  action: Action<Data>
): typeof state {
  switch (action.type) {
    case "idle": {
      return { status: "idle", data: undefined, error: undefined };
    }
    case "pending": {
      return { status: "pending", data: undefined, error: undefined };
    }
    case "resolved": {
      return { status: "resolved", data: action.data, error: undefined };
    }
    case "rejected": {
      return { status: "rejected", data: undefined, error: action.error };
    }
    default: {
      throw new Error("Unhandled action type");
    }
  }
}

function useSafeDispatch<Data>(dispatch: React.Dispatch<Action<Data>>) {
  const mounted = useRef(false);

  useLayoutEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return useCallback(
    (args: Action<Data>) => (mounted.current ? dispatch(args) : void 0),
    [dispatch]
  );
}

interface Status {
  idle: "idle";
  pending: "pending";
  rejected: "rejected";
  resolved: "resolved";
}

type IdleState = { status: Status["idle"]; data: undefined; error: undefined };

type PendingState = {
  status: Status["pending"];
  data: undefined;
  error: undefined;
};

type ResolvedState<Data> = {
  status: Status["resolved"];
  data: Data;
  error: undefined;
};

type RejectedState = {
  status: Status["rejected"];
  data: undefined;
  error: string;
};

type State<Data> =
  | IdleState
  | PendingState
  | ResolvedState<Data>
  | RejectedState;

type Action<Data> =
  | { type: Status["idle"] }
  | { type: Status["pending"] }
  | { type: Status["resolved"]; data: Data }
  | { type: Status["rejected"]; error: string };

type WithStateFunctions<Data, T> = {
  setData: (data: Data) => void;
  setError: (error: string) => void;
  setIdle: () => void;
  run: (promise: Promise<WARNING_ANY>) => Promise<void>;
} & T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WARNING_ANY = any;
