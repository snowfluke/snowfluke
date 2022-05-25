import React from "react";

export interface PostsProps {
  id: number;
  description: string;
  created_at: Date;
  slug: string;
  title: string;
  reading_time_minutes: number;
  body_html: string;
  cover_image: string;
  body_markdown: string;
}

export interface ProjectsProps {
  htmlUrl: string;
  name: string;
  stars: string;
  description: string;
}

export interface FeaturedProjectProps {
  link: string;
  title: string;
  description: string;
  tech: string;
}

export interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export interface StringProps {
  [name: string]: string | React.ReactNode;
}

export interface artistItemProps {
  [name: string]: string | React.ReactNode;
  external_urls: StringProps;
}
export interface WrapperProps {
  children?: React.ReactNode;
  darkTheme?: boolean;
}

export interface ChildrenStringProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
}
export interface Data {
  [key: string]: any;
}
