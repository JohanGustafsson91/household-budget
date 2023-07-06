import { getBudgetPeriodById } from "api/budget-period";
import { getTransactionsForPeriod } from "api/transaction";
import {
  ActionBar,
  PopupMenuItem,
  PopupMenuSection,
  PopupMenuTitle,
} from "components/ActionBar";
import { useVisitor } from "components/App/App.useVisitor";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "shared/useAsync";
import styled from "styled-components";
import { fontSize, space } from "theme";
import { BudgetPeriod as PeriodType } from "shared";
import { displayDate } from "utils";

import * as Diagram from "./Diagram";
import { useOnClickOutside } from "shared/useClickOutside";
import { Transaction } from "./types";
import { UpdateTransaction } from "./UpdateTransaction";
import { categories, Category } from "shared/categories";
import { CreateTransactions } from "./CreateTransactions";

export const BudgetPeriod = () => {
  const { id: periodId } = useParams();
  const { getFriendById: getUserById } = useVisitor();
  const { data: period, status: periodStatus, run } = useAsync<PeriodType>();
  const {
    data: transactions = [],
    setData: setTransactions,
    setError: setTransactionsError,
  } = useAsync<Transaction[]>();

  const [displayForUser, setDisplayForUser] = useState<{
    id: string;
    name: string;
  }>({ id: "both", name: "tillsammans" });

  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);
  const [view, setView] = useState<"create" | "overview" | "update">(
    "overview"
  );
  const [transaction, setTransaction] = useState<Transaction | undefined>(
    undefined
  );
  const viewRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(viewRef, () => setView("overview"));

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

  useEffect(() => {
    if (transaction) {
      setView("update");
    }
  }, [transaction]);

  if (!period) {
    return null;
  }

  const transactionsPerVisitor = transactions.filter(
    ({ author }) => displayForUser.id === "both" || displayForUser.id === author
  );

  const categorizedTransactions = transactionsPerVisitor.reduce((acc, curr) => {
    const previous = acc[curr.category] || [];
    return {
      ...acc,
      [curr.category]: [...previous, curr],
    };
  }, {} as Record<Category["type"], Transaction[]>);

  const income = summarize(categorizedTransactions["INCOME"] || []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { INCOME, ...rest } = categorizedTransactions;
  const expenses = summarize(Object.values(rest).flat());
  const left = income - expenses;

  const filteredTransactions = selectedCategory
    ? categorizedTransactions?.[selectedCategory.type] ?? []
    : transactionsPerVisitor;

  function handleShowCategory(category: Category) {
    return () =>
      setSelectedCategory(
        selectedCategory?.type === category.type ? undefined : category
      );
  }

  const displayForUserOptions = [
    ...period.members.map((id) => ({
      id,
      name: getUserById(id)?.name ?? "",
    })),
    {
      id: "both",
      name: "tillsammans",
    },
  ];

  return (
    <>
      <ActionBar
        title={`${displayDate(period.fromDate)} - ${displayDate(
          period.toDate
        )}`}
        backNavigationEnabled={view === "overview"}
        renderMenu={({ closeMenu }) => (
          <PopupMenuSection role="alert">
            <PopupMenuTitle>Välj vy</PopupMenuTitle>
            {displayForUserOptions.map(({ id, name }) => (
              <PopupMenuItem
                title={`Menu option ${name}`}
                key={id}
                active={displayForUser.id === id}
                onClick={() => {
                  setDisplayForUser({ id, name });
                  closeMenu();
                }}
              >
                {name}
              </PopupMenuItem>
            ))}
          </PopupMenuSection>
        )}
      >
        {view === "overview" ? (
          <ModeButton
            onClick={() =>
              setView((prev) => {
                console.log({ prev });
                return "create";
              })
            }
          >
            Lägg till
          </ModeButton>
        ) : null}
      </ActionBar>

      {
        {
          create: (
            <View ref={viewRef}>
              <CreateTransactions
                period={period}
                onUpdated={() => setView("overview")}
              />
            </View>
          ),
          update: (
            <View ref={viewRef}>
              {transaction ? (
                <UpdateTransaction
                  period={period}
                  transaction={transaction}
                  onUpdated={() => setView("overview")}
                />
              ) : null}
            </View>
          ),
          overview: (
            <>
              <OverviewContainer>
                <Overview>
                  <OverviewItem
                    title={`Summary for Inkomster`}
                    clickable={true}
                    active={selectedCategory?.type === "INCOME"}
                    onClick={handleShowCategory({
                      type: "INCOME",
                      text: "Inkomster",
                    })}
                  >
                    <Title>Inkomster</Title>
                    <Money>{displayMoney(income)}</Money>
                  </OverviewItem>
                  <OverviewItem>
                    <Title>Utgifter</Title>
                    <Money>{displayMoney(expenses)}</Money>
                  </OverviewItem>
                  <OverviewItem>
                    <Title>Saldo</Title>
                    <Money>{displayMoney(left)}</Money>
                  </OverviewItem>
                </Overview>

                <Diagram.DiagramContainer>
                  {categoriesForBoard.map((category, i) => {
                    const expensesForCategory = summarize(
                      categorizedTransactions?.[category.type] ?? []
                    );
                    let expensesInPercentage = Number(
                      (expensesForCategory / (income - left)) * 100
                    );
                    expensesInPercentage = isNaN(expensesInPercentage)
                      ? 0
                      : expensesInPercentage;
                    const active = category.type === selectedCategory?.type;

                    return (
                      <Diagram.DiagramCategory
                        title={`Summary for ${category.text}`}
                        key={category.type}
                        onClick={handleShowCategory(category)}
                        active={active}
                      >
                        <Diagram.DiagramBarWrapper>
                          <Diagram.DiagramBar
                            height={expensesInPercentage}
                            active={active}
                          >
                            <Diagram.DiagramBarPercentage>
                              {expensesInPercentage.toFixed(0)}%
                            </Diagram.DiagramBarPercentage>
                          </Diagram.DiagramBar>
                        </Diagram.DiagramBarWrapper>
                        <Diagram.DiagramText>
                          {category.text}
                        </Diagram.DiagramText>

                        <Diagram.PopupSum
                          floatfrom={
                            i === 0
                              ? "left"
                              : i + 1 === categoriesForBoard.length
                              ? "right"
                              : "none"
                          }
                        >
                          {displayMoney(expensesForCategory)}kr
                        </Diagram.PopupSum>
                      </Diagram.DiagramCategory>
                    );
                  })}
                </Diagram.DiagramContainer>
              </OverviewContainer>

              <List>
                <h3>
                  Transaktioner {displayForUser.name}{" "}
                  {selectedCategory
                    ? `för ${selectedCategory.text.toLowerCase()}`
                    : ""}
                </h3>
                {filteredTransactions.map((transaction) => {
                  const userName = getUserById(transaction.author)?.name;
                  const categoryName = categories.find(
                    (c) => c.type === transaction.category
                  )?.text;
                  const formattedMoney = `${
                    transaction.category === "INCOME" ? "+" : "-"
                  }${displayMoney(transaction.amount)}kr`;

                  return (
                    <ListItem
                      key={transaction.id}
                      onClick={() => setTransaction(transaction)}
                      title={`${userName} ${formattedMoney} till ${transaction.label} för ${categoryName}`}
                    >
                      <ListItemValue minWidth="80px">
                        {categoryName}
                        {displayForUser.id === "both" ? (
                          <TransactionInfo>{userName}</TransactionInfo>
                        ) : null}
                      </ListItemValue>
                      <ListItemValue flex={1}>
                        <TransactionName>{transaction.label}</TransactionName>
                        <TransactionInfo>
                          {displayDate(transaction.date)}
                        </TransactionInfo>
                      </ListItemValue>
                      <ListItemValue>{formattedMoney}</ListItemValue>
                    </ListItem>
                  );
                })}
                {filteredTransactions.length === 0 ? "Inga transaktioner" : ""}
              </List>
            </>
          ),
        }[view]
      }
    </>
  );
};

const categoriesForBoard = categories.filter(({ type }) => type !== "INCOME");

function summarize(list: Array<{ amount: number }>) {
  return list.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0);
}

function displayMoney(value: number) {
  return Math.floor(value);
}

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  ${space({ mb: 3 })};
`;

const Overview = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const OverviewItem = styled.div<{ clickable?: boolean; active?: boolean }>`
  ${(props) =>
    props.clickable
      ? `
cursor: pointer;
`
      : ""}
  ${(props) =>
    props.active
      ? `
    ${Money} {
      color: #C3A2ED;
    }
    `
      : ""}
`;

const List = styled.ul`
  flex: 2;
  overflow-y: auto;
  ${space({ m: 0, p: 0 })};
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  ${space({ mb: 3, py: 1 })};
  cursor: pointer;
`;

const ListItemValue = styled.div<{ flex?: number; minWidth?: string }>`
  ${space({ mr: 3 })}
  ${(props) => (props.flex ? `flex: ${props.flex}` : "")};
  min-width: ${(props) => props.minWidth ?? "none"};
`;

const TransactionName = styled.p`
  font-size: ${fontSize(2)};
  ${space({ m: 0 })};
  font-weight: 700;
  color: var(--color-dark);
`;

const TransactionInfo = styled.div`
  font-size: ${fontSize(0)};
`;

const Title = styled.h1`
  font-size: ${fontSize(2)};
  color: #c2c2c2;
  ${space({ m: 0, mb: 1 })};
  font-weight: normal;
`;

const Money = styled.h2`
  color: #313131;
  font-size: ${fontSize(5)};
  ${space({ m: 0, mb: 2 })}
  font-weight: 500;
`;

const View = styled.div`
  ${space({ mb: 3 })};
  flex: 1;
  overflow-y: auto;
`;

const ModeButton = styled.div`
  width: 50px;
  cursor: pointer;
`;
