const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        root: __dirname,
        resolveAlias: {
            tailwindcss: path.join(__dirname, "node_modules", "tailwindcss", "index.css"),
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
};

module.exports = nextConfig;
