import { Transition as ReactTransition } from "react-transition-group";

import {
  transitionStyles,
  StyledTransitionGroup,
} from "components/Layout/Transition/styles";

interface TransitionProps {
  children: React.ReactNode;
  location: string;
}

const TIMEOUT: number = 250;

export const Transition = ({ children, location }: TransitionProps) => {
  return (
    <StyledTransitionGroup>
      <ReactTransition
        key={location}
        timeout={{
          enter: TIMEOUT,
          exit: TIMEOUT,
        }}
      >
        {(status) => (
          <div
            style={{
              ...transitionStyles[status],
            }}
          >
            {children}
          </div>
        )}
      </ReactTransition>
    </StyledTransitionGroup>
  );
};
