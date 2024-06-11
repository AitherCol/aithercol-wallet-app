export default interface Transaction {
	id: number;
	type: "decrease" | "increase";
	balance_id: number;
	amount: string;
	description: string | null;
	from: string | null;
	to: string | null;
	is_address: boolean;
	created_at: string;
}
