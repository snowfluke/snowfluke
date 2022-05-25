import styled from "styled-components";
import { COLOR_BLACK, COLOR_WHITE } from "lib/colorPalette";
import { StringProps } from "lib/types";

export const ScrollUpContainer = styled.div<StringProps>`
  padding: 12px 13px;
  width: max-content;
  cursor: pointer;
  background-color: ${({ darkTheme }) =>
    darkTheme ? COLOR_WHITE : COLOR_BLACK};
  text-align: center;
  align-items: center;
  display: flex;
  border-radius: 50%;

  svg {
    width: 15px;
    height: 15px;

    path {
      stroke: ${({ darkTheme }) => (darkTheme ? COLOR_BLACK : COLOR_WHITE)};
    }
  }
`;
