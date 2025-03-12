import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
};
module.exports = {
  images: {
    domains: ["floe-media.s3.ap-northeast-2.amazonaws.com"], // ✅ S3 도메인 추가
  },
};
export default nextConfig;
