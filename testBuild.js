const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");

const testConfig = `const config = {apiUrl: "https://test-wallet-api.aithercol.com"};export default config;`;

async function main() {
	await fs.promises.rename("./package.json", "./package.prod.json");
	const data = JSON.parse(
		(await fs.promises.readFile("./package.prod.json")).toString()
	);
	data["homepage"] = "https://test-wallet.aithercol.com";
	await fs.promises.writeFile("./package.json", JSON.stringify(data));

	await fs.promises.rename("./src/config.ts", "./src/config.prod.ts");
	await fs.promises.writeFile("./src/config.ts", testConfig);
	await exec("yarn build");
	await fs.promises.rm("./src/config.ts", { force: true, recursive: true });
	await fs.promises.rename("./src/config.prod.ts", "./src/config.ts");
	await fs.promises.rm("./package.json", { force: true, recursive: true });
	await fs.promises.rename("./package.prod.json", "./package.json");
	await fs.promises.rm("./build/CNAME", { force: true, recursive: true });
	await fs.promises.writeFile("./build/CNAME", "test-wallet.aithercol.com");
}

main();
