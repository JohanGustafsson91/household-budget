import { getBudgetPeriodById, putBudgetPeriod } from "api/budget-period";
import { getTransactionsForPeriod } from "api/transaction";
import {
  ActionBar,
  PopupMenuItem,
  PopupMenuSection,
  PopupMenuTitle,
} from "components/ActionBar/ActionBar";
import { useEffect, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "shared/useAsync";
import styled from "styled-components";
import { fontSize, space } from "shared/theme";
import { BudgetPeriod as PeriodType } from "shared/BudgetPeriod";
import { displayDate } from "utils/date";

import * as Diagram from "./BudgetPeriod.Diagram";
import { useOnClickOutside } from "shared/useClickOutside";
import type { Transaction } from "./BudgetPeriod.Transaction";
import { UpdateTransaction } from "./BudgetPeriod.UpdateTransaction";
import { categories, Category } from "shared/BudgetPeriod";
import { CreateTransactions } from "./BudgetPeriod.CreateTransactions";
import { useVisitor } from "components/VisitorContext/VisitorContext.useVisitor";
import { displayMoney } from "shared/displayMoney";

interface State {
  displayForUser: {
    id: string;
    name: string;
  };
  showTypeOfTransactions: ShowType;
  selectedCategory: Category | undefined;
  transactionToUpdate: Transaction | undefined;
  view: "create" | "overview" | "update";
}

export default function BudgetPeriod() {
  const { id: periodId } = useParams();
  const {
    getFriendById: getUserById,
    id: visitorId,
    name: visitorName,
  } = useVisitor();
  const { data: period, status: periodStatus, run } = useAsync<PeriodType>();
  const {
    data: transactions = [],
    status: transactionStatus,
    setData: setTransactions,
    setError: setTransactionsError,
  } = useAsync<Transaction[]>();

  const [
    {
      displayForUser,
      showTypeOfTransactions,
      selectedCategory,
      transactionToUpdate,
      view,
    },
    setState,
  ] = useReducer(
    (state: State, updates: Partial<State>) => ({
      ...state,
      ...updates,
    }),
    {
      displayForUser:
        visitorId && visitorName
          ? { id: visitorId, name: visitorName }
          : displayAllTransactionsOption,
      showTypeOfTransactions: "all",
      selectedCategory: undefined,
      transactionToUpdate: undefined,
      view: "overview",
    },
  );

  const viewRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(viewRef, () => setState({ view: "overview" }));

  useEffect(
    function getPeriodById() {
      if (periodId && periodStatus === "idle") {
        run(getBudgetPeriodById(periodId));
      }
    },
    [periodId, periodStatus, run],
  );

  useEffect(
    function subscribeToTransactions() {
      if (periodStatus === "resolved" && period.members.length) {
        return getTransactionsForPeriod(
          period,
          setTransactions,
          setTransactionsError,
        );
      }
    },
    [period, periodStatus, setTransactions, setTransactionsError],
  );

  useEffect(() => {
    if (transactionToUpdate) {
      setState({ view: "update" });
    }
  }, [transactionToUpdate]);

  const transactionsToDisplay = transactions.filter((transaction) => {
    const authorMatch =
      displayForUser.id === "both" || displayForUser.id === transaction.author;

    const typeMatch = [
      showTypeOfTransactions === "all",
      showTypeOfTransactions === "required" && !transaction.optional,
      showTypeOfTransactions === "optional" && transaction.optional,
    ].some(Boolean);

    return authorMatch && typeMatch;
  });

  const findDuplicateTransactions = (transactions: Transaction[]) => {
    const duplicates = new Set<string>();

    transactions.forEach((transaction, index) => {
      const matchingTransactions = transactions.filter(
        (other, otherIndex) =>
          index !== otherIndex &&
          transaction.amount === other.amount &&
          (
            // Check if one label contains the other (ignoring case and whitespace)
            transaction.label.toLowerCase().trim().includes(other.label.toLowerCase().trim()) ||
            other.label.toLowerCase().trim().includes(transaction.label.toLowerCase().trim())
          ),
      );

      if (matchingTransactions.length > 0) {
        duplicates.add(transaction.id);
        matchingTransactions.forEach((match) => duplicates.add(match.id));
      }
    });

    return duplicates;
  };

  const duplicateTransactionIds = findDuplicateTransactions(
    transactionsToDisplay,
  );

  const { categorizedTransactions, totalIncome, totalExpenses, totalLeft } =
    getSummarizedValues(transactionsToDisplay);

  const updatePeriodTotalsOnUnmount = useRef<() => void>();

  useEffect(() => {
    updatePeriodTotalsOnUnmount.current = () => {
      if (!period?.id || transactionStatus !== "resolved") {
        return;
      }

      const { categorizedTransactions, totalIncome, totalExpenses } =
        getSummarizedValues(transactions);

      const summarizedTotalsForCategories = Object.keys(
        period.categoryExpenseTotals,
      ).reduce(
        (acc, key) => ({
          ...acc,
          [key]: summarize(
            categorizedTransactions[key as unknown as Category["type"]] ?? [],
          ),
        }),
        {} as PeriodType["categoryExpenseTotals"],
      );

      const shouldUpdate = Object.keys(period.categoryExpenseTotals).some(
        (key) =>
          period.categoryExpenseTotals[key as unknown as Category["type"]] !==
          summarizedTotalsForCategories[key as unknown as Category["type"]],
      );

      if (!shouldUpdate) {
        return;
      }

      const data = {
        categoryExpenseTotals: summarizedTotalsForCategories,
        totalIncome,
        totalExpenses,
      };

      putBudgetPeriod({
        id: period.id,
        data,
      });
    };
  }, [
    period?.categoryExpenseTotals,
    period?.id,
    transactionStatus,
    transactions,
  ]);

  useEffect(() => {
    return () => {
      updatePeriodTotalsOnUnmount?.current?.();
    };
  }, []);

  if (!period) {
    return null;
  }

  const filteredTransactions = selectedCategory
    ? (categorizedTransactions?.[selectedCategory.type] ?? [])
    : transactionsToDisplay;

  function handleShowCategory(category: Category) {
    return () =>
      setState({
        selectedCategory:
          selectedCategory?.type === category.type ? undefined : category,
      });
  }

  const displayForUserOptions = [
    ...period.members.map((id) => ({
      id,
      name: getUserById(id)?.name ?? "",
    })),
    displayAllTransactionsOption,
  ];

  return (
    <>
      <ActionBar
        title={`${displayDate(period.fromDate)} - ${displayDate(
          period.toDate,
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
                  setState({ displayForUser: { id, name } });
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
          <ModeButton onClick={() => setState({ view: "create" })}>
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
                onUpdated={() => setState({ view: "overview" })}
              />
            </View>
          ),
          update: (
            <View ref={viewRef}>
              {transactionToUpdate ? (
                <UpdateTransaction
                  period={period}
                  transaction={transactionToUpdate}
                  onUpdated={() => setState({ view: "overview" })}
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
                    <Money>{displayMoney(totalIncome)}</Money>
                  </OverviewItem>
                  <OverviewItem>
                    <Title>Utgifter</Title>
                    <Money>{displayMoney(totalExpenses)}</Money>
                  </OverviewItem>
                  <OverviewItem>
                    <Title>Saldo</Title>
                    <Money>{displayMoney(totalLeft)}</Money>
                  </OverviewItem>
                </Overview>

                <Diagram.DiagramContainer>
                  {categoriesForBoard.map((category, i) => {
                    const expensesForCategory = summarize(
                      categorizedTransactions?.[category.type] ?? [],
                    );
                    let expensesInPercentage = Number(
                      (expensesForCategory / (totalIncome - totalLeft)) * 100,
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
                <ItemHeader>
                  <h3>
                    Transaktioner {displayForUser.name}{" "}
                    {selectedCategory
                      ? `för ${selectedCategory.text.toLowerCase()}`
                      : ""}
                  </h3>
                  <select
                    value={showTypeOfTransactions}
                    onChange={(e) =>
                      setState({
                        showTypeOfTransactions: e.target.value as ShowType,
                      })
                    }
                  >
                    {["all", "required", "optional"].map((item) => (
                      <option key={item} value={item}>
                        {
                          {
                            all: "Alla",
                            required: "Nödvändiga",
                            optional: "Onödiga",
                          }[item]
                        }
                      </option>
                    ))}
                  </select>
                </ItemHeader>

                {duplicateTransactionIds.size > 0 && (
                  <DuplicateSummary>
                    <DuplicateSummaryIcon>⚠️</DuplicateSummaryIcon>
                    <DuplicateSummaryText>
                      Hittade {duplicateTransactionIds.size} potentiella
                      duplicerade transaktioner
                    </DuplicateSummaryText>
                  </DuplicateSummary>
                )}

                {filteredTransactions.map((transaction) => {
                  const userName = getUserById(transaction.author)?.name;
                  const categoryName = categories.find(
                    (c) => c.type === transaction.category,
                  )?.text;
                  const formattedMoney = `${
                    transaction.category === "INCOME" ? "+" : "-"
                  }${displayMoney(transaction.amount)}kr`;

                  return (
                    <ListItem
                      key={transaction.id}
                      onClick={() =>
                        setState({ transactionToUpdate: transaction })
                      }
                      title={`${userName} ${formattedMoney} till ${transaction.label} för ${categoryName}`}
                      isDuplicate={duplicateTransactionIds.has(transaction.id)}
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
                      {duplicateTransactionIds.has(transaction.id) && (
                        <DuplicateIndicator title="Potentiell duplicerad transaktion">
                          ⚠️
                        </DuplicateIndicator>
                      )}
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
}

const categoriesForBoard = categories.filter(({ type }) => type !== "INCOME");

const displayAllTransactionsOption = { id: "both", name: "Tillsammans" };

function summarize(list: Array<{ amount: number }>) {
  return list.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0);
}

function getSummarizedValues(transactions: Transaction[]) {
  const categorizedTransactions = transactions.reduce(
    (acc, curr) => {
      const previous = acc[curr.category] || [];
      return {
        ...acc,
        [curr.category]: [...previous, curr],
      };
    },
    {} as Record<Category["type"], Transaction[]>,
  );

  const totalIncome = summarize(categorizedTransactions.INCOME || []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { INCOME, ...rest } = categorizedTransactions;
  const totalExpenses = summarize(Object.values(rest).flat());
  const totalLeft = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    totalLeft,
    categorizedTransactions,
  };
}

type ShowType = "all" | "required" | "optional";

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

const ListItem = styled.li<{ isDuplicate?: boolean }>`
  display: flex;
  align-items: center;
  ${space({ mb: 3, py: 1 })};
  cursor: pointer;
  border-radius: 8px;
  padding: 12px;
  border: 2px solid transparent;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  overflow: visible;

  ${(props) =>
    props.isDuplicate
      ? `
    border-color: #ff6b6b;
    background-color: #fff5f5;
    box-shadow: 0 0 0 1px rgba(255, 107, 107, 0.2);
    
    &:hover {
      border-color: #ff5252;
      background-color: #ffebeb;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    }
  `
      : `
    &:hover {
      background-color: #e9ecef;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `}
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

const DuplicateIndicator = styled.span`
  background-color: #ff6b6b;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-left: 8px;
  flex-shrink: 0;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(255, 107, 107, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
    }
  }
`;

const DuplicateSummary = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff5f5;
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #d63031;
`;

const DuplicateSummaryIcon = styled.span`
  font-size: 16px;
  margin-right: 8px;
`;

const DuplicateSummaryText = styled.span`
  font-size: ${fontSize(0)};
  font-weight: 500;
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;

  :first-child {
    flex: 1;
  }
`;
