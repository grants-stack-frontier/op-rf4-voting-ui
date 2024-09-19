const AGORA_API_URL = process.env.AGORA_API_URL;
const AGORA_API_KEY = process.env.AGORA_API_KEY;
const DEFORM_API_URL = 'https://api.deform.cc';

const hostnames = [
	'euc.li',
	'ens.xyz',
	'content.optimism.io',
	'cdn.charmverse.io',
	'storage.googleapis.com',
	'i.imgur.com',
	'imagedelivery.net',
	'i.seadn.io',
	'lh3.googleusercontent.com',
	'pbs.twimg.com'
];

/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		AGORA_API_URL: AGORA_API_URL,
		DEFORM_API_URL: DEFORM_API_URL,
		AGORA_API_KEY: AGORA_API_KEY,
	},
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
		];
	},
	reactStrictMode: true,
	webpack: (config) => {
		config.resolve.fallback = { fs: false, net: false, tls: false };
		config.externals.push('pino-pretty', 'lokijs', 'encoding', {
			'node-gyp-build': 'commonjs node-gyp-build',
		});
		return config;
	},
	images: {
		remotePatterns: hostnames.map((hostname) => ({
			protocol: 'https',
			hostname,
			port: '',
			pathname: '/**',
		})),
	},
};
export default nextConfig;
