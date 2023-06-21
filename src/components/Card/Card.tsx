import styled from "styled-components";
import { fontSize, space__deprecated } from "theme";

export const CardTitle = styled.span`
  text-transform: uppercase;
  margin-bottom: ${space__deprecated(3)};
  font-size: ${fontSize(0)};
  font-weight: 500;
  display: block;
`;
