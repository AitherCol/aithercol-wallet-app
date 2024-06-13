export default interface Balance {
	id: number;
	user_id: number;
	contract: string;
	name: string;
	image: string;
	symbol: string;
	amount: string;
	frozen_amount: string;
	decimals: number;
	verification: string;
	created_at: string;
	updated_at: string;
}
