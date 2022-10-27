import { deleteBudgetPeriod, getBudgetPeriods } from "api/budgetPeriod";
import { ActionBarTitle } from "components/ActionBar";
import { useVisitor } from "components/App/App.VisitorProvider";
import { ActionButton } from "components/Button";
import { Card } from "components/Card";
import { Button } from "components/Form";
import { Loading } from "components/Loading";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BudgetPeriod } from "shared";
import { useAsync } from "shared/useAsync";
import styled from "styled-components";
import { displayDate } from "utils";

export const Overview = () => {
  const navigate = useNavigate();
  const visitor = useVisitor();
  const {
    status,
    data: budgetPeriods,
    setData: setBudgetPeriods,
    setError: setBudgetPeriodsError,
  } = useAsync<BudgetPeriod[]>();

  useEffect(
    function subscribeToBudgetPeriods() {
      return getBudgetPeriods(setBudgetPeriods, setBudgetPeriodsError);
    },
    [setBudgetPeriods, setBudgetPeriodsError]
  );

  function navigateTo(url: string) {
    return () => navigate(url);
  }

  return (
    <>
      <ActionBarTitle title={`Välkommen ${visitor.name}`} />

      {
        {
          idle: null,
          pending: (
            <Loading fullPage={false}>
              <p>Hämtar budgetperioder...</p>
            </Loading>
          ),
          rejected: <p>Kunde inte hämta budgetperioder...</p>,
          resolved: budgetPeriods?.length ? (
            budgetPeriods.map((period) => {
              const memberWith = period.members
                .filter((userId) => userId !== getAuth().currentUser?.uid)
                .map((u) => visitor.getFriendById(u)?.name ?? "")
                .join(", ");

              return (
                <Card
                  key={period.id}
                  onClick={navigateTo(`/period/${period.id}`)}
                  role="listitem"
                >
                  <Content>
                    <div>
                      Från {displayDate(period.fromDate)} -{" "}
                      {displayDate(period.toDate)}
                      <div>
                        {memberWith.length
                          ? `Tillsammans med ${memberWith}`
                          : ""}
                      </div>
                    </div>
                    <Button
                      onClick={function handleDeleteBugdetPeriod(e) {
                        e.stopPropagation();
                        return deleteBudgetPeriod(period.id);
                      }}
                    >
                      Ta bort
                    </Button>
                  </Content>
                </Card>
              );
            })
          ) : (
            <p>Inga skapade budgetperioder.</p>
          ),
        }[status]
      }

      <ActionButton onClick={navigateTo("/period/add")}>+</ActionButton>
    </>
  );
};

const Content = styled.div`
  display: flex;
  align-items: center;

  div {
    flex: 1;
  }

  ${Button} {
    float: right;
  }
`;
