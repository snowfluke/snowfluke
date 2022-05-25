import styled, { createGlobalStyle } from "styled-components";

import { StringProps, WrapperProps } from "lib/types";
import { devices } from "lib/displayDevice";
import {
  COLOR_BLUE,
  COLOR_BLACK,
  COLOR_LIGHT_GRAY,
  COLOR_DARK_GRAY,
  COLOR_WHITE,
  COLOR_LIGHT_CREAM,
  COLOR_DARK_CREAM,
} from "lib/colorPalette";

export const Section = styled.section`
  display: grid;
  grid-template-columns:
    minmax(6rem, auto) minmax(0, 78rem)
    minmax(6rem, auto);
  grid-gap: calc(12rem * 0.75) 0;
  gap: calc(12rem * 0.75) 0;

  @media ${devices.desktopM} {
    grid-template-columns:
      minmax(4.5rem, auto) minmax(0, 78rem)
      minmax(4.5rem, auto);
  }

  @media ${devices.tabletM} {
    grid-template-columns:
      minmax(3rem, auto) minmax(0, 78rem)
      minmax(3rem, auto);
  }

  @media ${devices.mobileL} {
    display: grid;
    grid-template-columns:
      minmax(1.5rem, auto) minmax(0, 78rem)
      minmax(1.5rem, auto);
    grid-gap: 3rem 0;
    gap: 3rem 0;
  }
`;

export const SectionWrapper = styled.div`
  display: grid;
  grid-column: 2;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 3rem;
  gap: 3rem;
  grid-auto-flow: dense;

  @media ${devices.tabletM} {
    grid-template-columns: none;
    grid-gap: 0;
    gap: 0;
  }
`;

export const SectionGrid = styled.div`
  grid-column: 1/13;
  display: grid;
`;

export const Flex = styled.div<StringProps>`
  display: flex;
  align-items: ${({ align }) => (align ? align : "center")};
  justify-content: ${({ justify }) => (justify ? justify : "space-between")};
  flex-direction: ${({ direction }) => (direction ? direction : "row")};
`;

export const StyledContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 56rem;
  margin: 0 auto;

  figure {
    margin: 0;

    img {
      width: 100%;
      overflow: hidden;
      border-radius: 12px;
    }
  }
`;

export const Main = styled.main<WrapperProps>`
  margin: 2rem auto;
  max-width: 55rem;
  width: 100%;

  h2 {
    margin-bottom: 4rem;
  }
`;

export const StyledHTML = createGlobalStyle<StringProps>` 
  body {
      background-color: ${({ darkTheme }) =>
        darkTheme ? COLOR_BLACK : COLOR_WHITE};

    strong, .color-black {
      color: ${({ darkTheme }) => (darkTheme ? COLOR_WHITE : COLOR_BLACK)};
      &:hover {
        text-decoration: none;
        outline: none;
      }
    }

    pre {
      background-color: ${({ darkTheme }) =>
        darkTheme ? COLOR_DARK_CREAM : COLOR_LIGHT_CREAM};
      color: ${COLOR_BLACK};

      strong {
          color: ${COLOR_BLACK};
      }
    }

    button {
        background-color: ${({ darkTheme }) =>
          darkTheme ? COLOR_WHITE : COLOR_BLACK};
        color: ${({ darkTheme }) => (darkTheme ? COLOR_BLACK : COLOR_WHITE)};
    }

    h2, h5 {
      color: ${({ darkTheme }) => (darkTheme ? COLOR_LIGHT_GRAY : COLOR_BLACK)};
    }
    
    a {
      color: ${({ darkTheme }) => (darkTheme ? COLOR_WHITE : COLOR_BLUE)};
    }

    ul, p, span {
      color: ${({ darkTheme }) => (darkTheme ? COLOR_DARK_GRAY : COLOR_BLACK)};
    }
    
    a:hover, .active {
        text-decoration: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 6px;
    }
}`;
