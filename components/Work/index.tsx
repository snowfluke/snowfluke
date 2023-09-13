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
          <h3>Frontend Mobile Developer @Anugerah Lestari Teknokreasi </h3>
        </Position>
        <Experience>
          Developing m‑banking app for Cirebon Bank in Android & iOS starts from
          UI/UX Designing until to code it in React Native.
        </Experience>
      </WorkWrapper>
      <span>Oct 2022 - Jan 2023</span>
      <Divider />

      <WorkWrapper>
        <Position>
          <h3>Backend Developer Internship @Rejeki Berkah Nusantara </h3>
        </Position>
        <Experience>
          Internship to demonstrate migration from monolithic architecture into
          micro‑services and building the frontend dashboard for business
          intelligent langitpay.
        </Experience>
      </WorkWrapper>
      <span>Jul 2022 - Aug 2022</span>
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
      <span>Aug 2020 - Jan 2021</span>
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
      <span>Nov 2018 - Jan 2019</span>
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
