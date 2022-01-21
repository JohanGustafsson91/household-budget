import styled from "styled-components";
import { space } from "theme";

export const PageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  float: left;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const PageHeader = styled.div`
  display: flex;
  border-bottom: 1px solid grey;
  justify-content: space-between;
  padding: ${space(2)};
`;

export const PageContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${space(2)};
  overflow: hidden;
`;
