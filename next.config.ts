import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.SITE_BASE_PATH?.trim() ?? "";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_SITE_BASE_PATH: isGitHubPages ? basePath : "" },
  ...(isGitHubPages
    ? {
        output: "export" as const,
        ...(basePath ? { basePath } : {}),
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

export default nextConfig;