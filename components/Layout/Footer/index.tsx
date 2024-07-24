import { Navigation } from "components/Layout/Navigation";
import { ExternalLinkProps, StringProps } from "lib/types";
import ScrollToTop from "components/Layout/ScrollToTop";

import { Flex, StyledContainer } from "components/Layout/Container/styles";
import {
  FooterContainer,
  GridContainer,
  FlexLinks,
} from "components/Layout/Footer/styles";

const ExternalLink = ({ href, children }: ExternalLinkProps) => (
  <a target="_blank" rel="noopener noreferrer" href={href}>
    {children}
  </a>
);

export const Footer = ({ darkTheme }: StringProps) => {
  return (
    <FooterContainer darkTheme={darkTheme}>
      <StyledContainer>
        <Flex justify="center" direction="column">
          <hr />
          <GridContainer>
            <FlexLinks>
              <Navigation href="/" text="Home" />
              <Navigation href="/blog" text="Blog" />
              <Navigation href="/project" text="Project" />
            </FlexLinks>
            <FlexLinks>
              <ExternalLink href="https://facebook.com/awalAriansyah">
                Facebook
              </ExternalLink>
              <ExternalLink href="https://github.com/snowfluke">
                GitHub
              </ExternalLink>
              <ExternalLink href="https://www.linkedin.com/in/awalariansyah/">
                LinkedIn
              </ExternalLink>
            </FlexLinks>
            <FlexLinks>
              <ExternalLink href="https://twitter.com/akasha_seeker">
                Twitter
              </ExternalLink>
              <ExternalLink href="https://instagram.com/mencari_akhir/">
                Instagram
              </ExternalLink>
              <ExternalLink href="https://www.youtube.com/channel/UChiE4jEOX06biZZqoa6Brkg">
                YouTube
              </ExternalLink>
            </FlexLinks>
          </GridContainer>
          <ScrollToTop darkTheme={darkTheme} />
        </Flex>
      </StyledContainer>
    </FooterContainer>
  );
};
