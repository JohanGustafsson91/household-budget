import { deleteBudgetPeriod, getBudgetPeriods } from "api/budget-period";
import { Loading } from "./OverviewBudgetPeriods.Loading";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BudgetPeriod, Category } from "shared/BudgetPeriod";
import { useAsync } from "shared/useAsync";
import styled from "styled-components";
import { displayDate } from "utils/date";
import { ActionBar } from "components/ActionBar/ActionBar";
import { fontSize, space } from "shared/theme";
import { useVisitor } from "components/VisitorContext/VisitorContext.useVisitor";
import { categories } from "shared/BudgetPeriod";
import { displayMoney } from "shared/displayMoney";
import { LineChart } from "./OverviewBudgetPeriods.LineChart";

export default function OverviewBudgetPeriods() {
  const navigate = useNavigate();
  const visitor = useVisitor();
  const {
    status: statusBudgetPeriods,
    data: budgetPeriods,
    setData: setBudgetPeriods,
    setError: setBudgetPeriodsError,
  } = useAsync<BudgetPeriod[]>();
  const [filter, setFilter] = useState<Filter>({
    date: filterSelections[2].date as Date,
    excludeLatestPeriodInAverage: true,
  });

  useEffect(
    function subscribeToBudgetPeriods() {
      return getBudgetPeriods(
        setBudgetPeriods,
        setBudgetPeriodsError,
        filter.date
      );
    },
    [setBudgetPeriods, setBudgetPeriodsError, filter]
  );

  function navigateTo(url: string) {
    return () => navigate(url);
  }

  const [, ...restOfPeriods] = budgetPeriods ?? [];
  const averages = averageCategoryExpenses(
    filter.excludeLatestPeriodInAverage ? restOfPeriods : budgetPeriods ?? []
  );

  return (
    <>
      <ActionBar title={`Välkommen ${visitor.name}`} />

      <FilterText>
        <select
          onChange={(e) => {
            setFilter((prev) => ({ ...prev, date: new Date(e.target.value) }));
          }}
          value={filter.date?.toString()}
        >
          {filterSelections.map((item) => (
            <option key={item.label} value={item.date.toString()}>
              {item.label}
            </option>
          ))}
        </select>
        <input
          type="checkbox"
          checked={filter.excludeLatestPeriodInAverage}
          onChange={() =>
            setFilter((prev) => ({
              ...prev,
              excludeLatestPeriodInAverage: !prev.excludeLatestPeriodInAverage,
            }))
          }
        />{" "}
        Exkludera nuvarande period
      </FilterText>

      <Container>
        {
          {
            pending: (
              <Loading fullPage={false}>
                <p>Hämtar budgetperioder...</p>
              </Loading>
            ),
            resolved: budgetPeriods?.length ? (
              <div>
                <ContainerAverage>
                  <h2>Genomsnitt</h2>
                  <CategoryList>
                    {Object.values(categories).map((value) => {
                      const average = averages[value.type];
                      return (
                        <CategoryItem key={value.type}>
                          <CategoryName>{value.text}</CategoryName>
                          <AverageValue>
                            {displayMoney(average)} kr
                          </AverageValue>
                        </CategoryItem>
                      );
                    })}
                  </CategoryList>
                </ContainerAverage>

                <h2>Utgifter över tid</h2>
                <LineChart budgetPeriods={budgetPeriods} />

                <h2>Perioder</h2>
                <CardContainer>
                  {budgetPeriods.map((period) => {
                    const memberWith = period.members
                      .filter((userId) => userId !== getAuth().currentUser?.uid)
                      .map((uid) => visitor.getFriendById(uid)?.name ?? "")
                      .join(", ");

                    return (
                      <PeriodCardContainer
                        key={period.id}
                        onClick={navigateTo(`/period/${period.id}`)}
                        role="listitem"
                      >
                        <PeriodCardHeader>
                          Från {displayDate(period.fromDate)} till{" "}
                          {displayDate(period.toDate)}
                        </PeriodCardHeader>
                        <PeriodCardSubHeader>
                          {memberWith.length
                            ? `Tillsammans med ${memberWith}`
                            : ""}
                        </PeriodCardSubHeader>
                        <PeriodCardRemoveButton
                          onClick={function handleDeleteBudgetPeriod(e) {
                            e.stopPropagation();

                            return window.confirm(
                              "Är du säker på att du vill ta bort budgetperioden?"
                            )
                              ? deleteBudgetPeriod(period.id)
                              : undefined;
                          }}
                        >
                          Ta bort
                        </PeriodCardRemoveButton>

                        <PeriodCardFinancialSummary>
                          <PeriodCardCategory>Inkomster</PeriodCardCategory>
                          <PeriodCardAmount>
                            {displayMoney(period.totalIncome)} kr
                          </PeriodCardAmount>
                        </PeriodCardFinancialSummary>
                        <PeriodCardFinancialSummary>
                          <PeriodCardCategory>Utgifter</PeriodCardCategory>
                          <PeriodCardAmount>
                            {displayMoney(period.totalExpenses)} kr
                          </PeriodCardAmount>
                        </PeriodCardFinancialSummary>
                        <PeriodCardFinancialSummary>
                          <PeriodCardCategory>Saldo</PeriodCardCategory>
                          <PeriodCardAmount>
                            {" "}
                            {displayMoney(
                              period.totalIncome - period.totalExpenses
                            )}{" "}
                            kr
                          </PeriodCardAmount>
                        </PeriodCardFinancialSummary>

                        <PeriodCardFinancialDetails>
                          <PeriodCardSummaryTitle>
                            Kategorier
                          </PeriodCardSummaryTitle>
                          {categories.map((category) =>
                            category.type !== "INCOME" ? (
                              <PeriodCardFinancialSummary key={category.type}>
                                <PeriodCardCategory>
                                  {category.text}
                                </PeriodCardCategory>
                                <PeriodCardAmount>
                                  {displayMoney(
                                    period.categoryExpenseTotals[category.type]
                                  )}{" "}
                                  kr
                                </PeriodCardAmount>
                              </PeriodCardFinancialSummary>
                            ) : null
                          )}
                        </PeriodCardFinancialDetails>
                      </PeriodCardContainer>
                    );
                  })}
                </CardContainer>
              </div>
            ) : (
              <p>Inga skapade budgetperioder.</p>
            ),
            rejected: <p>Kunde inte hämta budgetperioder...</p>,
            idle: null,
          }[statusBudgetPeriods]
        }
      </Container>
      <ActionButton onClick={navigateTo("/period/add")}>+</ActionButton>
    </>
  );
}

const today = new Date();

const dateStartOfYear = new Date(today.getFullYear(), 0, 1);

const filterSelections = [
  {
    label: "Det här året",
    date: dateStartOfYear,
  },
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((number) => ({
    label: `Senaste ${number + 1} månaderna`,
    date: new Date(new Date().setMonth(today.getMonth() - number)),
  })),
  {
    label: "Sen start",
    date: -1,
  },
];

const averageCategoryExpenses = (expenses: BudgetPeriod[]) => {
  const totals = expenses.reduce((acc, curr) => {
    for (const category in curr.categoryExpenseTotals) {
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total +=
        curr.categoryExpenseTotals[category as Category["type"]];
      acc[category].count += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const averages: Record<string, number> = {};
  for (const category in totals) {
    averages[category] = totals[category].total / totals[category].count;
  }
  return averages;
};

interface Filter {
  date: Date | undefined;
  excludeLatestPeriodInAverage: boolean;
}

const Container = styled.div`
  overflow-y: auto;
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

const FilterText = styled.div`
  ${space({ mb: 3 })};

  select {
    ${space({ mr: 2 })};
  }
`;

const ContainerAverage = styled.div`
  ${space({ p: 3, mb: 4 })};
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const CategoryList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  ${space({ mt: 4 })};
`;

const CategoryItem = styled.div`
  ${space({ p: 3 })};
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const CategoryName = styled.span`
  font-weight: bold;
  color: #333;
`;

const AverageValue = styled.span`
  color: #555;
  float: right;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const PeriodCardContainer = styled.div`
  ${space({ p: 4, mb: 3 })};
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  cursor: pointer;
`;

const PeriodCardHeader = styled.h2`
  text-align: center;
  color: #343a40;
  ${space({ mb: 3 })};
`;

const PeriodCardSubHeader = styled.h3`
  color: #495057;
  text-align: center;
  ${space({ mt: 3 })};
`;

const PeriodCardRemoveButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  margin: 10px 0;
  display: block;
  width: 100%;

  &:hover {
    background-color: #c82333;
  }
`;

const PeriodCardFinancialSummary = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #dee2e6;
`;

const PeriodCardCategory = styled.span`
  font-weight: bold;
  color: #343a40;
`;

const PeriodCardAmount = styled.span`
  color: #6c757d;
`;

const PeriodCardFinancialDetails = styled.div`
  margin-top: 20px;
`;

const PeriodCardSummaryTitle = styled.h4`
  text-align: center;
  color: #495057;
  margin-bottom: 10px;
`;
