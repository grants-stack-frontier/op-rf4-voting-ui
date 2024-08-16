const AGORA_API_URL = process.env.AGORA_API_URL
const DEFORM_API_URL = "https://api.deform.cc"

/** @type {import('next').NextConfig} */
const nextConfig = {
    // https://maxschmitt.me/posts/next-js-api-proxy
    // https://nextjs.org/docs/pages/api-reference/next-config-js/rewrites
    async rewrites() {
        return [
            {
                source: '/api/agora/:path*',
                destination: `${AGORA_API_URL}/:path*`,
            },
            {
                source: '/api/deform/:path*',
                destination: `${DEFORM_API_URL}/:path*`,
            },
        ]
    },
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = {fs: false, net: false, tls: false};
        config.externals.push("pino-pretty", "lokijs", "encoding", {
            "node-gyp-build": "commonjs node-gyp-build",
        });
        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "euc.li",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ens.xyz",
                port: "",
                pathname: "/**",
            },
        ],
    },
};
export default nextConfig;
