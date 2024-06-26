import axios from "axios";
import config from "../config";
import balance from "./balance";
import checks from "./checks";
import exchange from "./exchange";
import Balance from "./types/Balance";
import { BasicResponse, PaginationMeta } from "./types/BasicResponse";
import Commission from "./types/Commission";
import Rate from "./types/Rate";
import Transaction from "./types/Transaction";
import Wallet from "./types/Wallet";

async function get(token: string): Promise<BasicResponse & { wallet: Wallet }> {
	const { data } = await axios.get(`${config.apiUrl}/wallet`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function getNetwork(): Promise<
	BasicResponse & { network: "mainnet" | "testnet" }
> {
	const { data } = await axios.get(`${config.apiUrl}/wallet/network`);

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

async function getTransactions(
	body: { balance_id?: number; limit: number; page: number },
	token: string
): Promise<
	BasicResponse & {
		transactions: { data: Transaction[]; meta: PaginationMeta };
	}
> {
	const { data } = await axios.get(`${config.apiUrl}/wallet/transactions`, {
		headers: { Authorization: `Bearer ${token}` },
		params: body,
	});

	return data;
}

async function getTransaction(
	id: number,
	token: string
): Promise<
	BasicResponse & {
		transaction: Transaction;
		balance: Balance;
		rate: Rate;
	}
> {
	const { data } = await axios.get(`${config.apiUrl}/wallet/transactions/get`, {
		headers: { Authorization: `Bearer ${token}` },
		params: { id },
	});

	return data;
}

const wallet = {
	get,
	balances: balance,
	exchange,
	getRates,
	getNetwork,
	getCommission,
	getTransactions,
	getTransaction,
	checks,
};

export default wallet;
