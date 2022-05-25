import styled from "styled-components";
import { COLOR_MEDIUM_GRAY } from "lib/colorPalette";
import { devices } from "lib/displayDevice";

import { Flex } from "components/Layout/Container/styles";

export const Container = styled.div`
  h4 {
    text-transform: capitalize;
  }

  p {
    margin: 0;
  }

  span {
    font-size: 1.125rem;
  }

  padding: 2rem 0;
`;

export const Item = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${COLOR_MEDIUM_GRAY};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.3s;
  cursor: pointer;

  &:hover {
    transform: scale(1.01);
  }

  h4 {
    margin: 0;
  }

  ${Flex} {
    margin: 0.5rem 0;

    .item-number {
      margin-right: 0.5rem;
    }
  }

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none !important;

    @media ${devices.tabletM} {
      justify-content: flex-start;
      width: 100%;
    }
  }

  ${Flex} {
    @media ${devices.tabletM} {
      flex-direction: column;
      align-items: flex-start;

      span {
        margin-bottom: 1rem;
        width: 100%;
      }

      .item-number {
        display: none;
      }
    }
  }
`;

export const PostsDescription = styled.div`
  img,
  h2,
  h1,
  h3,
  figure,
  img {
    display: none;
  }
`;
