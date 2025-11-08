import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, FormField, Label, Button } from "components/FormElements";
import { postBudgetPeriod } from "api/budget-period";
import { useAsync } from "shared/useAsync";
import { BudgetPeriod } from "shared/BudgetPeriod";
import { ActionBar } from "components/ActionBar/ActionBar";
import { useVisitor } from "components/VisitorContext/VisitorContext.useVisitor";
import { DatePicker } from "components/DatePicker";
import styled from "styled-components";

export default function CreateBudgetPeriod() {
  const visitor = useVisitor();
  const navigate = useNavigate();
  const state = useAsync<BudgetPeriod>();

  const [form, setForm] = useState<Form>({
    fromDate: new Date(),
    toDate: null,
    members: [],
  });

  useEffect(
    function navigateToCreatedBudgetPeriod() {
      if (state.status === "resolved") {
        navigate(`/period/${state.data.id}`);
      }
    },
    [state.data?.id, navigate, state.status]
  );

  async function createBudgetPeriod(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    state.run(postBudgetPeriod(form));
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
      <ActionBar title="Skapa budgetperiod" />

      <Form onSubmit={createBudgetPeriod}>
        <FormField>
          <Label>
            Från {form.fromDate?.toLocaleDateString()} <div />
          </Label>
          <DatePicker
            locale="sv"
            maxDate={form.toDate ?? undefined}
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
            minDate={form.fromDate ?? undefined}
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
                  {friend.name}
                  <Checkbox
                    type="checkbox"
                    id={friend.id}
                    name={friend.id}
                    onChange={handleUpdateMembersInForm}
                    checked={form.members.includes(friend.id)}
                  />
                </Label>
              </div>
            ))}
          </Label>
        </FormField>

        <FormField>
          <Button
            disabled={!validForm || state.status === "pending"}
            type="submit"
          >
            Skapa
          </Button>
        </FormField>
      </Form>
    </>
  );
}

type Form = Parameters<typeof postBudgetPeriod>[0];

const Form = styled.form`
  overflow: auto;
`;
