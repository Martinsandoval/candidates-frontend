import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Prevent the page from being embedded in an iframe (clickjacking protection).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop browsers from sniffing the MIME type of a response.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limit referrer information sent to third-party origins.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features not used by this app.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS for 1 year once the browser has visited the site.
  // Enable only in production behind a real TLS terminator.
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
