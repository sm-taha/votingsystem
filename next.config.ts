import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		externalDir: true,
	},
	webpack: (config: any) => {
		config.resolve.modules.push("../node_modules");
		return config;
	},
};

export default nextConfig;
