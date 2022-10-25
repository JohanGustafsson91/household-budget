import styled from "styled-components";
import { fontSize, space } from "theme";
import swishIcon from "./swish.png";

const genderColorMap = {
  male: "rgba(144, 238, 144, 0.2)",
  female: "rgba(255, 182, 193, 0.2)",
  none: "var(--color-form-element-background)",
};

export const Wrapper = styled.div<{
  gender: "none" | "male" | "female";
}>`
  position: relative;
  border: 1px solid var(--color-border);
  padding: ${space(1)};
  margin-bottom: ${space(2)};
  font-size: ${fontSize(0)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  background-color: ${(props) => genderColorMap[props.gender]};
`;

export const Row = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;

  &:first-child {
    margin-bottom: ${space(4)};
  }
`;

export const Column = styled.div<{
  highlight?: boolean;
  big?: boolean;
}>`
  color: ${(props) =>
    props.highlight ? "var(--color-text-strong)" : "inherit"};
  font-weight: ${(props) => (props.big ? "bold" : "normal")};
  font-size: ${(props) => (props.big ? fontSize(1) : "inherit")};
`;

export const SwishIcon = styled.img`
  position: absolute;
  height: 25px;
  width: 25px;
  top: calc(50% - 25px / 2);
  left: calc(50% - 25px / 2);
`;
SwishIcon.defaultProps = {
  src: swishIcon,
  alt: "Swish icon",
};
