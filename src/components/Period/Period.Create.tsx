import { useUser } from "components/App/App.UserProvider";
import { ChangeEvent, FormEvent, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, COLLECTION, db } from "utils";
import { useNavigate } from "react-router-dom";
import { Period } from "shared";
import { DatePicker, FormField } from "components/Form";
import shortid from "shortid";

export const PeriodCreate = () => {
  const user = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState<Form>({
    fromDate: new Date(),
    toDate: null,
    members: [],
  });

  async function createPeriod(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = await addDoc(collection(db, COLLECTION["budgetPeriods"]), {
      ...form,
      members: [...form.members, auth.currentUser?.uid],
      author: auth?.currentUser?.uid,
      createdAt: new Date(),
      lastUpdated: new Date(),
      key: shortid(),
    }).catch(() => {
      // TODO handle error
      return undefined;
    });

    result && navigate(`/period/${result.id}`);
  }

  function handleUpdateDateInForm(name: "fromDate" | "toDate") {
    return (newDate: Date | null) => {
      newDate && setForm((prev) => ({ ...prev, [name]: newDate }));
    };
  }

  function handleUpdateMembersInForm(e: ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      members: checked
        ? [...prev.members, name]
        : prev.members.filter((member) => member !== name),
    }));
  }

  const validForm = Object.values(form).every(Boolean);

  return (
    <>
      <h3>Skapa budgetperiod</h3>

      <form onSubmit={createPeriod}>
        <FormField>
          <label>Från {form.fromDate?.toLocaleDateString()}</label>
          <DatePicker
            locale="sv"
            maxDate={form.toDate}
            name="fromDate"
            selected={form.fromDate}
            onChange={handleUpdateDateInForm("fromDate")}
            inline
          />
        </FormField>
        <FormField>
          <label>Till {form.toDate?.toLocaleDateString()}</label>
          <DatePicker
            locale="sv"
            name="toDate"
            minDate={form.fromDate}
            selected={form.toDate}
            onChange={handleUpdateDateInForm("toDate")}
            inline
          />
        </FormField>

        {user.status === "resolved" && (
          <FormField>
            <label>
              Tillsammans med?
              {user.data.friends.map((friend) => (
                <div key={friend.id}>
                  <label>
                    <input
                      type="checkbox"
                      id={friend.id}
                      name={friend.id}
                      onChange={handleUpdateMembersInForm}
                      checked={form.members.includes(friend.id)}
                    />
                    {friend.name}
                  </label>
                </div>
              ))}
            </label>
          </FormField>
        )}
        <FormField>
          <button disabled={!validForm} type="submit">
            Skapa
          </button>
        </FormField>
      </form>
    </>
  );
};

interface Form {
  fromDate: Period["fromDate"] | null;
  toDate: Period["toDate"] | null;
  members: Period["members"];
}
