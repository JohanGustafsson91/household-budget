import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { BudgetPeriod } from "shared";
import {
  FormField,
  DatePicker,
  Input,
  Label,
  Select,
  Checkbox,
} from "components/Form";
import { Button } from "components/Button";
import { putTransaction, deleteTransaction } from "api/transaction";
import { CardTitle } from "components/Card";
import { useAsync } from "shared/useAsync";
import { Transaction } from "./types";
import { categories } from "shared/categories";

export const UpdateTransaction = ({
  period,
  transaction,
  onUpdated,
}: Props) => {
  const { status: statusUpdatedOrDeleted, run: runUpdateOrDelete } = useAsync();

  const [form, setForm] = useState<Form>(() => ({
    id: transaction.id,
    label: transaction.label,
    category: transaction.category,
    amount: transaction.amount,
    date: transaction.date,
    shared: transaction.shared,
  }));

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

  function handleUpdateTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    runUpdateOrDelete(
      putTransaction(transaction.id, {
        ...form,
        date: form.date ?? new Date(),
        shared: form.shared ? true : false,
        lastUpdated: new Date(),
      })
    );
  }

  const validForm = Object.values(form).every((val) => val !== "" || val !== 0);
  const isPending = [statusUpdatedOrDeleted].includes("pending");

  return (
    <div>
      <CardTitle>Ändra</CardTitle>
      <form onSubmit={handleUpdateTransaction}>
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
            onChange={(newDate) =>
              newDate && setForm((prev) => ({ ...prev, date: newDate }))
            }
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
            Spara
          </Button>
          <Button
            type="button"
            onClick={() => runUpdateOrDelete(deleteTransaction(transaction.id))}
            disabled={isPending}
          >
            Ta bort
          </Button>
        </FormField>
      </form>
    </div>
  );
};

interface Props {
  period: BudgetPeriod;
  transaction: Transaction;
  onUpdated?: Function;
}

interface Form extends Omit<Transaction, "date" | "author" | "key"> {
  date: Transaction["date"] | undefined;
}
