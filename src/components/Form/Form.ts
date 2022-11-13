import styled, { css } from "styled-components";
import { breakpoint, fontSize, space } from "theme";

export const FormField = styled.div`
  margin-bottom: ${space(2)};
`;

const inputStyle = css`
  border: 0;
  background-color: var(--color-form-element-background);
  padding: ${space(2)};
  border-radius: ${space(1)};
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
  padding: ${space(2)};
  border-radius: ${space(1)};
  outline: 0;
  border: 1px solid #dddddd;
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
  ${inputStyle};
`;
