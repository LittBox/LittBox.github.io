import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // User site: https://littbox.github.io/ — no basePath needed.
  // If deploying to /LittBox/ instead, set basePath: "/LittBox".
};

export default nextConfig;
