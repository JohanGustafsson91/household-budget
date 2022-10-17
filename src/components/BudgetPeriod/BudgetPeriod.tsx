import { getBudgetPeriodById } from "api/getBudgetPeriods";
import { getTransactionsForPeriod } from "api/getTransactionsForPeriod";
import { ActionBarTitle } from "components/ActionBar";
import { useUser } from "components/App/App.UserProvider";
import { Card, CardTitle } from "components/Card";
import { pagePadding } from "components/Page";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AsyncState, Period as PeriodType } from "shared";
import styled from "styled-components";
import { breakpoint, fontSize, space } from "theme";
import { displayDate } from "utils";
import { categories, categoriesForBoard } from "./BudgetPeriod.categories";
import { Category } from "./BudgetPeriod.Category";
import { Transaction } from "./BudgetPeriod.Transaction";
import { CreateOrUpdateTransaction } from "./BudgetPeriod.CreateOrUpdateTransaction";
import {
  CreateMultipleTransactions,
  Table,
} from "./BudgetPeriod.CreateMultipleTransactions";
import { Loading } from "components/Loading";
import { FloatingActionMenu } from "./BudgetPeriod.FloatingActionMenu";

export const BudgetPeriod = () => {
  const { id: periodId } = useParams();
  const {
    period,
    summarizedTotals,
    transactionsPerCategory,
    transactionsPerMember,
    overview,
    status,
  } = useBudgetPeriod(periodId ?? "");
  const { getFriendById } = useUser();
  const navigate = useNavigate();

  // TODO collect in a custom hook
  const [searchParams, setSearchParams] = useSearchParams();
  const budgetPeriodAction = getMode(searchParams.get("mode"));
  const updateTransactionId =
    budgetPeriodAction === "update"
      ? searchParams.get("updateTransactionId")
      : null;

  function setBudgetPeriodAction(action: BudgetPeriodAction) {
    setSearchParams(action);
  }

  function resetTransactionAction() {
    setSearchParams({});
  }

  if (!periodId) {
    navigate("/");
  }

  if (status === "pending") {
    return (
      <Content>
        <Loading>Hämtar budgetperiod...</Loading>
      </Content>
    );
  }

  if (status === "rejected") {
    return <Content>Kunde inte ladda budgetperiod...</Content>;
  }

  return (
    <Content>
      <ActionBarTitle
        title={`Period ${displayDate(period.fromDate)} - ${displayDate(
          period.toDate
        )}`}
      />

      <TopContent>
        <Item>
          <ItemMoney highlight>{displayMoney(summarizedTotals.left)}</ItemMoney>
          <ItemMoneyLabel>Kvar</ItemMoneyLabel>
        </Item>
        <Item>
          <ItemMoney>{displayMoney(summarizedTotals.income)}</ItemMoney>
          <ItemMoneyLabel>Inkomster</ItemMoneyLabel>
        </Item>
        <Item>
          <ItemMoney>{displayMoney(summarizedTotals.expenses)}</ItemMoney>
          <ItemMoneyLabel>Utgifter</ItemMoneyLabel>
        </Item>
      </TopContent>

      <MarginBottomFix />

      <Card height="calc(50vh)">
        <Board columns={transactionsPerCategory.length}>
          {transactionsPerCategory.map(
            ({ type, categoryName, transactions }) => (
              <Lane key={type}>
                <LaneHeader>
                  <CardTitle>{categoryName}</CardTitle>
                </LaneHeader>
                <LaneContent>
                  {transactions.map((transaction) => (
                    <TransactionCard
                      gender={
                        transaction.shared
                          ? "none"
                          : getFriendById(transaction.author)?.gender || "male"
                      }
                      key={transaction.id}
                      onClick={() =>
                        setBudgetPeriodAction({
                          mode: "update",
                          updateTransactionId: transaction.id,
                        })
                      }
                    >
                      <TransactionRow>
                        <TransactionCol>
                          {transaction.shared
                            ? "Gemensam"
                            : getFriendById(transaction.author)?.name}
                        </TransactionCol>
                        <TransactionCol highlight>
                          {transaction.label}
                        </TransactionCol>
                      </TransactionRow>
                      <TransactionRow>
                        <TransactionCol>
                          {displayDate(transaction.date)}
                        </TransactionCol>
                        <TransactionCol highlight big>
                          {displayMoney(transaction.amount)}kr
                        </TransactionCol>
                      </TransactionRow>
                    </TransactionCard>
                  ))}
                </LaneContent>
              </Lane>
            )
          )}
        </Board>
      </Card>

      <Card>
        <CardTitle>Tillsammans</CardTitle>
        <CardRow>
          <CardCol>Inkomst</CardCol>
          <CardCol>+{displayMoney(summarizedTotals.income)} kr</CardCol>
        </CardRow>
        {summarizedTotals.totalsPerCategory.map(
          ({ type, categoryName, amount }) => (
            <CardRow key={`shared-${type}`}>
              <CardCol>{categoryName}</CardCol>
              <CardCol>-{displayMoney(amount)} kr</CardCol>
            </CardRow>
          )
        )}
        <CardRow>
          <CardCol>Totalt</CardCol>
          <CardCol>{displayMoney(summarizedTotals.left)} kr</CardCol>
        </CardRow>
      </Card>

      {transactionsPerMember.map(
        ({ name, userId, income, left, totalsPerCategory }) => (
          <Card key={`sum-${userId}`}>
            <CardTitle>{name}</CardTitle>

            <CardRow>
              <CardCol>Inkomst</CardCol>
              <CardCol>+{displayMoney(income)} kr</CardCol>
            </CardRow>

            {totalsPerCategory.map(({ type, categoryName, amount }) => (
              <CardRow key={`${userId}-${type}`}>
                <CardCol>{categoryName}</CardCol>
                <CardCol>-{displayMoney(amount)} kr</CardCol>
              </CardRow>
            ))}
            <CardRow>
              <CardCol>Totalt</CardCol>
              <CardCol>{displayMoney(left)} kr</CardCol>
            </CardRow>
          </Card>
        )
      )}

      <FloatingActionMenu>
        {({ closeMenu }) => (
          <FloatingMenu>
            <div
              role="listitem"
              onClick={() => {
                setBudgetPeriodAction({ mode: "create" });
                closeMenu();
              }}
            >
              Lägg till
            </div>
            <div
              role="listitem"
              onClick={() => {
                setBudgetPeriodAction({ mode: "create-many" });
                closeMenu();
              }}
            >
              Lägg till många
            </div>
            <div
              role="listitem"
              onClick={() => {
                setBudgetPeriodAction({ mode: "show-overview" });
                closeMenu();
              }}
            >
              Visa översikt
            </div>
          </FloatingMenu>
        )}
      </FloatingActionMenu>

      {budgetPeriodAction === "create" ? (
        <Overlay>
          <Modal>
            <CloseButton onClick={resetTransactionAction}>x</CloseButton>
            <CreateOrUpdateTransaction
              period={period}
              transaction={undefined}
              onUpdated={resetTransactionAction}
            />
          </Modal>
        </Overlay>
      ) : null}

      {budgetPeriodAction === "update" &&
      period.transactions.find((t) => t.id === updateTransactionId) ? (
        <Overlay>
          <Modal>
            <CloseButton onClick={resetTransactionAction}>x</CloseButton>
            <CreateOrUpdateTransaction
              period={period}
              transaction={
                budgetPeriodAction === "update"
                  ? period.transactions.find(
                      (t) => t.id === updateTransactionId
                    )
                  : undefined
              }
              onUpdated={resetTransactionAction}
            />
          </Modal>
        </Overlay>
      ) : null}

      {budgetPeriodAction === "create-many" ? (
        <Overlay>
          <Modal>
            <CloseButton onClick={resetTransactionAction}>x</CloseButton>
            <CreateMultipleTransactions
              period={period}
              onUpdated={resetTransactionAction}
            />
          </Modal>
        </Overlay>
      ) : null}

      {budgetPeriodAction === "show-overview" ? (
        <Overlay>
          <Modal>
            <CloseButton onClick={resetTransactionAction}>x</CloseButton>
            <CardTitle>Översikt</CardTitle>
            <Table>
              <thead>
                <tr>
                  <th>Namn</th>
                  <th>Belopp</th>
                  <th>Datum</th>
                  <th>Kategori</th>
                </tr>
              </thead>
              <tbody>
                {overview.map(({ name, amount, category, date, id }) => (
                  <tr key={id}>
                    <td>{name}</td>
                    <td>{amount}</td>
                    <td>{displayDate(date)}</td>
                    <td>{category}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal>
        </Overlay>
      ) : null}
    </Content>
  );
};

const getMode = (param: string | null) => {
  const foundMode = [
    "create",
    "create-many",
    "update",
    "show-overview",
    "none",
  ].find((mode) => mode === param);

  return (foundMode ?? "none") as
    | "create"
    | "create-many"
    | "update"
    | "show-overview"
    | "none";
};

type BudgetPeriodAction =
  | {
      mode: "create";
    }
  | { mode: "create-many" }
  | { mode: "update"; updateTransactionId: string }
  | { mode: "show-overview" };

function useBudgetPeriod(periodId: string) {
  const { data: userData, getFriendById: getFriendNameById } = useUser();

  const [period, setPeriod] = useState<AsyncState<PeriodType>>({
    data: undefined,
    status: "pending",
  });

  const [transactions, setTransactions] = useState<AsyncState<Transaction[]>>({
    data: undefined,
    status: "pending",
  });

  useEffect(
    function getPeriodById() {
      if (periodId) {
        getBudgetPeriodById(periodId)
          .then((data) =>
            setPeriod({
              status: "resolved",
              data,
            })
          )
          .catch(() => setPeriod({ data: undefined, status: "rejected" }));
      }
    },
    [periodId]
  );

  useEffect(
    function subscribeToTransactions() {
      if (period.data?.members.length) {
        const unsubscribe = getTransactionsForPeriod(
          period.data,
          (data) => setTransactions({ data, status: "resolved" }),
          function onError(_e) {
            setTransactions({ data: undefined, status: "rejected" });
          }
        );

        return unsubscribe;
      }
    },
    [period.data]
  );

  if (period.status === "rejected" || transactions.status === "rejected") {
    return {
      status: "rejected" as const,
    };
  }

  if (
    period.status === "pending" ||
    transactions.status === "pending" ||
    !userData
  ) {
    return {
      status: "pending" as const,
    };
  }

  const categorizedTransactions = (transactions.data || []).reduce(
    (acc, curr) => {
      const previous = acc[curr.category] || [];
      return {
        ...acc,
        [curr.category]: [...previous, curr],
      };
    },
    {} as Record<Category["type"], Transaction[]>
  );

  const income = summarize(categorizedTransactions["INCOME"] || []);
  const { INCOME, ...rest } = categorizedTransactions;
  const expenses = summarize(Object.values(rest).flat());
  const left = income - expenses;

  return {
    status: "resolved" as const,
    period: {
      ...period.data,
      transactions: transactions.data,
    },
    summarizedTotals: {
      income,
      expenses,
      left,
      totalsPerCategory: categoriesForBoard.map(({ type, text }) => ({
        type,
        categoryName: text,
        amount: summarize(categorizedTransactions[type] || []),
      })),
    },
    transactionsPerCategory: categories.map(({ type, text }) => ({
      categoryName: text,
      type,
      transactions: categorizedTransactions[type] || [],
    })),
    transactionsPerMember: period.data.members.map((userId) => {
      const transactionsByUser = categoriesForBoard.reduce((acc, curr) => {
        const transaction = categorizedTransactions[curr.type] || [];

        const userTransactions = transaction
          .filter(({ author, shared }) => author === userId || shared === true)
          .map((transaction) => ({
            ...transaction,
            amount: transaction.shared
              ? transaction.amount / period.data.members.length
              : transaction.amount,
          }));

        const previous = acc[curr.type] || [];
        return { ...acc, [curr.type]: [...previous, ...userTransactions] };
      }, {} as Record<Category["type"], Transaction[]>);

      const income = summarize(
        (categorizedTransactions.INCOME || []).filter(
          ({ author }) => author === userId
        )
      );

      return {
        name: getFriendNameById(userId)?.name,
        userId,
        income,
        left: income - summarize(Object.values(transactionsByUser).flat()),
        totalsPerCategory: categoriesForBoard.map(({ type, text }) => ({
          type,
          categoryName: text,
          amount: summarize(transactionsByUser[type] || []),
        })),
      };
    }),
    overview: (transactions.data || [])
      ?.filter((i) => i.author === userData.id)
      .map((t) => {
        return {
          date: t.date,
          amount: t.category === "INCOME" ? t.amount : -t.amount,
          name: t.label,
          id: t.id,
          category: categories.find((c) => c.type === t.category)?.text,
        };
      }),
  };
}

function summarize(list: Array<{ amount: number }>) {
  return list.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0);
}

function displayMoney(value: number) {
  return Math.floor(value);
}

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  margin-bottom: ${space(2)};
`;

const TopContent = styled.div`
  background-color: var(--color-background-action-bar);
  display: flex;
  position: absolute;
  justify-content: space-between;
  padding: ${space(3)} ${space(4)} ${space(6)} ${space(4)};
  left: 0;
  right: 0;
  margin-top: -${pagePadding};
  z-index: -1;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
`;
const ItemMoney = styled.div<{ highlight?: boolean }>`
  color: var(--color-text-action-bar);
  font-weight: 500;
  align-items: center;
  font-size: ${(props) => (props.highlight ? fontSize(5) : fontSize(3))};
  justify-self: flex-start;
`;
const ItemMoneyLabel = styled.div`
  color: #4d82d7;
`;

const MarginBottomFix = styled.div`
  margin-bottom: 90px;
`;

const Board = styled.div<{ columns: number }>`
  flex: 1;
  display: grid;
  grid-template-columns: ${(props) => `repeat(${props.columns}, 200px)`};
  overflow-y: hidden;
  overflow-x: scroll;
  height: 100%;
`;

const LaneContent = styled.div`
  flex: 1;
  border-top: 2px solid var(--color-border);
  padding: ${space(2)};
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
`;

const Lane = styled.div<{ noBorders?: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  ${LaneContent} {
    border-bottom: 2px solid var(--color-border);
    border-left: 2px solid var(--color-border);
  }
  &:first-child {
    ${LaneContent} {
      border-left: none;
    }
  }
`;

const LaneHeader = styled.div`
  color: var(--color-text);
  text-align: center;
  text-transform: uppercase;
  font-size: ${fontSize(0)};
`;

const Overlay = styled.div`
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

// todo add click outside
const Modal = styled.div`
  background-color: #fff;
  padding: ${space(3)} ${space(3)};
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  bottom: 0;
  overflow: auto;

  ${breakpoint(0)} {
    position: relative;
    top: unset;
    min-width: 500px;
    max-width: 500px;
    min-height: 80vh;
    max-height: 80vh;
  }
`;

const CloseButton = styled.button`
  outline: 0;
  border: 0;
  position: absolute;
  right: ${space(2)};
  top: ${space(2)};
  background-color: inherit;
  border-radius: 50%;
  height: 25px;
  width: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TransactionCard = styled.div<{ gender: "none" | "male" | "female" }>`
  border: 1px solid var(--color-border);
  padding: ${space(1)};
  margin-bottom: ${space(2)};
  font-size: ${fontSize(0)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  background-color: ${(props) => genderColorMap[props.gender]};
`;

const genderColorMap = {
  male: "rgba(144, 238, 144, 0.2)",
  female: "rgba(255, 182, 193, 0.2)",
  none: "#fff",
};

const TransactionRow = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;

  &:first-child {
    margin-bottom: ${space(4)};
  }
`;

const TransactionCol = styled.div<{ highlight?: boolean; big?: boolean }>`
  color: ${(props) =>
    props.highlight ? "var(--color-text-strong)" : "inherit"};
  font-weight: ${(props) => (props.big ? "bold" : "normal")};
  font-size: ${(props) => (props.big ? fontSize(1) : "inherit")};
`;

const CardCol = styled.div`
  color: var(--color-text-strong);
`;

const CardRow = styled.div`
  margin-bottom: ${space(1)};
  border-bottom: 1px solid var(--color-border);
  display: flex;
  padding: ${space(2)} 0;

  ${CardCol} {
    &:first-child {
      flex: 1;
    }
  }

  &:last-child {
    margin-top: ${space(2)};
    border: 0;
    font-weight: bold;
    margin-bottom: 0;
  }
`;

const FloatingMenu = styled.div`
  background-color: #fff;
  border: 1px solid #eee;
  margin-bottom: ${space(1)};

  div {
    cursor: pointer;
    padding: ${space(2)} ${space(4)} ${space(2)} ${space(2)};
    border-bottom: 1px solid #eee;
    &:last-child {
      border: 0;
    }
    &:hover {
      color: #000;
    }
  }
`;
