import useSWR from "swr";
import fetcher from "lib/fetcher";
import { Flex } from "components/Layout/Container/styles";
import Link from "next/link";
import { Container, Item } from "components/Posts/styles";
import { Data, ProjectsProps } from "lib/types";
import styled from "styled-components";
import { devices } from "lib/displayDevice";

export const Projects = () => {
  const { data } = useSWR<Data>("/api/github?type=popular-project", fetcher);

  return (
    <Container>
      <h3>Popular Repositories</h3>
      {data?.message ? (
        <h4>Maximum rate limit reached.</h4>
      ) : (
        data?.popular
          .filter((item: ProjectsProps, id: number) => id < 3)
          .map((item: ProjectsProps, id: number) => {
            return (
              <a
                href={item.htmlUrl}
                target="_blank"
                className="color-black"
                key={id}
                rel="noopener noreferrer"
              >
                <Item>
                  <Flex>
                    <Flex>
                      <span className="item-number">{`${id < 9 ? "0" : ""}${
                        id + 1
                      }`}</span>
                      <h4>{item.name}</h4>
                    </Flex>
                    <span>{item.stars} Stars</span>
                  </Flex>
                  <p>{item.description}</p>
                </Item>
              </a>
            );
          })
      )}

      {!data?.message && (
        <Link href="/project">
          <MoreLink>See more project...</MoreLink>
        </Link>
      )}
    </Container>
  );
};

export const MoreLink = styled.h5`
  font-size: 1.25rem;
  text-underline-position: under;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }

  margin-bottom: 0;

  @media ${devices.mobileL} {
    font-weight: normal;
  }
`;
