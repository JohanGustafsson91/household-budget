import { login } from "api/auth";
import { FormField, Input } from "components/Form";
import { Button } from "components/Button";
import React, { useState } from "react";
import { useAsync } from "shared/useAsync";
import styled from "styled-components";

export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "", error: "" });
  const { run, status } = useAsync<undefined>();

  function updateForm(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
      error: "",
    }));
  }

  return (
    <Wrapper>
      <Form
        onSubmit={function handleLogin(e: React.FormEvent) {
          e.preventDefault();
          run(login(form.email, form.password));
        }}
      >
        <Header>Hushållsbudget</Header>

        <FormField>
          <Input
            name="email"
            type="text"
            placeholder="Ange email"
            value={form.email}
            onChange={updateForm}
            autoComplete="email"
          />
        </FormField>
        <FormField>
          <Input
            name="password"
            type="password"
            placeholder="Ange lösenord"
            value={form.password}
            onChange={updateForm}
            autoComplete="current-password"
          />
        </FormField>
        <ErrorMessage>
          {status === "rejected" ? "Ange korrekt email och/eller lösenord" : ""}
        </ErrorMessage>

        <p>
          <Button type="submit" disabled={status === "pending"}>
            Logga in
          </Button>
        </p>
      </Form>
    </Wrapper>
  );
};

const Header = styled.h1``;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Form = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  align-self: center;
`;

const ErrorMessage = styled.p`
  color: red;
`;
