import styled from "styled-components";
import { fontSize, space } from "theme";

export const Card = styled.div<{ height?: string }>`
  padding: ${space(3)};
  margin-bottom: ${space(3)};
  min-height: ${(props) => props.height ?? "auto"};
  height: ${(props) => props.height ?? "auto"};
  background-color: var(--color-background-card);
  border-radius: ${space(2)};
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  cursor: ${(props) => (props.onClick ? "pointer" : "default")};
`;

export const CardContent = styled.div`
  flex: 1;
`;

export const CardTitle = styled.span`
  text-transform: uppercase;
  margin-bottom: ${space(3)};
  font-size: ${fontSize(0)};
  font-weight: 500;
  display: block;
`;

export const CardCol = styled.div`
  color: var(--color-text-strong);
`;

export const CardRow = styled.div`
  margin-bottom: ${space(1)};
  border-bottom: 1px solid var(--color-border);
  display: flex;
  padding: ${space(2)} 0;

  ${CardCol} {
    &:first-child {
      flex: 1;
    }
  }

  &:last-child {
    margin-top: ${space(2)};
    border: 0;
    font-weight: bold;
    margin-bottom: 0;
  }
`;
