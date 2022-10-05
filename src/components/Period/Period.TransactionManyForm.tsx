import { Button, Select } from "components/Form";
import { addDoc, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Period } from "shared";
import shortid from "shortid";
import styled from "styled-components";
import { space } from "theme";
import { auth, COLLECTION, db } from "utils";
import { categories } from "./Period.categories";
import { Transaction } from "./Period.Transaction";

interface Props {
  period: Period;
  onUpdated?: Function;
}

export function TransactionManyForm({ period, onUpdated }: Props) {
  const [pastedText, setPastedText] = useState("");
  const [transations, setTransactions] = useState<NewTransaction[]>([]);

  useEffect(
    function onPastedText() {
      const newTransactions = pastedText
        .split("\n")
        .map((line) => {
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
            author: auth?.currentUser?.uid,
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

  async function onAdd() {
    await Promise.all(
      transations.map((transation) =>
        addDoc(collection(db, COLLECTION["transactions"]), {
          ...transation,
        }).catch(() => {
          // TODO handle error
          return undefined;
        })
      )
    );

    onUpdated?.();
  }

  return (
    <Content>
      <h5>Lägg till många</h5>
      <Textarea
        value={pastedText}
        onChange={(e) => setPastedText(e.target.value)}
      />

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
                    onChange={(e) =>
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
                      )
                    }
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

      <Button onClick={onAdd}>Lägg till</Button>
    </Content>
  );
}

const Content = styled.div``;

const Textarea = styled.textarea`
  width: 100%;
  height: 300px;
`;

const Table = styled.table`
  width: 100%;

  th,
  td {
    text-align: left;
    padding: ${space(1)} 0;
  }

  tr {
  }
`;

interface NewTransaction {
  label: string;
  category: Transaction["category"];
  date: Date;
  amount: number;
  author: string | undefined;
  createdAt: Date;
  lastUpdated: Date;
  periodId: string;
  id: string;
}
