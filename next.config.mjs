/** @type {import('next').NextConfig} */

const SUPABASE_HOST = "nkzaaibxnpifwnkwpken.supabase.co"

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api.anthropic.com`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy",     value: CSP },
  { key: "Strict-Transport-Security",   value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options",             value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",      value: "nosniff" },
  { key: "X-XSS-Protection",            value: "1; mode=block" },
  { key: "Referrer-Policy",             value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",          value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control",      value: "on" },
]

const nextConfig = {
  // Remove X-Powered-By fingerprint
  poweredByHeader: false,

  // Strict mode for better error detection
  reactStrictMode: true,

  // Mitigation for GHSA-9g9p-9gw9-jx7f (Image Optimizer DoS via remotePatterns)
  // Only allow images from our own Supabase bucket — no open proxy
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Disable remote optimization for untrusted domains
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
