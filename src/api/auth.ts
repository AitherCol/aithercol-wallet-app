import axios from "axios";
import config from "../config";
import { BasicResponse } from "./types/BasicResponse";
import User from "./types/User";

async function getProfile(token: string): Promise<User | null> {
	try {
		const { data } = await axios.get(`${config.apiUrl}/auth/profile`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		return data.profile;
	} catch (error) {
		return null;
	}
}

async function login(
	init_data: string
): Promise<BasicResponse & { token: string }> {
	const { data } = await axios.post(`${config.apiUrl}/auth/login`, {
		init_data,
	});

	return data;
}

const auth = {
	login,
	getProfile,
};

export default auth;
