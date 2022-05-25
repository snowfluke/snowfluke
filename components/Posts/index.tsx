import useSWR from "swr";
import Link from "next/link";
import fetcher from "lib/fetcher";
import { Data, PostsProps, StringProps } from "lib/types";
import { formatDate } from "lib/helpers";

import { Container, Item } from "components/Posts/styles";
import { Flex } from "components/Layout/Container/styles";
import { Paragraph } from "pages/blog";

export const Posts = ({ title }: StringProps) => {
  const { data } = useSWR<Data>("/api/devto", fetcher);

  return (
    <Container>
      <h3>{title}</h3>
      {data?.feed?.map((item: PostsProps, id: number) => {
        return (
          <Link href={`/blog/${item.id}/${item.slug}`} key={id}>
            <Item>
              <Flex>
                <Flex>
                  <span className="item-number">{`${id < 9 ? "0" : ""}${
                    id + 1
                  }`}</span>
                  <h4>{item.title.substring(0, 65)}</h4>
                </Flex>
                <span>{formatDate(item.created_at)}</span>
              </Flex>
              <Paragraph>{item.description}</Paragraph>
            </Item>
          </Link>
        );
      })}
    </Container>
  );
};
