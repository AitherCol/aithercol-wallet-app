import axios from "axios";
import config from "../config";
import { BasicResponse } from "./types/BasicResponse";
import Check from "./types/Check";
import Rate from "./types/Rate";

async function list(
	token: string
): Promise<BasicResponse & { checks: Check[] }> {
	const { data } = await axios.get(`${config.apiUrl}/wallet/checks`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

export type CheckResponse = BasicResponse & {
	check: Check;
	info: {
		contract: string;
		image: string;
		name: string;
		symbol: string;
		decimals: number;
		rate: Rate;
	};
};

async function create(
	body: { balance_id: number; amount: string; password?: string },
	token: string
): Promise<CheckResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/wallet/checks/create`,
		body,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function get(key: string, token: string): Promise<CheckResponse> {
	const { data } = await axios.get(
		`${config.apiUrl}/wallet/checks/get?key=${key}`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);

	return data;
}

async function activate(
	body: { key: string; name: string; password?: string },
	token: string
): Promise<CheckResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/wallet/checks/activate`,
		body,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function deleteCheck(id: number, token: string): Promise<CheckResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/wallet/checks/delete`,
		{ id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

const checks = { list, activate, get, create, deleteCheck };

export default checks;
