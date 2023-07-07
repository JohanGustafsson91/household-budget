import styled from "styled-components";
import { fontSize, space } from "shared/theme";

export const CardTitle = styled.span`
  text-transform: uppercase;
  ${space({ mb: 3 })};
  font-size: ${fontSize(0)};
  font-weight: 500;
  display: block;
`;
