import { StringProps } from "lib/types";

import { ScrollUpContainer } from "components/Layout/ScrollToTop/styles";

export const ScrollToTop = ({ darkTheme }: StringProps) => {
  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ScrollUpContainer onClick={scrollUp} darkTheme={darkTheme}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.887 5.943">
        <path
          id="Path_157"
          data-name="Path 157"
          d="M6502.544,2805l3.529,3.53-3.529,3.529"
          transform="translate(-2803.586 6507.073) rotate(-90)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </ScrollUpContainer>
  );
};

export default ScrollToTop;
