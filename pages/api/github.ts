import type { NextApiRequest, NextApiResponse } from "next";
import { Data } from "lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=1200, stale-while-revalidate=600"
      );

      if (req.query.type === "featured-project")
        res.status(200).json([
          {
            title: "iDekita",
            description:
              "iDekita is a web-based application developed as a place to accommodate and search for creative ideas such as project ideas, research ideas, problem solving ideas and other creative ideas. Developed and won 1st award Techcomfest 2022 Politeknik Negeri Semarang",
            tech: "Next, Firebase, Tailwindcss",
            link: "https://github.com/snowfluke/idekita",
          },
          {
            title: "Presentia",
            description:
              "The third party service is a system that handles lecture attendance that integrates the discord bot (server) and the Presentia android mobile application (client) in its operation. Handling location mode attendance, online, sick, permission, deposit attendance, announcements, assignments and schedule changes in real time.",
            tech: "React Native, Firebase, Discord.js, PHP, Tailwindcss",
            link: "https://github.com/snowfluke/Presentia",
          },
          {
            title: "Teledrop",
            description:
              "A private telegram bot for mass control telegram account in cryptocurrency's token airdrop. The features including join automation, social media grabber and captcha bypassing.",
            tech: "Telegraf, Telegram, Tensorflow, Twitter API, Express, Cherio, Workerpool, Discord.js",
            link: "https://youtu.be/dpr3RrLRehs",
          },
          {
            title: "Buku Saku TKJ",
            description:
              "The Android application contains core learning materials for the Computer and Network Engineering major and its supporting tools. Created with the background of separate TKJ material, so that a centralized TKJ Pocket Book was created, which can be accessed offline and free of charge.",
            tech: "React Native, UI Kitten",
            link: "https://play.google.com/store/apps/details?id=com.bukusakutkj.sss",
          },
          {
            title: "Pikul",
            description:
              "A desktop application (Windows) development project with the aim of providing loan or credit services for students who cannot afford to purchase supporting equipment for STMIK Komputama Majenang lectures.",
            tech: "Electron, MySQL",
            link: "https://www.youtube.com/watch?v=y8lpe6FIloc",
          },
          {
            title: "Vinolium",
            description:
              "A web and android based visual novel project that tells the main character in a state of uncertainty after graduating from high school / vocational school to decide whether to continue studying, work or get married. This project is aimed at increasing the enrollment ratio of new student candidates for STMIK Komputama Majenang.",
            tech: "Tyranoscript, Javascript",
            link: "https://awaru.itch.io/vinolium",
          },
        ]);

      const userReposResponse = await fetch(
        "https://api.github.com/users/snowfluke/repos?per_page=100"
      );

      const repositories = await userReposResponse.json();
      const mine = repositories.filter((repo: Data) => !repo.fork);

      const popular = mine
        .filter((repo: Data) => repo.stargazers_count > 2)
        .sort((a: Data, b: Data) => b.stargazers_count - a.stargazers_count)
        .map((repo: Data) => ({
          htmlUrl: repo.html_url,
          name: repo.name.substring(0, 65),
          stars: repo.stargazers_count,
          description: repo.description,
        }));

      const mini = mine
        .filter((repo: Data) => repo?.topics.includes("mini-project"))
        .sort((a: Data, b: Data) => b.stargazers_count - a.stargazers_count)
        .map((repo: Data) => ({
          htmlUrl: repo.html_url,
          name: repo.name.substring(0, 65),
          stars: repo.stargazers_count,
          description: repo.description,
        }));

      if (req.query.type === "popular-project")
        return res.status(200).json({
          popular,
        });

      if (req.query.type === "mini-project")
        return res.status(200).json({
          mini,
        });
    }
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
}
