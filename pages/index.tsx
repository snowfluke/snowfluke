import Link from "next/link";
import styled from "styled-components";
import Image from "next/image";
import { Projects } from "components/Projects";
import Container from "components/Layout/Container";
import { StringProps } from "lib/types";
import { devices } from "lib/displayDevice";

import { Education } from "components/Education";
import { Flex } from "components/Layout/Container/styles";

import ProfilePicture from "public/assets/png/Awal.png";
import { Work } from "components/Work";

export default function Home() {
  return (
    <Container>
      <HeroFlex align="flex-start">
        <ContentWrapper>
          <h1>Awal Ariansyah</h1>
          <h2>Software Engineer</h2>
          <p>
            Adaptive Node.js Software Engineer with 2+ years of experience
            across multiple platform and contemporary framework to deliver a
            performant, efficient and friendly execution of code through
            enjoyable debugging. Familiar with JS, MERN, Next, Native, SQL, and
            Firebase. <br />
            <br />
            What do I mean by <b>Adaptive</b>? I don't blame any environment, I
            adjust myself to suit it instead –{" fetch "}
            <Link href="/Awal Ariansyah - CV.pdf">
              <a target={"_blank"}>
                <b>a fragment of my soul </b>
              </a>
            </Link>{" "}
            or see my{" "}
            <Link href="/Awal Ariansyah - Project Portfolio.pdf">
              <a target={"_blank"}>
                <b>collection of wielded sword.</b>
              </a>
            </Link>
          </p>
        </ContentWrapper>
        <RoundImage
          src={ProfilePicture}
          alt="Picture of Awal Ariansyah"
          width="150px"
          height="150px"
        />
      </HeroFlex>
      <Work />
      <Projects />
      <Education />
    </Container>
  );
}

export const ContentWrapper = styled.div<StringProps>`
  padding-right: 2rem;

  h1,
  h2 {
    margin: 0;
  }

  h2 {
    margin: 1rem 0;
    font-size: 1.5rem;
    font-weight: bold;
  }

  p {
    max-width: 65ch;
  }

  @media ${devices.mobileL} {
    margin-top: 2rem;
  }
`;

export const RoundImage = styled(Image)`
  border-radius: 50%;
`;

const HeroFlex = styled(Flex)`
  @media ${devices.mobileL} {
    flex-direction: column-reverse;
  }
`;
