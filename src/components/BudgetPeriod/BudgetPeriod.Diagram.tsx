import styled from "styled-components";
import { breakpoint, fontSize, space } from "shared/theme";

export const DiagramContainer = styled.div`
  display: flex;
  overflow-x: auto;
  flex: 1;
`;

export const PopupSum = styled.div<{ floatfrom?: "left" | "right" | "none" }>`
  background-color: #bfefc6;
  font-weight: bold;
  font-size: ${fontSize(3)};
  position: absolute;
  ${space({ p: 3 })};
  border-radius: 5px;
  text-align: center;
  display: none;
  z-index: 1;

  ${({ floatfrom = "none" }) =>
    ({
      left: `left: 0;`,
      right: `right: 0;`,
      none: "",
    }[floatfrom])}

  ${breakpoint(0)} {
    left: auto;
    right: auto;
  }
`;

export const DiagramCategory = styled.div<{ active?: boolean }>`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: white;
  ${space({ p: 2 })}
  min-width: 75px;
  align-items: center;
  cursor: pointer;
  overflow: visible;

  &:hover {
    ${PopupSum} {
      display: block;
    }
  }

  ${(props) =>
    props.active
      ? `
${PopupSum} {
  display: block;
}
  `
      : ""}
`;

export const DiagramBarWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  align-items: flex-end;
  ${space({ mb: 1 })}
`;

export const DiagramBar = styled.div<{ height: number; active?: boolean }>`
  display: flex;
  height: ${(props) => props.height}%;
  background-color: ${(props) => (props.active ? "#C3A2ED" : "#313131")};
  width: 100%;
  align-self: flex-end;
  color: #fff;
  align-items: flex-end;
  border-radius: 10px;
`;

export const DiagramBarPercentage = styled.div`
  ${space({ py: 2 })}
  width: 100%;
  height: auto;
  text-align: center;
  font-size: ${fontSize(3)};
  text-shadow: 0px 0px 1px #313131, -1px -1px 1px #313131, 1px -1px 1px #313131,
    -1px 1px 1px #313131, 1px 1px 1px #313131;
`;

export const DiagramText = styled.span``;

export const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  ${space({ mb: 3 })};
`;

export const Overview = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const List = styled.div`
  flex: 2;
  overflow-y: auto;
`;

export const ListItem = styled.div`
  display: flex;
  align-items: center;
  ${space({ mb: 3, py: 1 })}
`;

export const ListItemValue = styled.div<{ flex?: number; minWidth?: string }>`
  ${space({ mr: 3 })}
  ${(props) => (props.flex ? `flex: ${props.flex}` : "")};
  min-width: ${(props) => props.minWidth ?? "none"};
`;

export const TransactionName = styled.p`
  font-size: ${fontSize(2)};
  ${space({ m: 0 })};
  font-weight: 700;
  color: var(--color-dark);
`;

export const TransactionInfo = styled.div`
  font-size: ${fontSize(0)};
`;

export const Title = styled.h1`
  font-size: ${fontSize(2)};
  color: #c2c2c2;
  ${space({ m: 0, mb: 1 })};
  font-weight: normal;
`;

export const Money = styled.h2`
  color: #313131;
  font-size: ${fontSize(5)};
  ${space({ m: 0, mb: 2 })}
  font-weight: 500;
`;
