import useSWR from "swr";
import fetcher from "lib/fetcher";
import { Flex } from "components/Layout/Container/styles";
import { Container, Item } from "components/Posts/styles";
import { FeaturedProjectProps, Data } from "lib/types";

export const FeaturedProject = () => {
  const { data } = useSWR<Data>("/api/github?type=featured-project", fetcher);

  return (
    <Container>
      <h3>Featured Project</h3>
      {data?.message ? (
        <h4>Maximum rate limit reached.</h4>
      ) : (
        data?.map((item: FeaturedProjectProps, id: number) => {
          return (
            <a
              href={item.link}
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
                    <h4>{item.title}</h4>
                  </Flex>
                </Flex>
                <p>{item.description}</p>
                <br />
                <p>
                  <b>{item.tech}</b>
                </p>
              </Item>
            </a>
          );
        })
      )}
    </Container>
  );
};
