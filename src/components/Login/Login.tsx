import { signInWithEmailAndPassword } from "@firebase/auth";
import React, { useState } from "react";
import styled from "styled-components";
import { auth } from "utils/firebase";

export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "", error: "" });

  const updateForm = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
      error: "",
    }));

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, form.email, form.password).catch(() =>
      setForm((prevState) => ({
        ...prevState,
        error: "Enter correct email or password",
      }))
    );
  };

  return (
    <Wrapper>
      <Form onSubmit={login}>
        <Header>Household budget</Header>
        <input
          name="email"
          type="text"
          placeholder="Enter email"
          value={form.email}
          onChange={updateForm}
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Enter password"
          value={form.password}
          onChange={updateForm}
          autoComplete="current-password"
        />
        {form.error && <ErrorMessage>{form.error}</ErrorMessage>}

        <p>
          <button type="submit">Login</button>
        </p>
      </Form>
    </Wrapper>
  );
};

const Header = styled.h2``;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-width: 300px;
  align-self: center;
`;

const ErrorMessage = styled.p``;
