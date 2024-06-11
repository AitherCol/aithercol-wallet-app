export default interface Transaction {
	id: number;
	type: "decrease" | "increase";
	balance_id: number;
	amount: string;
	original_amount: string | null;
	description: string | null;
	from: string | null;
	to: string | null;
	is_address: boolean;
	created_at: string;
}
