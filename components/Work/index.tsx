import { DividerBorder } from "components/Work/styles";
import { devices } from "lib/displayDevice";
import styled from "styled-components";

const Divider = () => <DividerBorder />;

export const Work = () => {
  return (
    <>
      <h3>Work Experience</h3>

      <WorkWrapper>
        <Position>
          <h3>Software Engineer @snow.exe</h3>
        </Position>
        <Experience>
          Sailing software world with a small team responsible for building
          client-requested software in various platform and participated
          competition.
        </Experience>
      </WorkWrapper>
      <span>May 2021 - present</span>
      <Divider />

      <WorkWrapper>
        <Position>
          <h3>Graphic Designer @Jenester</h3>
        </Position>
        <Experience>
          Enjoyable experience of work while also learning a lot in designing
          logo, banner for medium-low business in the countryside.
        </Experience>
      </WorkWrapper>
      <span>Sep 2020 - Apr 2021</span>
      <Divider />

      <WorkWrapper>
        <Position>
          <h3>IT Support @Komputama</h3>
        </Position>
        <Experience>
          Starting the career by collecting IT experience, teaching others,
          maintenance hardware and networking.
        </Experience>
      </WorkWrapper>
      <span>Nov 2018 - Feb 2019</span>
      <Divider />
    </>
  );
};

export const WorkWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 0%;
  padding: 1rem 0px 0px;

  @media ${devices.tabletM} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Position = styled.div`
  margin-right: 36px;
  white-space: nowrap;
  position: relative;
  text-align: right;
  line-height: 28px;
  font-size: 1.25rem;

  h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  @media ${devices.tabletM} {
    h3 {
      margin-bottom: 0.5rem;
    }
  }
`;

export const Experience = styled.p`
  margin: 0px;
`;
