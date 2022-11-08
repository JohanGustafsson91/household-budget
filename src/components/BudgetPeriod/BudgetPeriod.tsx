import { getBudgetPeriodById } from "api/budgetPeriod";
import { getTransactionsForPeriod } from "api/transaction";
import { ActionBarTitle } from "components/ActionBar";
import { Card, CardCol, CardRow, CardTitle } from "components/Card";
import { pagePadding } from "components/Page";
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BudgetPeriod as PeriodType } from "shared";
import styled from "styled-components";
import { space } from "theme";
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
import {
  FloatingActionMenu,
  FloatingMenuItem,
} from "./BudgetPeriod.FloatingActionMenu";
import { useVisitor } from "components/App/App.VisitorProvider";

import * as TransactionCard from "./BudgetPeriod.TransactionCard";
import { Modal } from "./BudgetPeriod.Modal";
import * as Board from "./BudgetPeriod.Board";
import * as OverviewItem from "./BudgetPeriod.OverviewItem";
import { useAsync } from "shared/useAsync";

import AddIcon from "./BudgetPeriod.Add.icon.svg";
import AddManyIcon from "./BudgetPeriod.AddMany.icon.svg";
import OverviewIcon from "./BudgetPeriod.Overview.icon.svg";

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
  const { getFriendById } = useVisitor();
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
        <OverviewItem.Wrapper>
          <OverviewItem.Value highlight>
            {displayMoney(summarizedTotals.left)}
          </OverviewItem.Value>
          <OverviewItem.Label>Kvar</OverviewItem.Label>
        </OverviewItem.Wrapper>
        <OverviewItem.Wrapper>
          <OverviewItem.Value>
            {displayMoney(summarizedTotals.income)}
          </OverviewItem.Value>
          <OverviewItem.Label>Inkomster</OverviewItem.Label>
        </OverviewItem.Wrapper>
        <OverviewItem.Wrapper>
          <OverviewItem.Value>
            {displayMoney(summarizedTotals.expenses)}
          </OverviewItem.Value>
          <OverviewItem.Label>Utgifter</OverviewItem.Label>
        </OverviewItem.Wrapper>
      </TopContent>

      <MarginBottomFix />

      <Card height="calc(100vh - 250px)">
        <Board.Wrapper columns={transactionsPerCategory.length}>
          {transactionsPerCategory.map(
            ({ type, categoryName, transactions }) => (
              <Board.Lane key={type}>
                <Board.LaneHeader>
                  <CardTitle>{categoryName}</CardTitle>
                </Board.LaneHeader>
                <Board.LaneContent>
                  {transactions.map((transaction) => (
                    <TransactionCard.Wrapper
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
                      <TransactionCard.Row>
                        <TransactionCard.Column>
                          {transaction.shared
                            ? "Gemensam"
                            : getFriendById(transaction.author)?.name}
                        </TransactionCard.Column>
                        <TransactionCard.Column highlight>
                          {transaction.label.replace(/swish/i, "")}
                        </TransactionCard.Column>
                      </TransactionCard.Row>
                      <TransactionCard.Row>
                        <TransactionCard.Column>
                          {displayDate(transaction.date)}
                        </TransactionCard.Column>
                        <TransactionCard.Column highlight big>
                          {displayMoney(transaction.amount)}kr
                        </TransactionCard.Column>
                      </TransactionCard.Row>
                      {transaction.label.toLowerCase().includes("swish") ? (
                        <TransactionCard.SwishIcon />
                      ) : null}
                    </TransactionCard.Wrapper>
                  ))}
                </Board.LaneContent>
              </Board.Lane>
            )
          )}
        </Board.Wrapper>
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
          <>
            <FloatingMenuItem
              onClick={() => {
                setBudgetPeriodAction({ mode: "create" });
                closeMenu();
              }}
              text="Lägg till"
              icon={AddIcon}
            />
            <FloatingMenuItem
              onClick={() => {
                setBudgetPeriodAction({ mode: "create-many" });
                closeMenu();
              }}
              text="Lägg till många"
              icon={AddManyIcon}
            />
            <FloatingMenuItem
              onClick={() => {
                setBudgetPeriodAction({ mode: "show-overview" });
                closeMenu();
              }}
              text="Visa översikt"
              icon={OverviewIcon}
            />
          </>
        )}
      </FloatingActionMenu>

      {/* Modals */}
      {
        {
          create: (
            <Modal onClose={resetTransactionAction}>
              <CreateOrUpdateTransaction
                period={period}
                transaction={undefined}
                onUpdated={resetTransactionAction}
              />
            </Modal>
          ),
          update: period.transactions.find(
            (t) => t.id === updateTransactionId
          ) ? (
            <Modal onClose={resetTransactionAction}>
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
          ) : null,
          "create-many": (
            <Modal onClose={resetTransactionAction}>
              <CreateMultipleTransactions
                period={period}
                onUpdated={resetTransactionAction}
              />
            </Modal>
          ),
          "show-overview": (
            <Modal onClose={resetTransactionAction}>
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
          ),
          none: null,
        }[budgetPeriodAction]
      }
    </Content>
  );
};

const getMode = (param: string | null) => {
  const foundMode =
    ["create", "create-many", "update", "show-overview", "none"].find(
      (mode) => mode === param
    ) ?? "none";

  return foundMode as
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
  const { getFriendById: getFriendNameById, ...visitor } = useVisitor();
  const { data: period, status: periodStatus, run } = useAsync<PeriodType>();
  const {
    data: transactions,
    setData: setTransactions,
    setError: setTransactionsError,
    status: transactionsStatus,
  } = useAsync<Transaction[]>();

  useEffect(
    function getPeriodById() {
      if (periodId && periodStatus === "idle") {
        run(getBudgetPeriodById(periodId));
      }
    },
    [periodId, periodStatus, run]
  );

  useEffect(
    function subscribeToTransactions() {
      if (periodStatus === "resolved" && period.members.length) {
        return getTransactionsForPeriod(
          period,
          setTransactions,
          setTransactionsError
        );
      }
    },
    [period, periodStatus, setTransactions, setTransactionsError]
  );

  if ([periodStatus, transactionsStatus].includes("rejected")) {
    return {
      status: "rejected" as const,
    };
  }

  if (periodStatus !== "resolved" || transactionsStatus !== "resolved") {
    return {
      status: "pending" as const,
    };
  }

  const categorizedTransactions = transactions.reduce((acc, curr) => {
    const previous = acc[curr.category] || [];
    return {
      ...acc,
      [curr.category]: [...previous, curr],
    };
  }, {} as Record<Category["type"], Transaction[]>);

  const income = summarize(categorizedTransactions["INCOME"] || []);
  const { INCOME, ...rest } = categorizedTransactions;
  const expenses = summarize(Object.values(rest).flat());
  const left = income - expenses;

  return {
    status: "resolved" as const,
    period: {
      ...period,
      transactions,
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
    transactionsPerMember: period.members.map((userId) => {
      const transactionsByUser = categoriesForBoard.reduce((acc, curr) => {
        const transaction = categorizedTransactions[curr.type] || [];

        const userTransactions = transaction
          .filter(({ author, shared }) => author === userId || shared === true)
          .map((transaction) => ({
            ...transaction,
            amount: transaction.shared
              ? transaction.amount / period.members.length
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
    overview: transactions
      .filter((i) => i.author === visitor.id)
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

const MarginBottomFix = styled.div`
  margin-bottom: 90px;
`;
