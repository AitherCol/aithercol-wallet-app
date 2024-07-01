const config = {
	apiUrl:
		process.env.NODE_ENV === "production"
			? "https://wallet-api.aithercol.com"
			: "https://test-wallet-api.aithercol.com",
	username: "AitherColBot",
	isMarketEnabled: true,
};
export default config;
