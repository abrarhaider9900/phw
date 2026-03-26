/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
            {
                protocol: "http",
                hostname: "phw.scoopsolutions.us",
            },
        ],
    },
};

module.exports = nextConfig;
