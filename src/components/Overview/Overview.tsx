import { ActionBarTitle } from "components/ActionBar";
import { useUser } from "components/App/App.UserProvider";
import { ActionButton } from "components/Button";
import { Card } from "components/Card";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AsyncState, Period } from "shared";
import { auth, COLLECTION, db, displayDate } from "utils";

export const Overview = () => {
  const navigate = useNavigate();

  const user = useUser();

  const [state, setState] = useState<AsyncState<Period[]>>({
    data: undefined,
    status: "pending",
  });

  useEffect(function subscribeToBudgetPeriods() {
    const unsubscribe = onSnapshot(
      query(
        collection(db, COLLECTION["budgetPeriods"]),
        where("members", "array-contains", auth.currentUser?.uid ?? "")
      ),
      function onSnapshot(querySnapshot) {
        const periods = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();

            return {
              ...data,
              id: doc.id,
              fromDate: data.fromDate.toDate(),
              toDate: data.toDate.toDate(),
              createdAt: data.createdAt.toDate(),
              lastUpdated: data.lastUpdated.toDate(),
            };
          })
          .sort((a, b) => b.toDate - a.toDate);

        setState(() => ({ data: periods as Period[], status: "resolved" }));
      },
      function onError(e) {
        // TODO handle error
        setState((prev) => ({ status: "rejected", data: undefined }));
      }
    );

    return unsubscribe;
  }, []);

  function navigateTo(url: string) {
    return function onNavigate() {
      navigate(url);
    };
  }

  return (
    <>
      <ActionBarTitle title={`Välkommen ${user.data?.name ?? ""}`} />

      {state.status === "pending" && <p>Hämtar budgetperioder...</p>}

      {state.status === "resolved" && state.data.length === 0 && (
        <p>Inga skapade budgetperioder.</p>
      )}

      {state.status === "resolved" &&
        user.status === "resolved" &&
        state.data.map((period) => {
          const memberWith = period.members
            .filter((userId) => userId !== auth.currentUser?.uid)
            .map(user.getFriendNameById)
            .join(", ");

          return (
            <Card key={period.id} onClick={navigateTo(`/period/${period.id}`)}>
              Från {displayDate(period.fromDate)} - {displayDate(period.toDate)}
              <div>
                {memberWith.length ? `Tillsammans med ${memberWith}` : ""}
              </div>
            </Card>
          );
        })}

      <ActionButton onClick={navigateTo("/period/add")}>+</ActionButton>
    </>
  );
};
