import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { RoundImage } from "pages";
import { formatDate } from "lib/helpers";
import { devtoUserUrl, devtoArticleUrl } from "pages/api/devto";
import { devices } from "lib/displayDevice";
import { PostsProps } from "lib/types";

import { Flex } from "components/Layout/Container/styles";
import Container from "components/Layout/Container";

import ProfilePicture from "public/assets/png/Awal.png";

interface BlogProps {
  post: PostsProps;
  title: string;
}

interface ParamsProps {
  params: {
    slug: string;
    id: string;
  };
}

export default function Blog({ post, title }: BlogProps) {
  return (
    <Container title={`${title} - Awal Ariansyah`}>
      <BlogFlex>
        <AuthorContainer>
          <RoundImage
            src={ProfilePicture}
            alt="Picture of Awal"
            width="45px"
            height="45px"
          />
          <h4>Awal Ariansyah / {formatDate(post.created_at)}</h4>
        </AuthorContainer>
        <div>{post.reading_time_minutes} min read</div>
      </BlogFlex>
      <h1>{post.title}</h1>

      <figure>
        <img src={post.cover_image} alt={post.title} />
      </figure>

      <DescriptionContainer>
        {/* <p>
          <img
            src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/06asyktnaaokemi2h3wp.png"
            alt="Alt Text"
          />
        </p>
        <p>
          Go to <code>android</code> folder and make a new file called{" "}
          <code>local.properties</code>. This file will be used for pointing the
          sdk that gradle need in order to build your application.
        </p>
        <pre>
          <code>
            cd android/app sudo keytool -genkey -v -keystore
            yourkeyname.keystore -alias yourkeyaliasname -keyalg RSA -keysize
            2048 -validity 10000
          </code>
        </pre> */}
        <ReactMarkdown>{post?.body_markdown}</ReactMarkdown>
      </DescriptionContainer>
    </Container>
  );
}

export async function getStaticProps({ params }: ParamsProps) {
  const articleUrl = devtoArticleUrl + params.id;

  const res = await fetch(articleUrl);
  const post = await res.json();

  return {
    props: {
      post,
      title: post.title,
    },
    revalidate: 10,
  };
}

export async function getStaticPaths({ params }: ParamsProps) {
  const posts = await fetch(devtoUserUrl);
  const stories = await posts.json();

  const paths = stories.map((post: PostsProps) => ({
    params: {
      slug: post.slug,
      id: post.id.toString(),
    },
  }));

  return { paths, fallback: "blocking" };
}

const DescriptionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  ul,
  ol {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    word-wrap: break-word;
    word-break: break-all;
  }

  p {
    margin: 0 0 1rem 0;

    img {
      width: 100%;
      overflow: hidden;
      border-radius: 12px;
    }

    code {
      display: inline-block;
      font-size: 1rem;
      font-weight: bold;
    }
  }

  figure {
    margin: 0;

    img {
      width: 100%;
      overflow: hidden;
      border-radius: 12px;
    }
  }

  h2 {
    margin: 1.25rem 0;
    font-weight: bold;
    font-size: 2.25rem;
  }

  h3 {
    margin: 1rem 0;
    font-weight: bold;
    font-size: 1.5rem;
  }

  h4 {
    font-weight: bold;
    font-size: 1.25rem;
  }

  pre {
    margin: 0 0 1rem 0;

    box-sizing: border-box;
    overflow-x: auto;
    border-radius: 12px;
    line-height: 20px;
    padding: 10px;
  }

  @media ${devices.mobileL} {
    h2 {
      font-size: 1.5rem;
    }
  }

  ul {
    margin-left: 1rem;

    li {
      list-style-type: circle;
      padding: 0.5rem 0;
    }

    @media ${devices.tabletM} {
      margin: 0;

      li {
        list-style-type: none;
      }
    }
  }
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;

  h4 {
    margin: 0;
    font-size: 1rem;
    margin-left: 0.75rem;
  }

  @media ${devices.tabletM} {
    h4 {
      display: none;
    }
  }
`;

const BlogFlex = styled(Flex)`
  @media ${devices.tabletM} {
    justify-content: flex-start;

    ${AuthorContainer} {
      margin-right: 1rem;
    }
  }
`;
