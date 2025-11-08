import styled, { css } from "styled-components";
import { breakpoint, fontSize, space } from "shared/theme";

export const FormField = styled.div`
  ${space({ mb: 3 })};
`;

const inputStyle = css`
  background-color: var(--color-form-element-background);
  ${space({ p: 2 })};
  border-radius: var(--radius-md);
  outline: 0;
  border: 1px solid var(--color-border);
  font-size: ${fontSize(2)};
  color: var(--color-text-strong);
  width: 100%;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  font-family: inherit;

  &:hover {
    border-color: var(--color-background-action-bar);
  }

  &:focus {
    border-color: var(--color-background-action-bar);
    box-shadow: 0 0 0 3px rgba(3, 56, 165, 0.1);
    outline: none;
  }

  &:disabled {
    background-color: #F1F5F9;
    cursor: not-allowed;
    opacity: 0.6;
  }

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
  resize: vertical;
  line-height: 1.5;

  ${breakpoint(1)} {
    max-width: unset;
  }
`;

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-base);
  
  &:hover {
    border-color: var(--color-background-action-bar);
  }

  &:checked {
    accent-color: var(--color-background-action-bar);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const Label = styled.label`
  font-size: ${fontSize(1)};
  font-weight: 500;
  color: var(--color-text-strong);
  display: block;

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
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23687F9A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 20px;
  padding-right: 36px;
`;

export const Button = styled.button`
  background-color: var(--color-background-action-bar);
  color: var(--color-text-action-bar);
  border: none;
  border-radius: var(--radius-md);
  ${space({ px: 3, py: 1 })};
  font-size: ${fontSize(1)};
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
  font-family: inherit;
  ${space({ mr: 2, mb: 2 })};
  
  &:hover:not(:disabled) {
    background-color: #0246B8;
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }

  &:disabled {
    background-color: #CBD5E1;
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  &:focus-visible {
    outline: 2px solid var(--color-background-action-bar);
    outline-offset: 2px;
  }
`;

export const DangerButton = styled(Button)`
  background-color: #dc3545;
  
  &:hover:not(:disabled) {
    background-color: #c82333;
  }
  
  &:focus-visible {
    outline: 2px solid #dc3545;
    outline-offset: 2px;
  }
`;
