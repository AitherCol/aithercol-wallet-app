export default interface Check {
	user_id: number;
	key: string;
	balance_id: number;
	amount: string;
	password_protected: boolean;
	created_at: string;
	updated_at: string;
	id: number;
	activations: number;
	max_activations: number;
	total_amount: string;
}
