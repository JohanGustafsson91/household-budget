import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Period } from "shared";
import { categories } from "./Period.categories";
import {
  FormField,
  DatePicker,
  Input,
  Label,
  Select,
  Button,
} from "components/Form";
import { Transaction } from "./Period.Transaction";
import shortid from "shortid";
import { postTransaction } from "api/postTransaction";
import { getAuth } from "api/auth";
import { putTransaction } from "api/putTransaction";
import { deleteTransaction } from "api/deleteTransaction";

export const TransactionForm = ({
  period,
  updateTransaction,
  onUpdated,
}: Props) => {
  const [form, setForm] = useState<Form>(() =>
    updateTransaction === true
      ? getInitFormState(period.fromDate)
      : {
          id: updateTransaction.id,
          label: updateTransaction.label,
          category: updateTransaction.category,
          amount: updateTransaction.amount,
          date: updateTransaction.date,
          shared: updateTransaction.shared,
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

  function updateForm(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        "checked" in e.target && e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    }));
  }

  function handleUpdateDateInForm(name: "date") {
    return (newDate: Date | null) => {
      newDate && setForm((prev) => ({ ...prev, [name]: newDate }));
    };
  }

  async function addTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = await postTransaction({
      ...form,
      author: getAuth()?.currentUser?.uid ?? "",
      createdAt: new Date(),
      lastUpdated: new Date(),
      periodId: period.id,
      id: shortid(),
      date: form.date ?? new Date(),
    }).catch(() => {
      return undefined;
    });

    result && setForm(getInitFormState(period.fromDate));
  }

  function handleUpdateTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (updateTransaction === true) return;

    putTransaction(updateTransaction.id, {
      ...form,
      date: form.date ?? new Date(),
      shared: form.shared ? true : false,
      lastUpdated: new Date(),
    }).catch(() => {
      // TODO handle
    });

    onUpdated?.();
  }

  async function handleDeleteTransaction() {
    if (updateTransaction === true) return;
    await deleteTransaction(updateTransaction.id).catch(() => {
      // TODO handle
    });
    onUpdated?.();
  }

  const validForm = Object.values(form).every((val) => val !== "" || val !== 0);

  return (
    <div>
      <h5>{updateTransaction === true ? "Lägg till" : "Ändra"}</h5>
      <form
        onSubmit={
          updateTransaction !== true ? handleUpdateTransaction : addTransaction
        }
      >
        <FormField>
          <Label>
            Belopp
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
            onChange={handleUpdateDateInForm("date")}
            minDate={period.fromDate}
            maxDate={period.toDate}
            inline
          />
        </FormField>
        <FormField>
          <Label>
            Gemensam?
            <Input
              name="shared"
              type="checkbox"
              checked={form.shared}
              onChange={updateForm}
            />
          </Label>
        </FormField>
        <FormField>
          <Button type="submit" disabled={!validForm}>
            {updateTransaction === true ? "Lägg till" : "Spara"}
          </Button>
          {updateTransaction !== true && (
            <Button type="button" onClick={handleDeleteTransaction}>
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
  period: Period;
  updateTransaction: Transaction | true;
  onUpdated?: Function;
}

interface Form extends Omit<Transaction, "date" | "author" | "key"> {
  date: Transaction["date"] | undefined;
}
