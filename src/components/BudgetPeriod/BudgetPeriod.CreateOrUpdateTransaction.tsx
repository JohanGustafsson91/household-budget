import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { BudgetPeriod } from "shared";
import { categories } from "./BudgetPeriod.categories";
import {
  FormField,
  DatePicker,
  Input,
  Label,
  Select,
  Checkbox,
} from "components/Form";
import { Button } from "components/Button";
import { Transaction } from "./BudgetPeriod.Transaction";
import shortid from "shortid";
import {
  postTransaction,
  putTransaction,
  deleteTransaction,
} from "api/transaction";
import { getAuth } from "api/auth";
import { CardTitle } from "components/Card";
import { useAsync } from "shared/useAsync";

export const CreateOrUpdateTransaction = ({
  period,
  transaction,
  onUpdated,
}: Props) => {
  const { status: statusCreated, setIdle, run: runCreate } = useAsync();
  const { status: statusUpdatedOrDeleted, run: runUpdateOrDelete } = useAsync();

  const [form, setForm] = useState<Form>(() =>
    !transaction
      ? getInitFormState(period.fromDate)
      : {
          id: transaction.id,
          label: transaction.label,
          category: transaction.category,
          amount: transaction.amount,
          date: transaction.date,
          shared: transaction.shared,
        }
  );

  const focusRef = useRef<HTMLInputElement | null>(null);

  useEffect(
    function focusInputElement() {
      if (form.amount === 0) {
        focusRef.current?.focus();
      }
    },
    [form.amount]
  );

  useEffect(
    function resetFormWhenCreated() {
      if (statusCreated === "resolved") {
        setForm(getInitFormState(period.fromDate));
        setIdle();
      }
    },
    [period.fromDate, setIdle, statusCreated]
  );

  useEffect(
    function callbackWhenUpdatedOrDeleted() {
      if (statusUpdatedOrDeleted === "resolved") {
        onUpdated?.();
      }
    },
    [onUpdated, statusUpdatedOrDeleted]
  );

  function updateForm(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        "checked" in e.target && e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    }));
  }

  function handleUpdateDateInForm(newDate: Date | null) {
    newDate && setForm((prev) => ({ ...prev, date: newDate }));
  }

  async function addTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    runCreate(
      postTransaction({
        ...form,
        author: getAuth()?.currentUser?.uid ?? "",
        createdAt: new Date(),
        lastUpdated: new Date(),
        periodId: period.id,
        id: shortid(),
        date: form.date ?? new Date(),
      })
    );
  }

  async function handleUpdateTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (transaction) {
      runUpdateOrDelete(
        putTransaction(transaction.id, {
          ...form,
          date: form.date ?? new Date(),
          shared: form.shared ? true : false,
          lastUpdated: new Date(),
        })
      );
    }
  }

  async function handleDeleteTransaction() {
    if (transaction) {
      runUpdateOrDelete(deleteTransaction(transaction.id));
    }
  }

  const validForm = Object.values(form).every((val) => val !== "" || val !== 0);

  const isPending = [statusCreated, statusUpdatedOrDeleted].includes("pending");

  return (
    <div>
      <CardTitle>{transaction ? "Ändra" : "Lägg till"}</CardTitle>
      <form onSubmit={transaction ? handleUpdateTransaction : addTransaction}>
        <FormField>
          <Label>
            Belopp
            {/* TODO fix double */}
            <Input
              name="amount"
              type="number"
              min="1"
              max="1000000"
              value={form.amount}
              onChange={updateForm}
              ref={focusRef}
            />
          </Label>
        </FormField>
        <FormField>
          <Label>
            Händelse
            <Input name="label" value={form.label} onChange={updateForm} />
          </Label>
        </FormField>
        <FormField>
          <Label>
            Kategori
            <Select name="category" value={form.category} onChange={updateForm}>
              {categories.map((category) => (
                <option key={category.type} value={category.type}>
                  {category.text}
                </option>
              ))}
            </Select>
          </Label>
        </FormField>
        <FormField>
          <Label>
            Datum - {form.date?.toLocaleDateString()} <div />
          </Label>
          <DatePicker
            locale="sv"
            name="date"
            selected={form.date}
            onChange={handleUpdateDateInForm}
            minDate={period.fromDate}
            maxDate={period.toDate}
            inline
          />
        </FormField>
        <FormField>
          <Label>
            Gemensam?
            <Checkbox
              name="shared"
              type="checkbox"
              checked={form.shared}
              onChange={updateForm}
            />
          </Label>
        </FormField>
        <FormField>
          <Button type="submit" disabled={!validForm || isPending}>
            {transaction ? "Spara" : "Lägg till"}
          </Button>
          {transaction && (
            <Button
              type="button"
              onClick={handleDeleteTransaction}
              disabled={isPending}
            >
              Ta bort
            </Button>
          )}
        </FormField>
      </form>
    </div>
  );
};

const getInitFormState = (date: Date) => ({
  id: "notDefined",
  label: "",
  category: "OTHER" as const,
  amount: 0,
  date,
  shared: false,
});

interface Props {
  period: BudgetPeriod;
  transaction: Transaction | undefined;
  onUpdated?: Function;
}

interface Form extends Omit<Transaction, "date" | "author" | "key"> {
  date: Transaction["date"] | undefined;
}
