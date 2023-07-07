import { deleteBudgetPeriod, getBudgetPeriods } from "api/budget-period";
import { Button } from "components/FormElements";
import { Loading } from "./OverviewBudgetPeriods.Loading";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BudgetPeriod } from "shared/BudgetPeriod";
import { useAsync } from "shared/useAsync";
import styled from "styled-components";
import { displayDate } from "utils/date";
import { ActionBar } from "components/ActionBar/ActionBar";
import { fontSize, space } from "shared/theme";
import { useVisitor } from "components/VisitorContext/VisitorContext.useVisitor";

export default function OverviewBudgetPeriods() {
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
      <ActionBar title={`Välkommen ${visitor.name}`} />

      <Container>
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
                        <Text>
                          Från {displayDate(period.fromDate)} -{" "}
                          {displayDate(period.toDate)}
                        </Text>
                        <div>
                          {memberWith.length
                            ? `Tillsammans med ${memberWith}`
                            : ""}
                        </div>
                      </div>
                      <Button
                        onClick={function handleDeleteBugdetPeriod(e) {
                          e.stopPropagation();

                          return window.confirm(
                            "Är du säker på att du vill ta bort budgetperioden?"
                          )
                            ? deleteBudgetPeriod(period.id)
                            : undefined;
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
      </Container>
      <ActionButton onClick={navigateTo("/period/add")}>+</ActionButton>
    </>
  );
}

const Container = styled.div`
  overflow-y: auto;
`;

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

const Text = styled.span`
  font-weight: bold;
`;

const Card = styled.div<{ height?: string }>`
  ${space({ p: 3, mb: 3 })};
  min-height: ${(props) => props.height ?? "auto"};
  height: ${(props) => props.height ?? "auto"};
  background-color: var(--color-background-card);
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  cursor: ${(props) => (props.onClick ? "pointer" : "default")};
`;

const ActionButton = styled.button`
  position: fixed;
  ${space({ b: 3, r: 3 })};
  border-radius: 50%;
  height: ${fontSize(6)};
  width: ${fontSize(6)};
  outline: 0;
  border: 0;
  background-color: var(--color-background-action-bar);
  color: var(--color-text-action-bar);
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
  font-size: ${fontSize(4)};
  font-weight: bold;
`;
