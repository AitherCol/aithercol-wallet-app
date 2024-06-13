import axios from "axios";
import config from "../config";
import { BasicResponse } from "./types/BasicResponse";
import Pool from "./types/Pool";

export async function getPools(
	token: string
): Promise<BasicResponse & { pools: Pool[] }> {
	const { data } = await axios.get(`${config.apiUrl}/wallet/exchange/pools`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

export async function getPoolBalance(
	contract: string,
	token: string
): Promise<BasicResponse & { balance: string }> {
	const { data } = await axios.get(
		`${config.apiUrl}/wallet/exchange/pool_balance`,
		{
			headers: { Authorization: `Bearer ${token}` },
			params: { contract },
		}
	);

	return data;
}

export async function transferToPool(
	body: { balance_id: number; amount: string },
	token: string
): Promise<BasicResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/wallet/exchange/transfer_to_pool`,
		body,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

export async function swap(
	body: { input: string; output: string; amount: string; preview: boolean },
	token: string
): Promise<BasicResponse & any> {
	const { data } = await axios.post(
		`${config.apiUrl}/wallet/exchange/exchange`,
		body,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

const exchange = { getPools, getPoolBalance, transferToPool, swap };

export default exchange;
