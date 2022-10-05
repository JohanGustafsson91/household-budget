import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Period } from "shared";
import { categories } from "./Period.categories";
import { addDoc, collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { auth, COLLECTION, db } from "utils";
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

    const result = await addDoc(collection(db, COLLECTION["transactions"]), {
      ...form,
      author: auth?.currentUser?.uid,
      createdAt: new Date(),
      lastUpdated: new Date(),
      periodId: period.id,
      id: shortid(),
    }).catch(() => {
      // TODO handle error
      return undefined;
    });

    result && setForm(getInitFormState(period.fromDate));
  }

  function handleUpdateTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (updateTransaction === true) return;

    setDoc(
      doc(db, COLLECTION["transactions"], updateTransaction.id),
      { ...form, shared: form.shared ? true : false, lastUpdated: new Date() },
      { merge: true }
    ).catch(() => {
      // TODO handle
    });
    onUpdated?.();
  }

  async function deleteTransaction() {
    if (updateTransaction === true) return;
    await deleteDoc(
      doc(db, COLLECTION["transactions"], updateTransaction.id)
    ).catch(() => {
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
            <Button type="button" onClick={deleteTransaction}>
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
