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
import { postTransaction } from "api/transaction";
import { getAuth } from "api/auth";
import { CardTitle } from "components/Card";
import { useAsync } from "shared/useAsync";

export const CreateTransaction = ({ period }: Props) => {
  const { status, setIdle, run } = useAsync();

  const [form, setForm] = useState<Form>(() =>
    getInitFormState(period.fromDate)
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
      if (status === "resolved") {
        setForm(getInitFormState(period.fromDate));
        setIdle();
      }
    },
    [period.fromDate, setIdle, status]
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

  function addTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    run(
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

  const validForm = Object.values(form).every((val) => val !== "" || val !== 0);

  return (
    <div>
      <CardTitle>Lägg till</CardTitle>
      <form onSubmit={addTransaction}>
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
            onChange={function handleUpdateDateInForm(newDate: Date | null) {
              newDate && setForm((prev) => ({ ...prev, date: newDate }));
            }}
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
          <Button type="submit" disabled={!validForm || status === "pending"}>
            Lägg till
          </Button>
        </FormField>
      </form>
    </div>
  );
};

function getInitFormState(date: Date): Form {
  return {
    label: "",
    category: "OTHER" as const,
    amount: 0,
    date,
    shared: false,
  };
}

interface Props {
  period: BudgetPeriod;
}

interface Form extends Omit<Transaction, "date" | "author" | "key" | "id"> {
  date: Transaction["date"] | undefined;
}
