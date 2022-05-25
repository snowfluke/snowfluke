import { StringProps } from "lib/types";
import styled from "styled-components";
import { devices } from "lib/displayDevice";
import {
  COLOR_LIGHT_GRAY,
  COLOR_BLACK,
  COLOR_DARK_GRAY,
  COLOR_WHITE,
} from "lib/colorPalette";

export const FooterContainer = styled.footer<StringProps>`
  margin-bottom: 2rem;

  hr {
    width: 100%;
    margin-bottom: 1rem;
    border-top-width: 1px;
    height: 0;
    border-color: ${({ darkTheme }) =>
      darkTheme ? COLOR_BLACK : COLOR_LIGHT_GRAY};
  }

  a {
    color: ${({ darkTheme }) => (darkTheme ? COLOR_DARK_GRAY : COLOR_BLACK)};
    transition: all 0.3s;

    &:hover {
      color: ${({ darkTheme }) => (darkTheme ? COLOR_WHITE : COLOR_BLACK)};
    }
  }

  .active {
    color: ${({ darkTheme }) => (darkTheme ? COLOR_WHITE : COLOR_BLACK)};
  }
`;

export const GridContainer = styled.div`
  padding-bottom: 4rem;
  gap: 1rem;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media ${devices.tabletM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const FlexLinks = styled.div`
  flex-direction: column;
  display: flex;

  a {
    margin-top: 1rem;
  }
`;
