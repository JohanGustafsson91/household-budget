import { ChangeEvent, FormEvent, useState } from "react";
import { Period } from "shared";
import { categories } from "./Period.categories";
import { addDoc, collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { auth, COLLECTION, db } from "utils";
import { DatePicker, FormField } from "components/Form";
import { Transaction } from "./Period.Transaction";
import shortid from "shortid";

export const TransactionForm = ({
  period,
  updateTransaction,
  onUpdated,
}: Props) => {
  const initState = {
    id: updateTransaction !== true ? updateTransaction.id : "notDefined",
    label: updateTransaction !== true ? updateTransaction.label : "",
    category:
      updateTransaction !== true
        ? updateTransaction.category
        : ("OTHER" as const),
    amount: updateTransaction !== true ? updateTransaction.amount : 0,
    date: updateTransaction !== true ? updateTransaction.date : period.fromDate,
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
      id: shortid(),
    }).catch(() => {
      // TODO handle error
      return undefined;
    });

    result && setForm(initState);
  }

  function handleUpdateTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (updateTransaction === true) return;

    setDoc(
      doc(db, COLLECTION["transactions"], updateTransaction.id),
      { ...form, lastUpdated: new Date() },
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

  const validForm = Object.values(form).every(Boolean);

  return (
    <div>
      <h5>{updateTransaction === true ? "Lägg till" : "Ändra"}</h5>
      <form
        onSubmit={
          updateTransaction !== true ? handleUpdateTransaction : addTransaction
        }
      >
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
            {updateTransaction === true ? "Lägg till" : "Spara"}
          </button>
          {updateTransaction !== true && (
            <button onClick={deleteTransaction}>Ta bort</button>
          )}
        </FormField>
      </form>
    </div>
  );
};

interface Props {
  period: Period;
  updateTransaction: Transaction | true;
  onUpdated?: Function;
}

interface Form extends Omit<Transaction, "date" | "author" | "key"> {
  date: Transaction["date"] | undefined;
}
