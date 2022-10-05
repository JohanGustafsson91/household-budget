import { useUser } from "components/App/App.UserProvider";
import { ChangeEvent, FormEvent, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, COLLECTION, db } from "utils";
import { useNavigate } from "react-router-dom";
import { Period } from "shared";
import { Button, DatePicker, FormField, Input, Label } from "components/Form";
import shortid from "shortid";
import { ActionBarTitle } from "components/ActionBar";

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
      <ActionBarTitle title="Skapa budgetperiod" />

      <form onSubmit={createPeriod}>
        <FormField>
          <Label>
            Från {form.fromDate?.toLocaleDateString()} <div />
          </Label>
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
          <Label>
            Till {form.toDate?.toLocaleDateString()} <div />
          </Label>
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
            <Label>
              Tillsammans med?
              {user.data.friends.map((friend) => (
                <div key={friend.id}>
                  <Label>
                    <Input
                      type="checkbox"
                      id={friend.id}
                      name={friend.id}
                      onChange={handleUpdateMembersInForm}
                      checked={form.members.includes(friend.id)}
                    />
                    {friend.name}
                  </Label>
                </div>
              ))}
            </Label>
          </FormField>
        )}
        <FormField>
          <Button disabled={!validForm} type="submit">
            Skapa
          </Button>
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
