// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

const apiOrigin =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://manga-panel-extractor-production.up.railway.app";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  async rewrites() {
    return [
      {
        source: "/_clerk/:path*",
        destination: "/api/_clerk/:path*",
      },
      {
        source: "/__clerk/:path*",
        destination: "/api/__clerk/:path*",
      },
      {
        source: "/api/onepanel/:path*",
        destination: `${apiOrigin.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};
export default config;
