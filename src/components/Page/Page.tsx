import styled from "styled-components";
import { space } from "theme";

export const pagePadding = space(3);

export const PageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  float: left;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const PageContent = styled.div<{ overflowHidden?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${pagePadding};
  overflow: auto;

  ${(props) =>
    props.overflowHidden &&
    `
  overflow: hidden;
`}
`;
