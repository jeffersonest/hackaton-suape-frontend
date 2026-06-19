/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build enxuto p/ Docker: gera .next/standalone com server.js + deps mínimas.
  output: "standalone",
};

export default nextConfig;
