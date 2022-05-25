import { TransitionGroup } from "react-transition-group";
import styled from "styled-components";

const TIMEOUT: string = "250ms";

export const transitionStyles = {
  entering: {
    position: `absolute`,
    opacity: 0,
    transform: `translateX(50px)`,
  },
  entered: {
    transition: `opacity ${TIMEOUT} ease, transform ${TIMEOUT} ease`,
    opacity: 1,
    transform: `translateX(0px)`,
    animation: "blink .3s linear 2",
  },
  exiting: {
    transition: `opacity ${TIMEOUT} ease, transform ${TIMEOUT} ease`,
    opacity: 0,
    transform: `translateX(-50px)`,
  },
} as any;

export const StyledTransitionGroup = styled(TransitionGroup)`
  position: relative;
`;
