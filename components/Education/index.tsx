import { ChildrenStringProps } from "lib/types";
import { COLOR_SPOTIFY_GREEN } from "lib/colorPalette";

import { DividerBorder, StepLi } from "components/Education/styles";

const Divider = () => <DividerBorder />;

const Year = ({ children }: ChildrenStringProps) => <h4>{children}</h4>;

export const Education = () => {
  const Step = ({ title, description, children }: ChildrenStringProps) => (
    <StepLi>
      <div>
        <svg viewBox="0 0 24 24">
          <g
            fill="none"
            stroke={COLOR_SPOTIFY_GREEN}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </g>
        </svg>
        <h5>{title}</h5>
      </div>
      {description && <span>{description}</span>}
      <p>{children}</p>
    </StepLi>
  );

  return (
    <>
      <h3>Education Background</h3>
      <Year>2016 - 2019</Year>
      <ul>
        <Step
          title="SMK Komputama Majenang"
          description="Senior High School - Network Engineering"
        >
          Interesting youth to learn about computer and networking where I
          realized what my passion was. <br />
          Learned about different types of networking and how to build one,
          create and manage a server in Debian, set up Mikrotik, network
          simulation in Cisco Packet Tracer and fundamental programming.
        </Step>
      </ul>
      <Divider />
      <Year>2019 - 2023</Year>
      <ul>
        <Step
          title="STMIK Komputama Majenang"
          description="Bachelor Degree - Informatics Technology"
        >
          I took a full 4 year scholarship to continue my studies in IT while
          staying at the same foundation as my previous high school. <br />
          Going deeper into programming, data mining, software methodologies,
          information systems, databases, cryptography, and cyber ethics. I also
          joined the Student Business Incubator as a forum to develop my
          freelance developer activities.
        </Step>
      </ul>
    </>
  );
};
