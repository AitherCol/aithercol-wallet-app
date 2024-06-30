import axios from "axios";
import config from "../config";
import auth from "./auth";
import market from "./market";
import { BasicResponse } from "./types/BasicResponse";
import wallet from "./wallet";

export default {
	auth,
	wallet,
	market,
	custom: {
		get: async (path: string, token?: string): Promise<BasicResponse & any> => {
			const { data } = await axios.get(`${config.apiUrl}/${path}`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			return data;
		},
		post: async (
			path: string,
			token?: string,
			body?: any
		): Promise<BasicResponse & any> => {
			const { data } = await axios.post(`${config.apiUrl}/${path}`, body, {
				headers: { Authorization: `Bearer ${token}` },
			});

			return data;
		},
	},
};
