import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, DatePicker, FormField, Input, Label } from "components/Form";
import { ActionBarTitle } from "components/ActionBar";
import { postBudgetPeriod } from "api/budgetPeriod";
import { useVisitor } from "components/App/App.VisitorProvider";

export const CreateBudgetPeriod = () => {
  const visitor = useVisitor();
  const navigate = useNavigate();

  const [form, setForm] = useState<Form>({
    fromDate: new Date(),
    toDate: null,
    members: [],
  });

  async function createBudgetPeriod(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await postBudgetPeriod(form).catch(() => undefined);
    result && navigate(`/period/${result.id}`);
  }

  function handleUpdateDateInForm(name: "fromDate" | "toDate") {
    return (newDate: Date | null) =>
      newDate && setForm((prev) => ({ ...prev, [name]: newDate }));
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

      <form onSubmit={createBudgetPeriod}>
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

        <FormField>
          <Label>
            Tillsammans med?
            {visitor.friends.map((friend) => (
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

        <FormField>
          <Button disabled={!validForm} type="submit">
            Skapa
          </Button>
        </FormField>
      </form>
    </>
  );
};

type Form = Parameters<typeof postBudgetPeriod>[0];
