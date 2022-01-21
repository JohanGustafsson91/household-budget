import { useUser } from "components/App/App.UserProvider";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AsyncState, Period } from "shared";
import styled from "styled-components";
import { space } from "theme";
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
        const periods = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            ...data,
            id: doc.id,
            fromDate: data.fromDate.toDate(),
            toDate: data.toDate.toDate(),
            createdAt: data.createdAt.toDate(),
            lastUpdated: data.lastUpdated.toDate(),
          } as Period;
        });

        setState(() => ({ data: periods, status: "resolved" }));
      },
      function onError(e) {
        // TODO handle error
        setState((prev) => ({ status: "rejected", data: undefined }));
      }
    );

    return unsubscribe;
  }, []);

  function handleSignOut() {
    signOut(auth);
  }

  function navigateToDetailPage(id: string) {
    return () => navigate(`/period/${id}`);
  }

  function navigateToCreatePage() {
    navigate(`/period/add`);
  }

  return (
    <>
      <h3>Hushållsbudget</h3>

      {state.status === "pending" && <p>Hämtar budgetperioder...</p>}

      {state.status === "resolved" && state.data.length === 0 && (
        <p>Inga skapade budgetperioder.</p>
      )}

      {state.status === "resolved" &&
        user.status === "resolved" &&
        state.data.map((period) => {
          const memberWith = period.members
            .filter((userId) => userId !== auth.currentUser?.uid)
            .map(user.friendById)
            .join(", ");

          return (
            <PeriodItem
              key={period.id}
              onClick={navigateToDetailPage(period.id)}
            >
              Från {displayDate(period.fromDate)} - {displayDate(period.toDate)}
              <div>
                {memberWith.length ? `Tillsammans med ${memberWith}` : ""}
              </div>
            </PeriodItem>
          );
        })}

      <button onClick={navigateToCreatePage}>Skapa</button>
    </>
  );
};

const PeriodItem = styled.div`
  padding: ${space(2)};
  margin-bottom: ${space(2)};
  border: 1px solid grey;
`;
