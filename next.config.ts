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
  async redirects() {
    return [
      { source: '/personal/tasks', destination: '/tasks', permanent: false },
      { source: '/personal/calendar', destination: '/tasks?view=calendar', permanent: false },
      { source: '/personal/goals', destination: '/goals', permanent: false },
      { source: '/personal/habits', destination: '/personal', permanent: false },
      { source: '/brand/content', destination: '/tasks', permanent: false },
      { source: '/brand/calendar', destination: '/tasks?view=calendar', permanent: false },
      { source: '/brand/social', destination: '/brand', permanent: false },
      { source: '/brand/portfolio', destination: '/brand', permanent: false },
      { source: '/business/tasks', destination: '/tasks', permanent: false },
      { source: '/business/calendar', destination: '/tasks?view=calendar', permanent: false },
      { source: '/business/crm', destination: '/customers', permanent: false },
      { source: '/business/projects', destination: '/tasks', permanent: false },
      { source: '/brain/voices', destination: '/brain/personas', permanent: false },
      { source: '/brain/apps', destination: '/settings', permanent: false },
      { source: '/bunker/security', destination: '/bunker', permanent: false },
      { source: '/bunker/privacy', destination: '/bunker', permanent: false },
      { source: '/bunker/diagnostics', destination: '/system', permanent: false },
      { source: '/intelligence/workflows', destination: '/nexus/workbench', permanent: false },
      { source: '/intelligence/commands', destination: '/runs', permanent: false },
      { source: '/intelligence/webhooks', destination: '/intelligence', permanent: false },
      { source: '/intelligence/frameworks', destination: '/gym', permanent: false },
      { source: '/intelligence/heartbeat', destination: '/runs', permanent: false },
    ];
  },
};

export default nextConfig;
