import styled from "styled-components";
import Container from "components/Layout/Container";
import { Posts } from "components/Posts";

export default function Blog() {
  return (
    <Container title="Blog - Awal Ariansyah">
      <h1>Blog</h1>
      <Paragraph>
        Writing to me is like taking a note with a style.
        <br />
        The benefit of writing especially technical stuff is clear to me to
        remember what's important in case I run into the same issue and
        hopefully it helps someone who is desperately looking for a solution to
        the same issue.
      </Paragraph>
      <Posts title="Stories" />
    </Container>
  );
}

export const Paragraph = styled.p`
  br {
    content: "";
    margin: 1rem;
    display: block;
  }
`;
