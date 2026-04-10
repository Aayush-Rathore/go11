import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.goplay11-apk.com",
          },
        ],
        destination: "https://goplay11-apk.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
