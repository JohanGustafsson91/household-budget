import { getAuth } from "api/auth";
import { postTransaction } from "api/transaction";
import { CardTitle } from "components/Card";
import { FormField, Select, Textarea } from "components/Form";
import { Button } from "components/Button";
import { useEffect, useState } from "react";
import { BudgetPeriod } from "shared";
import { useAsync } from "shared/useAsync";
import shortid from "shortid";
import styled from "styled-components";
import { space } from "theme";
import { categories } from "./BudgetPeriod.categories";
import { NewTransaction, Transaction } from "./BudgetPeriod.Transaction";

interface Props {
  period: BudgetPeriod;
  onUpdated?: Function;
}

export function CreateMultipleTransactions({ period, onUpdated }: Props) {
  const [pastedText, setPastedText] = useState("");
  const [transations, setTransactions] = useState<NewTransaction[]>([]);
  const { run, status } = useAsync<undefined>();

  useEffect(
    function onPastedText() {
      const newTransactions = pastedText
        .split("\n")
        .map(function parseLine(line) {
          const [amount, label, date] = line.split("\t \t").reverse();
          const category: Transaction["category"] = amount.startsWith("-")
            ? "OTHER"
            : "INCOME";

          return {
            label,
            category,
            date: new Date(date),
            amount: Number.parseFloat(
              amount.replace(",", ".").replace("-", "").replace(" ", "")
            ),
            author: getAuth()?.currentUser?.uid,
            createdAt: new Date(),
            lastUpdated: new Date(),
            periodId: period.id,
            id: shortid(),
          } as NewTransaction;
        })
        .filter(({ amount }) => amount);

      setTransactions(newTransactions);
    },
    [period.id, pastedText]
  );

  async function createMultipleTransactions() {
    run(
      Promise.all(
        transations.map((transaction) => postTransaction(transaction))
      )
    );
  }

  useEffect(() => {
    if (status === "resolved") {
      onUpdated?.();
    }
  }, [onUpdated, status]);

  return (
    <Content>
      <CardTitle>Lägg till många</CardTitle>

      <FormField>
        <Textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
        />
      </FormField>

      {transations.length ? (
        <Table>
          <thead>
            <tr>
              <th>Namn</th>
              <th>Belopp</th>
              <th>Kategori</th>
            </tr>
          </thead>
          <tbody>
            {transations.map((transaction) => (
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
        </Table>
      ) : null}

      <Button
        onClick={createMultipleTransactions}
        disabled={status === "pending"}
      >
        Lägg till
      </Button>
    </Content>
  );
}

const Content = styled.div``;

export const Table = styled.table`
  width: 100%;

  th,
  td {
    text-align: left;
    padding: ${space(1)} 0;
    border-bottom: 1px solid #eee;
  }
`;
