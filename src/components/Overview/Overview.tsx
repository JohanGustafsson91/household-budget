import { deleteBudgetPeriod } from "api/deleteBudgetPeriod";
import { getBudgetPeriods } from "api/getBudgetPeriods";
import { ActionBarTitle } from "components/ActionBar";
import { useUser } from "components/App/App.UserProvider";
import { ActionButton } from "components/Button";
import { Card } from "components/Card";
import { Button } from "components/Form";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AsyncState, Period } from "shared";
import { displayDate } from "utils";

export const Overview = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [budgetPeriods, setBudgetPeriods] = useState<AsyncState<Period[]>>({
    data: undefined,
    status: "pending",
  });

  useEffect(function subscribeToBudgetPeriods() {
    const unsubscribe = getBudgetPeriods(
      function onSnapshot(data) {
        setBudgetPeriods({ data, status: "resolved" });
      },
      function onError() {
        setBudgetPeriods(() => ({ status: "rejected", data: undefined }));
      }
    );

    return unsubscribe;
  }, []);

  function handleDeleteBugdetPeriod(periodId: string) {
    return deleteBudgetPeriod(periodId);
  }

  function navigateTo(url: string) {
    return () => navigate(url);
  }

  return (
    <>
      <ActionBarTitle title={`Välkommen ${user.data?.name ?? ""}`} />

      {budgetPeriods.status === "pending" ? (
        <p>Hämtar budgetperioder...</p>
      ) : null}

      {budgetPeriods.status === "resolved" &&
      budgetPeriods.data.length === 0 ? (
        <p>Inga skapade budgetperioder.</p>
      ) : null}

      {budgetPeriods.status === "resolved" && user.status === "resolved"
        ? budgetPeriods.data.map((period) => {
            const memberWith = period.members
              .filter((userId) => userId !== getAuth().currentUser?.uid)
              .map((u) => user.getFriendById(u)?.name ?? "")
              .join(", ");

            return (
              <Card
                key={period.id}
                onClick={navigateTo(`/period/${period.id}`)}
                role="listitem"
              >
                <div>
                  Från {displayDate(period.fromDate)} -{" "}
                  {displayDate(period.toDate)}
                  <div>
                    {memberWith.length ? `Tillsammans med ${memberWith}` : ""}
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    return handleDeleteBugdetPeriod(period.id);
                  }}
                >
                  Ta bort
                </Button>
              </Card>
            );
          })
        : null}

      <ActionButton onClick={navigateTo("/period/add")}>+</ActionButton>
    </>
  );
};
