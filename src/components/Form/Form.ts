import styled, { css } from "styled-components";
import { breakpoint, fontSize, space } from "theme";

export const FormField = styled.div`
  ${space({ mb: 2 })};
`;

const inputStyle = css`
  border: 0;
  background-color: var(--color-form-element-background);
  ${space({ p: 2 })};
  border-radius: 4px;
  outline: 0;
  border: 1px solid #dddddd;

  width: 100%;

  ${breakpoint(1)} {
    max-width: 300px;
  }
`;

export const Input = styled.input`
  ${inputStyle}
`;

export const Textarea = styled.textarea`
  ${inputStyle}
  height: 300px;

  ${breakpoint(1)} {
    max-width: unset;
  }
`;

export const Checkbox = styled.input`
  border: 0;
  background-color: var(--color-form-element-background);
  ${space({ p: 2 })};
  border-radius: 4px;
  outline: 0;
  border: 1px solid #dddddd;
`;

export const Label = styled.label`
  font-size: ${fontSize(0)};

  input,
  select,
  div {
    ${space({ mt: 1 })};
    font-size: ${fontSize(2)};
    display: block;
  }
`;

export const Select = styled.select`
  ${inputStyle};
`;
