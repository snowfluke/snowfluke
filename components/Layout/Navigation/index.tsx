import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";
import { StringProps } from "lib/types";

export const Navigation = ({ href, text }: StringProps) => {
  const router = useRouter();

  return (
    <StyledLink href={href as string}>
      <a
        className={router.pathname == href ? "active" : ""}
        rel="noopener noreferrer"
      >
        {text}
      </a>
    </StyledLink>
  );
};

export const StyledLink = styled(Link)`
  text-transform: capitalize;
`;
