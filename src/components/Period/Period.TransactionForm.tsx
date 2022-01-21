import { ChangeEvent, FormEvent, useState } from "react";
import { Period } from "shared";
import { categories, Category } from "./Period.categories";
import { addDoc, collection } from "firebase/firestore";
import { auth, COLLECTION, db } from "utils";
import { DatePicker, FormField } from "components/Form";
import { Transaction } from "./Period.Transaction";

export const TransactionForm = ({ period }: Props) => {
  const initState = {
    label: "",
    category: "OTHER" as const,
    amount: 0,
    date: period.fromDate,
  };

  const [form, setForm] = useState<Form>(initState);

  function updateForm(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
    }).catch(() => {
      // TODO handle error
      return undefined;
    });

    result && setForm(initState);
  }

  const validForm = Object.values(form).every(Boolean);

  return (
    <div>
      <h5>Lägg till</h5>
      <form onSubmit={addTransaction}>
        <FormField>
          <label>
            Belopp
            <input
              name="amount"
              type="number"
              min="1"
              max="1000000"
              value={form.amount}
              onChange={updateForm}
            />
          </label>
        </FormField>
        <FormField>
          <label>
            Händelse
            <input name="label" value={form.label} onChange={updateForm} />
          </label>
        </FormField>
        <FormField>
          <label>
            Kategori
            <select name="category" value={form.category} onChange={updateForm}>
              {categories.map((category) => (
                <option key={category.type} value={category.type}>
                  {category.text}
                </option>
              ))}
            </select>
          </label>
        </FormField>
        <FormField>
          <label>Datum {form.date?.toLocaleDateString()}</label>
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
          <button type="submit" disabled={!validForm}>
            Lägg till
          </button>
        </FormField>
      </form>
    </div>
  );
};

interface Props {
  period: Period;
}

interface Form extends Omit<Transaction, "date" | "author" | "key"> {
  date: Transaction["date"] | undefined;
}
