import axios from "axios";
import config from "../config";
import balance from "./balance";
import { BasicResponse } from "./types/BasicResponse";
import Commission from "./types/Commission";
import Rate from "./types/Rate";
import Wallet from "./types/Wallet";

async function get(token: string): Promise<BasicResponse & { wallet: Wallet }> {
	const { data } = await axios.get(`${config.apiUrl}/wallet`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function getRates(
	contracts: string[],
	token: string
): Promise<BasicResponse & { rates: Rate[] }> {
	const { data } = await axios.post(
		`${config.apiUrl}/wallet/rates`,
		{ contracts },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function getCommission(
	balance: number,
	token: string
): Promise<BasicResponse & { commission: Commission }> {
	const { data } = await axios.get(
		`${config.apiUrl}/wallet/commission?balance_id=${balance}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

const wallet = { get, balances: balance, getRates, getCommission };

export default wallet;
