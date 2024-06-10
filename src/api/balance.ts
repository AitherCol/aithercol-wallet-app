import axios from "axios";
import config from "../config";
import Balance from "./types/Balance";
import { BasicResponse } from "./types/BasicResponse";

async function list(
	token: string
): Promise<BasicResponse & { balances: Balance[] }> {
	const { data } = await axios.get(`${config.apiUrl}/wallet/balances`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

const balance = { list };
export default balance;
