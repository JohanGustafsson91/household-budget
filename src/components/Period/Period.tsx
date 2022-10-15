import { getBudgetPeriodById } from "api/getBudgetPeriods";
import { getTransactionsForPeriod } from "api/getTransactionsForPeriod";
import { ActionBarTitle } from "components/ActionBar";
import { useUser } from "components/App/App.UserProvider";
import { ActionButton } from "components/Button";
import { Card, CardTitle } from "components/Card";
import { pagePadding } from "components/Page";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AsyncState, Period as PeriodType } from "shared";
import styled from "styled-components";
import { fontSize, space } from "theme";
import { displayDate } from "utils";
import { categories, categoriesForBoard } from "./Period.categories";
import { Category } from "./Period.Category";
import { Transaction } from "./Period.Transaction";
import { TransactionForm } from "./Period.TransactionForm";
import { MultipleTransactionsForm } from "./Period.MultipleTransactionsForm";
import { useLongPress } from "./Period.useLongPress";
import { Loading } from "components/Loading";

export const Period = () => {
  const { id: periodId } = useParams();
  const {
    period,
    summarizedTotals,
    transactionsPerCategory,
    transactionsPerMember,
  } = useBudgetPeriodWithTransactions(periodId ?? "");
  const { getFriendById } = useUser();
  const navigate = useNavigate();

  const [transactionAction, setTransactionAction] = useState<
    | {
        mode: "none";
      }
    | {
        mode: "create";
      }
    | {
        mode: "create-many";
      }
    | {
        mode: "update";
        transaction: Transaction;
      }
  >({
    mode: "none",
  });

  const resetTransactionAction = () => setTransactionAction({ mode: "none" });

  const longPressEvent = useLongPress(
    () => setTransactionAction({ mode: "create-many" }),
    () => setTransactionAction({ mode: "create" }),
    {
      shouldPreventDefault: true,
      delay: 500,
    }
  );

  if (!periodId) {
    navigate("/");
  }

  if (period.status === "pending") {
    return (
      <Content>
        <Loading>Hämtar budgetperiod...</Loading>
      </Content>
    );
  }

  if (period.status === "rejected") {
    return <Content>Kunde inte ladda budgetperioder...</Content>;
  }

  return (
    <Content>
      <ActionBarTitle
        title={`Period ${displayDate(period.data.fromDate)} - ${displayDate(
          period.data.toDate
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
                        setTransactionAction({ mode: "update", transaction })
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
        ({ name, userId, income, left, totalsPerCategory }) => {
          return (
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
          );
        }
      )}

      <ActionButton {...longPressEvent}>+</ActionButton>

      {transactionAction.mode === "create" ||
      transactionAction.mode === "update" ? (
        <Overlay>
          <Modal>
            <CloseButton onClick={resetTransactionAction}>x</CloseButton>
            <TransactionForm
              period={period.data}
              transaction={
                transactionAction.mode === "update"
                  ? transactionAction.transaction
                  : undefined
              }
              onUpdated={resetTransactionAction}
            />
          </Modal>
        </Overlay>
      ) : null}

      {transactionAction.mode === "create-many" ? (
        <Overlay>
          <Modal>
            <CloseButton onClick={resetTransactionAction}>x</CloseButton>
            <MultipleTransactionsForm
              period={period.data}
              onUpdated={resetTransactionAction}
            />
          </Modal>
        </Overlay>
      ) : null}
    </Content>
  );
};

function useBudgetPeriodWithTransactions(periodId: string) {
  const { getFriendById: getFriendNameById } = useUser();

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

  const categorizedTransactions = (transactions?.data || []).reduce(
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
    period,
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
    transactionsPerMember: (period.data?.members || []).map((userId) => {
      const transactionsByUser = categoriesForBoard.reduce((acc, curr) => {
        const transaction = categorizedTransactions[curr.type] || [];

        const userTransactions = transaction
          .filter(({ author, shared }) => author === userId || shared === true)
          .map((transaction) => ({
            ...transaction,
            amount: transaction.shared
              ? transaction.amount / (period.data?.members || []).length
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

const Modal = styled.div`
  background-color: #fff;
  padding: ${space(3)} ${space(3)};
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  bottom: 0;
  overflow: auto;
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
