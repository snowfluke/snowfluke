import type { NextApiRequest, NextApiResponse } from "next";

export const devtoUserUrl = `https://dev.to/api/articles?username=awalariansyah`;
export const devtoArticleUrl = `https://dev.to/api/articles/`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const devtoStories = await fetch(devtoUserUrl);

      const stories = await devtoStories.json();

      res.setHeader(
        "Cache-Control",
        "public, s-maxage=1200, stale-while-revalidate=600"
      );

      return res.status(200).json({
        feed: stories,
      });
    }
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
}
