import type { NextConfig } from "next";

// Optionally allow extra dev origins (e.g. a LAN/Tailscale IP used to open the
// dev server from a phone). Set DEV_ORIGINS as a comma-separated list, e.g.
//   DEV_ORIGINS="100.x.y.z,http://100.x.y.z:3333"
const devOrigins = (process.env.DEV_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  ...(devOrigins.length > 0 ? { allowedDevOrigins: devOrigins } : {}),
};

export default nextConfig;
