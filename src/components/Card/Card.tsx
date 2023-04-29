import styled from "styled-components";
import { fontSize, space__deprecated } from "theme";

export const Card = styled.div<{ height?: string }>`
  padding: ${space__deprecated(3)};
  margin-bottom: ${space__deprecated(3)};
  min-height: ${(props) => props.height ?? "auto"};
  height: ${(props) => props.height ?? "auto"};
  background-color: var(--color-background-card);
  border-radius: ${space__deprecated(2)};
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  cursor: ${(props) => (props.onClick ? "pointer" : "default")};
`;

export const CardTitle = styled.span`
  text-transform: uppercase;
  margin-bottom: ${space__deprecated(3)};
  font-size: ${fontSize(0)};
  font-weight: 500;
  display: block;
`;
