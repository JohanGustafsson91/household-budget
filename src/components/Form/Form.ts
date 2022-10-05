import styled from "styled-components";
import { fontSize, space } from "theme";

export const FormField = styled.div`
  margin-bottom: ${space(3)};
`;

export const Input = styled.input`
  border: 0;
  border-bottom: 1px solid #ccc;
  background-color: #fff;
`;

export const Label = styled.label`
  font-size: ${fontSize(0)};

  input,
  select,
  div {
    margin-top: ${space(1)};
    font-size: ${fontSize(2)};
    display: block;
  }
`;

export const Select = styled.select`
  border: 0;
  border-bottom: 1px solid #ccc;
  background-color: #fff;
`;

export const Button = styled.button``;
