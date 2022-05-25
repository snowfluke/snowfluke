import { FeaturedProject } from "components/FeaturedProject";
import Container from "components/Layout/Container";
import { MiniProject } from "components/MiniProject";
import { Paragraph } from "pages/blog";

export default function Project() {
  return (
    <Container title="Featured Project - Awal Ariansyah">
      <h1>Project</h1>
      <Paragraph>
        In order not to get stuck in the <b>tutorial hell</b>, I realized that
        it was best to apply what I had just learned by building something. A
        real use case implementation that can be useful for other people, not
        just a line of <b>Hello World</b>
        .
        <br />
        As the project goes on, it will eventually throw an exception. The
        debugging process is where our brain can easily remember the concepts.
        One stone to catch two birds!
      </Paragraph>
      <FeaturedProject />
      <MiniProject />
    </Container>
  );
}
