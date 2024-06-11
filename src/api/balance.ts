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

async function withdraw(
	body: { balance_id: number; address: string; amount: string },
	token: string
): Promise<BasicResponse & { balances: Balance[] }> {
	const { data } = await axios.post(
		`${config.apiUrl}/wallet/balances/withdraw`,
		body,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

const balance = { list, withdraw };
export default balance;
