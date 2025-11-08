import { postTransaction } from "api/transaction";
import { Title } from "./BudgetPeriod.Title";
import { FormField, Select, Textarea, Button } from "components/FormElements";
import { auth } from "api/firebase";
import { useEffect, useState } from "react";
import { BudgetPeriod } from "shared/BudgetPeriod";
import { categories } from "shared/BudgetPeriod";
import { useAsync } from "shared/useAsync";
import { nanoid } from "nanoid";
import styled from "styled-components";
import { space } from "shared/theme";
import { NewTransaction, Transaction } from "./BudgetPeriod.Transaction";
import previouslyStoredTransactions from "api/transactions-database-dump.json";

interface Props {
  period: BudgetPeriod;
  onUpdated?: () => unknown;
}

export const CreateTransactions = ({ period, onUpdated }: Props) => {
  const [activeStep, setActiveStep] = useState<Step>("paste");
  const [pastedText, setPastedText] = useState("");
  const [parsedPastedText, setParsedPastedText] = useState<string[][]>([]);
  const [transactions, setTransactions] = useState<NewTransaction[]>([]);
  const { run, status } = useAsync<undefined>();

  const [tableSettings, setTableSettings] = useState<typeof tableSettingsItems>(
    []
  );

  const maxColumns = parsedPastedText.reduce((acc, curr) => {
    return curr.length > acc ? curr.length : acc;
  }, 0);

  useEffect(
    function updateTableSettings() {
      setTableSettings(() =>
        Array.from({ length: maxColumns }).map(
          (_, i) => tableSettingsItems?.[i]
        )
      );
    },
    [maxColumns]
  );

  const state = {
    transactions,
    parsedPastedText,
  };

  const stepsNames = Object.keys(steps);
  const currentIndex = Object.keys(steps).findIndex(
    (element) => element === activeStep
  );
  const previousStep = stepsNames?.[currentIndex - 1] as Step | undefined;
  const nextStep = stepsNames?.[currentIndex + 1] as Step | undefined;

  useEffect(
    function callbackWhenCreated() {
      if (status === "resolved") {
        onUpdated?.();
      }
    },
    [onUpdated, status]
  );

  useEffect(
    function onPastedText() {
      setParsedPastedText(() =>
        pastedText
          .split("\n")
          .map(function parseLine(line) {
            return line
              .split(/\t|# /gm)
              .map((t) => t.trim())
              .filter(Boolean);
          })
          .filter((a) => a.length && a.length >= 3)
      );
    },
    [pastedText]
  );

  function updateTableSettings({
    fromIndex,
    toIndex,
  }: {
    fromIndex: number;
    toIndex: number;
  }) {
    const updatedList = [...tableSettings];
    const [element] = updatedList.splice(fromIndex, 1);
    updatedList.splice(toIndex, 0, element);
    setTableSettings(() => updatedList);
  }

  useEffect(
    function updateTransactions() {
      const result = parsedPastedText
        .map((item) => {
          const [date, label, amount] = [
            new Date(item[tableSettings.findIndex((i) => i?.type === "date")]),
            item[tableSettings.findIndex((i) => i?.type === "label")],
            item[tableSettings.findIndex((i) => i?.type === "amount")],
          ];

          const category = !amount?.startsWith("-")
            ? "INCOME"
            : (previouslyStoredTransactions.find(prev => 
                prev.label.trim().toLowerCase() === label?.trim()?.toLowerCase()
              )?.category ?? "OTHER") as Transaction["category"];

          return date !== null && !Number.isNaN(Number.parseFloat(amount))
            ? {
                label,
                category,
                date: new Date(date),
                amount: Number.parseFloat(
                  amount?.replace(",", ".").replace("-", "").replace(" ", "")
                ),
                author: auth.currentUser?.uid,
                createdAt: new Date(),
                lastUpdated: new Date(),
                periodId: period.id,
                id: nanoid(),
                shared: false,
                optional: false,
              }
            : undefined;
        })
        .filter(Boolean) as unknown as NewTransaction[];

      setTransactions(() => result);
    },
    [tableSettings, parsedPastedText, period.id]
  );

  function goToNextStep() {
    if (nextStep) setActiveStep(() => nextStep);
  }
  function goToPreviousStep() {
    if (previousStep) setActiveStep(() => previousStep);
  }

  return (
    <div>
      {{
        paste: () => (
          <div>
            <Title>Lägg till många</Title>

            <FormField>
              <Textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
              <div>
                <Button
                  type="button"
                  onClick={function formatPastedText() {
                    const rows = pastedText.trim().split("\n");

                    const formattedRows = rows.reduce(
                      (acc, row) => {
                        const trimmedRow = row.trim();

                        const isDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmedRow);
                        if (isDate) {
                          return {
                            ...acc,
                            currentDate: trimmedRow,
                          };
                        }

                        const isAmount = /^-?\d+(,\d{2})?$/.test(
                          trimmedRow.replace(" ", "")
                        );
                        if (isAmount && acc.currentText) {
                          return {
                            ...acc,
                            transactions: `${acc.transactions}\n${acc.currentDate}# ${acc.currentText}# ${trimmedRow}`,
                            currentText: "",
                          };
                        }

                        return {
                          ...acc,
                          currentText: trimmedRow,
                        };
                      },
                      {
                        currentDate: "",
                        currentText: "",
                        currentAmount: "",
                        transactions: "",
                      } as {
                        currentDate: string;
                        currentText: string;
                        currentAmount: string;
                        transactions: string;
                      }
                    );

                    setPastedText(() => formattedRows.transactions);
                  }}
                >
                  Formatera
                </Button>
              </div>
            </FormField>
          </div>
        ),
        select: () => (
          <View>
            <Title>Välj fält</Title>

            <table>
              <tr>
                {parsedPastedText[0].map((list, i) => {
                  const text = tableSettings?.[i]?.text ?? "";

                  return (
                    <td key={list + i}>
                      {text && i > 0 ? (
                        <ArrowButton
                          type="button"
                          title={`${text} tillbaka`}
                          onClick={() =>
                            updateTableSettings({
                              fromIndex: i,
                              toIndex: i - 1,
                            })
                          }
                        >
                          ←
                        </ArrowButton>
                      ) : null}
                      <span>{text}</span>
                      {text && i + 1 < parsedPastedText[0].length ? (
                        <ArrowButton
                          type="button"
                          title={`${text} nästa`}
                          onClick={() =>
                            updateTableSettings({
                              fromIndex: i,
                              toIndex: i + 1,
                            })
                          }
                        >
                          →
                        </ArrowButton>
                      ) : null}
                    </td>
                  );
                })}
              </tr>

              {parsedPastedText.map((list, i) => (
                <tr key={list.join(i.toString())}>
                  {list.map((column, c) => (
                    <td key={column + i + c}>{column}</td>
                  ))}
                </tr>
              ))}
            </table>
          </View>
        ),
        categories: () => (
          <View>
            <Title>Välj kategori</Title>

            <table>
              <thead>
                <tr>
                  <th>Namn</th>
                  <th>Belopp</th>
                  <th>Kategori</th>
                  <th>Nödvändig</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.label}</td>
                    <td>{transaction.amount}</td>
                    <td>
                      <Select
                        name="category"
                        value={transaction.category}
                        onChange={function updateCategory(e) {
                          setTransactions((prev) =>
                            prev.map((previousTransaction) =>
                              previousTransaction.id === transaction.id
                                ? {
                                    ...previousTransaction,
                                    category: e.target
                                      .value as Transaction["category"],
                                  }
                                : previousTransaction
                            )
                          );
                        }}
                      >
                        {categories.map((category) => (
                          <option key={category.type} value={category.type}>
                            {category.text}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={!transaction.optional}
                        onChange={(e) =>
                          setTransactions((prev) =>
                            prev.map((previousTransaction) =>
                              previousTransaction.id === transaction.id
                                ? {
                                    ...previousTransaction,
                                    optional: !e.target.checked,
                                  }
                                : previousTransaction
                            )
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button
              onClick={function createMultipleTransactions() {
                run(
                  Promise.all(
                    transactions.map((transaction) =>
                      postTransaction(transaction)
                    )
                  )
                );
              }}
              disabled={status === "pending"}
            >
              Lägg till
            </Button>
          </View>
        ),
      }[activeStep]()}

      <StepButtons>
        {previousStep ? (
          <Button disabled={!previousStep} onClick={goToPreviousStep}>
            Tillbaka
          </Button>
        ) : null}
        {nextStep ? (
          <Button
            disabled={!steps[activeStep].allowedNextStep(state)}
            onClick={goToNextStep}
          >
            Nästa
          </Button>
        ) : null}
      </StepButtons>
    </div>
  );
};

const steps: Record<
  Step,
  {
    allowedNextStep: (state: {
      transactions: NewTransaction[];
      parsedPastedText: string[][];
    }) => boolean;
  }
> = {
  paste: {
    allowedNextStep: ({ parsedPastedText }) => Boolean(parsedPastedText.length),
  },
  select: {
    allowedNextStep: ({ transactions }) => Boolean(transactions.length),
  },
  categories: {
    allowedNextStep: () => false,
  },
};

type Step = "paste" | "select" | "categories";

const View = styled.div`
  table {
    width: 100%;
    border-collapse: collapse;
    ${space({ mb: 2 })}
  }

  table,
  th,
  td {
    border: 1px solid;
    ${space({ p: 2 })};
  }
`;

const StepButtons = styled.div`
  width: 100%;
  ${space({ mt: 2 })}

  button {
    float: left;
  }

  button:nth-child(even) {
    float: right;
  }
`;

const tableSettingsItems = [
  { type: "date", text: "Datum" },
  { type: "label", text: "Namn" },
  { type: "amount", text: "Kostnad" },
];

const ArrowButton = styled.button`
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--color-text);
  font-size: 16px;
  line-height: 1;
  margin: 0 4px;
  
  &:hover {
    background-color: var(--color-background);
    border-color: var(--color-background-action-bar);
    color: var(--color-background-action-bar);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;
