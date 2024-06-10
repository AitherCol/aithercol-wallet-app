import axios from "axios";
import config from "../config";
import balance from "./balance";
import { BasicResponse } from "./types/BasicResponse";
import Wallet from "./types/Wallet";

async function get(token: string): Promise<BasicResponse & { wallet: Wallet }> {
	const { data } = await axios.get(`${config.apiUrl}/wallet`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

const wallet = { get, balances: balance };

export default wallet;
