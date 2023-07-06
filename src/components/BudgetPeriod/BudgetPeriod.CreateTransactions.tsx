import { postTransaction } from "api/transaction";
import { Button } from "components/Button/Button";
import { CardTitle } from "components/Card/Card";
import { FormField, Select, Textarea } from "components/Form/Form";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { BudgetPeriod } from "shared";
import { categories } from "shared/categories";
import { useAsync } from "shared/useAsync";
import shortid from "shortid";
import styled from "styled-components";
import { space } from "theme";
import { NewTransaction, Transaction } from "./BudgetPeriod.Transaction";

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
              .split(/\t|, /gm)
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

          return date !== null && !Number.isNaN(Number.parseFloat(amount))
            ? {
                label,
                category: amount?.startsWith("-")
                  ? "OTHER"
                  : ("INCOME" as Transaction["category"]),
                date: new Date(date),
                amount: Number.parseFloat(
                  amount?.replace(",", ".").replace("-", "").replace(" ", "")
                ),
                author: getAuth()?.currentUser?.uid,
                createdAt: new Date(),
                lastUpdated: new Date(),
                periodId: period.id,
                id: shortid(),
                shared: false,
              }
            : undefined;
        })
        .filter(Boolean) as unknown as NewTransaction[];

      setTransactions(() => result);
    },
    [tableSettings, parsedPastedText, period.id]
  );

  function goToNextStep() {
    nextStep && setActiveStep(() => nextStep);
  }
  function goToPreviousStep() {
    previousStep && setActiveStep(() => previousStep);
  }

  return (
    <div>
      {{
        paste: () => (
          <div>
            <CardTitle>Lägg till många</CardTitle>

            <FormField>
              <Textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
            </FormField>
          </div>
        ),
        select: () => (
          <View>
            <CardTitle>Välj fält</CardTitle>

            <table>
              <tr>
                {parsedPastedText[0].map((list, i) => {
                  const text = tableSettings?.[i]?.text ?? "";

                  return (
                    <td key={list + i}>
                      {text && i > 0 ? (
                        <button
                          title={`${text} tillbaka`}
                          onClick={() =>
                            updateTableSettings({
                              fromIndex: i,
                              toIndex: i - 1,
                            })
                          }
                        >
                          ←
                        </button>
                      ) : null}
                      <span>{text}</span>
                      {text && i + 1 < parsedPastedText[0].length ? (
                        <button
                          title={`${text} nästa`}
                          onClick={() =>
                            updateTableSettings({
                              fromIndex: i,
                              toIndex: i + 1,
                            })
                          }
                        >
                          →
                        </button>
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
            <CardTitle>Välj kategori</CardTitle>

            <table>
              <thead>
                <tr>
                  <th>Namn</th>
                  <th>Belopp</th>
                  <th>Kategori</th>
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
