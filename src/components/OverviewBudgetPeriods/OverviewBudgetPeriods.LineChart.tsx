import { useState } from "react";
import {
  LineChart as RechartLineChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BudgetPeriod, categories, Category } from "shared/BudgetPeriod";
import { displayMoney } from "shared/displayMoney";

export const LineChart = ({ budgetPeriods }: Props) => {
  const [displayCategories, setDisplayCategories] = useState(() =>
    Object.values(categories).map((value) => value.type)
  );

  const linechartData = budgetPeriods
    ?.map((entry) => ({
      Datum: new Date(entry.fromDate).toLocaleDateString(),
      CLOTHES: displayCategories.includes("CLOTHES")
        ? displayMoney(entry.categoryExpenseTotals.CLOTHES)
        : undefined,
      FOOD: displayCategories.includes("FOOD")
        ? displayMoney(entry.categoryExpenseTotals.FOOD)
        : undefined,
      LIVING: displayCategories.includes("LIVING")
        ? displayMoney(entry.categoryExpenseTotals.LIVING)
        : undefined,
      TRANSPORT: displayCategories.includes("TRANSPORT")
        ? displayMoney(entry.categoryExpenseTotals.TRANSPORT)
        : undefined,
      OTHER: displayCategories.includes("OTHER")
        ? displayMoney(entry.categoryExpenseTotals.OTHER)
        : undefined,
      SAVINGS: displayCategories.includes("SAVINGS")
        ? displayMoney(entry.categoryExpenseTotals.SAVINGS)
        : undefined,
      LOAN: displayCategories.includes("LOAN")
        ? displayMoney(entry.categoryExpenseTotals.LOAN)
        : undefined,
    }))
    .filter(Boolean)
    .reverse();

  const data: Array<{
    text: string;
    dataKey: Category["type"];
    stroke: string;
  }> = [
    { text: "Kläder", dataKey: "CLOTHES", stroke: "#8884d8" },
    { text: "Mat", dataKey: "FOOD", stroke: "#82ca9d" },
    { text: "Boende", dataKey: "LIVING", stroke: "#ffc658" },
    { text: "Transport", dataKey: "TRANSPORT", stroke: "#ff7300" },
    { text: "Övrigt", dataKey: "OTHER", stroke: "#387908" },
    { text: "Sparande", dataKey: "SAVINGS", stroke: "#8884d8" },
    { text: "Lån", dataKey: "LOAN", stroke: "#888410" },
  ];

  return (
    <ResponsiveContainer width="100%" height={500}>
      <RechartLineChart
        data={linechartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Datum" />
        <YAxis interval={0} tickCount={15} />
        <Tooltip />
        <Legend
          onClick={(e) => {
            const found = displayCategories.includes(
              e.dataKey as Category["type"]
            );

            setDisplayCategories((prev) =>
              found
                ? prev.filter((item) => item !== e.dataKey)
                : [...prev, e.dataKey as Category["type"]]
            );
          }}
        />
        {data.map((line, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={line.dataKey}
            stroke={
              displayCategories.includes(line.dataKey) ? line.stroke : "#eee"
            }
            strokeLinecap="butt"
            strokeWidth={2}
            style={{ cursor: "pointer" }}
          />
        ))}
      </RechartLineChart>
    </ResponsiveContainer>
  );
};

interface Props {
  budgetPeriods: BudgetPeriod[];
}
